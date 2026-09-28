# A validation gap in the unmerged-foundation handoff

DF-BUILD-01, real documentation task WO-DOC-CHECKS-01, revision 1, criteria 1.
Source: Drew-Goddyn/dream-foundry at e37d64087d556f2488a8e214fd9d98fb42bf9b12.
Session provenance is recorded in the local Submission manifest. Date: 2026-09-27 UTC.

**Finding (source-supported):** The launch brief directs the builder to start from
`docs/phase-0-foundation` without waiting for its merge. The workflow at that
revision automatically checks pull requests only when their base is `main`;
its push filter also names only `main`. A build PR targeting the foundation
branch therefore has no matching automatic trigger in this workflow. The
manual `workflow_dispatch` entry exists, but this report did not dispatch it.

**Evidence:** `foundation-launch.md`, opening instructions and complete build
message; `foundation-workflow.yml`, lines 3-8 and the two check commands at lines
28 and 30. Both are exact files extracted with `git show <source>:<path>` and
submitted as sealed evidence. No GitHub run history was used to infer a run.

**Consequence (inferred):** A reviewer following the branch handoff could mistake
an absent CI result for an unfinished run. Local passing checks alone do not
show that GitHub tested the fixed candidate.

**Recommendation (proposed):** Document the validation route beside the local
walkthrough: run the two existing checks against the fixed build, report them as
local evidence, and state that a PR targeting the foundation needs a separately
authorized CI route. Changing the trigger filter is an alternative future change;
it is not necessary to run or review the local workboard.

**Limit:** This is a source-level finding, not evidence of a failed CI run.
Repository settings, live branch protection, external Actions behavior, and
future foundation revisions were not inspected. No workflow, settings, CI
runs, permissions, or merges were changed for this task. Completion is this
fixed report and supporting files; fresh assessment and human acceptance remain
pending. Model usage, cost, and actual client reasoning configuration are unknown.
