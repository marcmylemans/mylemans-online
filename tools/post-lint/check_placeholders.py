#!/usr/bin/env python3
"""Hold back posts that still contain writing placeholders, and report them.

Runs in "Build and publish Docker image" before the image is built. For every
post in _posts/ it looks for placeholders such as <!-- VERIFY: ... -->,
<!-- SCREENSHOT: ... -->, [CONFIRM ...] or a bare TODO outside code blocks.

A post with placeholders that is NOT live yet gets `published: false` added to
its front matter in the CI workspace only (never committed), so this build
leaves it out. A post that is already live stays online, because pulling it
would break links and its comment thread; it is only reported.

Every post with placeholders gets one open GitHub issue (label
post-placeholders) listing the lines; the issue closes itself once the post is
clean. Fix the post, push, and the next build publishes it.

To keep a placeholder-looking line on purpose (a post about TODO comments,
say), add `placeholder_check: false` to that post's front matter.

Env:
  SITE_URL       live site, default https://mylemans.online
  DRY_RUN=1      report only: no front matter changes, no issues
  GITHUB_TOKEN / GH_TOKEN and GITHUB_REPOSITORY for the issue part (gh CLI)
"""
import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scheduled-posts"))
from due_posts import post_time  # noqa: E402  (same date rules as the scheduler)

SITE_URL = os.environ.get("SITE_URL", "https://mylemans.online").rstrip("/")
DRY_RUN = os.environ.get("DRY_RUN") == "1"
LABEL = "post-placeholders"
WORDS = r"VERIFY|CONFIRM|SCREENSHOT|ADD|TODO|FIXME|TBD|PLACEHOLDER|IMAGE|LINK"

# Checked outside fenced code blocks (code can legitimately say TODO or carry
# its own comments). Upper case only, so an ordinary "<!-- Add more ... -->"
# in a config sample is left alone.
PATTERNS = [
    re.compile(rf"<!--\s*(?:{WORDS})\b"),               # <!-- VERIFY: ... -->
    re.compile(rf"\[(?:{WORDS})\b[^\]]*\]"),            # [VERIFY ...], ![SCREENSHOT: ...](...)
    re.compile(r"\[(?:SERP title|Meta description|Hook line|Promise:|Preview:|The CTA)"),  # template leftovers
    re.compile(r"\b(?:TODO|FIXME|TBD|XXX)\b"),
]


def front_matter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    return (m.group(1), m.end()) if m else ("", 0)


def find_placeholders(text):
    front, body_start = front_matter(text)
    if re.search(r"^placeholder_check:\s*false\s*$", front, re.M):
        return []
    hits, in_code = [], False
    first_body_line = text[:body_start].count("\n") + 1
    for n, line in enumerate(text[body_start:].splitlines(), start=first_body_line):
        if re.match(r"^\s*(```|~~~)", line):
            in_code = not in_code
            continue
        if not in_code and any(p.search(line) for p in PATTERNS):
            hits.append((n, line.strip()))
    return hits


def slug(path):
    return re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem)


def is_live(path):
    url = f"{SITE_URL}/posts/{slug(path)}/"
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "post-placeholder-check"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status == 200
    except Exception:
        return False


def hold_back(path):
    text = path.read_text(encoding="utf-8")
    if re.search(r"^published:\s*false\s*$", front_matter(text)[0], re.M):
        return
    path.write_text(re.sub(r"^---\s*\n", "---\npublished: false\n", text, count=1), encoding="utf-8")


def gh(*args):
    r = subprocess.run(["gh", *args], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"::warning::gh {' '.join(args[:2])} failed: {r.stderr.strip()}")
    return r.stdout


def issue_title(path):
    return f"Placeholders left in {path.name}"


def sync_issues(reports):
    if DRY_RUN or not os.environ.get("GITHUB_REPOSITORY"):
        return
    gh("label", "create", LABEL, "--color", "D93F0B",
       "--description", "A post still contains writing placeholders", "--force")
    open_issues = json.loads(gh("issue", "list", "--label", LABEL, "--state", "open",
                                "--limit", "200", "--json", "number,title") or "[]")
    by_title = {i["title"]: i["number"] for i in open_issues}

    for path, hits, live, when in reports:
        if live:
            status = ("**Already live.** It stays online, so these placeholders are visible "
                      "in the page or its source right now. Fix them and push.")
        elif when and when > datetime.now(timezone.utc):
            status = (f"**Scheduled for {when:%Y-%m-%d %H:%M} UTC.** It will be held back at "
                      "that time unless these are fixed first.")
        else:
            status = ("**Held back.** This build left the post out. Fix the lines below and "
                      "push; the next build publishes it.")
        lines = "\n".join(f"- line {n}: `{t[:200].replace('`', chr(39))}`" for n, t in hits)
        body = (f"`_posts/{path.name}` still contains placeholders.\n\n{status}\n\n{lines}\n\n"
                "This issue closes itself after a build where the post is clean. To keep a "
                "placeholder-looking line on purpose, add `placeholder_check: false` to the "
                "post's front matter.\n\n_Opened by the placeholder check in "
                "\"Build and publish Docker image\"._")
        title = issue_title(path)
        if title in by_title:
            gh("issue", "edit", str(by_title.pop(title)), "--body", body)
        else:
            gh("issue", "create", "--title", title, "--label", LABEL, "--body", body)

    for title, number in by_title.items():  # posts that are clean (or gone) now
        gh("issue", "close", str(number), "--comment",
           "The post no longer contains placeholders. Closing.")


def main():
    reports = []
    for path in sorted(Path("_posts").glob("*.md")):
        hits = find_placeholders(path.read_text(encoding="utf-8", errors="replace"))
        if not hits:
            continue
        live = is_live(path)
        when = post_time(path)
        reports.append((path, hits, live, when))
        action = "live, reported only" if live else "held back"
        print(f"::warning file=_posts/{path.name},line={hits[0][0]}::"
              f"{len(hits)} placeholder(s), {action}")
        for n, t in hits:
            print(f"    line {n}: {t}")
        if not live and not DRY_RUN:
            hold_back(path)
    if not reports:
        print("No placeholders in any post.")
    sync_issues(reports)


if __name__ == "__main__":
    main()
