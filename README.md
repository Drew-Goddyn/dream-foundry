# Dream Foundry

A human-directed Codex swarm for research, experimentation, and eventually executable art.

**Now: use the reviewed local workboard for two useful precursor tasks.** The human relayed a fresh review reporting PASS for candidate `02675002`. No repair was requested. The implementation still exists in a local bundle, not on this documentation branch; see [status](docs/status.md) for exact identities, attribution, and publication state.

## Start here

Read [current status](docs/status.md), then [wave-one launch instructions](docs/agents/wave-01.md). Launch **DF-OPS-01** first. After it reports **BOARD_READY**, launch **DF-RESEARCH-01** on the same machine. They use one explicit durable state root and disjoint workspaces; they do not launch further agents.

The operational task makes shared-board startup and handoff repeatable. The research task identifies the smallest CPU-only anidoodle integration. Both use the actual workboard to claim and seal their output. No framework survey, simulator program, or repeated review of unchanged implementation is a prerequisite.

The [first-build brief](docs/agents/launch.md) and [first-review brief](docs/agents/reviewer.md) remain historical instructions for those completed assignments, not requests to launch duplicates. Human acceptance, publication, merge, and unattended automation remain separate from the received reviewer PASS.

## Working loop

Make a useful change, exercise its real entry point, obtain fresh review for changed implementation, and use the result. Treat research reports as proposals until assessed. Increase workers and autonomy separately; a report or issue does not start a process.

Agents read [AGENTS.md](AGENTS.md). Terms live in [CONTEXT.md](CONTEXT.md); authority in [operating policy](docs/operating-policy.md); assignment and evidence behavior in [coordination](docs/coordination.md). The [precursor suite](docs/experiments/precursor-suite.md) separates short current checks from deferred resilience work.

## Resources and publication

Current work uses installed tools and lightweight source/documentation inspection. GPU work, local model weights, generated media, large datasets, paid provisioning, and recursive worker launching are outside these assignments. Human-launched Codex sessions still consume the owner's model allowance. Use the highest supported reasoning setting on the human-selected model; report unknown configuration honestly.

GitHub holds Work Orders, draft PRs, and hosted checks. [GitHub operations](docs/github.md) records plan guidance and unapplied settings. Main is not automatically merged. Keep raw boards, transcripts, credentials, and private machine details local; the repository is public.

## Verification

The documentation branch supplies standard-library checks: `python3 tools/check_docs.py` and `python3 -m unittest discover -s tests` with Python 3.10+. Their success is not implementation CI. The local candidate's reviewer reported six workboard checks, fourteen total tests, independent CLI observations, and a real second-session report Assessment; source artifacts have not yet been inspected from the planning conversation.

Useful on demand: [architecture](docs/architecture.md), [transport research](docs/research/coordination-options.md), [report template](docs/templates/research-report.md), [assessment template](docs/templates/assessment.md), and [historical self-checks](docs/reviews/foundation-self-check.md). No project license has been selected; third-party code reuse needs an explicit provenance/license decision.
