"""Six precursor checks through real CLI processes; all identities here are simulated."""
from __future__ import annotations

import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

CLI = Path(__file__).resolve().parents[1] / 'tools' / 'workboard.py'


class WorkboardSmoke(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix='foundry-smoke-')
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.state = self.root / 'state'
        self.order = {
            'id': 'simulated-order', 'revision': '1', 'objective': 'Tiny simulated documentation task',
            'scope': 'Local test only', 'stopping_point': 'One fixed report',
            'source_revision': 'simulated-source-1', 'criteria_revision': '1',
            'criteria': [{'id': 'finding', 'text': 'A supported finding', 'required': True},
                         {'id': 'limit', 'text': 'A stated limit', 'required': True},
                         {'id': 'optional', 'text': 'Optional suggestion', 'required': False}]}
        self.order_file = self.write_json('order.json', self.order)
        self.report = self.root / 'report.md'
        self.report.write_text('Simulated report: fixture finding. Limit: fixture only.\n')
        self.evidence = self.root / 'source.txt'
        self.evidence.write_text('Simulated supporting source.\n')

    def write_json(self, name, value):
        path = self.root / name
        path.write_text(json.dumps(value))
        return path

    def command(self, *args):
        return [sys.executable, str(CLI), '--state-root', str(self.state), *map(str, args)]

    def run_cli(self, *args, ok=True):
        completed = subprocess.run(self.command(*args), capture_output=True, text=True, timeout=15)
        self.assertEqual(0 if ok else 1, completed.returncode, completed.stdout + completed.stderr)
        result = json.loads(completed.stdout if ok else completed.stderr)
        self.assertEqual(ok, result['ok'])
        return result

    def enqueue(self, trial='trial'):
        return self.run_cli('enqueue', '--order', self.order_file, '--trial', trial, '--method', 'Simulated fixture')

    def claim_args(self, trial='trial', assignment='assignment', session='simulated-author'):
        return ['claim', '--trial', trial, '--assignment', assignment, '--worker', 'simulated-builder',
                '--session', session, '--identity-kind', 'simulated', '--workspace', 'simulated-scratch']

    def active(self):
        self.enqueue()
        self.run_cli(*self.claim_args())

    def submit_args(self, submission='submission'):
        return ['submit', '--assignment', 'assignment', '--session', 'simulated-author',
                '--submission', submission, '--report', self.report, '--evidence', self.evidence,
                '--source-revision', 'simulated-source-1', '--criteria-revision', '1']

    def submitted(self):
        self.active()
        return self.run_cli(*self.submit_args())

    def assessment(self, submission):
        return {'id': 'simulated-review', 'submission': submission['submission'],
                'submission_digest': submission['digest'], 'reviewer': 'simulated-reviewer',
                'session': 'simulated-review-context', 'identity_kind': 'simulated',
                'source_revision': 'simulated-source-1', 'criteria_revision': '1',
                'criteria': {c['id']: {'result': 'PASS', 'observation': 'Simulated fixture observation',
                                      'evidence': [submission['manifest']['files'][1]['path']]}
                             for c in self.order['criteria']}}

    def assess(self, assessment, ok=True):
        return self.run_cli('assess', '--assessment', self.write_json('assessment.json', assessment), ok=ok)

    def test_01_happy_path(self):
        submission = self.submitted()
        review = self.assess(self.assessment(submission))
        self.assertEqual('PASS', review['result'])
        self.assertEqual('simulated', review['identity_kind'])
        self.assertFalse(review['independence_verified'])
        status = self.run_cli('status', '--include-report')
        self.assertEqual('not-recorded', status['human_acceptance'])
        trial = status['trials'][0]
        self.assertEqual('submitted-awaiting-real-review', trial['state'])
        self.assertEqual(self.report.read_text(), trial['submission']['report'])
        self.assertEqual(self.order, trial['work_order'])
        self.assertEqual('simulated-author', trial['submission']['manifest']['session'])

    def test_02_claim_collision(self):
        self.enqueue()
        # Both helpers wait for release, then exec the actual CLI. No model sessions.
        helper = 'import os,sys; sys.stdin.buffer.read(1); os.execv(sys.argv[1], sys.argv[1:])'
        processes = [subprocess.Popen([sys.executable, '-c', helper, *self.command(*self.claim_args(
            assignment=f'assignment-{i}', session=f'simulated-contender-{i}'))],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True) for i in range(2)]
        try:
            for process in processes:
                process.stdin.write('x')
                process.stdin.flush()
            outputs = [p.communicate(timeout=15) for p in processes]
            self.assertEqual([0, 1], sorted(p.returncode for p in processes), outputs)
            loser = json.loads(next(out[1] for p, out in zip(processes, outputs) if p.returncode))
            self.assertIn('claim refused', loser['error'])
            status = self.run_cli('status')
            self.assertEqual(1, len(status['trials']))
            self.assertEqual('active', status['trials'][0]['assignment']['state'])
            claims = [e for e in status['events'] if e['action'] == 'claim']
            self.assertEqual(['recorded', 'rejected'], sorted(e['outcome'] for e in claims))
        finally:
            for process in processes:
                if process.poll() is None:
                    process.kill()
                process.communicate()

    def test_03_submission_integrity(self):
        self.active()
        evidence_bytes = self.evidence.read_bytes()
        self.evidence.unlink()
        self.assertIn('No such file', self.run_cli(*self.submit_args(), ok=False)['error'])
        self.assertIsNone(self.run_cli('status')['trials'][0]['submission'])
        self.evidence.write_bytes(evidence_bytes)
        submission = self.run_cli(*self.submit_args())
        self.assertTrue(self.run_cli(*self.submit_args())['duplicate'])
        self.report.write_text('Changed report\n')
        self.assertIn('conflict', self.run_cli(*self.submit_args(), ok=False)['error'])
        sealed = self.state / submission['manifest']['files'][1]['path']
        sealed.chmod(0o600)
        original = sealed.read_bytes()
        sealed.write_bytes(b'Changed evidence')
        self.assertIn('cannot support PASS', self.assess(self.assessment(submission), ok=False)['error'])
        self.assertEqual('evidence-invalid', self.run_cli('status')['trials'][0]['state'])
        sealed.unlink()
        self.assertIn('cannot support PASS', self.assess(self.assessment(submission), ok=False)['error'])
        blocked = self.assessment(submission)
        for value in blocked['criteria'].values():
            value.update(result='BLOCKED', evidence=[], observation='Sealed evidence missing')
        self.assertEqual('BLOCKED', self.assess(blocked)['result'])
        # Restore only this simulated corruption fixture, then verify historical PASS invalidation.
        sealed.write_bytes(original)
        passing = self.assessment(submission)
        passing['id'] = 'simulated-pass'
        self.assertEqual('PASS', self.assess(passing)['result'])
        sealed.unlink()
        status = self.run_cli('status')
        self.assertEqual('evidence-invalid', status['trials'][0]['state'])
        self.assertEqual('PASS', status['trials'][0]['assessments'][-1]['result'])
        self.assertTrue(status['trials'][0]['submission']['evidence_errors'])

    def test_04_review_bookkeeping(self):
        submission = self.submitted()
        assessment = self.assessment(submission)
        for key, value, expected in [('session', 'simulated-author', 'author session'),
                                     ('source_revision', 'wrong-source', 'mismatch'),
                                     ('criteria_revision', 'wrong-criteria', 'mismatch'),
                                     ('submission_digest', 'wrong-digest', 'mismatch')]:
            wrong = copy.deepcopy(assessment)
            wrong[key] = value
            self.assertIn(expected, self.assess(wrong, ok=False)['error'])
        for outcome in ('FAIL', 'BLOCKED'):
            mixed = copy.deepcopy(assessment)
            mixed['id'] += '-' + outcome
            mixed['criteria']['finding']['result'] = outcome
            self.assertEqual(outcome, self.assess(mixed)['result'])
        missing = copy.deepcopy(assessment)
        del missing['criteria']['limit']
        self.assertIn('every original criterion', self.assess(missing, ok=False)['error'])
        no_evidence = copy.deepcopy(assessment)
        no_evidence['criteria']['finding']['evidence'] = []
        self.assertIn('PASS requires evidence', self.assess(no_evidence, ok=False)['error'])
        unknown_evidence = copy.deepcopy(assessment)
        unknown_evidence['criteria']['finding']['evidence'] = ['made-up']
        self.assertIn('unknown evidence', self.assess(unknown_evidence, ok=False)['error'])
        optional = copy.deepcopy(assessment)
        optional['criteria']['optional']['result'] = 'FAIL'
        self.assertEqual('PASS', self.assess(optional)['result'])
        self.assertEqual('not-recorded', self.run_cli('status')['human_acceptance'])
        # Attempted live identity on a simulated artifact cannot launder a fixture.
        masquerade = copy.deepcopy(assessment)
        masquerade['identity_kind'] = 'real'
        self.assertIn('Simulated work', self.assess(masquerade, ok=False)['error'])

    def test_05_persistence(self):
        submission = self.submitted()
        assessment = self.assessment(submission)
        self.assess(assessment)
        before = self.run_cli('status', '--include-report')
        # Each call exits and closes its connection; next status is a new process.
        after = self.run_cli('status', '--include-report')
        self.assertEqual(before, after)
        self.assertEqual(submission['digest'], after['trials'][0]['submission']['digest'])
        self.assertEqual(assessment['id'], after['trials'][0]['assessments'][0]['id'])
        revised = copy.deepcopy(self.order)
        revised['scope'] = 'Wider scope'
        self.write_json('order.json', revised)
        self.assertIn('Work Order is fixed', self.run_cli('enqueue', '--order', self.order_file,
                      '--trial', 'new-trial', '--method', 'simulated revision', ok=False)['error'])
        self.assertEqual(self.order, self.run_cli('status')['trials'][0]['work_order'])

    def test_06_cancellation(self):
        self.active()
        cancelled = self.run_cli('cancel', '--assignment', 'assignment', '--reason', 'Simulated cancellation')
        self.assertFalse(cancelled['process_terminated'])
        self.assertIn('does not terminate', cancelled['note'])
        self.assertIn('cancelled', self.run_cli(*self.submit_args(), ok=False)['error'])
        status = self.run_cli('status')
        self.assertEqual('cancelled', status['trials'][0]['state'])
        self.assertIsNone(status['trials'][0]['submission'])
        self.assertEqual('rejected', status['events'][-1]['outcome'])
        self.assertEqual('assignment', json.loads(status['events'][-1]['detail'])['assignment'])
        self.assertIn('claim refused', self.run_cli(*self.claim_args(assignment='replacement'), ok=False)['error'])
        self.assertFalse((self.state / 'evidence').exists())
        # Deadline refusal does not reassign or terminate anything either.
        self.enqueue('short-trial')
        self.run_cli(*self.claim_args('short-trial', 'short-assignment'), '--minutes', '0.00000000001')
        late = self.submit_args('late-submission')
        late[late.index('assignment')] = 'short-assignment'
        self.assertIn('deadline passed', self.run_cli(*late, ok=False)['error'])
        short = self.run_cli('status', '--trial', 'short-trial')['trials'][0]
        self.assertEqual('active', short['state'])
        self.assertTrue(short['assignment']['deadline_passed'])


if __name__ == '__main__':
    unittest.main()
