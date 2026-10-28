/** Frame-by-frame character animation manifest.
 * Art must come from individually illustrated, consistently aligned transparent
 * WebP frames. Every frame retains the same canvas dimensions and foot anchor.
 * Missing sequences intentionally fall back to the approved canonical pose.
 */
export const FRAME_SEQUENCES = {
  employee: { idle: 6, wave: 6, talk: 6, run: 12, walk: 8, pet_dog: 8, pet_cat: 8, prepare: 6 },
  dog: { idle: 6, walk: 8, run: 12, happy: 8, jump: 8, nap: 6 },
  cat: { idle: 6, walk: 8, run: 8, happy: 8, jump: 8, nap: 6, groom: 8 },
} as const;

export const FRAME_FPS = {
  employee: { idle: 4, wave: 9, talk: 7, run: 14, walk: 10, pet_dog: 10, pet_cat: 10, prepare: 8 },
  dog: { idle: 3, walk: 12, run: 14, happy: 8, jump: 12, nap: 3 },
  cat: { idle: 3, walk: 10, run: 12, happy: 7, groom: 9, nap: 2, jump: 11 },
} as const;

export type CharacterId = keyof typeof FRAME_SEQUENCES;
export type FrameAction<C extends CharacterId> = keyof (typeof FRAME_SEQUENCES)[C] & string;
export const framePath = (base: string, character: CharacterId, action: string, index: number) =>
  `${base}/frames/${character}/${action}/${String(index).padStart(2, "0")}.webp`;

/** Deterministic source-frame selection without re-mounting the Pixi sprite. */
export function animationFrameAt(elapsed: number, fps: number, count: number, looping = true): number {
  if (count <= 1 || fps <= 0) return 0;
  const frame = Math.max(0, Math.floor(Math.max(0, elapsed) * fps));
  return looping ? frame % count : Math.min(count - 1, frame);
}
