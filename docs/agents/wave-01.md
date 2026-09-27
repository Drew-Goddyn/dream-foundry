# Wave one: two useful workers on the reviewed workboard

Prepared, not launched. Use this after the human-relayed DF-VERIFY-01 PASS recorded in [status](../status.md). The goal is useful precursor work, not a new benchmark or reimplementation. Both sessions use the unchanged local candidate; the remote documentation branch does not contain its source.

## Launch order

1. Open a new local Codex session named **DF-OPS-01**, with the complete operational brief below and the private bundle location from the handoff. It sets up the fresh board and seeds both tasks before claiming its own.
2. When it reports **BOARD_READY**, open a separate local session named **DF-RESEARCH-01** with the research brief below. It reads the shared manifest rather than asking the human to relay intermediate state.
3. Each seals one report through the CLI and stops. Neither assesses its own report, spawns another worker, or changes the reviewed source. A later selected implementation change gets a new builder/reviewer loop; these reports are proposals.

The initial ready signal prevents both sessions from trying to initialize an empty database simultaneously, behavior the planning conversation has not inspected. After that, their tasks are independent. Do not claim overlap or unattended operation without actual evidence.

## Exact baseline and workspace contract

Implementation commit: `02675002f640dc484ec6f37a251aff2a5c21cc10`.

Implementation tree: `176e34317128c05c87e119c4447205adb0432a94`.

The human's prior handoff names the original bundle and the durable reviewer preservation directory. The operational worker locates and verifies the supplied bundle; it must not invent a path or retrieve only the remote foundation.

Proposed local root is `$HOME/.dream-foundry/precursor-01`, within actual client permissions. Keep the original handoff and review board unchanged. Use this layout outside tracked source:

```text
precursor-01/
  candidate.bundle
  source/                         # exact reviewed implementation, kept unchanged
  board/                          # one fresh live state root for both sessions
  wave.json                       # initialized by DF-OPS-01 only
  workspaces/DF-OPS-01/            # separate source copy/worktree if needed
  workspaces/DF-RESEARCH-01/
  outputs/DF-OPS-01/
  outputs/DF-RESEARCH-01/
```

Respect existing files. Reuse only a matching initialized wave; a conflicting populated directory is a blocker, not permission to reset it or quietly create another board. If the named root is denied by the sandbox, report the specific missing path permission rather than widening settings.

The local manifest holds `ready`, exact implementation commit/tree, absolute source/state/output locations, each actual CLI Work Order/Trial ID and criteria revision, and frozen task definitions. Verify both tasks through CLI status before publishing `ready: true`. Adapt identifiers to the actual CLI grammar; never change the substantive task criteria. Do not add a new manifest loader or runtime feature merely for this wave; the agents can read a local JSON file.

Work Order source binding uses the Foundry candidate. Upstream revisions discovered during research are supporting evidence, not replacements for that binding. Claims/submissions/assessments go through the supported CLI; direct database edits are outside scope. Read actual usage/help rather than inventing flags from this document.

## DF-OPS-01 brief

```text
You are DF-OPS-01. Use unchanged Dream Foundry candidate 02675002f640dc484ec6f37a251aff2a5c21cc10, tree 176e34317128c05c87e119c4447205adb0432a94, from the supplied local bundle. The remote documentation branch is not that implementation.

Read its AGENTS.md, CONTEXT.md, operating policy, docs/workboard.md and CLI help. Your active task is W1-A / GitHub issue #7, not the historical first-build instructions in the candidate. Preserve old artifacts and source. Check only what is needed to proceed; no repeated full test campaign.

Prepare $HOME/.dream-foundry/precursor-01 within actual permissions. Create a verified source checkout, one new board, disjoint output paths, and a ready manifest under the workspace contract above. Seed W1-A and W1-B through the existing CLI before claims. Freeze their criteria and record actual IDs/source/criteria in wave.json. W1-B's complete task is the research brief below; make it available locally so GitHub access is not necessary to start the other worker.

Claim only W1-A. Print BOARD_READY and the absolute manifest path as soon as setup is complete, then continue without waiting for the other session.

W1-A result: a short, executable same-host runbook showing how another human-launched agent finds its task, claims it, produces a report, seals it, and inspects status without copying intermediate messages between chats. Exercise the actual commands. Report at most three friction-reducing changes based on use; do not implement a scheduler or patch the baseline.

Seal the runbook/report with its evidence through the workboard. Return actual task/Trial/Submission IDs, digest, status, output path, and next-use commands. Leave Assessment and human acceptance pending. Use your real session handle when available; otherwise report unknown without inventing independence.

Also preserve a source-only candidate.bundle for the human to attach to the planning conversation. Inspect its included history for obvious secrets and private artifacts; exclude the runtime board and raw transcripts. Do not silently rewrite the reviewed commit to sanitize it: report any issue instead. Packaging is not a claim of publication.

Use installed tools and light CPU work. No extra agents or model calls, GPU, generated media, model/asset downloads, global installs, cloud provisioning, credential/sandbox changes, merge, or deployment. If a concrete implementation failure appears, preserve it and report rather than repairing around it. Stop after this useful handoff. A prepared manifest is not proof that the second worker ran.
```

## DF-RESEARCH-01 brief

```text
You are DF-RESEARCH-01. Start after DF-OPS-01 reports BOARD_READY. Read $HOME/.dream-foundry/precursor-01/wave.json, verify ready and the expected implementation commit 02675002f640dc484ec6f37a251aff2a5c21cc10 / tree 176e34317128c05c87e119c4447205adb0432a94, and use exactly its shared board root. Do not initialize another board or modify the manifest.

Read the fixed source's AGENTS.md, CONTEXT.md, operating policy, docs/workboard.md and CLI help. Use your own workspace/output path. This W1-B assignment, GitHub issue #8, supersedes historical starter prompts only for this session; it does not expand permissions. Claim only W1-B through the CLI and keep its criteria fixed.

Produce one implementation-ready brief for the smallest CPU-only anidoodle integration: source, metadata, or contract inspection before any rendering. Inspect relevant primary-source code/docs for alexgreensh/anidoodle and achimala/dream-loop. Use existing local copies or small text fetches through permitted read access; pin exactly the revisions inspected. Do not install dependencies or import uninspected code to get past a source-access blocker.

Describe one deep module with concrete input, inspectable output/evidence, expected errors, the complexity its implementation hides, and the smallest next builder task. Propose one useful CPU-only smoke case and one negative control, with the intended verification command clearly marked proposed. Aim for about 800 words plus source references, not a framework survey. Distinguish code-inspected, executed, inferred, and proposed claims.

Seal the report and supporting evidence through the shared workboard under the actual source/criteria binding. Keep upstream source revisions in the evidence. Return actual Work Order/Trial/Submission IDs, digest, status, and output path. Leave assessment and human acceptance pending. Use your actual session identity when available; label unknown honestly.

Use installed tools and lightweight CPU/text work only. Preserve the reviewed implementation and the other worker's output. No additional agents/provider calls, GPU, generated media, model/asset downloads, browser/render installs, daemons, permission/credential changes, merge, deployment, or publication troubleshooting. No repeat of the passed suite without changed implementation. Stop after one useful report or a specific blocker; do not busy-wait for new tasks.
```

## Completion and next decision

The expected result is two genuine session-authored Submissions visible through one board, with separate task ownership, sealed provenance, and no implementation changes. Observe actual timestamps and events before describing execution as concurrent. Choose the next small implementation from the findings, not from a speculative autonomy roadmap.

Source-only publication remains tracked in [#6](https://github.com/Drew-Goddyn/dream-foundry/issues/6). The human may attach the verified bundle here; private boards and raw review logs stay local. Current checks do not prove GitHub integration, automatic wake-up, authentication, or unattended processing.
