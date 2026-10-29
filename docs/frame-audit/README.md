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
| Dog walk | 8 | [Contact sheet](dog-walk-redraw.png) | [Walking in courtyard](dog-walk-browser.png) |
| Cat walk | 8 | [Contact sheet](cat-walk-redraw.png) | [Walking on tabletop](cat-walk-browser.png) |

The browser review captured changing indices for all three sequences. Other activities continue using canonical character art and safe existing poses. `public/art/manifest.json` lists only reviewed sequences; the ZIP's count-only manifest cannot activate its unreviewed crops. The full `test:frames` gate remains red until every required sequence has been reviewed. These 28 frames are an intermediate, visually checked subset of the requested 160.
