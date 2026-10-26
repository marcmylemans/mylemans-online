# Disabled on purpose.
#
# The old blog derived last_modified_at from git history. In this repo every
# post was committed in one migration pass, so git dates would mark all 136
# posts as "updated" on the same day and the "Recently updated" sidebar would
# list whatever the last bulk edit touched.
#
# When you revise a post, set it by hand in the front matter instead:
#
#   last_modified_at: 2026-11-03
#
# That drives the "Updated ..." line on the post, the sidebar, and the
# sitemap <lastmod>. Delete this file if you prefer; nothing depends on it.
