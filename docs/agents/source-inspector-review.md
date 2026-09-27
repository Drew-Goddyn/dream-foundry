# DF-VERIFY-03: source inspector and workboard UX

One fresh local implementation reviewer checks [Work Order #10](https://github.com/Drew-Goddyn/dream-foundry/issues/10) under [review #11](https://github.com/Drew-Goddyn/dream-foundry/issues/11). W1 report review is finished. This assignment neither rebuilds the candidate nor repeats the unchanged report assessments.

## Fixed subject

Commit: `b23a5b5c523a42fe47c1f0c11761ef2b80cb8796`.

Tree: `89ed649a0c4b4e44214782729bf465e3cb8c51a6`.

Expected parent: `02675002f640dc484ec6f37a251aff2a5c21cc10`.

Submission: `W2-B-47c1-S1`.

Submission digest: `5e616f0adcaeae5535208aa1457e945f7ef5192c8a8ea9cc25ab95093feaa137`.

Bundle digest: `183006d3ab147541008aa7919d641810434ee783d95748660d43a5cf1d4139d3`.

The human supplies the local wave path and builder output directory. It contains `source-inspector.bundle`, `handoff.json`, `fresh-review.txt`, `usage.sh` and evidence. These files have not been inspected by the planning conversation. Work from a standalone bundle checkout, with separate writable scratch state. Preserve the original files.

## Review sequence

1. Verify the bundle hash and source commit/tree/parent, then read the original frozen Work Order and criteria through the baseline workboard. Verify the sealed Submission and supporting evidence. Read the candidate's instructions and CLI help. Record initial observations before the builder's success narrative. If identities or necessary files cannot be established, mark the affected criterion BLOCKED.
2. Inspect `usage.sh` before running it on disposable state. Independently run the inspector against the actual fixed inputs twice. Compare receipt bytes; inspect source hashes, provenance, rule version, finding locations, coverage and limits. The existing real input is tooling text, not a film. Correctly reported findings must not be mistaken for a failure to execute the inspection.
3. Exercise clean and forbidden synthetic inputs, plus empty/missing scope, altered bytes, identity/profile mismatch, and invalid/escaping/link paths. Ensure no empty or partial scope becomes whole-repository certification, no input modules run, no runtime fetch occurs, and original inputs remain unchanged. Check the stated comment/string limitations rather than demanding a full TypeScript analyzer.
4. Exercise `--example-order` without opening a board, then enqueue the printed example on scratch state. Compare compact and full important-state fields, including corrupt-evidence, pending-review, deadline and acceptance cases. Compare default output with the baseline on the same unchanged scratch board. No live database migration or upgrade is permitted.
5. Run `python3 tools/check_docs.py`, relevant candidate tests and `python3 -m unittest discover -s tests -v`. Inspect assertions, changed code and preserved upstream license/notice. Independent CLI observations, not the reported test count, establish the result.
6. Record one real Assessment of `W2-B-47c1-S1` using the unchanged baseline CLI and your actual session identity where available. Obtain the exact Trial, criteria and author identity from the ledger/handoff; invent none. Baseline source is the Work Order input context; b23a5b5 is implementation output Evidence. Preserve this binding. Only the new Assessment and its normal event may be added to live state.

## Scope and disposition

This slice explicitly supports local text exports with claimed, unauthenticated origins and partial coverage. Absence of a Git snapshot reader, dependency traversal, renderer or full art inventory is not a defect against that assignment. Static rule results cannot certify security, rendering determinism or visual quality. The inspector's own repeatable receipt is a different claim from deterministic artwork.

Return an original compact report using [the assessment format](../templates/assessment.md): verified identities, actual reviewer session or unknown, PASS/FAIL/BLOCKED per critical criterion, direct evidence, real Assessment ID/result, limitations and smallest repair only if necessary. Human acceptance remains unrecorded.

Use installed tools and short CPU-only checks. Keep source unchanged; no repairs, rebases, assertion/criteria changes, package installs, additional agents, services, credentials/permission changes, publication troubleshooting, merges or deployments. Preserve the shared baseline and all W1 evidence. Stop at this review's disposition, not another autonomous round.

A launch brief is not a launched reviewer. Consult [current status](../status.md) before starting to avoid duplicate work.
