#!/usr/bin/env python3
"""List posts whose publish time falls in (SINCE, NOW].

Jekyll skips posts dated in the future, so a post committed ahead of time only
appears after the next build that runs once its date has passed. The
"Publish scheduled posts" workflow runs this hourly with SINCE set to the start
of the last successful site build: if anything is listed, a build is due.

Env:
  SINCE  ISO 8601 time of the last successful build (UTC, e.g. 2026-11-02T16:05:00Z)
  NOW    optional, for testing; defaults to the current time
Prints one line per due post and writes due=true|false to $GITHUB_OUTPUT.
"""
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

SITE_TZ = ZoneInfo("Europe/Brussels")  # _config.yml timezone; dates without an offset use it
FORMATS = ("%Y-%m-%d %H:%M:%S %z", "%Y-%m-%d %H:%M %z", "%Y-%m-%dT%H:%M:%S%z",
           "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d")


def iso(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def parse_date(raw):
    raw = raw.strip().strip("'\"")
    for fmt in FORMATS:
        try:
            d = datetime.strptime(raw, fmt)
        except ValueError:
            continue
        return d if d.tzinfo else d.replace(tzinfo=SITE_TZ)
    return None


def post_time(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    fm = re.match(r"^---\s*\n(.*?)\n---", text, re.S)
    front = fm.group(1) if fm else ""
    if re.search(r"^published:\s*false\s*$", front, re.M):
        return None
    m = re.search(r"^date:\s*(.+)$", front, re.M)
    d = parse_date(m.group(1)) if m else None
    if d is None:  # fall back to the date in the file name
        m = re.match(r"(\d{4}-\d{2}-\d{2})-", path.name)
        d = parse_date(m.group(1)) if m else None
    return d


def main():
    since = iso(os.environ["SINCE"]) if os.environ.get("SINCE") else None
    now = iso(os.environ["NOW"]) if os.environ.get("NOW") else datetime.now(timezone.utc)
    due = []
    for p in sorted(Path("_posts").glob("*.md")):
        t = post_time(p)
        if t and t <= now and (since is None or t > since):
            due.append((t, p.name))
    for t, name in due:
        print(f"due: {name} ({t.isoformat()})")
    if not due:
        print(f"nothing became due between {since} and {now}")
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a") as fh:
            fh.write(f"due={'true' if due else 'false'}\n")


if __name__ == "__main__":
    sys.exit(main())
