# Use the local workboard

Python 3.10+ and its standard library are the only runtime dependencies. Run the
commands from a fixed source checkout. Each invocation exits; SQLite and sealed
files preserve the work. There is no agent launcher, daemon, provider call, or
acceptance command.

## One shared state root

Choose one absolute directory outside every Git working tree. Every authorized
session must use exactly that root to see the same assignments. A different root
is a different board. State and raw logs are local, not PR attachments.

For a disposable walkthrough, create the root once and retain the printed path:

```sh
FOUNDRY_STATE="$(mktemp -d "${TMPDIR:-/tmp}/foundry-board.XXXXXX")"
printf '%s\n' "$FOUNDRY_STATE"
```

Pass that absolute path to the second session. For retained work, choose a durable
local directory instead: the operating system may remove temporary directories.
Use a local filesystem, not a network share or synchronized folder. The builder's
handoff supplies the existing root for its real report; do not create a new root
to inspect that report.

The CLI emits JSON on stdout, errors on stderr, and exits nonzero on rejection.
`status` also exports mutation/rejection history; it rechecks sealed file digests.
It is a local snapshot, not an automatically sanitized public artifact. Routine
argument syntax errors occur before a ledger transaction.

## Enqueue, claim, and submit

Print a minimal valid input without opening or creating a board:

```sh
python3 tools/workboard.py --example-order > /private/tmp/foundry-order-example.json
```

The example uses the same validator as enqueue. It is immediately usable on a
scratch board; replace its ID, example source revision, objective, scope and
criterion before using it for actual work. `enqueue --help` points to this flag.

The supplied [Work Order](../examples/workboard/documentation-order.json) asks for
a real documentation finding at the fixed foundation revision. Its objective,
scope, stopping point, source revision, and criteria are copied into the board.
The same Work Order ID cannot be redefined. Changed intent uses a new ID and
revision; each new attempt gets its own Trial ID.

```sh
python3 tools/workboard.py --state-root "$FOUNDRY_STATE" enqueue \
  --order examples/workboard/documentation-order.json \
  --trial DOC-CHECKS-T1 \
  --method 'Compare the fixed launch instructions with the fixed workflow'

# CODEX_THREAD_ID is supplied by the client when available.
# If unavailable, use a unique declared label and disclose that the real handle
# is unavailable. Labels do not prove identity or independent context.
FOUNDRY_SESSION="${CODEX_THREAD_ID:-declared-session-handle-unavailable}"
python3 tools/workboard.py --state-root "$FOUNDRY_STATE" claim \
  --trial DOC-CHECKS-T1 --assignment DOC-CHECKS-A1 \
  --worker DF-BUILD-01 --session "$FOUNDRY_SESSION" --identity-kind real \
  --workspace "$PWD" --minutes 60
```

Only one claimant succeeds. A loser must inspect `status`, not write the database
or start the same assignment anyway. Workspace and session values are provenance,
not filesystem locks or authentication. Every writer still needs its own worktree.
A claim defaults to 60 minutes. A passed deadline blocks new submissions but
leaves the claim recorded until explicit cancellation. It never reassigns work
or declares a session stopped.

Create the report and supporting evidence outside source:

```sh
FOUNDRY_INPUTS="$(mktemp -d "${TMPDIR:-/tmp}/foundry-inputs.XXXXXX")"
FOUNDRY_SOURCE=e37d64087d556f2488a8e214fd9d98fb42bf9b12
git show "$FOUNDRY_SOURCE:docs/agents/launch.md" > "$FOUNDRY_INPUTS/foundation-launch.md"
git show "$FOUNDRY_SOURCE:.github/workflows/docs-check.yml" > "$FOUNDRY_INPUTS/foundation-workflow.yml"
```

Read those files and write `report.md` in that inputs directory. The report must
answer the Work Order; use the [research template](templates/research-report.md)
for the distinctions between observation, inference, and recommendation. The
builder's [real report](reports/workboard-ci-handoff.md) is a concrete example,
not a fixture to resubmit as someone else's independent work.

```sh
python3 tools/workboard.py --state-root "$FOUNDRY_STATE" submit \
  --assignment DOC-CHECKS-A1 --session "$FOUNDRY_SESSION" \
  --submission DOC-CHECKS-S1 --report "$FOUNDRY_INPUTS/report.md" \
  --evidence "$FOUNDRY_INPUTS/foundation-launch.md" \
  --evidence "$FOUNDRY_INPUTS/foundation-workflow.yml" \
  --source-revision "$FOUNDRY_SOURCE" --criteria-revision 1

python3 tools/workboard.py --state-root "$FOUNDRY_STATE" status \
  --trial DOC-CHECKS-T1 --include-report
```

Submission copies bytes into the evidence area before recording the manifest.
It records the Assignment, worker/session, Work Order and criteria revisions,
source revision, file names, and SHA-256 digests. The package digest covers that
manifest, including file order and names. Exact same-ID/package retries return
the existing result; changed content or provenance conflicts. Retries never
repair missing or changed sealed files. A digest checks bytes, not factual truth
or whether a declared source revision is honest.

## Record a separate Assessment

A fresh human-launched reviewer first reads the exact manifest and evidence.
Use the [Assessment JSON template](../examples/workboard/assessment.json), writing
a completed copy outside source. Set its Submission ID/digest and source/criteria
revisions from `status`. Give every original criterion a PASS, FAIL, or BLOCKED,
a concrete observation, and the sealed paths supporting it. For example,
`evidence/DOC-CHECKS-S1/1` is a path from this manifest, not an arbitrary citation.
PASS requires references and intact files. Record missing evidence as BLOCKED
without any PASS criteria.

```sh
python3 tools/workboard.py --state-root "$FOUNDRY_STATE" assess \
  --assessment "$FOUNDRY_INPUTS/assessment.json"
python3 tools/workboard.py --state-root "$FOUNDRY_STATE" status --trial DOC-CHECKS-T1
```

Assessment IDs are fixed. A corrected review uses a new ID and retains history.
Required FAIL or BLOCKED controls the outcome; optional criteria cannot outweigh
it. The latest declared real Assessment supplies the displayed review result.
Known author-session reuse is rejected, but a different string cannot establish
fresh context. The CLI always returns `independence_verified: false`; the human
launch and the reviewer's observations supply that evidence.

Fixtures use `identity_kind: simulated` and visibly simulated identity labels.
Simulated Assessments stay in history but never count as a real review. A real
review PASS displays `review-pass-awaiting-human-acceptance`; human acceptance
always remains `not-recorded` in this slice. If evidence later changes, status
becomes `evidence-invalid` even if historical Assessments said PASS.

## Optional compact status

```sh
python3 tools/workboard.py --state-root "$FOUNDRY_STATE" status --compact
```

Compact JSON omits the event history, long Work Order text, file manifest and
Assessment observations. It retains Trial state, Assignment/deadline, Submission
digest and evidence errors, source/criteria revisions, every Assessment's identity
kind and result, per-criterion results, and unrecorded human acceptance. Evidence
is checked through the same status path; historical PASS cannot hide changed
files, and simulated reviews never become real reviews. `--trial` and
`--include-report` work in both views. Default status remains the full export with
unchanged output and exit behavior. Compact status adds no tables or migrations.

## Cancel active work

```sh
python3 tools/workboard.py --state-root "$FOUNDRY_STATE" cancel \
  --assignment DOC-CHECKS-A1 --reason 'Human explicitly stopped this assignment'
```

Cancellation applies to an active Assignment. It makes the Trial terminal;
subsequent submissions are rejected and recorded in history. It does **not**
terminate a human-opened Codex session. Confirm the former writer is idle before
reusing its workspace. A later attempt is a new Trial and Assignment; use a
different workspace while the former writer may still be active.

## Verify and hand off

```sh
python3 -m unittest discover -s tests -p test_workboard.py -v
python3 tools/check_docs.py
python3 -m unittest discover -s tests -v
```

The first command groups the six [precursor checks](experiments/precursor-suite.md)
into six tests. They use tiny local storage and simulated identities. Two CPU
helper processes contend through the actual CLI; they are not model sessions.
The complete discovery command also runs the original documentation fixtures.

At the starting foundation revision, the workflow's automatic PR and push
filters name only `main`. A draft build PR targeting `docs/phase-0-foundation`
therefore has no matching automatic trigger in that workflow. Report local
results as local results; confirm a real CI run separately before claiming one.
This slice leaves workflow permissions and triggers unchanged.

Use the [fresh-review launch](workboard-review.md) after freezing the candidate.
The local [build record](workboard-build.json) records the starting revision and
sanitized result identities. Review and human acceptance are still pending.

## Limits

This is trusted, same-user coordination on one host. Direct database/filesystem
writes can bypass bookkeeping; session strings and read-only evidence files are
not adversarial security. There is no scheduler, automatic expiry/reassignment,
process recovery, role authentication, source-revision verification, human
acceptance recording, or remote synchronization. File sealing precedes database
commit; interruption may leave unreferenced files. Exact retry can reuse intact
files, but power-loss recovery and orphan cleanup are not certified. Readable
status is a JSON snapshot, not a dashboard. Protect and retain the local state
root using the host's existing mechanisms.
