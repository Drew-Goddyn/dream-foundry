# Dream Foundry

A human-directed Codex swarm for research, experimentation, and eventually executable art.

**Now: build a useful local workboard, then improve it while using it.** The human requested fast, low-resource iteration rather than a long experiment or planning program. One builder makes the first working slice; one fresh reviewer checks it. Research happens only where it unblocks that slice.

The repository currently contains instructions, planning, and passing historical documentation checks, not an implemented workboard or running swarm. See [status](docs/status.md) for exact evidence and [the build brief](docs/agents/launch.md) for the next action.

## Start

Launch one local Codex session named **DF-BUILD-01** with the complete message in [docs/agents/launch.md](docs/agents/launch.md). Work from `docs/phase-0-foundation` while the foundation PR is unmerged, in a separate builder branch/worktree. There is no prerequisite scout session, framework survey, or full simulator.

The first slice is a local CLI that lets human-launched agents take a research Work Order, claim it without a collision, submit a fixed report, record a separate review, and inspect durable status. Use it on one real precursor task. This is a supervised prototype, not unattended execution or automatic agent spawning.

After a fixed candidate exists, launch **DF-VERIFY-01** using [the reviewer brief](docs/agents/reviewer.md). Review the working result, not another speculative architecture proposal.

## Fast loop

Build one usable slice. Run short checks for the failure modes it actually exposes. Review independently. Repair or keep the result. Use the workboard to drive the next small research/documentation task.

Keep the [glossary](CONTEXT.md), [operating policy](docs/operating-policy.md), [coordination contract](docs/coordination.md), and [bootstrap plan](docs/bootstrap-plan.md) current. The larger [experiment catalog](docs/experiments/precursor-suite.md) is a risk backlog, not a gate before useful work.

## Resources and GitHub

No GPU, local model weights, image/video generation, large datasets, paid cloud provisioning, or recursive worker launching in this slice. Local agent sessions still use the owner's model allowance. Use the highest reasoning setting supported by the human-selected model without claiming a prompt changes the client's configuration.

GitHub holds Work Orders, draft PRs, and lightweight hosted checks. [GitHub operations](docs/github.md) explains the Pro allowance and settings that remain unconfigured. Main is not automatically merged; raw logs and machine details stay local because this repository is public.

## Checks and references

With Python 3.10 or later, run `python3 tools/check_docs.py` and `python3 -m unittest discover -s tests`. These existing standard-library checks cover documentation structure and their own fixtures, not agent behavior. The builder adds short prototype tests and a real walkthrough.

Useful on demand: [architecture](docs/architecture.md), [transport research](docs/research/coordination-options.md), [research report](docs/templates/research-report.md), [assessment template](docs/templates/assessment.md), and [historical self-check evidence](docs/reviews/foundation-self-check.md). No project license has been selected; third-party code reuse needs a provenance/license decision.
