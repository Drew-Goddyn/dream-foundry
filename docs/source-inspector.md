# Inspect a local source export without rendering

The inspector reads a fixed local text export and emits a deterministic JSON
Inspection Receipt. It uses Python 3.10+ and the standard library. It never
imports inspected modules, invokes Git, accesses the network, or writes source.
The receipt is Evidence. A later Assessment must judge that Evidence against a
Work Order; neither a receipt nor a no-finding result records Acceptance.

This first slice supports **explicit export scopes only**. The available W1
source evidence is a partial text export, not a local upstream Git object
snapshot. No Git repository reader or film/dependency enumeration is provided.
Do not label working-tree bytes as a verified commit. Even a full-looking export
has partial repository coverage here; the inspector cannot establish its origin
from a manifest declaration.

## One interface

The Python entry point is
`inspect_snapshot(root, manifest, expected_revision, profile)` in
[the inspection module](../tools/source_inspector.py). It returns a receipt;
the CLI handles JSON input and stdout. All manifest files are required and are
scanned as text, regardless of extension. Files outside the list are ignored.

The manifest has exactly these fields (the hash below illustrates the shape):

```json
{
  "schema_version": 1,
  "source": {
    "kind": "export",
    "repository": "alexgreensh/anidoodle",
    "revision": "03ddf534328962f8a91eb115e3ae67e03da4de5a",
    "provenance": "W1-B-S1 sealed text export; fetch-index hashes, not authenticated Git history"
  },
  "files": [
    {
      "path": "skills/anidoodle/engine/tools/gate.mjs",
      "sha256": "e59d5343f079d9d9423a9ccb9ca367d05e7e74338ef54517047f211555a2e0cf"
    }
  ]
}
```

Use digests from the fixed source evidence you mean to inspect. Recalculating a
manifest after changing a file declares a different snapshot; it does not verify
the original source. Record any modified test data as `kind: fixture`,
`repository: synthetic`, and a revision such as `fixture:negative-control`.
The expected revision must be supplied separately and match that declaration.
Export identity supports only the pinned anidoodle repository/revision above.
Keep timestamps and machine paths in the surrounding report, not provenance text.
The receipt includes the canonical manifest's SHA-256 to bind that declaration.

From the implementation checkout, after setting `INSPECT_ROOT` to the export
folder and `INSPECT_MANIFEST` to its fixed manifest:

```sh
python3 tools/source_inspector.py \
  --root "$INSPECT_ROOT" --manifest "$INSPECT_MANIFEST" \
  --expected-revision 03ddf534328962f8a91eb115e3ae67e03da4de5a \
  --profile anidoodle-contract-text-v1 > receipt.json
```

Exit 0 means `no_findings_in_scope`; exit 1 means `findings`; exit 2 means
`inspection_error`. These outcomes never say repository PASS. Input errors
produce a receipt on stdout; argument syntax errors and inability to write stdout
use stderr. Keep the process exit code with the receipt when recording Evidence.
A findings receipt can still have complete coverage of its declared scope.
An error receipt can retain findings from other successfully examined files.

Each file record contains its path, actual SHA-256, declared SHA-256, byte count,
hash verification and scan flags. Sorted findings identify rule, path, and the
one-based original line/Unicode character column. Coverage separates required,
examined, missing and rejected paths. Findings and files are sorted; canonical
JSON has a final newline and no generated timestamp or machine path.

Paths must be relative and normalized, with no parent segments, empty segments,
backslashes, control characters or `.git` component. Symlinks in the root's
ancestors or file paths, hardlinks, special files and directory inputs fail.
An empty scope or empty file fails. Limits are 256 files and 2 MiB per file;
files must be UTF-8. The root must remain quiescent while reading. This is a
trusted local inspection tool, not protection against adversarial filesystem
races. On macOS, use physical paths such as `/private/tmp` for scratch exports.

## Rules and limits

The `anidoodle-contract-text-v1` profile adapts the sixteen forbidden patterns
and bad-RNG-seed pattern from anidoodle's pinned `gate.mjs`, plus its heuristic
comment removal. [Provenance and license](../third_party/anidoodle/README.md)
record the exact source and the adaptation. The executable gate was read as text;
it is neither imported nor run.

Patterns cover obvious randomness/clock access, filters, image/canvas creation,
network/storage/crypto references and selected imports. Matches are textual,
not a TypeScript semantic analysis. Strings can produce false positives; aliases,
computed properties and dependencies can evade checks. The comment heuristic
can remove code-looking text inside strings and regex literals. Python ASCII
regex matching differs from JavaScript on some Unicode inputs. We preserve
original offsets after deletion, but do not claim complete upstream equivalence.
The profile omits the upstream RNG-site count and all renderer, audio and motion
checks. Scanning gate/tooling text is useful byte-level Evidence; it does not
establish compliance of the absent art core or any film.

Receipts explicitly mark compilation, rendering/frame determinism, cache
correctness, audio, motion, visual quality, security, transitive compliance and
Git history authentication as not run. Hash integrity checks a declared snapshot,
not the truth of its provenance. Repository coverage stays partial even when all
declared files are examined.

## Exercise and seal

```sh
python3 -m unittest discover -s tests -p test_source_inspector.py -v
python3 -m unittest discover -s tests -p test_workboard_views.py -v
python3 tools/check_docs.py
python3 -m unittest discover -s tests -v
```

Tests create disposable synthetic exports/boards. They do not change W1 evidence
or the shared board. The builder's local package contains a separate real text
receipt and the exact exported bytes needed to reproduce it.

Attach the receipt, process result, fixed manifest, source export and test results
as Evidence with the [workboard submission command](workboard.md). The Work
Order's baseline source binding remains its input context. Record the resulting
implementation commit/tree as separate output Evidence. Use the unchanged
reviewed CLI for a live board until a separately authorized upgrade.
