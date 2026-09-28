# The Unprinted Garden

An original Dream Foundry illustrated world for issue #18. Draw a line on the press, print it, and follow its living impression into a painted garden. The recorded stroke determines the course, banks and planting positions. The world remains after release and can be saved as a plate or replay.

This campaign starts from INKBORN `fc602cc4317292cf3f1a60faf25cf12d3f7526cc` in a separate `make/unprinted-garden` worktree. The retained INKBORN branch and outputs remain the comparison baseline.

## One Foundry command

From the Dream Foundry repository:

```sh
node experiments/unprinted-garden/run.mjs \
  --config /absolute/private/garden-tools.json \
  --out /absolute/private/new-garden \
  --capture --verify --film --serve
```

The output directory must be new and outside every Git worktree. The command validates and compiles the editable Motor scene, bundles this piece against existing authorized dependencies, renders the original score once, captures three story frames, checks interaction and replay, prepares a deterministic replay film, and starts a loopback preview. It prints the playable URL. Omitting `--film` skips only movie production; omitting `--serve` ends after preparation and checks. Nothing is installed or deployed.

Private configuration:

```json
{
  "motorRoot": "/existing/authorized/Motor/installation",
  "anidoodleRoot": "/local/pinned/anidoodle/skills/anidoodle/engine/src/canvas-core",
  "chrome": "/existing/Google Chrome",
  "ffmpeg": "/existing/ffmpeg",
  "anchors": "/private/rendered-upstream-plates",
  "baseline": "/private/retained-inkborn-candidate"
}
```

`anchors` and `baseline` are optional comparison inputs. The anchors directory contains `wren.png`, `pocketWatch.png`, `lighthouse.png`, and their `identity.json`. The baseline is the retained candidate output with `03-unfurled/frame.png`. Source hashes are recorded for all participating modules. The exact upstream files are checked against [the pinned manifest](anidoodle-source.json); obtain those public files from the pinned anidoodle revision, including the relative music imports. Existing `esbuild` and Playwright are resolved from the configured installation's package context. Private installation bytes and bundled output stay outside Git.

## Make an impression

Draw on the small sheet, lift to keep the stroke, then choose **Print my line**. The guide exercises the same event reducer and Motor evaluator as live input. Intervening takes over from the currently visible state and removes future guide actions. The created world persists until Reset.

Focus the canvas for keyboard use: arrows move the nib, Shift increases the step, Space begins or ends the stroke, Enter prints, Escape pauses or continues creation, and R resets. Sound starts only after **Enable sound**; mute is always available. The score pauses with the creation. **Save plate** and **Save my replay** download locally. **Open replay** restores the drawing, action history and saved time.

## What evaluates and what paints

Motor's documented detached `evaluate()` snapshot is authoritative for the old creature's skinned curves, contact, expression, wheel, platen, living mark's wing poses and authored framing. Exact input requests are applied at their recorded times before the requested evaluation time. Current-pose input smoothing remains Motor's job. Reset and backward replay rebuild evaluation from the history.

The actual pinned anidoodle `Gfx`, `bake`, paper, wet-edge displacement, pooling/pressure marks and score synthesis render Foundry-owned drawings. Static parts are cropped and cached; moving creature contours are sampled from the evaluated Motor curves for selective material redraw. The small composition pass only knows this press, creature, living mark, river and botanical plates. It is not a Motor renderer, general converter, or second rig solver.

Cursor handlers record all coalesced samples without evaluating or painting the scene. One animation frame evaluates the accumulated history and paints the current pose. The Garden scene contains only the creature contours and controls it uses; it does not evaluate INKBORN's unused decorative rig. Requests at the same instant share an evaluation, retaining their order and values.

The saved history is the single source for live interaction, the guide, screenshots and the replay film. New vegetation follows the actual stroke, including returns and loops. The guided input is an example, not a substituted animation.

## Evidence and review

Private outputs include the editable scene, exact input history, original score, rendered audio, source snapshot and hashes, three story frames, comparison page, behavioral checks and optional film. The browser checks also send a real 96-move cursor stroke over 1.6 seconds and a controlled 32-sample coalesced burst. They require every meaningful point, no painting inside pointer handlers, handlers under 16.7 ms, a drained gesture within 2.1 seconds, and no drawing-frame gap over 150 ms in the configured Chrome installation. The pointer report and screenshot are saved beside the other evidence; these limits catch input stalls and do not claim constant 60 FPS. They compare fresh and reused Motor poses, cold/warm pixels in the configured Chrome, a distinct gesture, persistence, reset, takeover, keyboard use, narrow layout and sound/mute controls. Cross-browser pixel identity is not claimed.

A non-author uses this same entry point with a fresh private output directory. Review the three full-resolution moments and the actual upstream plates; try another gesture, interrupt creation, reset, save/reopen a replay, and enable/mute sound. Judge interactive correctness, material craft and narrative payoff separately. Keep the source fixed during the final review. Sampled still inspection and meters do not establish normal-speed viewing or listening. Preserve a rejection or observation gap in its original report.

The workboard records the lead as sole writer and the already-authorized reviewers as read-only. No new writer sessions or heartbeat are launched. If further writers are human-launched, the prepared names are **DF-GARDEN-PAINT** (botanical/material art) and **DF-GARDEN-PERFORMANCE** (press/creature action); agree disjoint ownership before changes.
