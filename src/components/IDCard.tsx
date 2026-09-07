import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, extend, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Text, RoundedBox, useTexture } from "@react-three/drei";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElements["bufferGeometry"];
    meshLineMaterial: ThreeElements["meshBasicMaterial"] & {
      lineWidth?: number;
    };
  }
}
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
  useRopeJoint,
  useSphericalJoint,
  type RigidBodyProps,
} from "@react-three/rapier";
import { personalInfo } from "../data/portfolioData";
import { useReducedMotion } from "../lib/motion";
import badgePortrait from "../images/subin-shk-hero2.jpg";

const ROLE_LINES = ["Software", "Quality Assurance"];

// Card dimensions in world units — 0.64 aspect matches the site's other
// (CSS) badge treatment before this one.
const CARD_W = 1.6;
const CARD_H = 2.5;
const CARD_T = 0.09;

// Where the fixed anchor sits and how far apart each rope-jointed chain
// link starts. A rope joint only limits the *maximum* distance between
// two bodies — if a body's initial position is placed farther from its
// joint partner than the rope's length (as opposed to right at it), the
// joint has nothing valid to hold at frame one and everything free-falls
// from there. Every initial position below is derived from this same
// anchor/spacing so they can never drift out of sync again.
const ANCHOR_Y = 2.4;
const LINK_GAP = 0.4;

/** One segment of chain between the fixed anchor and the card. Three
 * short rope-jointed bodies (matching the source article's j1/j2/j3)
 * read as a real hanging chain instead of one rigid rod. */
function Band({ anchorRef, cardRef }: { anchorRef: React.RefObject<any>; cardRef: React.RefObject<any> }) {
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);

  useRopeJoint(anchorRef, j1, [[0, 0, 0], [0, 0, 0], 0.4]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.4]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.4]);
  useSphericalJoint(j3, cardRef, [[0, 0, 0], [0, CARD_H / 2, 0]]);

  const line = useRef<any>(null);
  const points = useMemo(() => Array.from({ length: 4 }, () => new THREE.Vector3()), []);

  useFrame(() => {
    const refs = [anchorRef, j1, j2, j3];
    refs.forEach((r, i) => {
      const p = r.current?.translation?.();
      if (p) points[i].set(p.x, p.y, p.z);
    });
    if (line.current) {
      const curve = new THREE.CatmullRomCurve3(points);
      line.current.setPoints(curve.getPoints(24).flatMap((p) => [p.x, p.y, p.z]));
    }
  });

  const bodyProps: Partial<RigidBodyProps> = {
    type: "dynamic",
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  return (
    <>
      <RigidBody ref={j1} {...bodyProps} position={[0, ANCHOR_Y - LINK_GAP, 0]}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody ref={j2} {...bodyProps} position={[0, ANCHOR_Y - LINK_GAP * 2, 0]}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody ref={j3} {...bodyProps} position={[0, ANCHOR_Y - LINK_GAP * 3, 0]}>
        <BallCollider args={[0.08]} />
      </RigidBody>
      <mesh>
        <meshLineGeometry ref={line} />
        <meshLineMaterial
          color="#5fd4e8"
          lineWidth={0.045}
          transparent
          opacity={0.92}
        />
      </mesh>
    </>
  );
}

/** The card itself: a physical rigid body you can grab and fling, which
 * snaps back to hanging from the band once released. Dragging swaps it
 * to a kinematic body driven by a pointer raycast against a plane facing
 * the camera, rather than physically pushing it (which is the pattern
 * the source article uses — see "camera unprojection" in its write-up). */
function Card({ cardRef }: { cardRef: React.RefObject<any> }) {
  const { camera, raycaster, pointer } = useThree();
  const portrait = useTexture(badgePortrait);
  const [dragging, setDragging] = useState(false);
  const dragPlane = useRef(new THREE.Plane());
  const dragOffset = useRef(new THREE.Vector3());
  const meshRef = useRef<THREE.Group>(null);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const body = cardRef.current;
    if (!body) return;
    body.setBodyType(2, true); // kinematicPosition
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    dragPlane.current.setFromNormalAndCoplanarPoint(normal, e.point);
    const t = body.translation();
    dragOffset.current.set(e.point.x - t.x, e.point.y - t.y, e.point.z - t.z);
    setDragging(true);
    document.body.style.cursor = "grabbing";
  };

  const stopDragging = () => {
    const body = cardRef.current;
    if (body) {
      body.setBodyType(0, true); // back to dynamic
      body.wakeUp();
    }
    setDragging(false);
    document.body.style.cursor = "auto";
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    stopDragging();
  };

  useFrame(() => {
    const body = cardRef.current;
    if (!body) return;

    if (dragging) {
      raycaster.setFromCamera(pointer, camera);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane.current, hit);
      if (hit) {
        body.setNextKinematicTranslation({
          x: hit.x - dragOffset.current.x,
          y: hit.y - dragOffset.current.y,
          z: hit.z - dragOffset.current.z,
        });
      }
    }

    // Keep the card facing the viewer rather than tumbling — a real
    // badge on a lanyard mostly swings, it doesn't cartwheel, and an
    // unconstrained rigid body looks wrong doing that in a UI context.
    const rot = body.rotation();
    const euler = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    );
    const damped = THREE.MathUtils.damp(euler.z, 0, 6, 1 / 60);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(euler.x, euler.y, damped));
    body.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true);

    if (meshRef.current) {
      const t = body.translation();
      meshRef.current.position.set(t.x, t.y, t.z);
      meshRef.current.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }
  });

  return (
    <>
      <RigidBody
        ref={cardRef}
        colliders={false}
        type="dynamic"
        angularDamping={3}
        linearDamping={1.2}
        position={[0, ANCHOR_Y - LINK_GAP * 3 - CARD_H / 2, 0]}
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_T / 2]} />
      </RigidBody>

      <group
        ref={meshRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMissed={() => dragging && stopDragging()}
        onPointerOver={() => {
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!dragging) document.body.style.cursor = "auto";
        }}
      >
        {/* Clip connecting the card to the band. */}
        <mesh position={[0, CARD_H / 2 + 0.06, 0]}>
          <boxGeometry args={[0.22, 0.14, 0.06]} />
          <meshStandardMaterial color="#d8dce2" metalness={0.3} roughness={0.4} />
        </mesh>

        <RoundedBox args={[CARD_W, CARD_H, CARD_T]} radius={0.06} smoothness={4}>
          <meshPhysicalMaterial
            color="#0a0c11"
            roughness={0.35}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
          />
        </RoundedBox>

        {/* Portrait */}
        <mesh position={[0, CARD_H * 0.14, CARD_T / 2 + 0.001]}>
          <planeGeometry args={[CARD_W - 0.04, CARD_H * 0.56]} />
          <meshBasicMaterial map={portrait} toneMapped={false} />
        </mesh>

        {/* Info panel */}
        <mesh position={[0, -CARD_H * 0.31, CARD_T / 2 + 0.001]}>
          <planeGeometry args={[CARD_W - 0.02, CARD_H * 0.36]} />
          <meshStandardMaterial color="#c4c1ba" roughness={0.9} />
        </mesh>

        <Text
          position={[-CARD_W / 2 + 0.14, -CARD_H * 0.22, CARD_T / 2 + 0.01]}
          fontSize={0.15}
          color="#1c1c1c"
          anchorX="left"
          anchorY="middle"
          fontWeight={700}
        >
          {personalInfo.name}
        </Text>
        {ROLE_LINES.map((line, i) => (
          <Text
            key={line}
            position={[-CARD_W / 2 + 0.14, -CARD_H * 0.32 - i * 0.14, CARD_T / 2 + 0.01]}
            fontSize={0.1}
            color="#4a4844"
            anchorX="left"
            anchorY="middle"
          >
            {line}
          </Text>
        ))}
      </group>
    </>
  );
}

function Scene() {
  const anchor = useRef<any>(null);
  const card = useRef<any>(null);

  return (
    <>
      {/* No drei <Environment> — its presets fetch an HDRI from an
          external CDN at runtime, which is a fragile thing to depend on
          in production (and hung this exact page load in testing). A
          second, dimmer directional light standing in for bounce/fill
          light gets a similar clearcoat highlight without the network
          dependency. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-4, -2, 3]} intensity={0.35} />

      <RigidBody ref={anchor} type="fixed" position={[0, ANCHOR_Y, 0]}>
        <CuboidCollider args={[0.05, 0.05, 0.05]} />
      </RigidBody>

      {/* Card mounts before Band: Band's spherical joint reads
          cardRef.current once in its own mount effect, and if Card's
          RigidBody hasn't populated that ref yet by then, the joint is
          silently created against `null` and never actually attaches —
          which is exactly what was happening with Card declared second. */}
      <Card cardRef={card} />
      <Band anchorRef={anchor} cardRef={card} />
    </>
  );
}

/**
 * A real, physically-simulated 3D badge — react-three-fiber + Rapier
 * rigid bodies and rope joints for the lanyard, instead of the earlier
 * spring-driven CSS/DOM version. Built after
 * vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber:
 * a fixed anchor, three rope-jointed chain links, and the card itself as
 * a fourth body on a spherical joint, so it hangs and swings under real
 * gravity rather than a hand-tuned spring approximation of one.
 *
 * Drag turns the card into a kinematic body driven by a pointer raycast
 * against a camera-facing plane (see Card's onPointerDown) instead of
 * applying forces — release hands it back to the physics simulation,
 * which is what makes it fall and settle believably afterward.
 */
export default function IDCard() {
  const reduced = useReducedMotion();

  if (reduced) {
    // A full physics simulation is exactly the kind of motion this
    // preference exists to opt out of — render the card at rest, no
    // canvas, no simulation loop.
    return (
      <div
        className="relative mx-auto flex flex-col items-center gap-3 rounded-[18px] border border-white/10 bg-[#0a0c11] p-6 text-center"
        style={{ width: "clamp(200px, 17vw, 250px)", aspectRatio: "0.64" }}
      >
        <span className="font-display text-[1.05rem] font-semibold text-white">
          {personalInfo.name}
        </span>
        <span className="text-[0.75rem] text-white/60">Software QA Automation Engineer</span>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto touch-none"
      style={{ width: "clamp(230px, 22vw, 320px)", height: "clamp(340px, 34vw, 480px)" }}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 30 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <Physics gravity={[0, -30, 0]} interpolate>
            <Scene />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
