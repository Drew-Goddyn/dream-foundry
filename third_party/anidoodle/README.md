# Anidoodle rule provenance

The pattern definitions and comment-removal heuristic in
[the source inspector](../../tools/source_inspector.py) are adapted from Alex
Greenshpun's anidoodle gate at revision
`03ddf534328962f8a91eb115e3ae67e03da4de5a`, path
`skills/anidoodle/engine/tools/gate.mjs`, principally lines 36–46 and 60–69.

The exact gate text SHA-256 is
`e59d5343f079d9d9423a9ccb9ca367d05e7e74338ef54517047f211555a2e0cf`.
It was inspected from W1-B's sealed export and checked against its recorded fetch
index and directory-listing blob identity. This records evidence provenance,
not independent authentication of Git history.

The original [LICENSE](LICENSE) and [NOTICE](NOTICE) are retained unchanged from
that revision. Their Git blob identities were checked against W1-B's retained
root listing: LICENSE `9fb19f714da74472d435279eebc1a8e51c45e16e` and NOTICE
`d744f1c715d5abddc08a4d10993e75a3ef002c94`.

Changes: the patterns are expressed in Python with stable rule IDs; comment
removal retains original character offsets for locations; required files and
hashes come from an explicit export manifest. Enumeration, error receipts,
coverage and CLI handling are new. The renderer, gate executable, adapter imports,
RNG-site summary, audio checks and motion checks are omitted. The adaptation does
not claim complete matching equivalence, deterministic rendering, or security.
