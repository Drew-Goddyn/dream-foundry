# Drawing provenance

INKBORN's creature, printing press, part layout, curved silhouettes, rig, gesture,
replay and page are original Dream Foundry work. No example character or artwork
was reused.

The pressure marks in `marks.mjs` adapt Alex Greenshpun's anidoodle at
[`03ddf534328962f8a91eb115e3ae67e03da4de5a`](https://github.com/alexgreensh/anidoodle/tree/03ddf534328962f8a91eb115e3ae67e03da4de5a).
The specific source is
[`skills/anidoodle/engine/src/canvas-core/core.ts`](https://github.com/alexgreensh/anidoodle/blob/03ddf534328962f8a91eb115e3ae67e03da4de5a/skills/anidoodle/engine/src/canvas-core/core.ts):
seeded RNG, Catmull–Rom sampling, and the pressure ribbon's taper, normal offsets
and width modulation. Changes: ordinary JavaScript, scene-specific width bounds,
and closed Motor command output instead of Canvas drawing. No texture engine,
Canvas renderer or time-dependent drawing loop is copied.

The art also applies the source's wash/form technique: separate pigment layers,
slightly displaced geometry, concentrated dark turns and paper-colored lifted
marks. It uses explicit small offsets rather than anidoodle's noise displacement
and compositing filters. The structural hatch lines use the same pressure ribbons;
manufactured lines follow members, while botanical veins follow the opened plates.
This is a selected technique adaptation, not a lossless import of anidoodle's
renderer or all of its mark behavior.

The inspected craft guidance was
[`craft-bar.md`](https://github.com/alexgreensh/anidoodle/blob/03ddf534328962f8a91eb115e3ae67e03da4de5a/skills/anidoodle/references/craft-bar.md)
and
[`realism-and-craft.md`](https://github.com/alexgreensh/anidoodle/blob/03ddf534328962f8a91eb115e3ae67e03da4de5a/skills/anidoodle/references/realism-and-craft.md),
including explicit part-to-part transformation and interior marks at contacts.
The sumi brush and structural lettering sources were inspected for reference;
their implementations are not included.

Copyright 2026 Alex Greenshpun. Adapted portions are Apache-2.0. The original
[LICENSE](../../third_party/anidoodle/LICENSE) and
[NOTICE](../../third_party/anidoodle/NOTICE) remain in the repository. This file
records the adaptation and changes without altering those notices.

Motor is a separately configured private dependency. Its installation, runtime,
renderer, notices and generated embed remain in local output outside Git. Its
own public consumer interfaces perform document validation, curve deformation,
input interpolation, evaluation, embedding and Rive drawing. Local use does not
grant permission to redistribute Motor.
