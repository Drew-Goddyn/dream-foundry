# Architecture: a local evidence-driven work loop

Status: proposed, not implemented. Vocabulary: [CONTEXT.md](../CONTEXT.md). Runtime contracts: [coordination](coordination.md).

## Preserve the destination

Dream Foundry will eventually search over creative hypotheses and executable artwork. The immediate problem is smaller: several human-launched Codex sessions must produce research and experiments without losing ownership, provenance, review independence, or the user's control of resources.

Keep two kinds of work distinct. Factory work improves Foundry and its methods. Studio work creates artwork using those methods. Changes to policy, evaluation, and the controller pass through independent review; an artwork Trial cannot change its own evaluator or Operating Allowance.

## Three same-agent design alternatives

These are planning alternatives, not independently reviewed designs.

| Shape | Caller interface | Hidden complexity | Trade-off |
| --- | --- | --- | --- |
| GitHub-native manual workflow | Read a Work Order; post a Submission; request review | Existing issue/PR storage and access | Lowest setup; assignment comments do not provide atomic leases or restartable execution |
| Thin local controller | Obtain an Assignment; renew it; submit or block | Ownership, allowance accounting, retries, evidence linkage, recovery | A small amount of new code must be tested; good locality for coordination defects |
| Adopt a full orchestrator | Configure tracker/workflow; start runtime | Dispatch, workspace lifecycle, session management | Faster when its assumptions fit; larger dependency and permission surface, and manual-launch/review semantics still need verification |

Recommendation: use the first shape during bootstrap and test the second with fake workers before selecting a live transport. Study Symphony as a reference and evaluate adoption against explicit requirements rather than assuming a custom controller is necessary. See [research](research/coordination-options.md).

## Information authority

Repository documents hold versioned intent and operating policy. GitHub issues hold scoped Work Orders and discussion. Submitted artifact references identify exact source/output snapshots. A local controller, once implemented, owns only live Assignments, reservations, and execution state. GitHub updates are a projection of execution, not a second mutable lease database.

The controller snapshots an eligible Work Order revision before dispatch. Editing an issue does not retroactively change an active Assignment's target. A changed target creates a new revision and triggers reconciliation.

## Deep modules

| Module | Interface sketch | Implementation it hides |
| --- | --- | --- |
| Work Ledger | assign / renew / record | Atomic claims, fencing tokens, deadlines, idempotency, allowance reservations, persisted events |
| Trial Executor | execute / cancel | Worker process lifecycle, isolated worktree, pinned brief, event capture, effective permissions, cleanup |
| Assessment Lab | assess | Criteria binding, reproducible checks, fresh-context review dispatch, unresolved observations |
| Evidence Catalog | seal / retrieve | Artifact digests, provenance, sanitization state, retention, immutable publication references |

These are module seams, not a mandate for four deployed processes. Begin with one local program. Hide transport and filesystem operations behind internal seams where production and deterministic test adapters genuinely differ. No separate module per agent persona.

SQLite is a provisional single-host ledger choice, owned by the controller. Keep its file on local storage; workers never edit it directly or share it across network filesystems. SQLite's own guidance distinguishes local/application storage from cases needing many networked clients or simultaneous writers: [SQLite usage guidance](https://www.sqlite.org/whentouse.html). A later multi-host requirement should prompt a new decision, not a network-mounted database file.

## Dependency and test strategy

Pure policy and transition logic is in-process and tested directly through the Work Ledger interface. Use temporary local workspaces and real Git in integration tests when available. Inject a deterministic fake clock for time-driven behavior. Third-party Codex and GitHub adapters get recorded-response/failure fixtures; live smoke tests remain separate because mocks cannot establish real authentication or process control.

Evaluate CLI execution first because it can be probed without adding an SDK. The SDK is a plausible automation adapter; app-server is appropriate only if measured requirements need richer client/session control. Transport selection remains provisional until local preflight and the comparison Work Order finish.

## What is deliberately absent

No Kubernetes, distributed queue, local inference server, vector database, embedding pipeline, dashboard, public listener, or recursive agent-spawning policy is required for the precursor. There is no reason to pay those costs before demonstrating one reliable CPU-only work loop.
