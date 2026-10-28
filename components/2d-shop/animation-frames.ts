/** Frame-by-frame character animation manifest.
 * Art must come from individually illustrated, consistently aligned transparent
 * WebP frames. Every frame retains the same canvas dimensions and foot anchor.
 * Missing sequences intentionally fall back to the approved canonical pose.
 */
export const FRAME_SEQUENCES = {
  employee: { idle: 4, wave: 8, run: 10, pet: 8 },
  dog: { idle: 4, walk: 8, turn: 4, happy: 6, bark: 6, jump: 8 },
  cat: { idle: 4, walk: 8, turn: 4, happy: 6, groom: 8, nap: 4 },
} as const;

export const FRAME_FPS = {
  employee: { idle: 4, wave: 9, run: 14, pet: 10 },
  dog: { idle: 3, walk: 12, turn: 7, happy: 8, bark: 11, jump: 12 },
  cat: { idle: 3, walk: 10, turn: 7, happy: 7, groom: 9, nap: 2 },
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
