# Build, use, adjust

This plan supersedes the original staged research program following the human's request to move fast and avoid long experiments.

## First usable result

One local workboard for human-launched research/documentation agents. A user or authorized worker can enqueue a Work Order, obtain an exclusive Assignment, submit a fixed report, record a separate Assessment, and see the state after closing and reopening the CLI.

Use Python 3.10+ and its standard library if already installed. This is a reversible prototype default, not the platform's permanent language. No live model integration is needed: the human already opens Codex sessions, and those sessions can invoke ordinary local tools.

The first useful task is a short note identifying concrete contradictions or a needed next change in Foundry's own documentation. Use the workboard on that task instead of proving it only on fake messages.

## One builder, one reviewer

DF-BUILD-01 checks only the tools needed for the next operation, then builds #6. It need not wait for #1, #3, #4, or a foundation-only review. It uses a separate worktree and source branch, keeps raw local state outside Git, and offers a fixed candidate with actual commands and evidence.

DF-VERIFY-01 starts fresh when that candidate exists. It re-runs the actual CLI flow in a disposable workspace and checks the short mandatory cases. It does not patch source while reviewing. The same human account can carry reports, but this does not create a formal independent GitHub approver.

After review, the builder repairs real failures in the same slice. Optional improvements do not block the slice. If the approach repeatedly fails, replace the small approach rather than expanding the test program indefinitely.

## Short checks now

Check the happy path, exclusive claims, evidence integrity/idempotent resubmission, fresh-review bookkeeping, process reopen, and explicit cancellation. Details live in [the precursor suite](experiments/precursor-suite.md). These are small local checks, not a long benchmark or a gate requiring all eighteen historical scenarios.

## Use the next slice to learn

Once the workboard works, have two human-launched producers take a small approved set of research/documentation tasks and one fresh reviewer inspect the submissions. Add a status export the human can read. Only then add delivery/wake-up automation if manual handoff is the actual bottleneck.

Automatic expiry/reassignment, autonomous restarts, remote synchronization, and live provider execution require their own focused checks when introduced. The first supervised prototype does not claim these capabilities. Test future failure modes alongside the feature, not weeks before any use.

## Tuning rule

For each change record the problem, the smallest change, what happened, and keep/revert. Track useful accepted outputs, human interventions, duplicated work, errors, elapsed time, and reported usage. These observations guide the next task; no statistical experiment program is required to start.

Increase capacity, duration, and authority separately. Keep GPU/rendering work outside this precursor. The longer-term creative studio remains the destination.
