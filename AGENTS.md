# Working in Dream Foundry

Read [current status](docs/status.md), [operating policy](docs/operating-policy.md), [CONTEXT.md](CONTEXT.md), and your assigned Work Order. Historical briefs apply only when explicitly assigned; never restart completed work from an old README.

## Deliver value

1. Name the human-visible result and the decision it enables before editing. Task counts, tests and reports are not substitutes for that result.
2. Build the smallest usable version with existing tools. Infrastructure needs an observed blocker and a named immediate customer. Optional workboard/scanner expansion is frozen during First Look.
3. Use an isolated worktree and preserve existing work. Keep implementation responsibilities behind small interfaces; add shared abstractions only for behavior that actually varies or repeats.
4. Exercise the real entry point. For visual work, open and watch the moving result; source checks and screenshots alone do not verify motion. Record exact identity, observations and unavailable checks.
5. Return the artifact first, a short recommendation and enough evidence to reproduce failures. Changed implementation gets a fresh independent reviewer; do not replay unrelated historical reviews. Missing checks stay BLOCKED.
6. Stop at the assigned handoff or a genuine blocker. Propose the next step without claiming it. The human owns creative direction, acceptance and consequential permission changes.

## Context on demand

- Coordinating tasks: [workboard usage](docs/workboard.md), then [coordination](docs/coordination.md). Use the existing baseline CLI for live-board writes; use scratch state for changed code. A board access failure does not authorize a new coordination project.
- Inspecting source text: [inspector usage](docs/source-inspector.md). A receipt is Evidence, not artwork validation.
- Making First Look: [Work Order #14](https://github.com/Drew-Goddyn/dream-foundry/issues/14). Deliver the offline page; do not build a renderer adapter or dependency stack first.
- Reviewing a fixed implementation: use the original Work Order and direct observations, with read-only source and separate scratch. Do not alter the candidate or its criteria.
- Publishing or changing CI: [GitHub operations](docs/github.md). Use existing access; preserve secrets, source attribution and license notices.

One writer per worktree. No nested agents, wider permissions/spending, merges or deployments by inference. Record the actual model/reasoning setting when available; a prompt does not configure it. Keep raw logs and boards outside tracked files.

For an assembled repository change run `python3 tools/check_docs.py` and `python3 -m unittest discover -s tests`. Keep checks proportional to changed behavior and the requested experience.
