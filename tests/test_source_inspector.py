"""Short text-inspection checks, using explicitly synthetic snapshots only."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from source_inspector import PROFILE, UPSTREAM, inspect_snapshot, scan

CLI = Path(__file__).resolve().parents[1] / 'tools/source_inspector.py'


class SourceInspectorTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory(prefix='foundry-inspector-')
        self.addCleanup(temp.cleanup)
        self.directory = Path(temp.name).resolve()
        self.root = self.directory / 'export'
        self.root.mkdir()
        self.manifest = {'schema_version': 1,
                         'source': {'kind': 'fixture', 'repository': 'synthetic',
                                    'revision': 'fixture:clean', 'provenance': 'Synthetic unit-test text, not pristine upstream source'},
                         'files': []}
        self.add('z/host.ts', b'export const frame = 1;\n')
        self.add('a/core.ts', b'export const art = 2;\n')

    def add(self, name, data):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        self.manifest['files'] = [e for e in self.manifest['files'] if e['path'] != name]
        self.manifest['files'].append({'path': name, 'sha256': hashlib.sha256(data).hexdigest()})

    def inspect(self, manifest=None, revision='fixture:clean', profile=PROFILE):
        return inspect_snapshot(self.root, self.manifest if manifest is None else manifest, revision, profile)

    def command(self, manifest=None, *extra):
        path = self.directory / 'manifest.json'
        path.write_text(json.dumps(self.manifest if manifest is None else manifest))
        return subprocess.run([sys.executable, str(CLI), '--root', str(self.root), '--manifest', str(path),
                               '--expected-revision', 'fixture:clean', '--profile', PROFILE, *extra],
                              capture_output=True, timeout=15)

    def assert_error(self, result, code):
        self.assertEqual('inspection_error', result['outcome'])
        self.assertFalse(result['coverage']['scope_complete'])
        self.assertIn(code, [e['code'] for e in result['errors']])

    def test_clean_sorted_and_repeatable_cli(self):
        first, second = self.command(), self.command()
        self.assertEqual(0, first.returncode, first.stderr)
        self.assertEqual(first.stdout, second.stdout)
        receipt = json.loads(first.stdout)
        self.assertEqual(['a/core.ts', 'z/host.ts'], [f['path'] for f in receipt['files']])
        self.assertEqual('no_findings_in_scope', receipt['outcome'])
        self.assertEqual('partial', receipt['coverage']['repository'])
        self.assertEqual('fixture', receipt['source']['kind'])
        self.assertFalse(receipt['source']['identity_verified'])
        self.assertTrue(all(f['scanned'] and f['hash_verified'] for f in receipt['files']))
        self.assertTrue(all(v == 'not_run' for v in receipt['not_checked'].values()))
        self.assertNotIn(str(self.root), first.stdout.decode())

    def test_forbidden_control_is_fixture_and_is_not_executed(self):
        self.add('a/core.ts', b'// Math.random() ignored\n/* Date.now()\n ignored */\nconst value = Math.random();\nrng(Date.now());\nthrow new Error("must never execute");\n')
        run = self.command()
        self.assertEqual(1, run.returncode)
        receipt = json.loads(run.stdout)
        self.assertEqual('fixture', receipt['source']['kind'])
        self.assertIn({'rule': 'math-random', 'path': 'a/core.ts', 'line': 4, 'column': 15}, receipt['findings'])
        self.assertEqual(['math-random', 'bad-rng-seed', 'date-now'], [f['rule'] for f in receipt['findings']])
        self.assertTrue(receipt['coverage']['scope_complete'])

    def test_comment_string_alias_and_location_limits(self):
        self.assertEqual([], scan('// Math.random()\n/* fetch(x) */\nconst r = Math["random"]();', 'x.ts'))
        self.assertEqual('math-random', scan('const text = "Math.random()";', 'x.ts')[0]['rule'])
        self.assertEqual([], scan('const text = "/*"; Math.random(); const end = "*/";', 'x.ts'))
        self.assertEqual({'rule': 'math-random', 'path': 'x.ts', 'line': 2, 'column': 3},
                         scan('// prefix\r\n  Math./* erased */random()', 'x.ts')[0])
        self.assertEqual(1, len(scan('const url="https://host"; Math.random()', 'x.ts')))

    def test_each_profile_rule_has_a_text_control(self):
        controls = {
            'math-random': 'Math.random()', 'new-date': 'new Date()',
            'date-now': 'Date.now()', 'performance-now': 'performance.now()',
            'ctx-filter': 'ctx.filter', 'filter-assignment': 'other.filter = value',
            'new-image': 'new Image()', 'new-offscreen-canvas': 'new OffscreenCanvas()',
            'fetch': 'fetch(url)', 'xml-http-request': 'XMLHttpRequest',
            'import-scripts': 'importScripts(x)', 'local-storage': 'localStorage.x',
            'crypto': 'crypto.x', 'react-import': 'import x from "react"',
            'remotion-import': 'import x from "remotion"', 'pencil-import': '"pencil.tsx"',
            'bad-rng-seed': 'rng(Math.seed)',
        }
        for rule, source in controls.items():
            with self.subTest(rule=rule):
                self.assertEqual([rule], [f['rule'] for f in scan(source, 'control.ts')])

    def test_missing_empty_and_changed_bytes(self):
        (self.root / 'a/core.ts').unlink()
        result = self.inspect()
        self.assert_error(result, 'missing_required_file')
        self.assertEqual(['a/core.ts'], result['coverage']['missing'])
        self.assertEqual(['z/host.ts'], result['coverage']['examined'])
        self.add('a/core.ts', b'')
        self.assert_error(self.inspect(), 'empty_file')
        self.add('a/core.ts', b'valid')
        (self.root / 'a/core.ts').write_bytes(b'changed')
        result = self.inspect()
        self.assert_error(result, 'hash_mismatch')
        self.assertFalse(result['files'][0]['hash_verified'])
        self.assertEqual([], result['findings'])
        self.manifest['files'] = []
        self.assert_error(self.inspect(), 'invalid_or_empty_scope')
        self.assertEqual(2, self.command().returncode)

    def test_identity_profile_and_schema_rejections(self):
        self.assert_error(self.inspect(revision=UPSTREAM), 'identity_mismatch')
        self.assert_error(self.inspect(profile='future-profile'), 'unsupported_rule_profile')
        self.manifest['source'].update(kind='export', repository='alexgreensh/anidoodle')
        self.assert_error(self.inspect(), 'unsupported_source_identity')
        self.manifest['schema_version'] = True
        self.assert_error(self.inspect(), 'unsupported_manifest_version')
        self.assert_error(self.inspect({'arbitrary': True}), 'invalid_manifest_fields')
        self.assertEqual(2, self.command(None, '--profile', 'unknown').returncode)

    def test_invalid_paths_duplicates_and_hash_declarations(self):
        for name in ('../escape.ts', '/tmp/escape.ts', 'a/../core.ts', 'a//core.ts', './a.ts', 'a\\core.ts', '.git/config', 'a/\x00.ts'):
            with self.subTest(name=name):
                manifest = copy.deepcopy(self.manifest)
                manifest['files'][0]['path'] = name
                self.assert_error(self.inspect(manifest), 'invalid_path')
        manifest = copy.deepcopy(self.manifest)
        manifest['files'].append(manifest['files'][0])
        self.assert_error(self.inspect(manifest), 'duplicate_path')
        self.manifest['files'][0]['sha256'] = 'not-a-hash'
        self.assert_error(self.inspect(), 'invalid_sha256')

    def test_links_directories_and_utf8_fail(self):
        core = self.root / 'a/core.ts'
        core.unlink()
        core.symlink_to(self.root / 'z/host.ts')
        self.assert_error(self.inspect(), 'link_not_allowed')
        core.unlink()
        core.hardlink_to(self.root / 'z/host.ts')
        self.assert_error(self.inspect(), 'not_single_regular_file')
        core.unlink()
        core.mkdir()
        self.assert_error(self.inspect(), 'not_single_regular_file')
        core.rmdir()
        (self.root / 'a').rmdir()
        (self.root / 'a').symlink_to(self.root / 'z', target_is_directory=True)
        self.assert_error(self.inspect(), 'link_not_allowed')
        (self.root / 'a').unlink()
        self.add('a/core.ts', b'\xff')
        self.assert_error(self.inspect(), 'invalid_utf8')
        linkroot = self.directory / 'linked-root'
        linkroot.symlink_to(self.root, target_is_directory=True)
        self.assert_error(inspect_snapshot(linkroot, self.manifest, 'fixture:clean'), 'invalid_snapshot_root')

    def test_unreadable_manifest_cli(self):
        run = self.command(None, '--manifest', str(self.directory / 'missing.json'))
        self.assertEqual(2, run.returncode)
        self.assert_error(json.loads(run.stdout), 'unreadable_or_invalid_manifest')


if __name__ == '__main__':
    unittest.main()
