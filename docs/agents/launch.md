# Human-launched Codex assignments

These are prepared messages, not dispatched sessions. Start with DF-PREFLIGHT-01 only. Launching a message is a bounded assignment, not permission for the agent to create other sessions.

## Workspace preparation

Open or clone `Drew-Goddyn/dream-foundry` using the human's usual Git/Codex workflow. Inspect `docs/phase-0-foundation`; main may contain only the landing page while the foundation PR is unmerged. Record the exact commit before beginning. Do not reset or overwrite an existing dirty checkout. Once the foundation is accepted, use its merged commit for subsequent work.

For parallel writing assignments, create separate worktrees/branches using the already installed Git tools after checking the working tree. A reviewer uses a frozen read-only source snapshot with a separate writable evidence directory. A same-tree editor must not be active during review.

Select the highest reasoning setting actually supported by the chosen model in the local client. The preflight reports the observed setting or the fact that it could not verify it. No model name, effort flag, auth route, or local tool installation is assumed here.

## Launch first: DF-PREFLIGHT-01

Copy this whole message into one new local Codex session titled **DF-PREFLIGHT-01**:

```text
You are DF-PREFLIGHT-01, the local capability scout for Drew-Goddyn/dream-foundry.

Work from the documentation foundation revision, initially on branch docs/phase-0-foundation. Record the exact commit. Read AGENTS.md, CONTEXT.md, docs/operating-policy.md, docs/status.md, and GitHub Work Order P0-01 (#1). If those documents are absent, report the mismatch and stop rather than reconstructing them.

Goal: establish the actual local capabilities needed for a small, CPU-only Codex research swarm. This is one bounded investigation, not a build or an unattended loop.

Inspect only command-specific non-secret output: repository revision/status, OS family, installed Git and available runtimes, codex --version, and relevant codex help. Report the supported local integration routes, effective sandbox/approval constraints you can establish, and highest reasoning setting supported for the human-selected model. Inspect an authentication status command only after confirming its output is non-secret; report the route/availability, never token contents. Distinguish observed behavior from help text and untested claims.

Do not install anything, download weights or datasets, start services, invoke nested model sessions, alter client configuration, widen permissions, read credential files, or dump environment variables. Do not change source, commit, push, merge, or publish an issue comment in this assignment. Keep raw output local.

Return one sanitized report using docs/templates/research-report.md: exact candidate/repository identity, commands actually run, capability matrix, observations, unknowns, and the smallest next probe you recommend. The report may be your final message; omit private paths and identifiers. Stop after that report. Do not start the next Work Order.
```

The issue allows a future sanitized report publication; this initial launch is intentionally narrower and returns the report without a GitHub write. The human can relay that first report. Routine later handoffs should move to the tested controller, not remain manual forever.

## Next lane: DF-RESEARCH-01

After preflight, assign one fresh session the coordination-options Work Order. Read docs/research/coordination-options.md and the sanitized preflight. Scope: official source reading and one new report under docs/research/reports/df-research-01.md on its own branch. Compare CLI, SDK, app-server where relevant, and adopting Symphony against manual launches, fresh review, recovery, and permissions. Return a recommendation and smallest smoke-test plan. No installation, live nested model invocation, or edit to effective policy. Stop after one report.

## Parallel lane: DF-PROTOCOL-01

After preflight, assign a different session the protocol-experiments Work Order. Read CONTEXT.md, docs/coordination.md, and docs/experiments/precursor-suite.md. Scope: one report under docs/research/reports/df-protocol-01.md with counterexample traces, data-contract proposals, and a minimal fake-worker harness plan. Challenge ambiguous states and duplicate/stale/expired ownership. Do not implement a production controller or edit shared policy. Stop after one report.

## Then: DF-VERIFY-01

After the integration owner freezes a planning revision or implemented candidate, open a genuinely fresh session. Use [the reviewer brief](reviewer.md), supply the exact commit and original Work Order criteria, and keep the author's self-review separate until the reviewer's initial assessment is recorded.

Session labels are human-readable handles. Preserve the real runtime session ID when available; otherwise explicitly record it as unavailable. Never use a newest-session selector to address one of several workers.
