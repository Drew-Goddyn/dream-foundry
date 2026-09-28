# Wave two: assess reports and build the first source inspector

Two human-launched local sessions, separate workspaces, one existing shared board. The reviewer checks two fixed reports while the builder makes one isolated implementation. Reports remain proposals until assessed; new code remains unverified until a later fresh implementation review. No additional framework survey or unchanged-baseline review is required.

## Source and state

Use the local wave manifest at `$HOME/.dream-foundry/precursor-01/wave.json`. It names the actual baseline checkout, common board, and existing report locations. Do not replace it, initialize a second live wave board, or overwrite prior output directories. New-role outputs belong in distinct directories under the existing wave, with unique suffixes if already occupied.

Expected baseline commit: `02675002f640dc484ec6f37a251aff2a5c21cc10`.

Expected baseline tree: `176e34317128c05c87e119c4447205adb0432a94`.

Source-only bundle: `exports/candidate.bundle` beneath that wave, reported SHA-256 `5c70ce006c51a557862f6eaf3f2fadbc9406ee3ac413661751a7a1644cc24780`. Check bytes and Git identity before use. The remote documentation branch does not contain the implementation; fetching new instructions does not require rebasing the fixed baseline.

Both sessions use the baseline CLI and its actual help/documentation for live-board operations. All new-code tests and destructive probes use scratch state. Respect the client's existing permitted paths; a denied path is a narrow blocker, not permission to widen settings.

## DF-VERIFY-02: complete launch message

Work Order: [#9](https://github.com/Drew-Goddyn/dream-foundry/issues/9). Start a genuinely fresh context, not either report author's continuation.

```text
You are DF-VERIFY-02, the fresh reviewer of Dream Foundry's two sealed wave-one reports. This is report review, not a repeated review of the unchanged workboard.

Read $HOME/.dream-foundry/precursor-01/wave.json and verify its baseline commit 02675002f640dc484ec6f37a251aff2a5c21cc10 and tree 176e34317128c05c87e119c4447205adb0432a94. Read the original frozen W1-A and W1-B criteria, AGENTS.md, CONTEXT.md, operating policy, and the actual docs/workboard.md/CLI help. Use a separate source copy/scratch directory if running examples.

Review these separately:
W1-A-S1 / W1-A-T1 / criteria 1
  94a88d07a4750c971891f3d819f810a4e030bd2526f974c82a071a89644e92f5
W1-B-S1 / W1-B-T1 / criteria 1
  c73f713de4b0b8d6cbea72703386feef3cd8975a62d3510cfc0ee7e033ea91b2

Verify sealed bytes and evidence before Assessments. For W1-A, inspect the runbook before executing it, exercise read-only inspection on the real board, and use scratch state for mutating examples. Check that another session can find/claim/submit the right task and that the reported help/status friction is supported by actual use.

For W1-B, check pinned upstream evidence, the actual renderer-versus-contractScan call order, the proposed module interface, and the smoke/negative-control proposal. Assess the report against its original criteria; do not demand an implemented inspector. A regex scan is not proof of determinism or transitive compliance. Partial source exports must have honest coverage/provenance.

Record two real Assessments via the unchanged baseline CLI with your actual session identity where available. Use separate per-criterion PASS/FAIL/BLOCKED; leave human acceptance unrecorded. The only intended shared-board changes are those Assessments and their normal events. Preserve the reports, frozen criteria, baseline, manifest bindings, and other workers' records. Do not infer exact execution overlap from two distinct session IDs.

Return both Assessment IDs/results, actual observations/commands, necessary corrections, and your original report location. Do not repeat the full fourteen-test workboard review or troubleshoot GitHub publication. No source edits, installations, further agents, GPU/media/model workloads, daemons, permissions/credential changes, merge, or deployment. Stop after both report dispositions or concrete blockers.

DF-BUILD-02 may work separately in parallel. You are not reviewing or approving its new code.
```

## DF-BUILD-02: complete launch message

Work Order: [#10](https://github.com/Drew-Goddyn/dream-foundry/issues/10). The reviewer need not finish before isolated implementation begins.

```text
You are DF-BUILD-02, implementing Dream Foundry's first no-render source inspector and two small usability fixes.

Read $HOME/.dream-foundry/precursor-01/wave.json. Verify baseline commit 02675002f640dc484ec6f37a251aff2a5c21cc10 and tree 176e34317128c05c87e119c4447205adb0432a94 from its checkout/bundle. Use your own build/source-inspector branch/workspace, preserving existing work. Keep shared source and W1 evidence unchanged. Read AGENTS.md, CONTEXT.md, operating policy, actual CLI help/docs/workboard.md, and sealed reports W1-A-S1/W1-B-S1.

Implement a text-only inspection module with one small entry point over a fixed local snapshot, explicit file scope, and versioned rule profile. Emit a deterministic JSON Inspection Receipt with source identity/provenance, sorted file hashes, findings with rule/path/location, examined versus missing coverage, and explicit limits. Ground the first small rule profile in anidoodle revision 03ddf534328962f8a91eb115e3ae67e03da4de5a, skills/anidoodle/engine/tools/gate.mjs. Never import or run that executable gate or upstream art code. Prefer installed Python/standard-library tools; retain real license/provenance for any copied implementation.

Use available local Git objects or W1-B's text exports. Bind Git bytes to the specified commit rather than dirty files labeled with HEAD. Export-only inputs need verified byte hashes, claimed upstream revision and stated provenance, plus partial repository coverage. An export manifest is not authenticated Git history. No whole-repository PASS from partial or empty input. Missing required files, changed hashes, mismatched identities, unsupported rules, invalid paths, or links outside scope must fail honestly. Label altered fixtures as fixtures.

An Inspection Receipt is Evidence, not an Assessment or proof of deterministic rendering, safety, full dependency compliance, or visual quality. Specify the pattern scanner's limits; do not build a full TypeScript analyzer or promise upstream equivalence without evidence.

Also expose a valid minimal Work Order example via CLI help or a side-effect-free example command, and add opt-in compact status. Preserve default output/exit contracts and important invalid-evidence, review, and acceptance states. No database migration.

Use the unchanged baseline CLI for live-board writes. Register/claim only a distinct W2 build Trial with frozen criteria from this assignment and baseline source as input context; record the final implementation commit/tree separately as output Evidence. Test modified code on scratch boards only. The parallel reviewer owns W1 Assessment writes. Before final handoff, inspect available W1 Assessments; reconcile material contrary findings or clearly report pending review without indefinite waiting.

Run short tests: an actual receipt over available pinned upstream text; a valid fixture and forbidden-pattern control; missing/empty scope, altered hashes, invalid paths and identity mismatch; repeatable receipt bytes; a usable printed Work Order example; compact/full status agreement. Run existing documentation and workboard regressions. Record exact commands and results. The inspector itself must make no network calls, renderer/agent starts, dependency installs, or upstream writes.

Return one fixed implementation with a sealed build report, test evidence, actual receipt, exact commit/tree, source-only bundle, and copy-paste use/fresh-review instructions. A source snapshot/patch must match the claimed output identity. Publication uses existing working access only; otherwise keep an offline handoff rather than looping on the earlier 403. No merge or baseline upgrade.

One bounded CPU-only assignment. No additional agents/provider calls, GPU, media/model downloads, global installs, daemons/public listeners, provisioning, credential/permission expansion, or deployment. Repair routine local failures and stop at the runnable handoff or a genuine blocker. A later fresh implementation reviewer checks this code; report review #9 cannot certify it.
```

## Synchronization and completion

The reviewer and builder share only the existing board through its reviewed CLI. The reviewer owns two W1 Assessments; the builder owns one distinct W2 assignment/result and its own implementation workspace. Preserve existing output identities; add new records rather than editing sealed ones.

A report FAIL or BLOCKED applies to that report's criterion. The builder must inspect any consequential contrary evidence rather than treating a pending or failed report as accepted. It can return an explicitly experimental candidate while a report Assessment is pending. There is no assumption that an idle session wakes automatically when new evidence appears.

The observed wave-one statuses and bundle identity are in [status](../status.md). Upload only the source-only bundle to the planning conversation for implementation inspection; keep board data and private transcripts local. No local file is available in the planning conversation merely because its path is written here.
