/**
 * Mesh gestures sampled exclusively from each approved 2D canonical texture.
 * Changes vertex POSITIONS only; all UVs, palette and art remain untouched.
 */
export type RigKind = "employee" | "dog" | "cat";
export type RigMotion = "idle" | "walk" | "turn" | "happy" | "wave" | "run" | "pet" |
  "bark" | "jump" | "groom" | "nap";
export type RigControls = {
  gait: number; speed: number; seconds: number; motion: RigMotion; actionProgress?: number;
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const bump = (x: number, center: number, radius: number) => clamp01(1 - Math.abs(x - center) / radius);
const pulse = (x: number) => Math.pow(Math.max(0, Math.sin(x * Math.PI)), .7);

export function deformVertices(
  original: Float32Array, target: Float32Array,
  width: number, height: number, controls: RigControls, kind: RigKind,
): void {
  const moving = controls.motion === "walk" || controls.motion === "run";
  const speedWeight = moving ? clamp01(Math.abs(controls.speed) / 28) : 0;
  const phase = controls.gait;
  const p = clamp01(controls.actionProgress ?? 0);
  const happy = controls.motion === "happy";
  const bark = controls.motion === "bark";
  const jumping = controls.motion === "jump";
  const groom = controls.motion === "groom";
  const nap = controls.motion === "nap";
  const petting = controls.motion === "pet";
  const waving = controls.motion === "wave";
  const breath = Math.sin(controls.seconds * 1.9);
  const tailRate = happy || bark || jumping ? 12 : moving ? 8 : 3.2;
  for (let i = 0; i < original.length; i += 2) {
    const x = original[i], y = original[i + 1];
    const u = x / width, v = y / height;
    let dx = 0, dy = 0;
    if (kind === "employee") {
      const hand = bump(u, .30, .22) * bump(v, .27, .26);
      const face = bump(u, .53, .34) * bump(v, .18, .28);
      const skirt = clamp01((v - .48) * 3);
      const legs = clamp01((v - .76) * 5);
      if (waving) {
        dx += hand * Math.sin(controls.seconds * 7) * width * .025;
        dy -= hand * Math.cos(controls.seconds * 7) * height * .013;
      }
      if (petting) {
        // Bring the arm toward the pet, compress knees and bow forward.
        dx -= v * width * .027;
        dy -= skirt * height * .064;
        dx -= hand * width * .045;
        dy += hand * height * .040;
      }
      if (moving) {
        dx += legs * (u < .50 ? -1 : 1) * Math.sin(phase) * width * .029 * speedWeight;
        dy -= legs * Math.max(0, Math.sin(phase + (u < .5 ? 0 : Math.PI))) * height * .029 * speedWeight;
        dx += skirt * Math.sin(phase * .5) * width * .011 * speedWeight;
      }
      dx += face * Math.sin(controls.seconds * 2.1) * width * .004;
      dy += (1 - v) * breath * height * .002;
    } else {
      // Tail is to the LEFT in both canonical sources. Left/right forepaw
      // regions move out of phase, while anchor points near the floor stay put.
      const paws = clamp01((v - .63) / .27);
      const tail = clamp01((.47 - u) / .42) * clamp01((.76 - v) / .53);
      const head = bump(u, .73, .35) * bump(v, .37, .34);
      const frontPaw = bump(u, .74, .27) * bump(v, .79, .26);
      const chest = bump(u, .69, .36) * bump(v, .64, .36);
      dx += tail * Math.sin(controls.seconds * tailRate + v * 2.9) * width * (happy || bark || jumping ? .052 : .023);
      dy += tail * Math.cos(controls.seconds * tailRate) * height * .011;
      if (moving) {
        const leftStep = Math.sin(phase), rightStep = Math.sin(phase + Math.PI);
        const stride = u < .50 ? leftStep : rightStep;
        dx += paws * stride * width * .032 * speedWeight;
        dy -= paws * Math.max(0, stride) * height * .025 * speedWeight;
        dy -= Math.abs(Math.sin(phase)) * (1 - paws) * height * .006 * speedWeight;
      }
      if (bark) {
        const voice = Math.sin(controls.seconds * 25) * Math.sin(p * Math.PI);
        dx += head * voice * width * .012;
        dy -= head * Math.abs(voice) * height * .017;
        dy += chest * voice * height * .010;
      }
      if (jumping) {
        // Individual leg tuck accompanies the holder's parabolic jump.
        dy -= paws * Math.sin(p * Math.PI) * height * .053;
        dx += tail * Math.sin(p * Math.PI * 3) * width * .02;
      }
      if (groom && kind === "cat") {
        // Raise the illustrated front paw towards the muzzle several times.
        const licking = pulse((p * 4) % 1);
        dx -= frontPaw * licking * width * .092;
        dy -= frontPaw * licking * height * .14;
        dy += head * licking * height * .011;
      }
      if (nap && kind === "cat") {
        // Lying on the table: tuck legs and sink torso, keep the ground point
        // fixed. Full-body silhouette is still the ORIGINAL cat illustration.
        const settle = Math.min(1, p * 6, (1 - p) * 6);
        dy += (1 - v) * height * .20 * settle;
        dx -= head * width * .035 * settle;
        dy -= paws * height * .007 * settle;
      }
      if (happy) {
        dx += head * Math.sin(controls.seconds * 8.5) * width * .012;
        dy -= head * Math.abs(Math.sin(controls.seconds * 7)) * height * .012;
      }
      dy += breath * (1 - paws) * height * (nap ? .002 : .004);
    }
    target[i] = x + dx;
    target[i + 1] = y + dy;
  }
}