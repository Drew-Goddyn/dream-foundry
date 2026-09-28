"""Positive and negative fixtures for the lightweight documentation checker."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from tools.check_docs import REQUIRED, check


class DocumentationChecks(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        for name in REQUIRED:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("# Fixture\n", encoding="utf-8")

    def write(self, name: str, content: str) -> None:
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    def test_valid_structure(self) -> None:
        self.write("README.md", "# Fixture\n[Agents](AGENTS.md)\n")
        self.assertEqual([], check(self.root))

    def test_missing_required_file(self) -> None:
        (self.root / "AGENTS.md").unlink()
        self.assertTrue(any("missing required file" in e for e in check(self.root)))

    def test_broken_local_link(self) -> None:
        self.write("README.md", "# Fixture\n[Missing](missing.md)\n")
        self.assertTrue(any("missing local link" in e for e in check(self.root)))

    def test_repository_escape(self) -> None:
        self.write("README.md", "# Fixture\n[Outside](../outside.md)\n")
        self.assertTrue(any("escapes repository" in e for e in check(self.root)))

    def test_unclosed_fence(self) -> None:
        self.write("README.md", "# Fixture\n```text\nunfinished\n")
        self.assertTrue(any("unclosed" in e for e in check(self.root)))

    def test_bad_json(self) -> None:
        self.write("examples/bad.json", "{broken}")
        self.assertTrue(any("invalid JSON" in e for e in check(self.root)))

    def test_external_and_fenced_links_are_not_fetched(self) -> None:
        self.write("README.md", "# Fixture\n[External](https://example.invalid)\n```text\n[Example](absent.md)\n```\n")
        self.assertEqual([], check(self.root))

    def test_valid_json(self) -> None:
        self.write("examples/good.json", '{"enabled": false}\n')
        self.assertEqual([], check(self.root))


if __name__ == "__main__":
    unittest.main()
