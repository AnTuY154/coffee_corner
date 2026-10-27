/**
 * Source-driven 2D mesh rigs. Every vertex samples the ONE canonical illustration
 * for its character: no unrelated sprites, no replacement images, no sliding
 * background pixels. Walk motion is distance-driven and independent of FPS.
 */
export type RigKind = "employee" | "dog" | "cat";
export type RigMotion = "idle" | "walk" | "turn" | "happy" | "wave" | "run" | "pet";
export type RigControls = {
  gait: number; speed: number; seconds: number; motion: RigMotion;
};

export function deformVertices(
  original: Float32Array,
  target: Float32Array,
  width: number,
  height: number,
  controls: RigControls,
  kind: RigKind,
): void {
  const moving = controls.motion === "walk" || controls.motion === "run";
  const speedWeight = moving ? Math.min(1, Math.abs(controls.speed) / 25) : 0;
  const phase = controls.gait;
  const happy = controls.motion === "happy";
  const petting = controls.motion === "pet";
  const waving = controls.motion === "wave";
  const breath = Math.sin(controls.seconds * 2.1);
  const tailWag = Math.sin(controls.seconds * (happy ? 11 : moving ? 8 : 3.2));
  for (let i = 0; i < original.length; i += 2) {
    const x = original[i];
    const y = original[i + 1];
    const u = x / width, v = y / height;
    let dx = 0, dy = 0;
    if (kind === "employee") {
      // Four distinct anatomical zones: raised waving hand (left-upper),
      // head/hair (upper centre), skirt (lower middle), two legs (bottom).
      const hand = Math.max(0, 1 - Math.abs(u - .30) * 4.4) * Math.max(0, 1 - Math.abs(v - .26) * 4);
      const head = Math.max(0, 1 - Math.abs(u - .51) * 2.8) * Math.max(0, 1 - Math.abs(v - .16) * 3.2);
      const skirt = Math.max(0, Math.min(1, (v - .48) * 3));
      const lower = Math.max(0, Math.min(1, (v - .76) * 5));
      if (waving) { dx += hand * Math.sin(controls.seconds * 7.5) * width * .016; dy -= hand * Math.cos(controls.seconds * 7.5) * height * .008; }
      if (petting) {
        // Crouch by compressing lower half and gently leaning into pet.
        dx -= v * width * .036;
        dy -= skirt * height * .055;
        dx -= hand * width * .028;
      }
      if (moving) {
        dx += lower * (u < .50 ? -1 : 1) * Math.sin(phase) * width * .027 * speedWeight;
        dy -= lower * Math.max(0, Math.sin(phase + (u < .5 ? 0 : Math.PI))) * height * .03 * speedWeight;
        dx += skirt * Math.sin(phase * .5) * width * .012 * speedWeight;
      }
      dx += head * Math.sin(controls.seconds * 2.3) * width * .004;
      dy += (1 - v) * breath * height * .0025;
    } else {
      // Canonical pet silhouettes put the tail on the left and four paws on
      // the bottom. The high-density grid bends paw/leg pixels separately,
      // preserving the original fur painting and its alpha silhouette.
      const paws = Math.max(0, Math.min(1, (v - .64) / .27));
      const tail = Math.max(0, Math.min(1, (.46 - u) / .40)) * Math.max(0, Math.min(1, (.75 - v) / .55));
      const head = Math.max(0, 1 - Math.abs(u - .72) * 2.6) * Math.max(0, 1 - Math.abs(v - .38) * 2);
      dx += tail * Math.sin(controls.seconds * (happy ? 11 : 3) + v * 3) * width * (happy ? .04 : .020);
      dy += tail * tailWag * height * .009;
      if (moving) {
        const stride = Math.sin(phase + (u < .50 ? 0 : Math.PI));
        dx += paws * stride * width * .022 * speedWeight;
        dy -= paws * Math.max(0, stride) * height * .021 * speedWeight;
        dy -= Math.abs(Math.sin(phase)) * (1 - paws) * height * .006 * speedWeight;
      }
      if (happy) { dx += head * Math.sin(controls.seconds * 8.5) * width * .012; dy -= head * Math.abs(Math.sin(controls.seconds * 7)) * height * .012; }
      dy += breath * (1 - paws) * height * .004;
    }
    target[i] = x + dx;
    target[i + 1] = y + dy;
  }
}