#!/usr/bin/env python3
"""Post the approved draft from a reader-comment issue as a giscus reply.

Reads the issue body fresh (so edits made after the issue was opened count),
takes the text between the reply markers and the giscus-meta line, and adds it
as a reply in the discussion. Then comments the link on the issue and closes
question issues (corrections stay open until the post is fixed).
"""
import json
import os
import re
import subprocess

repo = os.environ["GITHUB_REPOSITORY"]
issue = os.environ["ISSUE"]


def gh(args, token, check=True):
    env = {**os.environ, "GH_TOKEN": token}
    return subprocess.run(["gh", *args], check=check, capture_output=True, text=True, env=env).stdout


def note(text):
    gh(["issue", "comment", issue, "-R", repo, "--body", text], os.environ["ISSUE_TOKEN"])


body = gh(["issue", "view", issue, "-R", repo, "--json", "body", "-q", ".body"], os.environ["ISSUE_TOKEN"])
draft = re.search(r"<!-- reply:start -->\s*(.*?)\s*<!-- reply:end -->", body, re.S)
meta = re.search(r"<!-- giscus-meta (\{.*?\}) -->", body)
if not draft or not draft.group(1).strip() or not meta:
    note("Couldn't post: the draft reply (between the reply markers) or the giscus-meta line is missing or empty.")
    raise SystemExit(1)
m = json.loads(meta.group(1))
text = draft.group(1).strip()

mutation = """
mutation($d: ID!, $r: ID!, $b: String!) {
  addDiscussionComment(input: {discussionId: $d, replyToId: $r, body: $b}) { comment { url } }
}"""
try:
    out = gh(["api", "graphql", "-f", f"query={mutation}", "-F", f"d={m['discussion_id']}",
              "-F", f"r={m['reply_to']}", "-f", f"b={text}"], os.environ["GH_TOKEN"])
    url = json.loads(out)["data"]["addDiscussionComment"]["comment"]["url"]
except subprocess.CalledProcessError as e:
    note(f"Couldn't post the reply: `{(e.stderr or e.stdout or '').strip()[:300]}`. Check BLOG_BOT_TOKEN.")
    raise

note(f"Reply posted: {url}")
if "reader-question" in os.environ.get("LABELS", ""):
    gh(["issue", "close", issue, "-R", repo, "--reason", "completed"], os.environ["ISSUE_TOKEN"])
print(f"Posted {url}")
