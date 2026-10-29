#!/usr/bin/env python3
"""Validate local HTML/CSS references without third-party dependencies."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


EXPECTED_PAGES = (
    "index.html", "stories/shezhi.html",
    "stories/zhubian.html", "stories/sunkehua.html", "stories/shexiang.html",
)
SKIP_DIRS = {".git", "node_modules", "_site", "_qa"}


class References(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.references: list[tuple[int, str]] = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if not value:
                continue
            if key in {"href", "src", "poster"}:
                self.references.append((self.getpos()[0], value))
            elif key == "srcset" and not value.lstrip().startswith("data:"):
                for candidate in value.split(","):
                    parts = candidate.strip().split()
                    if parts:
                        self.references.append((self.getpos()[0], parts[0]))

    handle_startendtag = handle_starttag


def case_matches(path: Path, root: Path) -> bool:
    """Catch filename case mistakes even when checking on Windows."""
    try:
        relative = path.relative_to(root)
    except ValueError:
        return False
    current = root
    for part in relative.parts:
        if not current.is_dir() or part not in {item.name for item in current.iterdir()}:
            return False
        current /= part
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    root = args.root.resolve()
    errors: list[str] = []
    checked = 0
    files = [p for p in root.rglob("*") if p.is_file()
             and not (set(p.relative_to(root).parts) & SKIP_DIRS)]
    for expected in EXPECTED_PAGES:
        if not (root / expected).is_file():
            errors.append(f"Required page missing: {expected}")

    for source in files:
        if source.suffix.lower() not in {".html", ".css"}:
            continue
        content = source.read_text(encoding="utf-8-sig")
        if source.suffix.lower() == ".html":
            document = References()
            document.feed(content)
            references = document.references
        else:
            references = [(content[:m.start()].count("\n") + 1, m.group(1).strip("\"' "))
                          for m in re.finditer(r"url\(\s*([^)]*?)\s*\)", content)]
        for line, raw in references:
            raw = raw.strip()
            if not raw or raw.startswith(("#", "//")):
                continue
            try:
                parsed = urlsplit(raw)
            except ValueError:
                errors.append(f"{source.relative_to(root)}:{line}: invalid URL: {raw}")
                continue
            if parsed.scheme or parsed.netloc:
                continue
            relative = unquote(parsed.path)
            if not relative:
                continue
            # Root-relative paths would break project Pages under /repository/.
            if relative.startswith("/"):
                errors.append(f"{source.relative_to(root)}:{line}: use a relative URL for GitHub project Pages: {raw}")
                continue
            target = (source.parent / relative).resolve()
            if not target.is_relative_to(root):
                errors.append(f"{source.relative_to(root)}:{line}: URL leaves website folder: {raw}")
                continue
            if target.is_dir():
                target /= "index.html"
            checked += 1
            if not target.is_file():
                errors.append(f"{source.relative_to(root)}:{line}: missing file: {raw}")
            elif not case_matches(target, root):
                errors.append(f"{source.relative_to(root)}:{line}: filename case mismatch: {raw}")

    if errors:
        print("Static site validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1
    print(f"OK: {len(EXPECTED_PAGES)} required pages and {checked} local file references checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
