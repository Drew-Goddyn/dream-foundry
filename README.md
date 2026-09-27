# Dream Foundry

A human-directed Codex swarm for research, experimentation, and eventually executable art.

**Current phase: CPU-only precursor work.** This repository contains a proposed operating model, research, launch briefs, and lightweight documentation checks. It does not yet contain a working controller, agent runner, or autonomous swarm. A document describing a feature is not evidence that the feature works.

## Start here

Read the [current status](docs/status.md), then the [bootstrap plan](docs/bootstrap-plan.md). The first local assignment is **DF-PREFLIGHT-01**, described in [agent launch instructions](docs/agents/launch.md). Launch only that assignment initially. Research and protocol-design lanes follow after local capabilities are known.

Agents begin with [AGENTS.md](AGENTS.md). Project terminology lives in [CONTEXT.md](CONTEXT.md).

## What we are building

The long-term studio explores creative directions, builds reproducible candidates, assesses actual outputs, and retains useful discoveries. The first workload is the factory itself: research, failure-case experiments, documentation, and planning that make that studio possible.

The intended progression is:

1. Human-launched, explicitly scoped Codex assignments with durable reports.
2. A CPU-only simulation of assignment ownership, evidence, review, cancellation, and recovery.
3. One live local build/review loop under an explicit allowance.
4. A small supervised swarm, followed by measured increases in capacity and autonomy.

GitHub records intent and reviewed changes. A proposed local controller owns live assignment state. Agents produce submissions, not their own acceptance. See [architecture](docs/architecture.md), [coordination](docs/coordination.md), and [operating policy](docs/operating-policy.md).

## Low-resource means

No local model weights, GPU jobs, image generation, video rendering, large dataset downloads, or paid cloud provisioning in this phase. Human-launched Codex sessions can still consume the owner's model allowance; GitHub Pro does not pay for them. Highest supported reasoning on the human-selected model is a preference, not an unlimited spending grant.

## Repository map

- [Research and integration options](docs/research/coordination-options.md)
- [GitHub Pro and repository operations](docs/github.md)
- [CPU-only precursor experiment suite](docs/experiments/precursor-suite.md)
- [Independent review instructions](docs/agents/reviewer.md)
- [Research report template](docs/templates/research-report.md)
- [Assessment template](docs/templates/assessment.md)
- [Proposed authority decision](docs/adr/0001-separate-intent-from-execution.md)
- [Foundation self-check and historical CI evidence](docs/reviews/foundation-self-check.md)

Run `python3 tools/check_docs.py` and `python3 -m unittest discover -s tests` with **Python 3.10 or later** for the repository's mechanical documentation checks. They require only Python's standard library. They do not validate agent behavior, external links, source truth, or independent review. If Python is unavailable locally, report that limitation rather than installing it during preflight.

The repository is public. Publish sanitized summaries, not raw agent transcripts, credentials, or machine-specific environment reports. No project license has been selected yet; importing third-party code requires a separate provenance and license decision.
