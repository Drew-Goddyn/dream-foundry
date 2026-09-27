# Coordination contract

Status: proposed. The first workboard is a supervised local prototype. Future automation requirements below are not gates for that slice.

## Bootstrap and current slice

The human launches DF-BUILD-01 and later a fresh DF-VERIFY-01. The builder uses its own worktree. The reviewer uses the fixed candidate in a separate copy and writable evidence area. Do not make the human relay routine intermediate build steps.

The Workboard module should provide a small CLI for enqueue, claim, submit, assess, status/export, and explicit cancellation. Names may change if the observable workflow becomes simpler. Use one explicit local state root shared by the authorized clients and outside tracked source. Issue comments are discussion, not locks.

Work Order snapshots carry an objective, criteria, scope, and revision. Each attempt is a Trial. An Assignment binds a Trial to the worker/session and its permitted lifetime. A Submission is a fixed output plus provenance. An Assessment binds observations to the exact Submission and criteria revision. Preserve these distinctions without turning each noun into its own module.

## Required now

**Exclusive claims.** Claiming a ready Trial is an atomic transaction. Two callers contending for it cannot both become the current owner. An unsuccessful claim is a visible outcome, not a silent duplicate assignment.

**Fixed evidence.** Seal the report into the evidence area before recording its Submission. Record content digest, source revision where applicable, Assignment/session, and criteria revision. Repeating the same ID/digest returns the existing result. The same ID with different contents is a conflict. Missing/changed evidence prevents recording a successful Assessment. Keep the manifest/checks explicit; a digest is not proof of truth.

**Independent assessment.** Record a fresh reviewer session and per-criterion PASS/FAIL/BLOCKED. Reject known builder-session reuse, revision mismatch, and a successful status without the required evidence. Session strings alone cannot prove independence; demonstrate two actual sessions during the supervised walkthrough. A simulated reviewer stays labeled simulated.

**Reopen.** Closing and reopening the CLI preserves assignments, submissions, and assessments. Database transaction recovery is not a claim of recovering live agent processes.

**Cancel.** Explicit cancellation invalidates the current assignment so a late submission cannot advance it; keep the rejected event inspectable. Cancellation of a ledger record does not terminate a manually opened Codex session. Say so in the CLI result. Replacements use a different workspace until the former writer is known idle.

**No self-acceptance.** Submitting or scoring an output is not Acceptance. The human remains the initial acceptance/merge owner. Display awaiting-human-acceptance separately from a review PASS.

## Future automation, test when added

Automatic expiry and reassignment require fencing generations, actual process reconciliation, and safe replacement isolation. Lease expiry alone never establishes a stopped process. Controller restart must not reset an allowance or spawn duplicate work. Changes to wall clocks require explicit reconciliation rather than blind trust.

Programmatic worker execution needs owned process groups, targeted cancellation, actual session identities, permission reapplication, complete results, and unknown-usage accounting. External publication needs durable retry/reconciliation markers because a timed-out request may already have succeeded. No exactly-once remote-effect promise.

Work Order or policy changes create a new revision; they do not retroactively improve an old Assessment or silently widen an active grant. These principles apply now, while the automatic machinery is deferred.

## Resources and trust

The current allowance is one human-launched build assignment and a separately human-launched review of its fixed result. Routine local code/test repairs inside the assignment do not need repeated human approval. Further model sessions or unattended batches require a new explicit launch/allowance.

Keep public reporting sanitized, raw logs local, and runtime state outside Git. The prototype coordinates trusted same-user agents; it does not enforce adversarial security simply by assigning role names. See [operating policy](operating-policy.md).
