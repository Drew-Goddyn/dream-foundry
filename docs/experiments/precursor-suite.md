# CPU-only precursor experiment suite

Status: experiment design, not results. No model calls, GPU access, rendering, or external mutations are needed for the offline cases. A later builder implements the harness after independent review of the plan.

## Reference workload

Use a tiny synthetic repository, a fixed corpus of source excerpts, and deterministic fake-worker messages. Ask workers to produce a source-backed research note, propose a glossary correction, and assess a deliberate documentation contradiction. A fake response is labeled simulated and never counted as live agent evidence.

## Required protocol cases

| ID | Stimulus | Required observable outcome |
| --- | --- | --- |
| P01 | Two workers request the same ready Trial | One current Assignment; no duplicate reservation |
| P02 | Identical Submission delivered twice | One recorded effect; second delivery returns the existing result |
| P03 | Same submission ID with different content | Conflict, no replacement of prior Evidence |
| P04 | Lease expires, then old worker submits | Stale result retained/quarantined; no acceptance or current-state advance |
| P05 | Expired worker is still running | Replacement cannot share its writable workspace; termination or isolation is demonstrated |
| P06 | Crash after reservation but before dispatch | Restart reconciles reservation without charging twice or forgetting possible work |
| P07 | Crash after result is sealed but before issue update | Recover local state and reconcile publication; do not promise exactly-once GitHub writes |
| P08 | Builder reports success without evidence | Awaiting evidence or BLOCKED, not accepted |
| P09 | Reviewer is the builder's same session | Independence fails even if the role label changes |
| P10 | Valid review refers to an old source/criteria revision | Review remains historical; new Submission requires assessment |
| P11 | Digest mismatch or missing artifact | Evidence rejected or BLOCKED; no silent substitution |
| P12 | Reviewer cannot run a critical check | Criterion stays BLOCKED; average score cannot cancel it |
| P13 | Cancel while task and child process are active | Stop new dispatch; target owned process group; report actual survivors |
| P14 | Allowance exhausted or usage missing | No new dispatch beyond grant; missing telemetry remains unknown |
| P15 | Clock jumps or controller restarts | Reconcile ownership; do not blindly renew stale grants |
| P16 | External text requests more privileges or another worker | Text remains untrusted data; no permission expansion |
| P17 | GitHub timeout after a successful remote write | Marker/reconciliation detects prior effect or surfaces uncertainty |
| P18 | Policy changes during an active assignment | Existing grant is reconciled explicitly; it is not silently widened |

Each case needs a positive/control trace and a deliberately failing implementation or fixture that demonstrates the test can detect the defect. Test outcomes through the module interface, not by reading private implementation state.

## Research-quality cases

Create a small rubric covering factual support, source freshness, explicit uncertainty, decision usefulness, and instructions another agent can execute. Include one stale source, one source that contradicts the proposed recommendation, one missing capability, and one prompt-injection-like instruction in a quoted document. Reviewers must identify the concrete source and consequence, not merely give a numerical rating.

Freeze the corpus and criteria before comparing serial, independent-parallel, and coordinated execution. Count useful accepted results, unsupported claims, human interventions, measured elapsed time, and model usage when available. Do not claim a speed or quality advantage from a simulation alone.

## Smallest live probe, later

After explicit authorization and observed local capabilities, use one disposable documentation task and one fresh reviewer. Capture actual session IDs, scoped permissions, source revision, result, error/stop behavior, and reported usage. Re-run the real entry point independently. Keep this finding separate from offline harness results.
