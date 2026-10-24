export type MoveKey = "forward" | "back" | "left" | "right";
export type ShopControls = {
  keys: Set<MoveKey>;
  x: number;
  z: number;
  yaw: number;
  pitch: number;
  autoWalk: boolean;
  locked: boolean;
};
export const START_POSITION = { x: 0, z: 9.4 };
export const COUNTER_RANGE = 3.5;
export const COUNTER_NEAR_Z = 3.25;
/** Camera position is a pure function so yaw/pitch orbit can be regression-tested without WebGL. */
export function cameraAnchor(c: Pick<ShopControls, "x" | "z" | "yaw" | "pitch">, compact: boolean): {
  position: [number, number, number];
  lookAt: [number, number, number];
} {
  const follow = compact ? 3.75 : 4.4;
  const sin = Math.sin(c.yaw), cos = Math.cos(c.yaw);
  return {
    position: [c.x + sin * follow + cos * .42, 2.7 + c.pitch * 2, c.z + cos * follow - sin * .42],
    lookAt: [c.x - sin * 4.5, 1.83 + c.pitch * 1.7, c.z - cos * 4.5],
  };
}
export function nearCounter(x: number, z: number): boolean {
  return Math.abs(x) <= COUNTER_RANGE && z <= COUNTER_NEAR_Z;
}
export function stepMovement(
  c: ShopControls,
  delta: number,
): { near: boolean; arrived: boolean } {
  const dt = Math.min(Math.max(delta, 0), 0.05);
  let arrived = false;
  if (c.locked) return { near: nearCounter(c.x, c.z), arrived: false };
  if (c.autoWalk) {
    const d = Math.hypot(c.x, c.z - 2.6);
    const step = Math.min(d, dt * 3.55);
    if (d > 0) {
      c.x += (-c.x / d) * step;
      c.z += ((2.6 - c.z) / d) * step;
    }
    c.yaw += (0 - c.yaw) * Math.min(1, dt * 4);
    if (d <= 0.08) {
      c.x = 0;
      c.z = 2.6;
      c.autoWalk = false;
      arrived = true;
    }
  } else {
    const forward = Number(c.keys.has("forward")) - Number(c.keys.has("back"));
    const side = Number(c.keys.has("right")) - Number(c.keys.has("left"));
    const magnitude = Math.hypot(forward, side) || 1;
    const speed = 3.6 * dt / magnitude;
    const dx = -Math.sin(c.yaw) * forward + Math.cos(c.yaw) * side;
    const dz = -Math.cos(c.yaw) * forward - Math.sin(c.yaw) * side;
    // Simple collision boundary: the front of the service counter is at z = 1.9.
    c.x = Math.min(5.45, Math.max(-5.45, c.x + dx * speed));
    c.z = Math.min(10.5, Math.max(1.9, c.z + dz * speed));
  }
  return { near: nearCounter(c.x, c.z), arrived };
}
