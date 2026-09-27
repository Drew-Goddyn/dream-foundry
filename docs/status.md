# Current status

Snapshot: 2026-09-26, America/Vancouver. This is a handoff, not a live scheduler.

## Latest direction

The human asked to move quickly and avoid long experiments. The earlier separate preflight, transport study, protocol study, and full offline simulator are no longer prerequisites. Build a useful local workboard now, using reversible defaults and short checks. This changes pacing and scope staging, not merge, spend, or agent-launch permissions.

Repository: `Drew-Goddyn/dream-foundry`, public at inspection. Main remains the initial README commit `62261db81ae9c02ee2d047a607ddbac41a11cc6f`. [Draft PR #2](https://github.com/Drew-Goddyn/dream-foundry/pull/2) contains the foundation and this fast-path revision. Use its exact current head, not main, to start a builder branch.

## What exists

Documentation, role briefs, templates, a disabled policy example, and small documentation checks exist. Historical CI run 36299928678 passed eight checker fixtures for foundation head d945c201; [the record](reviews/foundation-self-check.md) identifies the exact historical merge snapshot. New revisions need their own checks. No controller, workboard, local worker, or fresh independent reviewer has run from this chat.

## Dispatch

| Label | Work Order | State | Result |
| --- | --- | --- | --- |
| DF-BUILD-01 | [#6](https://github.com/Drew-Goddyn/dream-foundry/issues/6) | Ready for human launch | First usable local research workboard |
| DF-VERIFY-01 | [#5](https://github.com/Drew-Goddyn/dream-foundry/issues/5) | Launch after fixed candidate | Fresh review of actual entry point and short checks |
| DF-RESEARCH-01 | [#3](https://github.com/Drew-Goddyn/dream-foundry/issues/3) | Optional; only for a concrete blocker | Answer a decision the running slice needs |
| DF-PREFLIGHT-01 | [#1](https://github.com/Drew-Goddyn/dream-foundry/issues/1) | Retired as a separate launch | Checks folded into DF-BUILD-01 startup |
| DF-PROTOCOL-01 | [#4](https://github.com/Drew-Goddyn/dream-foundry/issues/4) | Retired as a separate launch | Short protocol tests folded into #6 |

Real session handles: none reported. Repository access is established; local Codex, Python, filesystem permissions, authentication, and the owner's remaining model/GitHub allowances are uninspected.

## Still deliberately absent

No automatic merges, branch-rule changes, public listener, paid infrastructure, Project board, Codespace, GPU workload, or recursive worker spawning. The builder can proceed from the unmerged foundation; waiting for a documentation-only approval is not a separate gate. Human acceptance and fresh review apply to the implemented candidate.

Next action: launch DF-BUILD-01 with [the complete brief](agents/launch.md). Do not launch the retired scout/protocol roles.
