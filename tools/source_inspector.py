#!/usr/bin/env python3
"""Inspect a hash-pinned local text export. Evidence only; never executes source."""
from __future__ import annotations

import argparse
import bisect
import hashlib
import json
from pathlib import Path
import re
import stat
import sys

PROFILE = 'anidoodle-contract-text-v1'
UPSTREAM = '03ddf534328962f8a91eb115e3ae67e03da4de5a'
GATE_PATH = 'skills/anidoodle/engine/tools/gate.mjs'
# Pattern definitions and comment heuristic adapted from the pinned gate.
# See third_party/anidoodle for the original Apache-2.0 license and NOTICE.
RULES = (
    ('math-random', r'Math\.random'), ('new-date', r'\bnew Date\b'),
    ('date-now', r'\bDate\.now\b'), ('performance-now', r'performance\.now'),
    ('ctx-filter', r'\bctx\.filter\b'), ('filter-assignment', r'\.filter\s*=[^=]'),
    ('new-image', r'\bnew Image\b'), ('new-offscreen-canvas', r'\bnew OffscreenCanvas\b'),
    ('fetch', r'\bfetch\s*\('), ('xml-http-request', r'XMLHttpRequest'),
    ('import-scripts', r'\bimportScripts\b'), ('local-storage', r'\blocalStorage\b'),
    ('crypto', r'\bcrypto\.'), ('react-import', r'from\s+["\']react["\']'),
    ('remotion-import', r'from\s+["\']remotion["\']'), ('pencil-import', r'pencil\.tsx'),
    ('bad-rng-seed', r'rng\s*\(\s*(Date|Math|performance)'),
)
MAX_FILES = 256
MAX_BYTES = 2 * 1024 * 1024
LIMITATIONS = [
    'Evidence only: not an Assessment, Acceptance, or whole-repository PASS.',
    'Export hashes bind local bytes to a declaration, not authenticated Git history. Revision and origin are claims.',
    'Only explicit required files are scanned; imports and dependencies are not followed. Repository coverage is partial.',
    'Heuristic comment deletion can misread strings, URLs, templates, and regex literals. Strings may produce findings; aliases and computed properties may evade them.',
    'Python ASCII regex matching approximates the pinned patterns; Unicode whitespace and JavaScript parsing semantics are not equivalent. No complete upstream gate equivalence is claimed.',
    'Locations are one-based original-text lines and Unicode code-point columns; CRLF counts as one line break.',
    'Trusted local snapshot only: files must remain quiescent during reading. No adversarial filesystem race protection.',
    'At most 256 files, 2 MiB per file; regular UTF-8 nonempty files only. Symlinks and hardlinks are rejected.',
]
NOT_CHECKED = ['compilation', 'rendering', 'frame_determinism', 'cache_correctness',
               'audio', 'motion', 'visual_quality', 'security', 'transitive_compliance',
               'git_history_authentication']


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False) + '\n'


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def valid_path(value):
    return (isinstance(value, str) and bool(value) and len(value) <= 1024
            and not value.startswith('/') and '\\' not in value
            and all(part not in ('', '.', '..', '.git') for part in value.split('/'))
            and not any(ord(c) < 32 or ord(c) == 127 for c in value))


def strip_comments(source):
    """Delete comments as the upstream heuristic does; retain original offsets."""
    offsets = list(range(len(source)))
    for pattern, keep_prefix in ((r'/\*[\s\S]*?\*/', False), (r'(^|[^:])//.*$', True)):
        chunks, positions, start = [], [], 0
        for match in re.finditer(pattern, source, re.MULTILINE | re.ASCII):
            end = match.start() + (len(match.group(1)) if keep_prefix else 0)
            chunks.append(source[start:end])
            positions.extend(offsets[start:end])
            start = match.end()
        chunks.append(source[start:])
        positions.extend(offsets[start:])
        source, offsets = ''.join(chunks), positions
    return source, offsets


def scan(source, path):
    stripped, offsets = strip_comments(source)
    starts = [0] + [m.end() for m in re.finditer('\n', source)]
    findings = []
    for rule, pattern in RULES:
        for match in re.finditer(pattern, stripped, re.ASCII):
            offset = offsets[match.start()]
            line = bisect.bisect_right(starts, offset)
            findings.append({'rule': rule, 'path': path, 'line': line,
                             'column': offset - starts[line - 1] + 1})
    return findings


def read_regular(root, relative):
    """Reject link components before reading; do not resolve them into the scope."""
    current = root
    for part in relative.split('/'):
        current = current / part
        info = current.lstat()
        if stat.S_ISLNK(info.st_mode):
            raise ValueError('link_not_allowed')
        if current != root / relative and not stat.S_ISDIR(info.st_mode):
            raise ValueError('non_directory_component')
    if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
        raise ValueError('not_single_regular_file')
    with current.open('rb') as stream:
        data = stream.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError('file_too_large')
    return data


def inspect_snapshot(root, manifest, expected_revision, profile=PROFILE):
    """Return one deterministic receipt for an explicit, all-required export scope.

    The caller supplies the local root, parsed manifest, independently expected
    revision and fixed rule-profile ID. No source import, Git, network or writes.
    """
    receipt = {
        'schema_version': 1, 'inspector_version': '1', 'artifact_kind': 'Evidence',
        'outcome': 'inspection_error', 'source': None, 'manifest_sha256': None,
        'rule_profile': {'id': profile, 'basis_repository': 'alexgreensh/anidoodle',
                         'basis_revision': UPSTREAM, 'basis_path': GATE_PATH,
                         'basis_sha256': 'e59d5343f079d9d9423a9ccb9ca367d05e7e74338ef54517047f211555a2e0cf',
                         'rules': [rule for rule, _ in RULES] if profile == PROFILE else []},
        'files': [], 'findings': [], 'errors': [],
        'coverage': {'repository': 'partial', 'required': [], 'examined': [],
                     'missing': [], 'rejected': [], 'scope_complete': False},
        'limitations': LIMITATIONS, 'not_checked': {key: 'not_run' for key in NOT_CHECKED},
    }

    def error(code, path=None):
        receipt['errors'].append({'code': code, 'path': path})

    if profile != PROFILE:
        error('unsupported_rule_profile')
        return receipt
    if not isinstance(manifest, dict) or set(manifest) != {'schema_version', 'source', 'files'}:
        error('invalid_manifest_fields')
        return receipt
    receipt['manifest_sha256'] = sha256(canonical(manifest).encode('utf-8'))
    if type(manifest['schema_version']) is not int or manifest['schema_version'] != 1:
        error('unsupported_manifest_version')
        return receipt
    source = manifest['source']
    if (not isinstance(source, dict) or set(source) != {'kind', 'repository', 'revision', 'provenance'}
            or not all(isinstance(v, str) and v.strip() for v in source.values())):
        error('invalid_source_identity')
        return receipt
    receipt['source'] = {**source, 'identity_verified': False, 'expected_revision': expected_revision}
    if source['revision'] != expected_revision:
        error('identity_mismatch')
    if source['kind'] == 'export':
        if source['repository'] != 'alexgreensh/anidoodle' or source['revision'] != UPSTREAM:
            error('unsupported_source_identity')
    elif source['kind'] == 'fixture':
        if source['repository'] != 'synthetic' or not re.fullmatch(r'fixture:[A-Za-z0-9_.-]+', source['revision']):
            error('invalid_fixture_identity')
    else:
        error('unsupported_snapshot_kind')
    entries = manifest['files']
    if not isinstance(entries, list) or not 1 <= len(entries) <= MAX_FILES:
        error('invalid_or_empty_scope')
        return receipt
    paths = []
    for entry in entries:
        if not isinstance(entry, dict) or set(entry) != {'path', 'sha256'}:
            error('invalid_file_entry')
            continue
        if not valid_path(entry['path']):
            error('invalid_path')
            continue
        path = entry['path']
        paths.append(path)
        if not isinstance(entry['sha256'], str) or not re.fullmatch('[0-9a-f]{64}', entry['sha256']):
            error('invalid_sha256', path)
    if len(paths) != len(set(paths)):
        error('duplicate_path')
    receipt['coverage']['required'] = sorted(set(paths))
    if receipt['errors']:
        receipt['coverage']['rejected'] = sorted(set(paths))
        return receipt
    root = Path(root).absolute()
    # The root itself and any ancestor must not redirect the declared snapshot.
    try:
        if any(p.is_symlink() for p in (root, *root.parents)) or not root.is_dir():
            error('invalid_snapshot_root')
            return receipt
    except OSError:
        error('inaccessible_snapshot_root')
        return receipt
    for entry in sorted(entries, key=lambda e: e['path']):
        path = entry['path']
        try:
            data = read_regular(root, path)
        except FileNotFoundError:
            error('missing_required_file', path)
            receipt['coverage']['missing'].append(path)
            continue
        except ValueError as exc:
            error(str(exc), path)
            receipt['coverage']['rejected'].append(path)
            continue
        except OSError:
            error('unreadable_file', path)
            receipt['coverage']['rejected'].append(path)
            continue
        actual = sha256(data)
        item = {'path': path, 'sha256': actual, 'expected_sha256': entry['sha256'],
                'bytes': len(data), 'hash_verified': actual == entry['sha256'], 'scanned': False}
        receipt['files'].append(item)
        if not item['hash_verified']:
            error('hash_mismatch', path)
        elif not data.strip():
            error('empty_file', path)
        else:
            try:
                source_text = data.decode('utf-8')
            except UnicodeDecodeError:
                error('invalid_utf8', path)
            else:
                receipt['findings'].extend(scan(source_text, path))
                item['scanned'] = True
                receipt['coverage']['examined'].append(path)
        if not item['scanned']:
            receipt['coverage']['rejected'].append(path)
    receipt['findings'].sort(key=lambda f: (f['path'], f['line'], f['column'], f['rule']))
    receipt['coverage']['scope_complete'] = not receipt['errors']
    if not receipt['errors']:
        receipt['outcome'] = 'findings' if receipt['findings'] else 'no_findings_in_scope'
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__, epilog='Exit 0: no findings in explicit scope; 1: findings; 2: inspection/input error. See docs/source-inspector.md.')
    parser.add_argument('--root', required=True, help='Quiescent local export directory (no links)')
    parser.add_argument('--manifest', required=True, help='Version 1 JSON: source provenance plus explicit paths and SHA-256 hashes')
    parser.add_argument('--expected-revision', required=True, help='Pinned upstream commit or fixture:name; must match manifest')
    parser.add_argument('--profile', required=True, help=PROFILE)
    args = parser.parse_args()
    try:
        manifest = json.loads(Path(args.manifest).read_text(encoding='utf-8'))
    except (OSError, UnicodeError, ValueError):
        receipt = inspect_snapshot(args.root, None, args.expected_revision, args.profile)
        receipt['errors'] = [{'code': 'unreadable_or_invalid_manifest', 'path': None}]
    else:
        receipt = inspect_snapshot(args.root, manifest, args.expected_revision, args.profile)
    try:
        sys.stdout.write(canonical(receipt))
    except OSError:
        print('Cannot write Inspection Receipt', file=sys.stderr)
        return 2
    return {'no_findings_in_scope': 0, 'findings': 1, 'inspection_error': 2}[receipt['outcome']]


if __name__ == '__main__':
    raise SystemExit(main())
