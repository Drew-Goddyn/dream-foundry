# Dream Foundry

A human-directed Codex swarm for research, experimentation, and eventually executable art.

**Now: build a useful local workboard, then improve it while using it.** The human requested fast, low-resource iteration rather than a long experiment or planning program. One builder makes the first working slice; one fresh reviewer checks it. Research happens only where it unblocks that slice.

The repository now includes a supervised Python/SQLite workboard. Use the [local walkthrough](docs/workboard.md) to enqueue, claim, submit, assess, inspect, and cancel work. Fresh independent review and human acceptance are pending; see [status](docs/status.md).

## Start

Use a fixed source checkout and one explicit state root shared by authorized sessions. Follow the [workboard walkthrough](docs/workboard.md), or launch **DF-VERIFY-01** with the fixed candidate and [complete review packet](docs/workboard-review.md). The [original build brief](docs/agents/launch.md) records the authorized scope. The CLI coordinates human-launched sessions; it does not launch them.

## Fast loop

Build one usable slice. Run short checks for the failure modes it actually exposes. Review independently. Repair or keep the result. Use the workboard to drive the next small research/documentation task.

Keep the [glossary](CONTEXT.md), [operating policy](docs/operating-policy.md), [coordination contract](docs/coordination.md), and [bootstrap plan](docs/bootstrap-plan.md) current. The larger [experiment catalog](docs/experiments/precursor-suite.md) is a risk backlog, not a gate before useful work.

## Resources and GitHub

No GPU, local model weights, image/video generation, large datasets, paid cloud provisioning, or recursive worker launching in this slice. Local agent sessions still use the owner's model allowance. Use the highest reasoning setting supported by the human-selected model without claiming a prompt changes the client's configuration.

GitHub holds Work Orders, draft PRs, and lightweight hosted checks. [GitHub operations](docs/github.md) explains the Pro allowance and settings that remain unconfigured. Main is not automatically merged; raw logs and machine details stay local because this repository is public.

## Checks and references

With Python 3.10 or later, run `python3 tools/check_docs.py` and `python3 -m unittest discover -s tests`. The structural checker covers documentation; test discovery also runs six workboard smoke tests through real local CLI processes with simulated identities. These are local self-tests, not independent agent acceptance.

Useful on demand: [architecture](docs/architecture.md), [transport research](docs/research/coordination-options.md), [research report](docs/templates/research-report.md), [assessment template](docs/templates/assessment.md), and [historical self-check evidence](docs/reviews/foundation-self-check.md). No project license has been selected; third-party code reuse needs a provenance/license decision.

For the no-render text inspection slice, see the [source inspector](docs/source-inspector.md). It emits scoped Evidence receipts from fixed local text exports.
