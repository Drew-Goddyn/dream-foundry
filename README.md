# Dream Foundry

A human-directed Codex swarm for research, experimentation, and eventually executable art.

## Start here

Read [current status](docs/status.md) for the active assignments, exact source identities, and what is observed versus reported. Agents begin with [AGENTS.md](AGENTS.md). Old launch briefs are historical unless the current assignment selects them.

The first local workboard has a human-relayed independent PASS. Two human-launched workers now report sealed outputs on one shared board: an operational runbook and a CPU-only anidoodle integration brief. Their reports await Assessment. The implementation is still local, not present on this documentation branch.

The prepared next step is [wave two](docs/agents/wave-02.md): one fresh reviewer assesses both reports while one isolated builder makes a no-render source inspector and two small workboard usability fixes. No mandatory framework study, repeated baseline review, or long experiment precedes that work. Preparing briefs does not launch sessions.

## Working loop

Build one useful slice, exercise its real entry point, independently review changed implementation, and use the result. Research can inform an isolated experiment before it is accepted, but contrary evidence must be reconciled before claiming a verified outcome.

GitHub records intent and proposed changes. The reviewed local workboard coordinates manually launched sessions through explicit task claims and sealed outputs. Automatic agent launching, unattended recovery, and remote synchronization are not implemented or certified.

Terms live in [CONTEXT.md](CONTEXT.md); authority in [operating policy](docs/operating-policy.md); assignment and evidence behavior in [coordination](docs/coordination.md). [The precursor suite](docs/experiments/precursor-suite.md) separates current smoke checks from deferred resilience work.

## Resources and publication

Use installed tools and lightweight CPU/source inspection. GPU work, model weights, generated media, large datasets, paid provisioning, and recursive worker launching are outside current assignments. Human-launched Codex sessions still consume the owner's model allowance. Use the highest supported reasoning on the human-selected model; a prompt cannot configure it.

[GitHub operations](docs/github.md) records plan guidance and settings not yet applied. Main is not automatically merged. Keep boards, raw transcripts, credentials, and machine-specific details local because this repository is public. A source-only Git bundle is the pending transport for implementation inspection here; a path in a report is not an uploaded file.

## Checks and references

This documentation branch uses `python3 tools/check_docs.py` and `python3 -m unittest discover -s tests` with Python 3.10+. Documentation CI does not certify the unpublished local workboard or future inspector. See [status](docs/status.md) for scoped evidence.

Useful on demand: [architecture](docs/architecture.md), [report template](docs/templates/research-report.md), [assessment template](docs/templates/assessment.md), [earlier wave](docs/agents/wave-01.md), and [historical self-checks](docs/reviews/foundation-self-check.md). Third-party code reuse requires checking and retaining its actual license/provenance; no project license has been selected.
