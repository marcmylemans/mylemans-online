# Sets last_modified_at on posts from git history.
#
# Rules:
# - A last_modified_at set by hand in the front matter is left alone.
# - The first commit that added the post does not count as a modification.
# - Bulk commits (touching more than BULK_THRESHOLD files, e.g. the blog
#   migration or an image conversion pass) are ignored, so a mass edit does
#   not mark every post as "updated" on the same day.
#
# Needs the full git history at build time: the Docker build copies .git and
# the Pages workflow checks out with fetch-depth: 0.

BULK_THRESHOLD = 15

Jekyll::Hooks.register :posts, :post_init do |post|
  next if post.data["last_modified_at"]
  next unless system("git rev-parse --is-inside-work-tree > /dev/null 2>&1")

  path = post.path
  # newest first: "<hash>|<iso date>"
  log = `git log --follow --format="%H|%aI" -- "#{path}"`.lines.map(&:strip).reject(&:empty?)
  next if log.size < 2 # only ever added, never edited

  first_commit = log.last.split("|").first
  log[0..-2].each do |line|
    hash, date = line.split("|")
    next if hash == first_commit
    touched = `git show --name-only --format= #{hash}`.lines.count { |l| !l.strip.empty? }
    next if touched > BULK_THRESHOLD
    post.data["last_modified_at"] = date
    break
  end
end
