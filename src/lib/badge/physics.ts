import { Euler, Quaternion, Vector3 } from "three";

/** Card size in world units; the camera maps CARD_W to the layout box's CSS width. */
export const CARD_W = 2;
export const CARD_H = CARD_W / 0.64;
export const CARD_D = 0.036;

/** Punched hole for the clasp's hook, in the card's local frame. */
export const SLOT = { r: 0.065, y: CARD_H / 2 - 0.15 };

/** Top of the clasp's swivel eye, where the strap attaches (card local frame;
 * the card's centre of mass is the origin). */
export const ATTACH = new Vector3(0, CARD_H / 2 + 0.48, 0);

/** Fixed node count, so layout changes only re-space the rope. */
export const ROPE_SEGMENTS = 28;

// Fixed solver step, independent of display refresh rate; rendering
// interpolates between the last two steps.
const H = 1 / 720;
// Enough to cover a 50ms frame, so a slow frame never plays out in slow
// motion. Each step is a few microseconds.
const MAX_STEPS = 36;
export const GRAVITY = 55;
const CARD_MASS = 1;
const ROPE_MASS = 0.16;

const LIN_DAMP = 1.1;
const ANG_DAMP = 1.6;
const ANG_DAMP_DRAG = 4.5;

// Air drag, neighbour-velocity smoothing and soft bending keep the light
// strap from rippling like a string when the card moves.
const ROPE_DAMP = 4;
const ROPE_SMOOTH = 0.18;
const ROPE_BEND_COMPLIANCE = 4e-4;

// Strap torsion turns the card back toward its target face. It acts on the
// accumulated twist, so a card spun round twice unwinds twice.
const TWIST_K = 5;
const TWIST_C = 0.9;
const TWIST_MAX = Math.PI * 2;

// Sideways motion turns the card's face into the swing.
const SWING_YAW = 0.18;
const SWING_YAW_MAX = 1.2;

// The grab point eases toward the pointer over ~14ms, just enough to
// smooth raw input without the card trailing behind the hand.
const DRAG_COMPLIANCE = 6e-5;
const DRAG_FOLLOW = 70;
const DRAG_SOFT_EDGE = 0.6;

// Retractable reel: while held, the strap pays out or reels in (within these
// multiples of its rest length); released, it retracts to rest length.
const MIN_STRETCH = 0.2;
const MAX_STRETCH = 2.4;
const REEL_RATE = 16;
const RETRACT_RATE = 4.5;

/** Damping multiplier for reduced motion: it glides back instead of swinging. */
const CALM = 4;

// Hover pushes are spread over ~80ms so brushing the card never jolts it.
const PUSH_RATE = 12;
const PUSH_MAX = 0.35;

const WALL_K = 180;
const WALL_C = 14;

const MAX_V = 40;
const MAX_W = 30;

export interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Pose {
  /** Start this far above the rest position. */
  lift?: number;
  yaw?: number;
  roll?: number;
}

const _r = new Vector3();
const _n = new Vector3();
const _rn = new Vector3();
const _t = new Vector3();
const _p = new Vector3();
const _d = new Vector3();
const _ax = new Vector3();
const _az = new Vector3();
const _q = new Quaternion();
const _e = new Euler();

/**
 * A rope of point masses hanging from a kinematic anchor, with a rigid card
 * on a ball joint at its end, solved with extended position-based dynamics
 * (Müller et al. 2020).
 */
export class BadgeSim {
  readonly anchor = new Vector3();
  length = 4;
  private seg = this.length / ROPE_SEGMENTS;

  /** Rope nodes; index 0 is pinned to the anchor, the card's attach point is
   * the implicit last node. */
  readonly p: Vector3[] = [];
  private readonly prev: Vector3[] = [];
  private readonly vel: Vector3[] = [];
  private readonly wRope = ROPE_SEGMENTS / ROPE_MASS;

  readonly x = new Vector3();
  readonly v = new Vector3();
  readonly q = new Quaternion();
  readonly w = new Vector3();
  private readonly xPrev = new Vector3();
  private readonly qPrev = new Quaternion();
  private readonly invMass = 1 / CARD_MASS;
  private readonly invI = new Vector3(
    12 / (CARD_MASS * (CARD_H * CARD_H + CARD_D * CARD_D)),
    12 / (CARD_MASS * (CARD_W * CARD_W + CARD_D * CARD_D)),
    12 / (CARD_MASS * (CARD_W * CARD_W + CARD_H * CARD_H))
  );

  /** Accumulated (unwrapped) yaw: how wound up the strap is. */
  twist = 0;
  private yawPrev = 0;
  /** 0 shows the front, ±π the back. */
  private twistTarget = 0;
  private showingBack = false;

  dragging = false;
  calm = false;
  private readonly grab = new Vector3();
  private grabArm = 0;
  private readonly target = new Vector3();
  private readonly follow = new Vector3();
  /** Reel pay-out (1 = rest length), and its state when the drag began. */
  private stretch = 1;
  private stretch0 = 1;
  private needed0 = 0;

  private readonly pushJ = new Vector3();
  private readonly pushAt = new Vector3();
  private acc = 0;

  walls: Box = { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
  dragBox: Box = { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };

  constructor() {
    for (let i = 0; i < ROPE_SEGMENTS; i++) {
      this.p.push(new Vector3());
      this.prev.push(new Vector3());
      this.vel.push(new Vector3());
    }
  }

  reset(anchor: Vector3, length: number, pose: Pose = {}) {
    const { lift = 0, yaw = 0, roll = 0 } = pose;
    this.setLength(length);
    this.anchor.copy(anchor);
    this.anchor.y += lift;

    // Attach point exactly a rope-length below the anchor: taut and straight.
    this.q.setFromEuler(_e.set(0, yaw, roll, "YXZ"));
    _p.copy(this.anchor);
    _p.y -= length;
    this.x.copy(ATTACH).applyQuaternion(this.q).negate().add(_p);
    this.xPrev.copy(this.x);
    this.qPrev.copy(this.q);
    this.v.set(0, 0, 0);
    this.w.set(0, 0, 0);
    this.acc = 0;

    for (let i = 0; i < ROPE_SEGMENTS; i++) {
      this.p[i].lerpVectors(this.anchor, _p, i / ROPE_SEGMENTS);
      // Tiny offset so a collinear rope can still buckle when pushed.
      this.p[i].z += Math.sin(i * 1.7) * 1e-4;
      this.prev[i].copy(this.p[i]);
      this.vel[i].set(0, 0, 0);
    }

    this.yawPrev = this.yaw();
    this.twist = this.yawPrev;
    this.dragging = false;
    this.stretch = 1;
    this.twistTarget = 0;
    this.showingBack = false;
  }

  /** Turn the card to its other face; `side` picks the spin direction.
   * Turning back to the front always unwinds the strap. */
  flip(side: number) {
    this.showingBack = !this.showingBack;
    this.twistTarget = this.showingBack ? (side < 0 ? -Math.PI : Math.PI) : 0;
  }

  setLength(length: number) {
    this.length = length;
    this.seg = length / ROPE_SEGMENTS;
  }

  step(dt: number) {
    this.acc = Math.min(this.acc + Math.max(dt, 0), H * MAX_STEPS);
    while (this.acc >= H) {
      this.substep(H);
      this.acc -= H;
    }
  }

  /** Card pose interpolated between the last two solver steps. */
  renderPose(x: Vector3, q: Quaternion) {
    const a = this.acc / H;
    x.lerpVectors(this.xPrev, this.x, a);
    q.slerpQuaternions(this.qPrev, this.q, a);
  }

  /** Rope nodes interpolated between the last two solver steps. */
  renderNodes(out: Vector3[]) {
    const a = this.acc / H;
    out[0].copy(this.p[0]);
    for (let i = 1; i < ROPE_SEGMENTS; i++) out[i].lerpVectors(this.prev[i], this.p[i], a);
  }

  startDrag(worldPoint: Vector3) {
    _q.copy(this.q).invert();
    this.grab.copy(worldPoint).sub(this.x).applyQuaternion(_q);
    this.grabArm = _d.copy(this.grab).sub(ATTACH).length();
    this.target.copy(worldPoint);
    this.follow.copy(worldPoint);
    this.stretch0 = this.stretch;
    this.needed0 = this.needed();
    this.dragging = true;
  }

  moveDrag(worldPoint: Vector3) {
    this.target.copy(worldPoint);
    softClampToBox(this.target, this.dragBox, DRAG_SOFT_EDGE);
    const reach = this.length * MAX_STRETCH + this.grabArm;
    _d.subVectors(this.target, this.anchor);
    if (_d.length() > reach) this.target.copy(this.anchor).addScaledVector(_d.normalize(), reach);
  }

  endDrag() {
    this.dragging = false;
  }

  push(worldPoint: Vector3, j: Vector3) {
    _q.copy(this.q).invert();
    this.pushAt.copy(worldPoint).sub(this.x).applyQuaternion(_q);
    this.pushJ.add(j);
    clampLength(this.pushJ, PUSH_MAX);
  }

  /** Fastest-moving part of the system (units/s), for sleep detection. */
  motion() {
    let m = this.v.length() + this.w.length() * CARD_H * 0.5 + this.pushJ.length() * 10;
    for (let i = 1; i < ROPE_SEGMENTS; i++) m = Math.max(m, this.vel[i].length());
    return m;
  }

  private substep(h: number) {
    const { p, prev, vel } = this;
    const ropeDamp = Math.exp(-ROPE_DAMP * h);

    p[0].copy(this.anchor);
    for (let i = 1; i < ROPE_SEGMENTS; i++) {
      vel[i].y -= GRAVITY * h;
      vel[i].multiplyScalar(ropeDamp);
      prev[i].copy(p[i]);
      p[i].addScaledVector(vel[i], h);
    }

    const calm = this.calm ? CALM : 1;
    if (this.pushJ.lengthSq() > 1e-10) {
      _p.copy(this.pushJ).multiplyScalar(1 - Math.exp(-PUSH_RATE * h));
      this.pushJ.sub(_p);
      _r.copy(this.pushAt).applyQuaternion(this.q);
      this.v.addScaledVector(_p, this.invMass);
      this.w.add(this.invInertia(_rn.crossVectors(_r, _p), _t));
    }
    this.v.y -= GRAVITY * h;
    if (!this.dragging) this.applyWalls(h);
    this.v.multiplyScalar(Math.exp(-LIN_DAMP * calm * h));
    this.applyTwist(h);
    this.w.multiplyScalar(Math.exp(-(this.dragging ? ANG_DAMP_DRAG : ANG_DAMP * calm) * h));
    clampLength(this.v, MAX_V);
    clampLength(this.w, MAX_W);

    this.xPrev.copy(this.x);
    this.qPrev.copy(this.q);
    this.x.addScaledVector(this.v, h);
    rotate(this.q, this.w, h);

    // The reel tracks the change in pull since the grab, so the strap stays
    // as taut as it was and grabbing never makes the card hop.
    let want = 1;
    let rate = RETRACT_RATE;
    if (this.dragging) {
      this.follow.lerp(this.target, 1 - Math.exp(-DRAG_FOLLOW * h));
      const pulled = (this.needed() - this.needed0) / this.length;
      want = Math.max(MIN_STRETCH, Math.min(MAX_STRETCH, this.stretch0 + pulled));
      rate = REEL_RATE;
    }
    this.stretch += (want - this.stretch) * (1 - Math.exp(-rate * h));
    const seg = this.seg * this.stretch;

    for (let i = 0; i < ROPE_SEGMENTS - 1; i++) {
      solvePair(p[i], i === 0 ? 0 : this.wRope, p[i + 1], this.wRope, seg, 0);
    }
    const bendAlpha = ROPE_BEND_COMPLIANCE / (h * h);
    for (let i = 0; i < ROPE_SEGMENTS - 2; i++) {
      solvePair(p[i], i === 0 ? 0 : this.wRope, p[i + 2], this.wRope, seg * 2, bendAlpha, true);
    }
    this.solveLink(ATTACH, p[ROPE_SEGMENTS - 1], this.wRope, seg, 0, h, false);

    // Long-range tethers stop a light chain stretching under a heavy card.
    for (let i = 1; i < ROPE_SEGMENTS; i++) tether(p[i], this.anchor, i * seg);
    this.solveLink(ATTACH, this.anchor, 0, this.length * this.stretch, 0, h, true);

    if (this.dragging) this.solveLink(this.grab, this.follow, 0, 0, DRAG_COMPLIANCE, h, false);

    const inv = 1 / h;
    for (let i = 1; i < ROPE_SEGMENTS; i++) vel[i].subVectors(p[i], prev[i]).multiplyScalar(inv);
    for (let i = 1; i < ROPE_SEGMENTS - 1; i++) {
      _d.addVectors(vel[i - 1], vel[i + 1]).multiplyScalar(0.5).sub(vel[i]);
      vel[i].addScaledVector(_d, ROPE_SMOOTH);
    }
    this.v.subVectors(this.x, this.xPrev).multiplyScalar(inv);
    _q.copy(this.qPrev).invert().premultiply(this.q);
    this.w.set(_q.x, _q.y, _q.z).multiplyScalar(2 * inv);
    if (_q.w < 0) this.w.negate();

    this.trackTwist();
  }

  /** Distance constraint between a point on the card and `other` (inverse
   * mass `wOther`, 0 = fixed). */
  private solveLink(
    local: Vector3,
    other: Vector3,
    wOther: number,
    rest: number,
    compliance: number,
    h: number,
    unilateral: boolean
  ) {
    _r.copy(local).applyQuaternion(this.q);
    _n.copy(this.x).add(_r).sub(other);
    const len = _n.length();
    if (len < 1e-7) return;
    const c = len - rest;
    if (unilateral && c <= 0) return;
    _n.divideScalar(len);

    _rn.crossVectors(_r, _n);
    const wBody = this.invMass + _rn.dot(this.invInertia(_rn, _t));
    const dl = -c / (wBody + wOther + compliance / (h * h));

    _p.copy(_n).multiplyScalar(dl);
    this.x.addScaledVector(_p, this.invMass);
    _rn.crossVectors(_r, _p);
    rotate(this.q, this.invInertia(_rn, _t), 1);
    if (wOther > 0) other.addScaledVector(_n, -wOther * dl);
  }

  private needed() {
    return _d.subVectors(this.follow, this.anchor).length() - this.grabArm;
  }

  private invInertia(vec: Vector3, out: Vector3) {
    _q.copy(this.q).invert();
    return out.copy(vec).applyQuaternion(_q).multiply(this.invI).applyQuaternion(this.q);
  }

  private applyTwist(h: number) {
    _ax.set(0, 1, 0).applyQuaternion(this.q);
    const t = Math.max(-TWIST_MAX, Math.min(TWIST_MAX, this.twist - this.twistTarget));
    const swing = Math.max(-SWING_YAW_MAX, Math.min(SWING_YAW_MAX, SWING_YAW * this.v.x));
    const damping = TWIST_C * (this.calm ? CALM : 1);
    const torque = -TWIST_K * t - damping * this.w.dot(_ax) + swing;
    _d.copy(_ax).multiplyScalar(torque * h);
    this.w.add(this.invInertia(_d, _t));
  }

  private applyWalls(h: number) {
    const { x, v, walls: b } = this;
    if (x.x < b.minX) v.x += (WALL_K * (b.minX - x.x) - WALL_C * v.x) * h;
    else if (x.x > b.maxX) v.x += (WALL_K * (b.maxX - x.x) - WALL_C * v.x) * h;
    if (x.y < b.minY) v.y += (WALL_K * (b.minY - x.y) - WALL_C * v.y) * h;
    else if (x.y > b.maxY) v.y += (WALL_K * (b.maxY - x.y) - WALL_C * v.y) * h;
  }

  /** Yaw about world Y, averaging the X-axis and normal estimates so it stays
   * defined when either tips vertical. */
  private yaw() {
    _ax.set(1, 0, 0).applyQuaternion(this.q);
    _az.set(0, 0, 1).applyQuaternion(this.q);
    return Math.atan2(_az.x - _ax.z, _ax.x + _az.z);
  }

  private trackTwist() {
    const yaw = this.yaw();
    let d = yaw - this.yawPrev;
    if (d > Math.PI) d -= Math.PI * 2;
    else if (d < -Math.PI) d += Math.PI * 2;
    this.twist += d;
    this.yawPrev = yaw;
  }
}

/** `alpha` is compliance / h²; `pushOnly` resists compression only. */
function solvePair(
  a: Vector3,
  wa: number,
  b: Vector3,
  wb: number,
  rest: number,
  alpha: number,
  pushOnly = false
) {
  const w = wa + wb;
  if (w === 0) return;
  _d.subVectors(a, b);
  const len = _d.length();
  if (len < 1e-9 || (pushOnly && len >= rest)) return;
  const k = (len - rest) / (len * (w + alpha));
  a.addScaledVector(_d, -wa * k);
  b.addScaledVector(_d, wb * k);
}

function tether(pt: Vector3, anchor: Vector3, max: number) {
  _d.subVectors(pt, anchor);
  const len = _d.length();
  if (len > max) pt.copy(anchor).addScaledVector(_d, max / len);
}

/** q += ½·[ω·h, 0]·q, renormalised. */
function rotate(q: Quaternion, o: Vector3, h: number) {
  const ox = o.x * h * 0.5;
  const oy = o.y * h * 0.5;
  const oz = o.z * h * 0.5;
  const { x, y, z, w } = q;
  q.set(
    x + ox * w + oy * z - oz * y,
    y + oy * w + oz * x - ox * z,
    z + oz * w + ox * y - oy * x,
    w - ox * x - oy * y - oz * z
  ).normalize();
}

function clampLength(v: Vector3, max: number) {
  const l = v.length();
  if (l > max) v.multiplyScalar(max / l);
}

/** Clamp into the box, easing into each edge over the last `soft` units. */
function softClampToBox(v: Vector3, b: Box, soft: number) {
  v.x = softClamp(v.x, b.minX, b.maxX, soft);
  v.y = softClamp(v.y, b.minY, b.maxY, soft);
}

function softClamp(x: number, min: number, max: number, soft: number) {
  const s = Math.min(soft, (max - min) / 2);
  if (s <= 0) return Math.max(min, Math.min(max, x));
  if (x > max - s) return max - s * Math.exp(-(x - (max - s)) / s);
  if (x < min + s) return min + s * Math.exp(-(min + s - x) / s);
  return x;
}
