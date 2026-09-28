#!/usr/bin/env python3
"""Supervised, same-user local workboard. No worker launch or acceptance authority."""
from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import sqlite3
import sys
import tempfile

SOURCE_ROOT = Path(__file__).resolve().parents[1]
SCHEMA = """
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, snapshot TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS trials (
    id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
    method TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('ready','active','submitted','cancelled')));
CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY, trial_id TEXT NOT NULL UNIQUE REFERENCES trials(id),
    worker TEXT NOT NULL, session TEXT NOT NULL, identity_kind TEXT NOT NULL,
    workspace TEXT NOT NULL, expires_at TEXT NOT NULL, state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL UNIQUE REFERENCES assignments(id),
    digest TEXT NOT NULL, manifest TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY, submission_id TEXT NOT NULL REFERENCES submissions(id),
    snapshot TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events (
    sequence INTEGER PRIMARY KEY, at TEXT NOT NULL, action TEXT NOT NULL,
    outcome TEXT NOT NULL, detail TEXT NOT NULL);
"""


class Invalid(ValueError):
    pass


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def now():
    return datetime.now(timezone.utc)


def require(condition, message):
    if not condition:
        raise Invalid(message)


def text(value, name):
    require(isinstance(value, str) and bool(value.strip()), f'{name} must be nonempty text')
    return value


def identifier(value):
    require(isinstance(value, str) and re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,79}', value),
            'IDs must be 1-80 letters, digits, dots, underscores or hyphens, starting with a letter/digit')
    return value


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def fields(value, names):
    require(isinstance(value, dict) and set(value) == set(names.split()),
            f'Expected exactly these fields: {names}')


def order_snapshot(value):
    fields(value, 'id revision objective scope stopping_point source_revision criteria_revision criteria')
    identifier(value['id'])
    for name in ('revision', 'objective', 'scope', 'stopping_point', 'source_revision', 'criteria_revision'):
        text(value[name], name)
    require(isinstance(value['criteria'], list) and value['criteria'], 'criteria must be a nonempty list')
    seen = set()
    for criterion in value['criteria']:
        fields(criterion, 'id text required')
        identifier(criterion['id'])
        text(criterion['text'], 'criterion text')
        require(type(criterion['required']) is bool, 'required must be boolean')
        require(criterion['id'] not in seen, 'duplicate criterion ID')
        seen.add(criterion['id'])
    require(any(c['required'] for c in value['criteria']), 'at least one required criterion is needed')
    return value


def row(db, table, identity):
    # Table names are constants at call sites, never client input.
    result = db.execute(f'SELECT * FROM {table} WHERE id=?', (identity,)).fetchone()
    require(result is not None, f'Unknown {table} ID: {identity}')
    return dict(result)


def context(db, assignment_id):
    assignment = row(db, 'assignments', assignment_id)
    trial = row(db, 'trials', assignment['trial_id'])
    order = json.loads(row(db, 'orders', trial['order_id'])['snapshot'])
    return assignment, trial, order


def state_root(raw):
    path = Path(raw).expanduser()
    require(path.is_absolute(), '--state-root must be an explicit absolute path')
    path = path.resolve()
    require(not path.is_relative_to(SOURCE_ROOT), 'state must be outside source')
    require(not any((parent / '.git').exists() for parent in (path, *path.parents)),
            'state must be outside Git working trees')
    path.mkdir(parents=True, exist_ok=True, mode=0o700)
    return path


def evidence_path(root, relative):
    path = root / relative
    require(path.resolve().is_relative_to((root / 'evidence').resolve()), 'evidence path escapes evidence area')
    return path


def verify(root, manifest):
    errors = []
    for item in manifest['files']:
        try:
            data = evidence_path(root, item['path']).read_bytes()
            if digest(data) != item['sha256']:
                errors.append(f"changed evidence: {item['path']}")
        except (OSError, Invalid):
            errors.append(f"missing or inaccessible evidence: {item['path']}")
    return errors


def seal(root, relative, data):
    path = evidence_path(root, relative)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if path.exists():
        require(path.read_bytes() == data, f'Conflicting sealed file: {relative}')
        return
    # Atomic file replacement happens before the database records the Submission.
    # An interrupted attempt may leave unreferenced files; identical retry is safe.
    fd, temporary = tempfile.mkstemp(prefix='.sealing-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
        path.chmod(0o400)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def enqueue(db, root, args):
    order = order_snapshot(read_json(args.order))
    identifier(args.trial)
    text(args.method, 'method')
    previous = db.execute('SELECT snapshot FROM orders WHERE id=?', (order['id'],)).fetchone()
    if previous:
        require(previous['snapshot'] == canonical(order), 'Work Order is fixed; use a new ID for revised intent/criteria')
    else:
        db.execute('INSERT INTO orders VALUES (?,?)', (order['id'], canonical(order)))
    db.execute('INSERT INTO trials VALUES (?,?,?,?)', (args.trial, order['id'], args.method, 'ready'))
    return {'trial': args.trial, 'work_order': order, 'state': 'ready'}


def claim(db, root, args):
    for identity in (args.assignment, args.worker, args.session):
        identifier(identity)
    text(args.workspace, 'workspace')
    require(math.isfinite(args.minutes) and args.minutes > 0, 'minutes must be positive and finite')
    deadline = (now() + timedelta(minutes=args.minutes)).isoformat()
    trial = row(db, 'trials', args.trial)
    require(trial['state'] == 'ready', f"Trial is {trial['state']}; claim refused")
    db.execute('INSERT INTO assignments VALUES (?,?,?,?,?,?,?,?)',
               (args.assignment, args.trial, args.worker, args.session, args.identity_kind,
                args.workspace, deadline, 'active'))
    db.execute("UPDATE trials SET state='active' WHERE id=?", (args.trial,))
    return {'assignment': row(db, 'assignments', args.assignment),
            'note': 'Deadline blocks new submissions; no automatic reassignment or process control.'}


def submit(db, root, args):
    identifier(args.submission)
    assignment, trial, order = context(db, args.assignment)
    require(args.session == assignment['session'], 'Assignment session mismatch')
    require(assignment['state'] != 'cancelled', 'Assignment cancelled; late submission rejected')
    require(args.source_revision == order['source_revision'], 'source revision mismatch')
    require(args.criteria_revision == order['criteria_revision'], 'criteria revision mismatch')
    paths = [Path(args.report), *(Path(p) for p in args.evidence)]
    require(len({p.name for p in paths[1:]}) == len(paths[1:]), 'Evidence filenames must be distinct')
    contents = [p.read_bytes() for p in paths]
    require(all(data.strip() for data in contents), 'report and evidence must be nonempty')
    contents[0].decode('utf-8')
    files = [{'role': 'report' if i == 0 else 'evidence', 'name': p.name,
              'path': f'evidence/{args.submission}/{i}', 'sha256': digest(data)}
             for i, (p, data) in enumerate(zip(paths, contents))]
    manifest = {'submission': args.submission, 'assignment': args.assignment,
                'trial': trial['id'], 'worker': assignment['worker'], 'session': assignment['session'],
                'identity_kind': assignment['identity_kind'], 'work_order_id': order['id'],
                'work_order_revision': order['revision'], 'criteria_revision': args.criteria_revision,
                'source_revision': args.source_revision, 'files': files}
    package_digest = digest(canonical(manifest).encode('utf-8'))
    previous = db.execute('SELECT * FROM submissions WHERE id=?', (args.submission,)).fetchone()
    if previous:
        require(previous['digest'] == package_digest, 'Submission ID/content conflict')
        require(not verify(root, manifest), 'Sealed evidence missing or changed; retry cannot repair it')
        return {'submission': args.submission, 'digest': package_digest, 'duplicate': True}
    require(assignment['state'] == 'active', 'Assignment is not active')
    require(now() < datetime.fromisoformat(assignment['expires_at']), 'Assignment deadline passed; cancel explicitly')
    for item, data in zip(files, contents):
        seal(root, item['path'], data)
    require(not verify(root, manifest), 'Sealed evidence verification failed')
    db.execute('INSERT INTO submissions VALUES (?,?,?,?)',
               (args.submission, args.assignment, package_digest, canonical(manifest)))
    db.execute("UPDATE assignments SET state='submitted' WHERE id=?", (args.assignment,))
    db.execute("UPDATE trials SET state='submitted' WHERE id=?", (trial['id'],))
    return {'submission': args.submission, 'digest': package_digest, 'manifest': manifest, 'duplicate': False}


def assess(db, root, args):
    assessment = read_json(args.assessment)
    fields(assessment, 'id submission submission_digest reviewer session identity_kind source_revision criteria_revision criteria')
    for name in ('id', 'reviewer', 'session'):
        identifier(assessment[name])
    require(assessment['identity_kind'] in ('real', 'simulated'), 'identity_kind must be real or simulated')
    submission = row(db, 'submissions', assessment['submission'])
    manifest = json.loads(submission['manifest'])
    assignment, trial, order = context(db, submission['assignment_id'])
    require(assessment['session'] != assignment['session'], 'Known author session cannot review its own Submission')
    require(assessment['submission_digest'] == submission['digest'], 'submission digest mismatch')
    for name in ('source_revision', 'criteria_revision'):
        require(assessment[name] == manifest[name], f'{name} mismatch')
    require(not (assignment['identity_kind'] == 'simulated' and assessment['identity_kind'] == 'real'),
            'Simulated work requires a simulated Assessment')
    criteria = assessment['criteria']
    require(isinstance(criteria, dict) and set(criteria) == {c['id'] for c in order['criteria']},
            'Assessment must cover every original criterion exactly once')
    paths = {item['path'] for item in manifest['files']}
    for value in criteria.values():
        fields(value, 'result observation evidence')
        require(value['result'] in ('PASS', 'FAIL', 'BLOCKED'), 'Unknown criterion result')
        text(value['observation'], 'observation')
        require(isinstance(value['evidence'], list) and all(isinstance(p, str) for p in value['evidence']),
                'criterion evidence must be a list of sealed paths')
        require(set(value['evidence']).issubset(paths), 'criterion cites unknown evidence')
        require(value['result'] != 'PASS' or value['evidence'], 'PASS requires evidence references')
    required = [criteria[c['id']]['result'] for c in order['criteria'] if c['required']]
    result = 'FAIL' if 'FAIL' in required else 'BLOCKED' if 'BLOCKED' in required else 'PASS'
    errors = verify(root, manifest)
    require(not errors or all(c['result'] != 'PASS' for c in criteria.values()),
            'Missing or changed sealed evidence cannot support PASS')
    assessment.update(result=result, evidence_errors=errors, independence_verified=False,
                      human_acceptance='not-recorded')
    previous = db.execute('SELECT snapshot FROM assessments WHERE id=?', (assessment['id'],)).fetchone()
    if previous:
        require(previous['snapshot'] == canonical(assessment), 'Assessment is fixed; use a new ID')
    else:
        db.execute('INSERT INTO assessments VALUES (?,?,?)',
                   (assessment['id'], assessment['submission'], canonical(assessment)))
    return assessment


def cancel(db, root, args):
    assignment = row(db, 'assignments', args.assignment)
    text(args.reason, 'reason')
    require(assignment['state'] in ('active', 'cancelled'), 'Only an active Assignment can be cancelled')
    db.execute("UPDATE assignments SET state='cancelled' WHERE id=?", (args.assignment,))
    db.execute("UPDATE trials SET state='cancelled' WHERE id=?", (assignment['trial_id'],))
    return {'assignment': args.assignment, 'state': 'cancelled', 'reason': args.reason,
            'process_terminated': False,
            'note': 'Ledger cancellation does not terminate a human-opened Codex session. Confirm the writer is idle before reusing its workspace.'}


def status(db, root, args):
    result = {'schema_version': 1, 'human_acceptance': 'not-recorded', 'trials': [], 'events': []}
    if args.trial:
        row(db, 'trials', args.trial)
    for raw in db.execute('SELECT * FROM trials ORDER BY rowid'):
        trial = dict(raw)
        if args.trial and trial['id'] != args.trial:
            continue
        trial['work_order'] = json.loads(row(db, 'orders', trial['order_id'])['snapshot'])
        assignment = db.execute('SELECT * FROM assignments WHERE trial_id=?', (trial['id'],)).fetchone()
        trial.update(assignment=dict(assignment) if assignment else None, submission=None, assessments=[])
        if assignment:
            trial['assignment']['deadline_passed'] = now() >= datetime.fromisoformat(assignment['expires_at'])
            submission = db.execute('SELECT * FROM submissions WHERE assignment_id=?', (assignment['id'],)).fetchone()
            if submission:
                manifest = json.loads(submission['manifest'])
                errors = verify(root, manifest)
                trial['submission'] = {'id': submission['id'], 'digest': submission['digest'],
                                       'manifest': manifest, 'evidence_errors': errors}
                if args.include_report and not errors:
                    trial['submission']['report'] = evidence_path(root, manifest['files'][0]['path']).read_text(encoding='utf-8')
                trial['assessments'] = [json.loads(a['snapshot']) for a in db.execute(
                    'SELECT snapshot FROM assessments WHERE submission_id=? ORDER BY rowid', (submission['id'],))]
                real_reviews = [a for a in trial['assessments'] if a['identity_kind'] == 'real']
                trial['state'] = 'submitted-awaiting-real-review'
                if real_reviews:
                    trial['state'] = {'PASS': 'review-pass-awaiting-human-acceptance',
                                      'FAIL': 'review-fail', 'BLOCKED': 'review-blocked'}[real_reviews[-1]['result']]
                if errors:
                    trial['state'] = 'evidence-invalid'
        result['trials'].append(trial)
    # Full chronological mutation/rejection log, even when trials are filtered.
    result['events'] = [dict(e) for e in db.execute('SELECT * FROM events ORDER BY sequence')]
    return compact_status(result) if args.compact else result


def compact_status(full):
    """Project the verified status; never derive a second review/evidence state."""
    result = {'schema_version': full['schema_version'], 'view': 'compact',
              'human_acceptance': full['human_acceptance'], 'trials': []}
    for trial in full['trials']:
        order = trial['work_order']
        item = {'id': trial['id'], 'state': trial['state'],
                'work_order': {key: order[key] for key in
                               ('id', 'revision', 'source_revision', 'criteria_revision')},
                'assignment': trial['assignment'], 'submission': None, 'assessments': []}
        if trial['submission']:
            submission = trial['submission']
            item['submission'] = {key: submission[key] for key in ('id', 'digest', 'evidence_errors')}
            item['submission'].update({key: submission['manifest'][key] for key in
                                       ('identity_kind', 'source_revision', 'criteria_revision')})
            if 'report' in submission:
                item['submission']['report'] = submission['report']
        for assessment in trial['assessments']:
            review = {key: assessment[key] for key in
                      ('id', 'reviewer', 'session', 'identity_kind', 'result', 'evidence_errors',
                       'independence_verified', 'human_acceptance')}
            review['criteria'] = {key: value['result'] for key, value in assessment['criteria'].items()}
            item['assessments'].append(review)
        result['trials'].append(item)
    return result


class PrintOrderExample(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        example = order_snapshot({
            'id': 'example-order', 'revision': '1',
            'objective': 'Record one supported local source observation',
            'scope': 'Disposable example only; no external actions',
            'stopping_point': 'One report and supporting source excerpt',
            'source_revision': 'example-source-replace-with-your-fixed-revision',
            'criteria_revision': '1',
            'criteria': [{'id': 'observation', 'text': 'Support the observation with source evidence',
                          'required': True}]})
        print(canonical(example))
        parser.exit()


def parser():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--example-order', action=PrintOrderExample, nargs=0,
                     help='Print a valid minimal Work Order JSON and exit without opening a board')
    cli.add_argument('--state-root', required=True, help='Absolute shared directory outside all Git working trees')
    commands = cli.add_subparsers(dest='command', required=True)
    enqueue_cli = commands.add_parser('enqueue', help='Snapshot intent and create one ready Trial')
    enqueue_cli.add_argument('--order', required=True, help='Work Order JSON; print a minimal input with workboard.py --example-order')
    enqueue_cli.add_argument('--trial', required=True)
    enqueue_cli.add_argument('--method', required=True)
    claim_cli = commands.add_parser('claim', help='Atomically claim a ready Trial')
    for name in ('trial', 'assignment', 'worker', 'session', 'workspace'):
        claim_cli.add_argument('--' + name, required=True)
    claim_cli.add_argument('--identity-kind', choices=('real', 'simulated'), required=True)
    claim_cli.add_argument('--minutes', type=float, default=60, help='Permitted lifetime, default 60 minutes; never auto-reassigns')
    submit_cli = commands.add_parser('submit', help='Seal report and evidence with provenance')
    for name in ('assignment', 'session', 'submission', 'report', 'source-revision', 'criteria-revision'):
        submit_cli.add_argument('--' + name, required=True)
    submit_cli.add_argument('--evidence', required=True, action='append', help='Repeat for each supporting file')
    assess_cli = commands.add_parser('assess', help='Record a fixed per-criterion Assessment, never Acceptance')
    assess_cli.add_argument('--assessment', required=True)
    cancel_cli = commands.add_parser('cancel', help='Cancel an active ledger Assignment; does not stop a session')
    cancel_cli.add_argument('--assignment', required=True)
    cancel_cli.add_argument('--reason', required=True)
    status_cli = commands.add_parser('status', help='JSON snapshot/export; checks all sealed evidence')
    status_cli.add_argument('--compact', action='store_true',
                            help='Opt-in current-state JSON without event history or verbose criteria; still verifies evidence')
    status_cli.add_argument('--trial')
    status_cli.add_argument('--include-report', action='store_true')
    return cli


def main():
    args = parser().parse_args()
    db = None
    try:
        os.umask(0o077)
        root = state_root(args.state_root)
        db = sqlite3.connect(root / 'workboard.sqlite3', timeout=10)
        db.row_factory = sqlite3.Row
        db.execute('PRAGMA foreign_keys=ON')
        version = db.execute('PRAGMA user_version').fetchone()[0]
        require(version in (0, 1), 'Unsupported database version')
        db.executescript(SCHEMA)
        db.execute('PRAGMA user_version=1')
        db.execute('BEGIN' if args.command == 'status' else 'BEGIN IMMEDIATE')
        handlers = {'enqueue': enqueue, 'claim': claim, 'submit': submit,
                    'assess': assess, 'cancel': cancel, 'status': status}
        result = handlers[args.command](db, root, args)
        if args.command != 'status':
            db.execute('INSERT INTO events(at,action,outcome,detail) VALUES (?,?,?,?)',
                       (now().isoformat(), args.command, 'recorded', canonical(result)))
        db.commit()
        print(canonical({'ok': True, **result}))
        return 0
    except (Invalid, OSError, ValueError, sqlite3.Error, OverflowError) as exc:
        if db is not None:
            db.rollback()
            if args.command != 'status':
                try:
                    db.execute('INSERT INTO events(at,action,outcome,detail) VALUES (?,?,?,?)',
                               (now().isoformat(), args.command, 'rejected', canonical({'error': str(exc),
                                'assignment': getattr(args, 'assignment', None), 'trial': getattr(args, 'trial', None)})))
                    db.commit()
                except sqlite3.Error:
                    pass
        print(canonical({'ok': False, 'error': str(exc)}), file=sys.stderr)
        return 1
    finally:
        if db is not None:
            db.close()


if __name__ == '__main__':
    raise SystemExit(main())
