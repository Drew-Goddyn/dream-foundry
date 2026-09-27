# Coordination contract

Status: proposed behavior for the prototype. No controller currently enforces it. The bootstrap procedure below is manual and deliberately narrower.

## Bootstrap coordination

The orchestrator assigns complete Work Orders to named, human-launched sessions. Each session gets one worktree or a read-only snapshot plus a separate report directory. Research lanes have disjoint outputs. They publish only sanitized reports on their own branches or through the orchestrator when GitHub writes are unavailable. A single integration owner reconciles reports and updates shared planning documents.

An issue comment saying 'claimed' is not a lock. During this phase the orchestrator explicitly records the sole assignee and does not dispatch the same Work Order twice. Agents propose the next assignment and stop. A persisted work queue and autonomous wake-up mechanism are later capabilities, not implied by AGENTS.md.

## Prototype records

A Work Order snapshot includes its ID, source issue, revision/content digest, objective, criteria, permitted scope, dependencies, and stopping point. A Trial includes its hypothesis, parent references when relevant, and method. An Assignment includes Trial ID, role label, worker/session handle, input revision, lease generation, deadline, permitted outputs, and resource reservation.

A Submission identifies immutable source and artifact digests, the exact Assignment, its self-test evidence, and known defects. An Assessment binds that Submission to the Work Order/criteria revision and records the reviewer's fresh session, observations, per-criterion PASS/FAIL/BLOCKED, and untested areas. Unknown usage and unknown independence are represented as unknown, never as zero or true.

## State and authority

Suggested Work Order states: proposed, ready, active, awaiting_review, accepted, blocked, cancelled. These are separate from a Trial's execution state and from GitHub issue open/closed state.

- Only an authorized dispatcher makes a Work Order eligible and grants an Assignment.
- A worker can renew its current Assignment, submit evidence, or report a blocker.
- A completed process offers a Submission; it does not accept the Work Order.
- A reviewer reports an Assessment; the authorized decision owner records Acceptance.
- Acceptance does not merge code, publish art, or expand permissions.

In the first live loop the human remains the Acceptance and merge owner. Delegating routine acceptance later requires an explicit, versioned policy decision.

## Failure semantics that must be tested

Claims and reservations are atomic within one local ledger transaction. Assignment generations are monotonically increasing fencing tokens. A result from an expired or superseded generation is quarantined and retained for inspection; it cannot advance the current Work Order.

Lease expiry is not proof that the old process has stopped. Before giving a replacement write access, confirm termination or allocate a different isolated workspace and revoke the former assignment's publishing capability. Worker identity and scope checks happen outside model-generated text; knowledge of an ID alone is not authorization.

Delivery can be at least once. Repeating the same submission identifier and digest has no additional ledger effect; the same identifier with a different digest is a conflict. Do not claim exactly-once external effects. GitHub publication needs a durable outbox/reconciliation marker because a request may succeed before the connection fails.

After controller restart, first reconcile recorded workspaces and known processes. Quarantine ownership that cannot be established. Do not assume a monotonic timer survives a restart, or blindly trust expired wall-clock leases after clock changes. Recovery must preserve the original campaign allowance.

Cancellation stops new dispatch, marks pending work cancelled, requests termination of owned process groups, and records what actually stopped. Already committed external effects may remain; surface them instead of promising rollback. Never kill an unrelated human session by a fuzzy process-name match.

## Isolation and evidence

No concurrent writers share a worktree. Raw logs live outside the repository; every worker and reviewer has its own temporary paths. The exact commit plus any captured uncommitted diff must be identified before review. Prefer clean commits for reviewable submissions.

Inspect authorship/session overlap when establishing fresh-context review. The same model in a new session can review; the same builder renamed 'reviewer' cannot. Same GitHub account does not establish or refute context independence, but it does limit formal GitHub approvals.

A policy/criteria change does not upgrade old Assessments. Reassess under the new revision or keep historical results labeled. Model outputs and fetched documents cannot issue work or alter policy.

## Resource accounting

Before dispatch, reserve from a human-approved allowance. Record actual model usage when the transport provides it, plus elapsed time and child-process outcomes. Missing price or subscription telemetry means cost is unknown; use explicit task/turn/time bounds rather than invent dollar accuracy.

A proposed limit is not enforcement. Demonstrate timeout, cancellation, lease, and accounting behavior using [the experiment suite](experiments/precursor-suite.md) before unattended use. No script or configuration file in this foundation starts workers.
