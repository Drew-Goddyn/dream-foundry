# INKBORN

An ink creature pulls a printing press into a botanical impression. Drag the
vermilion drop, reverse direction, or release midway. Arrow keys on the drop and
the Pull slider provide keyboard access; Escape releases and R resets.

## Run from Dream Foundry

Use an existing authorized Motor runnable installation with its matching renderer,
Node 22+, and installed Chrome. Nothing is downloaded, installed or built inside
Motor. Create a private configuration outside every Git worktree:

```json
{
  "motorRoot": "/absolute/existing/motor-installation",
  "chrome": "/absolute/installed/chrome-executable"
}
```

From the Dream Foundry workspace:

```sh
node experiments/inkborn/run.mjs \
  --config /private/local-tools.json \
  --out /private/new-inkborn \
  --capture --verify --serve
```

The command authors and validates an editable Motor scene, invokes Motor's embed
and native snapshot interfaces, exercises the actual browser controls, and prints
a loopback-only playable URL. Keep that terminal running; Ctrl-C stops its server.
The output directory must be new and outside any Git worktree. Failed output is
retained for diagnosis. Missing or incompatible tools fail with an error; there
is no install, fallback renderer, engine patch or schema extension.

The exercised dependency is Motor `b7eaae7c4a986727ffbdd83d14a5e205fd447777`
with the existing ABI 4 renderer bundle. Its runtime SHA-256 is
`363903f185689a22effaac19d75c67a0abdaad56c5b679f4f065c84e79a9ce5a`.
Every build records actual source hashes, dependency identity, scene and replay
hashes. The Foundry base is `d3d358d4b44400cf24d72df8e243f0240221665c`.
See [drawing attribution](ATTRIBUTION.md) for the pinned anidoodle adaptation.

## Compare the same gesture

Retain the first result and generate the candidate against it:

```sh
node experiments/inkborn/run.mjs --config /private/local-tools.json \
  --out /private/inkborn-initial --variant initial --capture
node experiments/inkborn/run.mjs --config /private/local-tools.json \
  --out /private/inkborn-candidate --capture --verify \
  --compare /private/inkborn-initial --serve
```

Open `/comparison/` on the candidate URL. Comparison rejects mismatched replay
hashes. The original initial drawing and tuning are preserved as a comparison
variant; they deliberately retain the visible problems discovered in the first
capture. Three native poses are sampled at 0.3, 2.12 and 3.6 seconds. The full
replay includes near/far reaches, reversal, release, re-grab and return to rest.
The page's **Watch the gesture** button uses those same input records.

`art.mjs` is the editable scene-specific authoring source; `tuning.json` holds the
two retained variants. `gesture.mjs` maps the drop to input requests and owns the
replay. Motor evaluates all input smoothing, held poses and Bézier skinning. The
host positions a transparent accessible hit target over Motor's drawn drop and
passes input requests; it never draws creature or machine geometry.

## Evidence and review

`identity.json` binds the output to actual source and dependency bytes.
`checks.json` contains local author checks. Native PNGs and their Motor receipts
live in the three pose directories. The browser checks retain desktop/mobile
screenshots and an actual drag recording. Private outputs include Motor and must
stay local. Commit only this Foundry source and the existing licensed notices.

The author checks verify current-pose continuity, sampled tail/hand contacts,
forward/replay agreement, independent instances, reset, actual mouse and keyboard
controls, reduced motion and resizing. The assembly is a stylized authored
mechanism, not a rigid-body simulation. Native stills and sampled checks do not
establish a human normal-speed aesthetic verdict or screen-reader qualification.

Two fresh non-author visual reviewers drove the bounded drawing revisions. Their
raw reviews and scores remain in the private delivery record. A reviewer is not
human acceptance. See [the fresh review procedure](REVIEW.md) to reproduce the
candidate through this same command.
