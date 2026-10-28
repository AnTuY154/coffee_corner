# Vườn É — approved 2D character frames

The approved contact sheet contains three characters: a green-apron employee, an orange-and-white dog, and a calico cat. Do **not** use the unrelated sword-fighter sprite sheet.

The PixiJS scene loads sequences from `public/art/frames/<actor>/<action>/<00..>.webp` only when the complete sequence is declared in `public/art/manifest.json`. Each frame MUST have a transparent background, identical canvas dimensions within its sequence, a consistent ground/foot anchor, and genuine motion between drawings. The source contact sheet includes lettering, arrows, coloured backdrops and repeated/misnumbered poses: cutting it into equal-width rectangles is not an acceptable production asset pipeline.

Use `npm run test:frames` after installing vetted images. Do not publish a manifest containing unreviewed or incomplete sequences. While a sequence is absent, the existing approved canonical portrait remains in place. The code change does not itself claim that the images were uploaded or visually approved.

Expected actions are specified in `components/2d-shop/animation-frames.ts`; the clerk's petting pose is selected as `pet_dog` or `pet_cat` according to the interaction target. On a real sequence the renderer disables the legacy vertex warp and rotation.
