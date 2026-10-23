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
