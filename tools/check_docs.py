#!/usr/bin/env python3
"""Offline structural documentation checks; not semantic or security approval."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

REQUIRED = (
    "README.md", "AGENTS.md", "CONTEXT.md", "docs/status.md",
    "docs/architecture.md", "docs/operating-policy.md", "docs/coordination.md",
    "docs/bootstrap-plan.md", "docs/github.md", "docs/agents/launch.md",
    "docs/agents/reviewer.md", "docs/experiments/precursor-suite.md",
)
SKIP = {".git", ".foundry", ".local", ".tmp", "node_modules", "__pycache__"}
LINK = re.compile(r"!?\[[^\]\n]*\]\(([^)\n]+)\)")
FENCE = re.compile(r"^\s*(`{3,}|~{3,})")


def check(root: Path) -> list[str]:
    root = root.resolve()
    errors: list[str] = []
    for name in REQUIRED:
        if not (root / name).is_file():
            errors.append(f"missing required file: {name}")
    for path in sorted(root.rglob("*")):
        rel = path.relative_to(root)
        if any(part in SKIP for part in rel.parts) or not path.is_file():
            continue
        if path.suffix not in {".md", ".json"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            errors.append(f"{rel}: cannot read UTF-8: {exc}")
            continue
        if not text.strip():
            errors.append(f"{rel}: empty file")
        if path.suffix == ".json":
            try:
                json.loads(text)
            except json.JSONDecodeError as exc:
                errors.append(f"{rel}: invalid JSON at line {exc.lineno}")
            continue
        fence: str | None = None
        fence_length = 0
        for number, line in enumerate(text.splitlines(), 1):
            match = FENCE.match(line)
            if match:
                token = match.group(1)
                if fence is None:
                    fence, fence_length = token[0], len(token)
                elif token[0] == fence and len(token) >= fence_length:
                    fence = None
                continue
            if fence is not None:
                continue
            for target in LINK.findall(line):
                target = target.strip().split(" ", 1)[0].strip("<>")
                parsed = urlsplit(target)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                destination = (path.parent / unquote(parsed.path)).resolve()
                if not destination.is_relative_to(root):
                    errors.append(f"{rel}:{number}: local link escapes repository")
                elif not destination.exists():
                    errors.append(f"{rel}:{number}: missing local link: {target}")
        if fence is not None:
            errors.append(f"{rel}: unclosed fenced code block")
    return errors


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors = check(root)
    for error in errors:
        print(error, file=sys.stderr)
    if errors:
        print(f"FAIL: {len(errors)} structural documentation issue(s)")
        return 1
    print("PASS: required files, local inline-link paths, code fences, and JSON syntax")
    print("Not checked: external URLs, anchors, reference links, semantic claims, permissions, or runtime behavior")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
