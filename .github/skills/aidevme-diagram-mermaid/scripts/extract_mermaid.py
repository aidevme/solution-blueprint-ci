#!/usr/bin/env python3
"""Extract ```mermaid blocks from Markdown files for batch validation.

Usage:
    extract_mermaid.py <file-or-dir> [...] [--out DIR] [--validate]

Writes each block to DIR (default: ./mermaid-extracted) as
<markdown-stem>-<n>.mmd and prints "<source>:<line> -> <file>".
With --validate, runs validate_local.sh on every extracted file and
exits 1 if any block is invalid (2 if no backend is available).
"""

import argparse
import pathlib
import re
import shutil
import subprocess
import sys

FENCE_OPEN = re.compile(r"^(\s*)(`{3,}|~{3,})\s*mermaid\s*$")


def iter_markdown(paths):
    for raw in paths:
        p = pathlib.Path(raw)
        if p.is_dir():
            yield from sorted(p.rglob("*.md"))
        elif p.suffix.lower() in (".md", ".markdown") and p.is_file():
            yield p


def extract_blocks(md_path):
    """Yield (start_line, code) for each mermaid fence in the file."""
    lines = md_path.read_text(encoding="utf-8").splitlines()
    i = 0
    while i < len(lines):
        m = FENCE_OPEN.match(lines[i])
        if not m:
            i += 1
            continue
        indent, fence = m.group(1), m.group(2)
        start = i + 1
        body = []
        i += 1
        while i < len(lines) and not lines[i].strip().startswith(fence):
            line = lines[i]
            body.append(line[len(indent):] if line.startswith(indent) else line)
            i += 1
        yield start, "\n".join(body) + "\n"
        i += 1


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--out", default="mermaid-extracted")
    ap.add_argument("--validate", action="store_true")
    args = ap.parse_args()

    out_dir = pathlib.Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    extracted = []
    for md in iter_markdown(args.paths):
        for n, (line, code) in enumerate(extract_blocks(md), start=1):
            target = out_dir / f"{md.stem}-{n}.mmd"
            target.write_text(code, encoding="utf-8")
            extracted.append((f"{md}:{line}", target))
            print(f"{md}:{line} -> {target}")

    if not extracted:
        print("no mermaid blocks found", file=sys.stderr)
        return 0
    if not args.validate:
        return 0

    script = pathlib.Path(__file__).with_name("validate_local.sh")
    # Resolve bash through PATH: on Windows a bare "bash" would hit WSL's System32\bash.exe first.
    bash = shutil.which("bash")
    if not bash:
        print("bash not found on PATH", file=sys.stderr)
        return 2
    failed = 0
    for source, target in extracted:
        # POSIX paths: Git Bash strips backslashes from native Windows paths.
        r = subprocess.run([bash, script.as_posix(), target.as_posix()], capture_output=True, text=True)
        if r.returncode == 2:
            print(r.stderr.strip(), file=sys.stderr)
            return 2
        status = "PASS" if r.returncode == 0 else "FAIL"
        print(f"{status}  {source}")
        if r.returncode != 0:
            failed += 1
            print("      " + r.stderr.strip().replace("\n", "\n      "))
    print(f"{len(extracted) - failed}/{len(extracted)} valid")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
