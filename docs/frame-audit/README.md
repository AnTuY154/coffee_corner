# Vườn É frame pack audit (2026-10-29)

Source: `Bảng sprite hoạt ảnh nhân vật dễ thương.png` (1536×1024) and the supplied `vuon-e-frame-deploy-bundle.zip`. The ZIP contains 160 valid WebP files by format and count, but its crop output is not visually approved. The contact sheets below show every supplied frame on a contrasting background:

- [Employee](employee-contact.png)
- [Dog](dog-contact.png)
- [Cat](cat-contact.png)

| Character | Actions inspected | Blocking defects |
| --- | --- | --- |
| Employee | idle, wave, talk, run, walk, pet_dog, pet_cat, prepare | Number labels and adjacent figures remain in wave, talk, walk and pet poses. Several run frames retain detached neighbor fragments or clipped limbs. The idle sequence changes very little. |
| Dog | idle, walk, run, happy, jump, nap | Walk and run crops split the dog or include the next figure. Several poses depict a calico cat, not the approved white and orange dog. Number labels and background remain. |
| Cat | idle, walk, run, happy, jump, nap, groom | Many crops include neighboring cats, printed numbers and tabletop fragments. Several frames cut off the head, paws or tail. |

The source itself overlaps figures and text. Pixels hidden behind a neighboring figure cannot be recovered deterministically from this sheet. The affected motions were redrawn as individual, transparent poses using the approved character references. Each frame was aligned to a common canvas and inspected as a sequence in PixiJS.

**Disposition:** no action from the supplied ZIP is approved for production. The following redrawn sequences are installed and approved after transparent-corner checks, visual review and live Pixi frame capture:

| Sequence | Frames | Redraw | Browser capture |
| --- | ---: | --- | --- |
| Employee run | 12 | [Contact sheet](employee-run-redraw.png) | [Running outside counter](employee-run-browser.png) |
| Employee walk | 8 | [Contact sheet](employee-walk-redraw.png) | [Walking outside counter](employee-walk-browser.png) |
| Dog walk | 8 | [Contact sheet](dog-walk-redraw.png) | [Walking in courtyard](dog-walk-browser.png) |
| Dog run | 12 | [Contact sheet](dog-run-redraw.png) | [Running in courtyard](dog-run-browser.png) |
| Cat walk | 8 | [Contact sheet](cat-walk-redraw.png) | [Walking on tabletop](cat-walk-browser.png) |

The remaining 112 frames were redrawn with the built-in ImageGen tool on 2026-11-02. The final pack contains 160 lossless transparent WebPs across all 21 required sequences. None of the defective ZIP crops are used. `public/art/manifest.json` approves the full reviewed pack. Canonical fallback remains available for network/image decoding failures.

| Character | Additional reviewed sequences |
| --- | --- |
| Employee | [idle (6)](employee-idle-redraw.png), [wave (6)](employee-wave-redraw.png), [talk (6)](employee-talk-redraw.png), [prepare (6)](employee-prepare-redraw.png), [pet dog (8)](employee-pet_dog-redraw.png), [pet cat (8)](employee-pet_cat-redraw.png) |
| Dog | [idle (6)](dog-idle-redraw.png), [happy (8)](dog-happy-redraw.png), [jump (8)](dog-jump-redraw.png), [nap (6)](dog-nap-redraw.png) |
| Cat | [idle (6)](cat-idle-redraw.png), [run (8)](cat-run-redraw.png), [happy (8)](cat-happy-redraw.png), [jump (8)](cat-jump-redraw.png), [nap (6)](cat-nap-redraw.png), [groom (8)](cat-groom-redraw.png) |

Generation prompt recipe: preserve the approved character identity and watercolor anime linework; illustrate distinct sequential phases for the named action in separate cells; keep the entire head, hands/paws, shoes and tail inside each cell; use transparent alpha with no text, numbers, ground, shadows or neighboring figures. The standing employee reference was used for counter actions; petting contains only the employee to avoid duplicating the live pet. Blink, mouth, stirring, stroking, wagging, jump, grooming and breathing phases were specified individually. Early standing variants retaining a walking stance and cat happy variants containing motion marks were rejected or repaired before export.

Packing only crops isolated cells and normalizes their canvas; it does not invent limb motion. Employee frames use 384×512 and a foot baseline at y=500; crouching poses occupy a shorter portion of that same canvas. Pet frames use 256×256 and y=245. The [pixel validation report](pixel-validation.json) checks transparent borders, consistent dimensions and unique decoded pixel data for every sequence. The real Pixi review test loads every sequence, verifies its frame index and captures the storefront; looping actions must advance frames. Mobile storefront, menu/cart/checkout and actor placement remain covered by the visual suite.

The cat now performs a small 22-world-pixel tabletop hop, returning to the same safe surface. Illustrated nap and jump sequences do not use squash/stretch or mesh deformation.

Local verification: typecheck, actor choreography, 2D scene wiring, frame activity mapping, all 160 frame paths/headers and production build passed. The full browser suite passed 31 applicable cases with 9 device-specific skips. The final cat-petting size adjustment passed the employee sequence review and cat interaction checks on desktop/mobile (3 cases, 1 device-specific skip).

Runtime evidence: [counter idle](employee-idle-browser.png), [wave](employee-wave-browser.png), [preparing a drink](employee-prepare-browser.png), [petting dog](employee-pet_dog-browser.png), [petting cat](employee-pet_cat-browser.png), [dog nap](dog-nap-browser.png), [cat grooming](cat-groom-browser.png), [cat hop](cat-jump-browser.png). Playwright also captures every action and checks changing frame indices for loops.

The first employee walking redraws were rejected for repeated leg poses and changes to the face, glasses and shoes. A subsequent identity repair and three explicit passing/contact poses resolved those defects. The final eight-frame sequence was aligned to a 384×512 canvas with a common foot baseline and reviewed in the held walking state in PixiJS on 2026-11-02.
