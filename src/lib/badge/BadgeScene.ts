import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  ExtrudeGeometry,
  HemisphereLight,
  MathUtils,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  Object3D,
  Path,
  PerspectiveCamera,
  PMREMGenerator,
  Plane,
  Raycaster,
  RepeatWrapping,
  Scene,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Intersection,
  type Material,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  ATTACH,
  BadgeSim,
  CARD_D,
  CARD_H,
  CARD_W,
  GRAVITY,
  ROPE_SEGMENTS,
  SLOT,
} from "./physics";
import {
  loadArtAssets,
  paintBack,
  paintFront,
  paintStitch,
  paintStrap,
  STRAP_TEX_H,
  STRAP_TEX_W,
  type ArtAssets,
} from "./textures";

export interface BadgeLayout {
  /** Stage (canvas) size, CSS px. */
  width: number;
  height: number;
  /** Card width at rest, CSS px. */
  cardWidth: number;
  /** Card centre at rest within the stage, CSS px. */
  cx: number;
  cy: number;
}

interface BadgeSceneOptions {
  host: HTMLElement;
  /** Overlay clipped every frame to the card's outline, so only pointers that
   * land on the card are caught. */
  hitArea: HTMLElement;
  photo: string;
  reducedMotion: boolean;
  onContextLost: () => void;
}

const CAMERA_Z = 10;
/** Device-pixel cap: the stage is mostly empty, so more resolution only costs fill rate. */
const MAX_PIXELS = 4.5e6;

const STRAP_HALF_W = 0.15;
const STRAP_HALF_T = 0.006;
/** World length of one strap texture repeat, so the print never stretches. */
const STRAP_TILE = (STRAP_HALF_W * 2 * STRAP_TEX_H) / STRAP_TEX_W;
const SUB = 4;
const MAIN_SAMPLES = (ROPE_SEGMENTS - 1) * SUB + 1;
const WRAP_SAMPLES = 10;
const FLAP_SAMPLES = 6;
const SAMPLES = MAIN_SAMPLES + WRAP_SAMPLES + FLAP_SAMPLES;
const FLAP_LEN = 0.3;
const STITCH_ROWS = 7;

const CARD_TOP = CARD_H / 2;
const CORNER_R = 0.144;

// Strap folded round a D-ring, linked to a lobster clasp hooked through the
// card's hole; the card above the hole rests in the bottom of the hook.
const HOOK = { r: 0.024, halfW: 0.13, yaw: 0.7 };
const HOOK_Y = SLOT.y + SLOT.r - HOOK.r;
const EYE = { r: 0.042, tube: 0.013 };
const BARREL = { r: 0.03, h: 0.075 };
const LOOP_H = ATTACH.y - 2 * EYE.r - BARREL.h + 0.01 - HOOK_Y;
const D_RING = { halfW: 0.168, h: 0.19, tube: 0.016 };
/** Radius the strap wraps the D-ring's bar at. */
const FOLD_R = D_RING.tube + STRAP_HALF_T + 0.002;
/** Puts a printed bead at the bottom of the wrap, hidden under the bar. */
const STRAP_PRINT_OFFSET = (Math.PI * FOLD_R) / 2 / STRAP_TILE;

/** Keeps a card near the hero's top edge on a believably long lanyard. */
const MIN_ROPE = 3.4;


const NUDGE = 0.5;
const NUDGE_PUSH = 0.35;
const NUDGE_MAX = 0.12;

const CLICK_SLOP = 6;
const CLICK_MS = 450;

const SLEEP_SPEED = 0.003;
const SLEEP_FRAMES = 24;

/** Arrives back-first and turns to face the viewer as it settles. */
const INTRO_POSE = { yaw: -2.5, roll: 0.08 };

const OUTLINE = [
  [-CARD_W / 2, -CARD_H / 2],
  [CARD_W / 2, -CARD_H / 2],
  [CARD_W / 2, CARD_TOP],
  [0.15, CARD_TOP],
  [0.1, ATTACH.y],
  [-0.1, ATTACH.y],
  [-0.15, CARD_TOP],
  [-CARD_W / 2, CARD_TOP],
] as const;

const _v = new Vector3();
const _d = new Vector3();
const _j = new Vector3();
const _m = new Matrix4();
const _ndc = new Vector2();
const _plane = new Plane(new Vector3(0, 0, 1), 0);
const _p = new Vector3();
const _s = new Vector3();
const _n = new Vector3();
const _t = new Vector3();

/**
 * The 3D lanyard badge laid over the hero. The render loop only runs while
 * something is moving and the stage is on screen.
 */
export class BadgeScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(30, 1, 0.5, 60);
  private readonly sim = new BadgeSim();
  private readonly raycaster = new Raycaster();
  private readonly hits: Intersection[] = [];

  private readonly card = new Object3D();
  private readonly body: Mesh;
  private readonly hook: Mesh;
  private readonly dRing: Mesh;
  private readonly ribbon = new Ribbon();
  private readonly env: Texture;
  private readonly canvases = {
    front: document.createElement("canvas"),
    back: document.createElement("canvas"),
    strap: document.createElement("canvas"),
    stitch: document.createElement("canvas"),
  };
  private readonly textures: CanvasTexture[];

  private readonly attach = new Vector3();
  private readonly ropeNodes = Array.from({ length: ROPE_SEGMENTS }, () => new Vector3());
  /** Where the strap reaches the front of the D-ring's top bar. */
  private readonly strapEnd = new Vector3();
  private readonly nodes: Vector3[];

  private layout: BadgeLayout | null = null;
  private ppu = 100;
  private restAnchorY = 0;
  private reduced: boolean;
  private ready = false;
  /** Held until `play()`, so the drop-in isn't spent behind the loading screen. */
  private cleared = false;
  private started = false;
  private visible = true;
  private disposed = false;

  private raf = 0;
  private last = 0;
  private still = 0;
  private intro: { start: number; lift: number; omega: number } | null = null;

  private dragId: number | null = null;
  private dragZ = 0;
  private press: { x: number; y: number; t: number; side: number } | null = null;
  private hovering = false;
  private readonly hoverPrev = new Vector3();

  constructor(private readonly opts: BadgeSceneOptions) {
    this.reduced = opts.reducedMotion;
    this.sim.calm = opts.reducedMotion;

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = NeutralToneMapping;
    renderer.domElement.style.cssText = "position:absolute;left:0;top:0;display:block;";
    opts.host.prepend(renderer.domElement);
    this.renderer = renderer;

    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    this.env = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    this.scene.environment = this.env;
    this.scene.environmentIntensity = 0.6;

    this.scene.add(new HemisphereLight(0xffffff, 0x1a2233, 0.5));
    const key = new DirectionalLight(0xffffff, 1.7);
    key.position.set(-2.5, 5, 10);
    const rim = new DirectionalLight(0xa8e4ff, 1.1);
    rim.position.set(4, 3, -6);
    this.scene.add(key, rim);

    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const texture = (canvas: HTMLCanvasElement) => {
      const t = new CanvasTexture(canvas);
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = anisotropy;
      return t;
    };
    const frontTex = texture(this.canvases.front);
    const backTex = texture(this.canvases.back);
    const strapTex = texture(this.canvases.strap);
    strapTex.wrapT = RepeatWrapping;
    const stitchTex = texture(this.canvases.stitch);
    this.textures = [frontTex, backTex, strapTex, stitchTex];

    const face = (map: Texture) =>
      new MeshPhysicalMaterial({
        map,
        roughness: 0.5,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
      });
    // The black back is matte: a glossy coat reflects the room over it and
    // turns the black charcoal.
    const back = new MeshPhysicalMaterial({
      map: backTex,
      roughness: 0.85,
      envMapIntensity: 0.25,
    });
    const edge = new MeshStandardMaterial({ color: "#d9d5cc", roughness: 0.4 });
    const metal = new MeshStandardMaterial({ color: "#dfe3e8", metalness: 1, roughness: 0.26 });
    const darkMetal = new MeshStandardMaterial({ color: "#8d96a1", metalness: 1, roughness: 0.34 });

    this.body = new Mesh(cardGeometry(), [face(frontTex), edge, back]);
    const clasp = lobsterClasp(metal, darkMetal);
    this.hook = clasp.hook;
    this.card.add(this.body, clasp.group);
    this.dRing = new Mesh(dRingGeometry(), metal);

    const strap = new Mesh(
      this.ribbon.geometry,
      new MeshPhysicalMaterial({
        map: strapTex,
        roughness: 0.72,
        sheen: 0.8,
        sheenRoughness: 0.45,
        sheenColor: new Color("#9db4ff"),
      })
    );
    strap.frustumCulled = false;

    const stitch = new Mesh(
      this.ribbon.stitch,
      new MeshStandardMaterial({
        map: stitchTex,
        transparent: true,
        depthWrite: false,
        roughness: 0.85,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    stitch.frustumCulled = false;

    this.scene.add(this.card, this.dRing, strap, stitch);
    this.nodes = [...this.ropeNodes.slice(0, ROPE_SEGMENTS - 1), this.strapEnd];

    const hit = opts.hitArea;
    hit.addEventListener("pointerdown", this.onDown);
    hit.addEventListener("pointermove", this.onMove);
    hit.addEventListener("pointerup", this.onUp);
    hit.addEventListener("pointercancel", this.onCancel);
    hit.addEventListener("lostpointercapture", this.onCancel);
    hit.addEventListener("pointerleave", this.onLeave);
    renderer.domElement.addEventListener("webglcontextlost", this.onContextLost);
  }

  async load() {
    const assets = await loadArtAssets(this.opts.photo);
    if (this.disposed) return;
    this.paint(assets);
    if (!assets.fontsLoaded) {
      document.fonts.ready.then(() => {
        if (this.disposed) return;
        this.paint(assets);
        this.wake(true);
      });
    }
    this.ready = true;
    this.start();
    this.wake(true);
  }

  setLayout(l: BadgeLayout) {
    this.layout = l;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / (l.width * l.height)));
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(l.width, l.height);
    this.ppu = l.cardWidth / CARD_W;

    // Off-axis projection: the camera sits squarely in front of the card's
    // rest position, with the frustum shifted to its place in the stage.
    const fullW = 2 * Math.max(l.cx, l.width - l.cx);
    const fullH = 2 * Math.max(l.cy, l.height - l.cy);
    this.camera.aspect = fullW / fullH;
    this.camera.fov = MathUtils.radToDeg(2 * Math.atan(fullH / this.ppu / 2 / CAMERA_Z));
    this.camera.position.set(0, 0, CAMERA_Z);
    this.camera.setViewOffset(fullW, fullH, fullW / 2 - l.cx, fullH / 2 - l.cy, l.width, l.height);

    const top = l.cy / this.ppu;
    const bottom = -(l.height - l.cy) / this.ppu;
    const left = -l.cx / this.ppu;
    const right = (l.width - l.cx) / this.ppu;

    // Anchor just past the stage's top edge, so the strap runs out of frame.
    const length = Math.max(top - ATTACH.y + 0.8, MIN_ROPE);
    this.restAnchorY = ATTACH.y + length;
    this.sim.setLength(length);
    if (!this.intro) this.sim.anchor.set(0, this.restAnchorY, 0);

    this.sim.walls = {
      minX: Math.min(left + 1.2, 0),
      maxX: Math.max(right - 1.2, 0),
      minY: Math.min(bottom + 1.8, 0),
      maxY: Math.max(top - 1.7, 0),
    };
    this.sim.dragBox = {
      minX: Math.min(left + 0.45, 0),
      maxX: Math.max(right - 0.45, 0),
      minY: Math.min(bottom + 0.5, 0),
      maxY: Math.max(top - 0.5, 0),
    };

    this.start();
    this.wake(true);
  }

  play() {
    this.cleared = true;
    this.start();
    this.wake(true);
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) this.wake(true);
  }

  setReducedMotion(reduced: boolean) {
    if (reduced === this.reduced) return;
    this.reduced = reduced;
    this.sim.calm = reduced;
    if (reduced && this.intro) {
      this.intro = null;
      this.sim.reset(_v.set(0, this.restAnchorY, 0), this.sim.length);
    }
    this.wake(true);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);

    const hit = this.opts.hitArea;
    hit.removeEventListener("pointerdown", this.onDown);
    hit.removeEventListener("pointermove", this.onMove);
    hit.removeEventListener("pointerup", this.onUp);
    hit.removeEventListener("pointercancel", this.onCancel);
    hit.removeEventListener("lostpointercapture", this.onCancel);
    hit.removeEventListener("pointerleave", this.onLeave);
    hit.style.clipPath = "polygon(0 0, 0 0, 0 0)";

    const materials = new Set<Material>();
    this.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m));
    });
    materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.env.dispose();

    const canvas = this.renderer.domElement;
    canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.renderer.dispose();
    // Free the GL context now; dev remounts and HMR would otherwise pile them up.
    this.renderer.forceContextLoss();
    canvas.remove();
  }

  private paint(assets: ArtAssets) {
    paintFront(this.canvases.front, assets);
    paintBack(this.canvases.back);
    paintStrap(this.canvases.strap);
    paintStitch(this.canvases.stitch, FLAP_LEN / (STRAP_HALF_W * 2));
    this.textures.forEach((t) => (t.needsUpdate = true));
  }

  private start() {
    if (this.started || !this.ready || !this.cleared || !this.layout) return;
    this.started = true;
    const anchor = _v.set(0, this.restAnchorY, 0);
    if (this.reduced) {
      this.sim.reset(anchor, this.sim.length);
      return;
    }
    // Lowered in from above the stage on a critically damped curve that never
    // accelerates harder than gravity, so the strap stays taut.
    const l = this.layout;
    const lift = (l.cy + l.cardWidth / 0.64 / 2 + 40) / this.ppu;
    const omega = MathUtils.clamp(Math.sqrt((0.8 * GRAVITY) / lift), 2.4, 4.2);
    this.sim.reset(anchor, this.sim.length, { lift, ...INTRO_POSE });
    this.intro = { start: performance.now(), lift, omega };
  }

  private wake(renderIfIdle = false) {
    if (this.disposed || !this.started || !this.visible) return;
    this.still = 0;
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
      if (renderIfIdle) this.render();
    }
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (this.disposed) return;
    const dt = MathUtils.clamp((now - this.last) / 1000, 0, 1 / 20);
    this.last = now;

    if (this.intro) {
      const { start, lift, omega } = this.intro;
      const wt = (omega * Math.max(0, now - start)) / 1000;
      this.sim.anchor.y = this.restAnchorY + lift * (1 + wt) * Math.exp(-wt);
      if (wt > 11) {
        this.sim.anchor.y = this.restAnchorY;
        this.intro = null;
      }
    }

    this.sim.step(dt);
    this.render();

    const resting = !this.intro && !this.sim.dragging && this.sim.motion() < SLEEP_SPEED;
    this.still = resting ? this.still + 1 : 0;
    if (this.still < SLEEP_FRAMES && this.visible) this.raf = requestAnimationFrame(this.tick);
  };

  private render() {
    const l = this.layout;
    if (!l) return;
    this.sim.renderPose(this.card.position, this.card.quaternion);
    this.card.updateMatrixWorld();
    this.attach.copy(ATTACH).applyMatrix4(this.card.matrixWorld);
    this.sim.renderNodes(this.ropeNodes);

    // The D-ring's bar sits a ring's height above the attach point, so the
    // ring's bottom threads the clasp's eye.
    _d.subVectors(this.ropeNodes[ROPE_SEGMENTS - 1], this.attach).normalize();
    this.strapEnd.copy(this.attach).addScaledVector(_d, D_RING.h - EYE.tube - 0.004);
    this.ribbon.update(this.nodes, this.sim.twist);

    const rb = this.ribbon;
    _m.makeBasis(rb.endSide, rb.endUp, rb.endNormal);
    this.dRing.quaternion.setFromRotationMatrix(_m);
    this.dRing.position.copy(rb.foldCenter);

    this.renderer.render(this.scene, this.camera);
    this.syncHitArea(l);
  }

  private syncHitArea(l: BadgeLayout) {
    let poly = "";
    for (const [x, y] of OUTLINE) {
      _v.set(x, y, 0).applyMatrix4(this.card.matrixWorld).project(this.camera);
      const px = ((_v.x + 1) / 2) * l.width;
      const py = ((1 - _v.y) / 2) * l.height;
      poly += `${poly ? "," : ""}${px.toFixed(1)}px ${py.toFixed(1)}px`;
    }
    this.opts.hitArea.style.clipPath = `polygon(${poly})`;
  }

  private setRay(e: { clientX: number; clientY: number }) {
    const r = this.renderer.domElement.getBoundingClientRect();
    _ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(_ndc, this.camera);
  }

  private pick(e: { clientX: number; clientY: number }) {
    this.setRay(e);
    this.hits.length = 0;
    this.raycaster.intersectObjects([this.body, this.hook], false, this.hits);
    return this.hits[0] ?? null;
  }

  private pointerAt(e: { clientX: number; clientY: number }, z: number, out: Vector3) {
    this.setRay(e);
    _plane.constant = -z;
    return this.raycaster.ray.intersectPlane(_plane, out) !== null;
  }

  private onDown = (e: PointerEvent) => {
    if (!this.started || e.button !== 0 || this.dragId !== null) return;
    const hit = this.pick(e);
    if (!hit) return;
    e.preventDefault();
    this.opts.hitArea.setPointerCapture(e.pointerId);
    this.dragId = e.pointerId;
    this.dragZ = hit.point.z;
    this.sim.startDrag(hit.point);
    this.press = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      side: this.card.worldToLocal(_v.copy(hit.point)).x,
    };
    this.wake();
  };

  private onMove = (e: PointerEvent) => {
    if (e.pointerId === this.dragId) {
      if (this.press && Math.hypot(e.clientX - this.press.x, e.clientY - this.press.y) > CLICK_SLOP) {
        this.press = null;
      }
      if (this.pointerAt(e, this.dragZ, _v)) this.sim.moveDrag(_v);
      this.wake();
      return;
    }
    if (e.pointerType !== "mouse" || !this.started) return;

    const hit = this.pick(e);
    if (!hit || this.reduced || !this.pointerAt(e, 0, _v)) {
      this.hovering = false;
      return;
    }
    // Brushing the card nudges it along with the pointer and slightly away.
    if (this.hovering) {
      _d.subVectors(_v, this.hoverPrev);
      _j.set(_d.x * NUDGE, _d.y * NUDGE, -_d.length() * NUDGE_PUSH);
      if (_j.length() > NUDGE_MAX) _j.setLength(NUDGE_MAX);
      this.sim.push(hit.point, _j);
      this.wake();
    }
    this.hoverPrev.copy(_v);
    this.hovering = true;
  };

  private onUp = (e: PointerEvent) => {
    if (e.pointerId !== this.dragId) return;
    const press = this.press;
    this.endDrag(e.pointerId);
    if (press && performance.now() - press.t < CLICK_MS) this.click(press);
  };

  private onCancel = (e: PointerEvent) => {
    if (e.pointerId === this.dragId) this.endDrag(e.pointerId);
  };

  private endDrag(pointerId: number) {
    const hit = this.opts.hitArea;
    if (hit.hasPointerCapture(pointerId)) hit.releasePointerCapture(pointerId);
    this.dragId = null;
    this.press = null;
    this.sim.endDrag();
    this.wake();
  }

  /** A click flips the card. */
  private click(press: { side: number }) {
    this.flip(press.side);
  }

  private flip(side: number) {
    if (this.disposed) return;
    this.sim.flip(side);
    this.wake();
  }

  private onLeave = () => {
    this.hovering = false;
  };

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.opts.onContextLost();
  };
}

/**
 * The lanyard: a flat ribbon swept along a spline through the rope nodes,
 * wrapped round the D-ring's bar and folded back up behind itself. Front and
 * back are separate faces (the back's U flipped so the print reads from
 * behind), with thin edge walls.
 */
class Ribbon {
  readonly geometry = new BufferGeometry();
  readonly stitch = new BufferGeometry();
  /** Frame where the strap meets the D-ring, and the bar it wraps. */
  readonly endSide = new Vector3(1, 0, 0);
  readonly endUp = new Vector3(0, 1, 0);
  readonly endNormal = new Vector3(0, 0, 1);
  readonly foldCenter = new Vector3();

  private readonly pos: BufferAttribute;
  private readonly nrm: BufferAttribute;
  private readonly uv: BufferAttribute;
  private readonly stitchPos: BufferAttribute;
  private readonly stitchNrm: BufferAttribute;
  private readonly c = new Float32Array(SAMPLES * 3);
  private readonly sides = new Float32Array(SAMPLES * 3);
  private readonly normals = new Float32Array(SAMPLES * 3);
  private readonly arc = new Float32Array(SAMPLES);
  private mainLength = 1;

  constructor() {
    const verts = SAMPLES * 8;
    this.pos = new BufferAttribute(new Float32Array(verts * 3), 3).setUsage(DynamicDrawUsage);
    this.nrm = new BufferAttribute(new Float32Array(verts * 3), 3).setUsage(DynamicDrawUsage);
    this.uv = new BufferAttribute(new Float32Array(verts * 2), 2).setUsage(DynamicDrawUsage);

    // Per sample: front L/R, back L/R, left edge F/B, right edge F/B.
    const index: number[] = [];
    for (let i = 0; i < SAMPLES - 1; i++) {
      const a = i * 8;
      const b = a + 8;
      index.push(a, b, b + 1, a, b + 1, a + 1);
      index.push(a + 2, b + 3, b + 2, a + 2, a + 3, b + 3);
      index.push(a + 4, a + 5, b + 5, a + 4, b + 5, b + 4);
      index.push(a + 6, b + 7, a + 7, a + 6, b + 6, b + 7);
    }
    const us = [0, 1, 1, 0, 0.04, 0.04, 0.96, 0.96];
    const uv = this.uv.array as Float32Array;
    for (let i = 0; i < verts; i++) uv[i * 2] = us[i % 8];
    this.geometry.setIndex(index);
    this.geometry.setAttribute("position", this.pos);
    this.geometry.setAttribute("normal", this.nrm);
    this.geometry.setAttribute("uv", this.uv);

    // Stitch overlay: STITCH_ROWS rows of 2 vertices on the strap's front over
    // the fold, then the same on the back of the flap.
    const sv = STITCH_ROWS * 4;
    this.stitchPos = new BufferAttribute(new Float32Array(sv * 3), 3).setUsage(DynamicDrawUsage);
    this.stitchNrm = new BufferAttribute(new Float32Array(sv * 3), 3).setUsage(DynamicDrawUsage);
    const stitchUv = new Float32Array(sv * 2);
    const stitchIndex: number[] = [];
    for (let face = 0; face < 2; face++) {
      const base = face * STITCH_ROWS * 2;
      for (let j = 0; j < STITCH_ROWS; j++) {
        const v = j / (STITCH_ROWS - 1);
        stitchUv.set([0, v, 1, v], (base + j * 2) * 2);
        if (j < STITCH_ROWS - 1) {
          const l = base + j * 2;
          const u = l + 2;
          stitchIndex.push(u, l, l + 1, u, l + 1, u + 1);
        }
      }
    }
    this.stitch.setIndex(stitchIndex);
    this.stitch.setAttribute("position", this.stitchPos);
    this.stitch.setAttribute("normal", this.stitchNrm);
    this.stitch.setAttribute("uv", new BufferAttribute(stitchUv, 2));
  }

  update(nodes: Vector3[], twist: number) {
    this.sampleSpline(nodes);
    this.frameMain(twist);
    this.buildFold();
    this.writeVertices();
    this.layStitches();
  }

  private sampleSpline(nodes: Vector3[]) {
    const c = this.c;
    const last = nodes.length - 1;
    let k = 0;
    for (let s = 0; s < last; s++) {
      const p1 = nodes[s];
      const p2 = nodes[s + 1];
      const p0 = s > 0 ? nodes[s - 1] : null;
      const p3 = s + 2 <= last ? nodes[s + 2] : null;
      for (let j = 0; j < SUB; j++, k++) {
        const t = j / SUB;
        c[k * 3] = catmull(p0 ? p0.x : 2 * p1.x - p2.x, p1.x, p2.x, p3 ? p3.x : 2 * p2.x - p1.x, t);
        c[k * 3 + 1] = catmull(p0 ? p0.y : 2 * p1.y - p2.y, p1.y, p2.y, p3 ? p3.y : 2 * p2.y - p1.y, t);
        c[k * 3 + 2] = catmull(p0 ? p0.z : 2 * p1.z - p2.z, p1.z, p2.z, p3 ? p3.z : 2 * p2.z - p1.z, t);
      }
    }
    c.set([nodes[last].x, nodes[last].y, nodes[last].z], k * 3);

    this.arc[0] = 0;
    for (let i = 1; i < MAIN_SAMPLES; i++) this.arc[i] = this.arc[i - 1] + dist(c, i);
    this.mainLength = this.arc[MAIN_SAMPLES - 1] || 1;
  }

  /**
   * Frames for the main strap. The width direction comes from a reference
   * face normal (the viewer's direction, turned by this sample's share of the
   * twist), which stays well-defined however the strap is pulled across the
   * screen; it only degenerates when the strap points straight at the camera.
   */
  private frameMain(twist: number) {
    const { c, sides, normals } = this;
    for (let i = 0; i < MAIN_SAMPLES; i++) {
      tangentAt(c, i, 0, MAIN_SAMPLES - 1, _t);
      const th = (twist * this.arc[i]) / this.mainLength;
      _s.set(Math.sin(th), 0, Math.cos(th)).cross(_t);
      if (_s.lengthSq() < 1e-8) _s.fromArray(sides, Math.max(i - 1, 0) * 3);
      _s.normalize();
      _n.crossVectors(_t, _s);
      _s.toArray(sides, i * 3);
      _n.toArray(normals, i * 3);
    }
    const e = (MAIN_SAMPLES - 1) * 3;
    this.endSide.fromArray(sides, e);
    this.endNormal.fromArray(normals, e);
    tangentAt(c, MAIN_SAMPLES - 1, 0, MAIN_SAMPLES - 1, _t);
    this.endUp.copy(_t).negate();
  }

  /**
   * A half-turn under the D-ring's bar, then the flap back up. The flap
   * follows the main strap's own curve a fold's thickness behind it, so it
   * stays flat against the strap however the strap bends.
   */
  private buildFold() {
    const { c, sides } = this;
    const n = this.endNormal;
    const down = _t.copy(this.endUp).negate();
    this.foldCenter.fromArray(c, (MAIN_SAMPLES - 1) * 3).addScaledVector(n, -FOLD_R);

    for (let j = 1; j <= WRAP_SAMPLES; j++) {
      const phi = (Math.PI * j) / WRAP_SAMPLES;
      _p.copy(this.foldCenter)
        .addScaledVector(n, FOLD_R * Math.cos(phi))
        .addScaledVector(down, FOLD_R * Math.sin(phi));
      const i = MAIN_SAMPLES - 1 + j;
      _p.toArray(c, i * 3);
      this.endSide.toArray(sides, i * 3);
    }
    for (let j = 1; j <= FLAP_SAMPLES; j++) {
      this.alongMain((FLAP_LEN * j) / FLAP_SAMPLES, _p, _s, _n);
      _p.addScaledVector(_n, -2 * FOLD_R);
      const i = MAIN_SAMPLES - 1 + WRAP_SAMPLES + j;
      _p.toArray(c, i * 3);
      _s.toArray(sides, i * 3);
    }
    for (let i = MAIN_SAMPLES; i < SAMPLES; i++) this.arc[i] = this.arc[i - 1] + dist(c, i);
  }

  private writeVertices() {
    const { c, sides, normals, arc } = this;
    const pos = this.pos.array as Float32Array;
    const nrm = this.nrm.array as Float32Array;
    const uv = this.uv.array as Float32Array;

    for (let i = 0; i < SAMPLES; i++) {
      _s.fromArray(sides, i * 3);
      if (i < MAIN_SAMPLES) {
        _n.fromArray(normals, i * 3);
      } else {
        tangentAt(c, i, 0, SAMPLES - 1, _t);
        _n.crossVectors(_t, _s);
        if (_n.lengthSq() < 1e-8) _n.fromArray(normals, (i - 1) * 3);
        _n.normalize().toArray(normals, i * 3);
      }

      const o = i * 24;
      for (let q = 0; q < 8; q++) {
        const sgnS = q === 0 || q === 2 || q === 4 || q === 5 ? -1 : 1;
        const sgnN = q === 0 || q === 1 || q === 4 || q === 6 ? 1 : -1;
        const w = STRAP_HALF_W * sgnS;
        const t = STRAP_HALF_T * sgnN;
        pos[o + q * 3] = c[i * 3] + _s.x * w + _n.x * t;
        pos[o + q * 3 + 1] = c[i * 3 + 1] + _s.y * w + _n.y * t;
        pos[o + q * 3 + 2] = c[i * 3 + 2] + _s.z * w + _n.z * t;
        const face = q < 4 ? _n : _s;
        const sgn = q < 4 ? sgnN : sgnS;
        nrm[o + q * 3] = face.x * sgn;
        nrm[o + q * 3 + 1] = face.y * sgn;
        nrm[o + q * 3 + 2] = face.z * sgn;
      }

      // V runs up from the D-ring, so the print stays fixed relative to the
      // card however the strap bends or reels out.
      const v = (this.mainLength - arc[i]) / STRAP_TILE + STRAP_PRINT_OFFSET;
      for (let q = 0; q < 8; q++) uv[(i * 8 + q) * 2 + 1] = v;
    }
    this.pos.needsUpdate = true;
    this.nrm.needsUpdate = true;
    this.uv.needsUpdate = true;
  }

  /** Box-X stitching over the fold, on the strap's front and the flap's back. */
  private layStitches() {
    const pos = this.stitchPos.array as Float32Array;
    const nrm = this.stitchNrm.array as Float32Array;
    const lift = STRAP_HALF_T + 0.0015;
    const back = STITCH_ROWS * 2;

    for (let j = 0; j < STITCH_ROWS; j++) {
      this.alongMain((FLAP_LEN * j) / (STITCH_ROWS - 1), _p, _s, _n);
      _p.addScaledVector(_n, lift);
      writeRow(pos, nrm, j * 2, _p, _s, _n);
      // Back face: mirrored across so it reads and winds correctly from behind.
      _p.addScaledVector(_n, -2 * (FOLD_R + lift));
      writeRow(pos, nrm, back + j * 2, _p, _s.negate(), _n.negate());
    }
    this.stitchPos.needsUpdate = true;
    this.stitchNrm.needsUpdate = true;
  }

  /** Centre, side and normal of the main strap a distance `d` up from its end. */
  private alongMain(d: number, p: Vector3, s: Vector3, n: Vector3) {
    const { c, arc, sides, normals } = this;
    const target = this.mainLength - d;
    let i = MAIN_SAMPLES - 2;
    while (i > 0 && arc[i] > target) i--;
    const t = MathUtils.clamp((target - arc[i]) / (arc[i + 1] - arc[i] || 1), 0, 1);
    lerpPacked(c, i, t, p);
    lerpPacked(sides, i, t, s).normalize();
    lerpPacked(normals, i, t, n).normalize();
  }
}

function writeRow(
  pos: Float32Array,
  nrm: Float32Array,
  v: number,
  p: Vector3,
  s: Vector3,
  n: Vector3
) {
  pos.set(
    [
      p.x - s.x * STRAP_HALF_W,
      p.y - s.y * STRAP_HALF_W,
      p.z - s.z * STRAP_HALF_W,
      p.x + s.x * STRAP_HALF_W,
      p.y + s.y * STRAP_HALF_W,
      p.z + s.z * STRAP_HALF_W,
    ],
    v * 3
  );
  nrm.set([n.x, n.y, n.z, n.x, n.y, n.z], v * 3);
}

/** Unit tangent at sample i (pointing to higher indices) within [lo, hi]. */
function tangentAt(c: Float32Array, i: number, lo: number, hi: number, out: Vector3) {
  const a = Math.max(i - 1, lo) * 3;
  const b = Math.min(i + 1, hi) * 3;
  out.set(c[b] - c[a], c[b + 1] - c[a + 1], c[b + 2] - c[a + 2]);
  const len = out.length();
  return len > 1e-9 ? out.divideScalar(len) : out.set(0, -1, 0);
}

function lerpPacked(arr: Float32Array, i: number, t: number, out: Vector3) {
  const a = i * 3;
  return out.set(
    arr[a] + (arr[a + 3] - arr[a]) * t,
    arr[a + 1] + (arr[a + 4] - arr[a + 1]) * t,
    arr[a + 2] + (arr[a + 5] - arr[a + 2]) * t
  );
}

function dist(c: Float32Array, i: number) {
  const dx = c[i * 3] - c[i * 3 - 3];
  const dy = c[i * 3 + 1] - c[i * 3 - 2];
  const dz = c[i * 3 + 2] - c[i * 3 - 1];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  return (
    0.5 *
    (2 * p1 +
      (p2 - p0) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (3 * p1 - p0 - 3 * p2 + p3) * t2 * t)
  );
}

/** D-ring in the strap's frame (origin on the bar the strap wraps). */
function dRingGeometry() {
  const { halfW: w, h } = D_RING;
  const outline: [number, number][] = [
    [-w, 0],
    [-w / 3, 0],
    [w / 3, 0],
    [w, 0],
    [w * 0.9, -h * 0.26],
    [w * 0.55, -h * 0.63],
    [w * 0.2, -h * 0.92],
    [0, -h],
    [-w * 0.2, -h * 0.92],
    [-w * 0.55, -h * 0.63],
    [-w * 0.9, -h * 0.26],
  ];
  const curve = new CatmullRomCurve3(
    outline.map(([x, y]) => new Vector3(x, y, 0)),
    true,
    "centripetal"
  );
  return new TubeGeometry(curve, 96, D_RING.tube, 10, true);
}

/**
 * Lobster clasp in the card's frame: a teardrop wire loop whose bottom passes
 * through the hole, with a swivel barrel and eye. Turned about the vertical so
 * it reads as a loop from the front.
 */
function lobsterClasp(metal: Material, dark: Material) {
  const group = new Object3D();
  group.position.y = HOOK_Y;
  group.rotation.y = HOOK.yaw;

  const taper = (y: number) => 1 - 0.6 * Math.pow(y / LOOP_H, 1.5);
  const points: Vector3[] = [];
  for (let i = 0; i < 32; i++) {
    const t = (i / 32) * Math.PI * 2;
    const y = (LOOP_H / 2) * (1 - Math.cos(t));
    points.push(new Vector3(0, y, HOOK.halfW * Math.sin(t) * taper(y)));
  }
  const curve = new CatmullRomCurve3(points, true, "centripetal");
  const hook = new Mesh(new TubeGeometry(curve, 128, HOOK.r, 12, true), metal);

  const barrel = new Mesh(new CylinderGeometry(BARREL.r, BARREL.r * 0.85, BARREL.h, 20), metal);
  barrel.position.y = LOOP_H + BARREL.h / 2 - 0.01;

  // Square to the card, so it links the D-ring like a chain link.
  const eye = new Mesh(new TorusGeometry(EYE.r, EYE.tube, 10, 28), metal);
  eye.position.y = LOOP_H + BARREL.h - 0.01 + EYE.r;
  eye.rotation.y = Math.PI / 2 - HOOK.yaw;

  const ty = LOOP_H * 0.55;
  const trigger = new Mesh(new BoxGeometry(0.022, 0.07, 0.03), dark);
  trigger.position.set(0, ty, HOOK.halfW * Math.sin(Math.acos(1 - (2 * ty) / LOOP_H)) * taper(ty) + HOOK.r);

  group.add(hook, barrel, eye, trigger);
  return { group, hook };
}

/**
 * Rounded card slab with a hairline bevel and the punched hole. The lids are
 * split into material groups (0 front, 1 edge, 2 back) with UVs fitted to the
 * artwork, the back mirrored so it reads correctly when turned.
 */
function cardGeometry() {
  const bevel = 0.008;
  const depth = CARD_D - bevel * 2;
  const w = CARD_W - bevel * 2;
  const h = CARD_H - bevel * 2;
  const r = CORNER_R - bevel;

  const shape = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - r);
  shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + h);
  shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);

  const hole = new Path();
  hole.absarc(0, SLOT.y, SLOT.r, 0, Math.PI * 2, false);
  shape.holes.push(hole);

  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geo.translate(0, 0, -depth / 2);

  // ExtrudeGeometry emits both lids as one group, back half first.
  const [lids, sides] = geo.groups;
  const half = lids.count / 2;
  geo.clearGroups();
  geo.addGroup(lids.start + half, half, 0);
  geo.addGroup(sides.start, sides.count, 1);
  geo.addGroup(lids.start, half, 2);

  const pos = geo.getAttribute("position");
  const uv = geo.getAttribute("uv");
  for (let i = lids.start; i < lids.start + lids.count; i++) {
    const u = (pos.getX(i) + w / 2) / w;
    const v = (pos.getY(i) + h / 2) / h;
    uv.setXY(i, i < lids.start + half ? 1 - u : u, v);
  }
  return geo;
}
