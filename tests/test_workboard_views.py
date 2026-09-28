"""New views use disposable boards; declared-real review tests remain simulations."""
import json
from pathlib import Path
import subprocess
import sys
import unittest
import test_workboard

CLI = test_workboard.CLI


class WorkboardViews(test_workboard.WorkboardSmoke):
    # Run only new checks here; base smoke checks remain in their original suite.
    test_01_happy_path = None
    test_02_claim_collision = None
    test_03_submission_integrity = None
    test_04_review_bookkeeping = None
    test_05_persistence = None
    test_06_cancellation = None

    def agreement(self, state):
        full = self.run_cli('status', '--trial', 'trial', '--include-report')
        compact = self.run_cli('status', '--trial', 'trial', '--include-report', '--compact')
        self.assertNotIn('events', compact)
        self.assertIn('events', full)
        self.assertNotIn('view', full)
        self.assertEqual(full['human_acceptance'], compact['human_acceptance'])
        a, b = full['trials'][0], compact['trials'][0]
        self.assertEqual(state, b['state'])
        for key in ('id', 'state', 'assignment'):
            self.assertEqual(a[key], b[key])
        if a['submission']:
            for key in ('id', 'digest', 'evidence_errors'):
                self.assertEqual(a['submission'][key], b['submission'][key])
            self.assertEqual(a['submission'].get('report'), b['submission'].get('report'))
        self.assertEqual(len(a['assessments']), len(b['assessments']))
        for x, y in zip(a['assessments'], b['assessments']):
            for key in ('id', 'result', 'identity_kind', 'evidence_errors', 'independence_verified', 'human_acceptance'):
                self.assertEqual(x[key], y[key])
        return compact

    def test_example_is_discoverable_side_effect_free_and_enqueues(self):
        result = subprocess.run([sys.executable, str(CLI), '--state-root', str(self.state), '--example-order'],
                                capture_output=True, text=True, timeout=15)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertFalse(self.state.exists())
        printed = json.loads(result.stdout)
        order = self.write_json('printed-example.json', printed)
        self.run_cli('enqueue', '--order', order, '--trial', 'example-trial', '--method', 'Simulated printed example')
        self.assertEqual(printed, self.run_cli('status')['trials'][0]['work_order'])
        help_result = subprocess.run(self.command('enqueue', '--help'), capture_output=True, text=True)
        self.assertIn('--example-order', help_result.stdout)
        self.assertEqual(0, subprocess.run([sys.executable, str(CLI), '--example-order'], capture_output=True).returncode)
        self.assertEqual(2, subprocess.run([sys.executable, str(CLI), 'status'], capture_output=True).returncode)

    def test_ready_active_simulated_review_and_invalid_evidence(self):
        self.enqueue()
        self.agreement('ready')
        self.run_cli(*self.claim_args())
        self.agreement('active')
        submission = self.run_cli(*self.submit_args())
        self.agreement('submitted-awaiting-real-review')
        self.assess(self.assessment(submission))
        compact = self.agreement('submitted-awaiting-real-review')
        self.assertEqual('simulated', compact['trials'][0]['assessments'][0]['identity_kind'])
        sealed = self.state / submission['manifest']['files'][1]['path']
        sealed.chmod(0o600)
        sealed.write_text('Corrupted simulated evidence')
        self.agreement('evidence-invalid')
        sealed.unlink()
        self.agreement('evidence-invalid')
        for args in (('status', '--trial', 'missing'), ('status', '--trial', 'missing', '--compact')):
            self.assertFalse(self.run_cli(*args, ok=False)['ok'])

    def test_declared_real_review_states_on_simulated_scratch_board(self):
        self.enqueue()
        args = self.claim_args()
        args[args.index('simulated')] = 'real'
        self.run_cli(*args)
        submission = self.run_cli(*self.submit_args())
        for outcome, state in (('PASS', 'review-pass-awaiting-human-acceptance'),
                               ('FAIL', 'review-fail'), ('BLOCKED', 'review-blocked')):
            assessment = self.assessment(submission)
            assessment.update(id='simulated-declared-real-' + outcome, identity_kind='real')
            assessment['criteria']['finding']['result'] = outcome
            self.assess(assessment)
            self.agreement(state)
        (self.state / submission['manifest']['files'][1]['path']).unlink()
        self.agreement('evidence-invalid')

    def test_cancelled_and_expired_agreement(self):
        self.enqueue()
        self.run_cli(*self.claim_args(), '--minutes', '0.00000000001')
        compact = self.agreement('active')
        self.assertTrue(compact['trials'][0]['assignment']['deadline_passed'])
        self.run_cli('cancel', '--assignment', 'assignment', '--reason', 'Simulated cancellation')
        self.agreement('cancelled')


if __name__ == '__main__':
    unittest.main()
