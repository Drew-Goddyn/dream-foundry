# Dream Foundry

A human-directed creative swarm: explore different ideas, make executable work, compare real results, and retain useful discoveries with less human coordination.

## Next result: First Look

[Work Order #14](https://github.com/Drew-Goddyn/dream-foundry/issues/14): **a drawn machine invents a flower**, interpreted three different ways on one offline, playable page. The next human feedback should choose a creative direction, not approve more infrastructure.

The sketches are not implemented yet. Launch **DF-MAKE-01** with the first-look assignment from an isolated `make/first-look` worktree based on this integrated branch. One maker produces three creative hypotheses; this is not three autonomous agents. A fresh reviewer checks the fixed experience afterward.

## What already works

This branch combines the published, reviewed workboard and text inspector with current operating instructions. Runtime, tests, examples and third-party notices retain their published blob identities. See [status](docs/status.md) for exact provenance and pending work.

Use [the workboard](docs/workboard.md) to coordinate local sessions and [the source inspector](docs/source-inspector.md) for scoped text checks. These tools do not launch agents or certify artwork. Ordinary offline browser sketches are now the assigned creative workload; heavyweight rendering and model-generation jobs are not.

## Working rule

Deliver something judgeable. Add infrastructure only to remove an observed blocker for a named deliverable or repeated human burden. Keep review evidence available, but show the artifact first. Existing tools are frozen unless a concrete defect blocks the current outcome.

Agents read [AGENTS.md](AGENTS.md), [current status](docs/status.md) and their assignment. Permissions live in [operating policy](docs/operating-policy.md); terminology in [CONTEXT.md](CONTEXT.md). Historical wave briefs are not current dispatch instructions.

Checks: `python3 tools/check_docs.py` and `python3 -m unittest discover -s tests`. Their success is not visual review. GitHub publication, human acceptance, merging and local workboard upgrades remain separate. Keep private runtime data out of this public repository.
