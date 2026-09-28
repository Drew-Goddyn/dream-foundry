# Short checks first; resilience backlog later

The human asked to avoid long experiments. This replaces the requirement to complete an eighteen-case simulator before building. Implement the useful supervised CLI and test the small scope it actually exposes.

## Six mandatory smoke checks for the first slice

| Check | Direct observation |
| --- | --- |
| Happy path | Enqueue one real research/documentation Work Order, claim it, submit a small fixed report, attach a separate Assessment, and inspect status. A test reviewer is labeled simulated; fresh human-launched review is separately demonstrated. |
| Claim collision | Two local CLI processes contend for one Trial; only one obtains its current Assignment. |
| Submission integrity | Same-ID/same-digest resubmission is harmless; changed content under that ID conflicts; missing or modified sealed evidence cannot support PASS. |
| Review bookkeeping | Known same-session review and mismatched source/criteria are rejected; required BLOCKED/FAIL criteria cannot be averaged into PASS; reviewer PASS is not human Acceptance. |
| Persistence | Close every CLI process, reopen against the same temporary state root, and observe the same recorded state. This does not certify daemon recovery. |
| Cancellation | Cancel an Assignment and attempt a late submission; it cannot advance the Work Order. The tool explicitly says the human-opened agent process is not terminated by ledger cancellation. |

Use tiny fixtures and real temporary local storage. The suite should stay short enough to run during normal edits. A pair of local helper processes tests claim concurrency; it is not an agent swarm or another model invocation. Include negative/control fixtures so a green result can actually detect defects.

No performance campaign, external provider call, GPU job, large dataset, or full simulator is required. If a prerequisite is missing, report the actual blocker; do not launch an installation/research project without need.

## Future risk catalog, not first-slice gates

The former P01-P18 cases remain below as a map of where tests belong when new features are introduced. First-slice equivalents are covered by the smoke checks, not a second suite.

| IDs | Risk | Add the test when |
| --- | --- | --- |
| P01 | Duplicate current claims | Now, claim collision |
| P02-P03 | Duplicate/conflicting submissions | Now, integrity |
| P04-P05 | Expired grants and old workers still alive | Automatic lease expiry/reassignment is introduced |
| P06-P07 | Crash between reservation/dispatch or sealing/publication | Autonomous dispatcher or publication outbox is introduced |
| P08-P12 | Missing evidence, false independence, stale criteria, digest mismatch, blocked review | Now, integrity and review bookkeeping |
| P13 | Cancelling owned process groups without killing unrelated sessions | Programmatic process supervision is introduced; ledger cancellation is tested now |
| P14-P15 | Missing usage, exhausted allowances, clock jumps | Unattended accounting and time-based scheduling are introduced |
| P16 | Retrieved instructions attempt privilege expansion | Maintain the trust rule now; exercise its enforcement at any new tool/launch seam |
| P17 | Remote write succeeds before timeout | Actual GitHub write synchronization is introduced |
| P18 | Active grant silently widens after policy update | Policy hot reload or unattended grant renewal is introduced |

## Tune by using it

Pick one real precursor task, write down the problem, make one small change, and observe the result. Track useful output and human interventions without turning the project into a measurement framework. A keep/revert note is enough for reversible changes; consequential authority changes still need an explicit decision.
