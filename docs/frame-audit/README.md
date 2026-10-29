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

The source itself overlaps figures and text. Pixels hidden behind a neighboring figure cannot be recovered deterministically from this sheet. A single transparent image generation repair of `employee/run/00` restored its silhouette, but changed fine facial, apron and clothing details; independent generations would not preserve a coherent 12-frame cycle. It is not installed as production art.

**Disposition:** no action in this pack is approved for production. The website continues using its canonical character art and safe existing poses. `public/art/manifest.json` and `public/art/frames/` must only be added after each complete sequence has been visually reviewed for identity, transparency, limb completeness, foot alignment and loop continuity. The runtime now requires a `manifest.approved` count for each such sequence; the ZIP's count-only manifest cannot activate these unreviewed crops.
