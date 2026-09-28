# Current status

Build snapshot: 2026-09-27 UTC. This is a supervised local handoff, not a live scheduler.

## Latest direction

The human asked to move quickly and avoid long experiments. The earlier separate preflight, transport study, protocol study, and full offline simulator are no longer prerequisites. Build a useful local workboard now, using reversible defaults and short checks. This changes pacing and scope staging, not merge, spend, or agent-launch permissions.

Repository: `Drew-Goddyn/dream-foundry`, public at inspection. Main remains the initial README commit `62261db81ae9c02ee2d047a607ddbac41a11cc6f`. [Draft PR #2](https://github.com/Drew-Goddyn/dream-foundry/pull/2) contains the foundation and this fast-path revision. Use its exact current head, not main, to start a builder branch.

## What exists

A Python/SQLite CLI now provides enqueue, atomic claim, sealed submission, separate assessment, persistent status, and explicit cancellation. The [walkthrough](workboard.md) and [sanitized build record](workboard-build.json) describe the local slice. A [real documentation report](reports/workboard-ci-handoff.md) was submitted through the tool; its builder-authored simulated Assessment is not independent review. Documentation, role briefs, templates, a disabled policy example, and small documentation checks also exist. Historical CI run 36299928678 passed eight checker fixtures for foundation head d945c201; [the record](reviews/foundation-self-check.md) identifies the exact historical merge snapshot. New revisions need their own checks. The builder exercised the local workboard. No controller or fresh independent reviewer was launched by this build.

## Dispatch

| Label | Work Order | State | Result |
| --- | --- | --- | --- |
| DF-BUILD-01 | [#6](https://github.com/Drew-Goddyn/dream-foundry/issues/6) | Local slice built; fresh review pending | First usable local research workboard |
| DF-VERIFY-01 | [#5](https://github.com/Drew-Goddyn/dream-foundry/issues/5) | Launch after fixed candidate | Fresh review of actual entry point and short checks |
| DF-RESEARCH-01 | [#3](https://github.com/Drew-Goddyn/dream-foundry/issues/3) | Optional; only for a concrete blocker | Answer a decision the running slice needs |
| DF-PREFLIGHT-01 | [#1](https://github.com/Drew-Goddyn/dream-foundry/issues/1) | Retired as a separate launch | Checks folded into DF-BUILD-01 startup |
| DF-PROTOCOL-01 | [#4](https://github.com/Drew-Goddyn/dream-foundry/issues/4) | Retired as a separate launch | Short protocol tests folded into #6 |

The real builder session handle is recorded in the local ledger and omitted from public artifacts. Local checks used installed Python 3.14.2 and SQLite 3.53.2. Client reasoning configuration, model usage, cost, and remaining allowances are unknown. See the handoff for the fixed candidate and current publication result; branch names alone are not evidence identities.

## Still deliberately absent

No automatic merges, branch-rule changes, public listener, paid infrastructure, Project board, Codespace, GPU workload, or recursive worker spawning. The builder can proceed from the unmerged foundation; waiting for a documentation-only approval is not a separate gate. Human acceptance and fresh review apply to the implemented candidate.

Next action: the human launches DF-VERIFY-01 with the exact candidate, local Submission root/digest, and [complete review packet](workboard-review.md). Independent review and human acceptance remain pending.
