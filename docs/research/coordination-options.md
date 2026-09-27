# Coordination and Codex integration research

Status: source inspection and design recommendation, not local execution. Checked 2026-09-26, America/Vancouver. Research scope is deliberately narrow: a human launches named local Codex agents; work is primarily text and CPU-only tests; GitHub is already available.

## Primary sources and observed claims

| Source | Source-supported claim | What remains untested here |
| --- | --- | --- |
| [Codex non-interactive documentation](https://developers.openai.com/codex/noninteractive/) | `codex exec` supports JSON events, final-message output, JSON Schema-constrained output, and explicit session resumption | Installed version, effective permissions, available model/effort, real cancellation and auth |
| [Codex SDK documentation](https://developers.openai.com/codex/sdk/) | The TypeScript library starts, continues, and resumes local threads | Dependency installation and end-to-end behavior on the owner's host |
| [Codex app-server documentation](https://developers.openai.com/codex/app-server/) | Rich bidirectional client protocol, session operations, streamed events, and approvals; experimental transport caveats | Whether precursor requirements justify its larger interface |
| [Codex MCP documentation](https://developers.openai.com/codex/mcp/) | Codex can use connected MCP tools | Whether exposing local Foundry assignment tools helps manually opened sessions |
| [Symphony README](https://github.com/openai/symphony/blob/be10a1b79df723d6d7612b5651c8522704dafb2e/README.md) and [specification](https://github.com/openai/symphony/blob/be10a1b79df723d6d7612b5651c8522704dafb2e/SPEC.md) | A tracker-driven long-running orchestration design with isolated workspaces, bounded dispatch, retries, reconciliation, and repository-owned workflow policy | Suitability of available implementation for GitHub, manual worker launches, and our independent review protocol |
| [SQLite usage guidance](https://www.sqlite.org/whentouse.html) | Local/application storage is a useful fit; networked many-writer cases need different consideration | Our ledger schema, durability, contention, and restart behavior |

The inspected Symphony revision is `be10a1b79df723d6d7612b5651c8522704dafb2e`. The first 180 specification lines were inspected for architecture and constraints, not the entire implementation. Its README calls the implementation an engineering preview. Do not call it production-validated by this research.

## Important compatibility correction

Current Codex SDK documentation states that `codex mcp-server` and the standalone Codex MCP-server binary were removed. Old tutorials that use Codex as that MCP server are not a supported foundation. This is different from Codex acting as a client of our prospective MCP tools. App-server documentation also warns about experimental WebSocket behavior and unauthenticated non-loopback listeners during rollout; no public listener is needed here.

## Comparison against this project's actual requirements

An explicit CLI adapter offers the cheapest first live probe and inspectable process/event boundaries. The SDK improves ergonomics for durable local automation but adds a dependency to verify. App-server earns its cost only when interaction, approvals, or session inspection require its richer protocol. Symphony is a serious adopt-versus-build candidate, but its dispatch assumptions must be reconciled with the human's request to launch workers themselves.

Recommend retaining a small execution seam and deciding the first adapter after preflight. Do not write a new general orchestration framework just because it is possible. A positive adoption result should replace custom work, not add another layer underneath it.

## DF-RESEARCH-01 completion questions

Can the chosen route reliably return a real session handle, full output, error mode, and measurable usage? Can a fresh reviewer use a separate context and fixed snapshot? Can cancellation target only owned child processes? What settings persist on resume, and which must be reapplied? Are assignments and logs durable enough to reconcile after restart? Can the route remain human-launched without secretly becoming a session spawner?

Produce one recommendation, its rejected alternatives, exact source revisions/checked dates, and a smallest authorized smoke-test plan. No packages, daemons, external model calls, or account changes during the research assignment.

## Upstream creative references

The prior design inspected Dream Loop at `9bddb901f7d071cfefdd21e264267c757177a9df` and anidoodle at `03ddf534328962f8a91eb115e3ae67e03da4de5a`. They motivate the future visual feedback loop; their rendering workloads are not required for precursor research. Recheck relevant source revisions before integration rather than assuming those snapshots remain current.
