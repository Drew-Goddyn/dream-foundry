# Architecture: local workboard first

Status: proposed implementation brief, not a running system. The human's latest direction replaces the earlier research-first sequence.

## Choose the smallest useful seam

Build one Workboard module behind a CLI. It owns persisted Work Orders, exclusive Assignments, fixed Submissions, Assessments, and readable status. Callers should not coordinate by editing the database or negotiating issue comments.

Prefer an already installed Python 3.10+ runtime and standard-library SQLite/filesystem tools for the first slice. All clients invoke the same module through the CLI; separate CLI processes may open transactions, but no worker edits tables directly. The single-owner rule is logical ownership by the Workboard implementation, not a requirement for a daemon. Keep the database on one host, outside tracked files.

A small CLI eliminates the need to choose between Codex SDK, app-server, MCP, and Symphony before the first useful result. Human-launched Codex sessions already supply the reasoning and can invoke local tools. Richer transport is a later adapter only when something must actually vary.

## Alternatives considered, same-agent design passes

A GitHub-only work queue has almost no setup but lacks our atomic local claim semantics. A daemon with provider adapters offers automatic wake-ups but adds lifecycle, authentication, and recovery work before a useful result. A local CLI workboard gives the current caller a simple interface and keeps transactions, snapshots, and validation in one implementation. Choose the CLI now; keep the other options as a nonblocking research note.

## Scope and authority

Repository documents hold intent/policy; GitHub issues hold scoped Work Orders; the local workboard holds current assignments and evidence references. Initially import or seed only explicit Work Orders. No GitHub polling, bidirectional synchronization, or public listener is needed.

The first slice is a trusted, same-user, single-host prototype. Role/session IDs record provenance and detect accidental same-session review; they are not authentication or proof against a malicious agent. Filesystem and client permissions still matter. Do not sell bookkeeping as a security boundary.

Assignment grants are bounded by the Work Order/session scope. Cancellation invalidates the current claim. Automatic lease expiry, replacement workers, process supervision, and unattended retry are not in the first slice; a stale assignment is explicitly cancelled before any replacement. No old process gets declared dead because a timer elapsed.

## Module depth and tests

Keep claim transitions, submission sealing/digests, repeated-delivery handling, and assessment binding inside Workboard. The interface is the test surface. Use a temporary real database and real filesystem fixtures, with two CLI processes for a claim collision. Avoid exposing storage internals to make tests convenient.

Do not prebuild the previously proposed Trial Executor, Assessment Lab, and Evidence Catalog as separate packages. Extract a module when real variation or duplicated knowledge earns the seam. Report schemas can remain small validated data structures.

## Later, when earned

The [coordination contract](coordination.md) separates current acceptance criteria from future automation behavior. Add a Codex adapter only for programmatic execution, a tracker adapter only for actual synchronization, and a scheduler only when bounded batch dispatch is needed. [Transport research](research/coordination-options.md) remains reference material, not a gate.
