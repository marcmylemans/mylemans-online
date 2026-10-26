# mylemans-online

The combined Mylemans Online site: the main site and the blog in one Jekyll
build, served by a small Express app (newsletter API via Resend, plus the
redirects from the old blog host). Deploys as a Docker image to GHCR via
GitHub Actions, like before.

This repo replaces both `mylemans-online-site` (static HTML + Express) and
`marcmylemans.github.io` (Jekyll Chirpy on GitHub Pages).

## Layout

```
_config.yml          Jekyll config: permalinks, plugins, giscus, pagination
_layouts/            default (shell), post, category, tag
_includes/           header, footer, post-card, pagination, giscus, advertisement
_plugins/            posts-lastmod-hook.rb (last-modified dates from git)
_posts/              blog posts (empty until the migration step)
assets/css/          styles.css (site), blog.css (blog layouts), syntax.css (Rouge)
assets/img/posts/    post images (empty until the migration step)
blog/index.html      blog index at /blog/, paginated 10 per page
*.html               the existing site pages, unchanged apart from front matter
server.js            Express: static files, /api/subscribe, legacy host redirect
dockerfile           two stages: Ruby builds Jekyll, Node serves the result
```

## Testing on GitHub Pages (temporary)

While the Docker image is not live yet, the repo can be previewed at
`https://blog.mylemans.online/mylemans-online/` through GitHub Pages:

1. Add `.github/workflows/pages-deploy.yml` (builds with the full Gemfile and
   `--baseurl /mylemans-online` so links work under the project path).
2. Settings → Pages → Source: **GitHub Actions**.

All generated links use `relative_url`, so the same source builds for the
root domain in Docker and for the project path on Pages. The newsletter
form will not work on Pages (no Express behind it); everything else does.
Remove the workflow and switch Pages off once Docker is live, so Google
does not index a duplicate.

## Local development

```bash
bundle install
bundle exec jekyll serve --livereload      # http://localhost:4000, no API
```

To run the full thing including the newsletter API:

```bash
bundle exec jekyll build
npm ci
RESEND_API_KEY=... node server.js          # http://localhost:80
```

Or `docker compose up --build`.

## What changed versus the two old repos

- Header and footer are Jekyll includes, rendered at build time. The old
  client-side `data-include` fetch is gone.
- Every existing page got a `layout: null` front matter block so Jekyll
  processes the includes; nothing else in those pages changed. They keep
  their `.html` URLs (`/about.html`, `/privacy.html`, ...).
- The homepage blog section is a Liquid loop over `site.posts`. The old
  sitemap scraper in `main.js` (which was showing four 2022 posts dated Oct 6
  because they sorted by git lastmod) is removed.
- Post permalinks are `/posts/:title/`, categories `/categories/:name/`,
  tags `/tags/:name/`, exactly as on blog.mylemans.online, so backlinks and
  giscus threads (mapped by pathname) carry over unchanged.
- `server.js` 301-redirects anything arriving with the `blog.mylemans.online`
  Host header to the same path on `https://mylemans.online` (and `/` to
  `/blog/`). Controlled by `LEGACY_BLOG_HOST` and `CANONICAL_ORIGIN`.
- The homepage follows the merged-site design: identity plus the latest post
  in the hero, a six-post grid with category pills, evergreen guides
  (`_data/evergreen.yml`) and category panels, Labs, YouTube, newsletter,
  and a four-column footer.
- `/blog/` has client-side search (`blog/search.json` + `assets/js/blog-search.js`),
  category pills, list rows with thumbnails, and a sidebar with recently
  updated posts, trending tags and a newsletter card.
- Chirpy is gone. The post layout provides what the posts actually use:
  `{% youtube %}` (jekyll-youtube), `{: .prompt-tip }` style callouts,
  `{% include advertisement.html %}` (now a no-op), `image:` cover images,
  TOC (jekyll-toc), giscus comments, Rouge syntax highlighting.

## Posts: what the migration pass did

The 136 posts in `_posts/` came from `marcmylemans.github.io` through a
scripted pass (log: `_posts` front matter plus `migration-log.csv` in the
repo root at migration time):

- 13 files without `.md` renamed; 4 non-posts dropped (`switchconfig`,
  `hyper-v-config`, `new_post_template`, `Create_Secure_VPS`).
- Categories reduced to 18 canonical ones (Homelab, Proxmox, Hyper-V,
  Windows Server, Windows 11, Active Directory, Remote Desktop Services,
  Entra ID & Intune, Microsoft 365, Networking, Security, Backup, Scripts,
  Self-hosting, Cloud, Hardware, Reviews, Community). Chirpy's
  `Category 1/2/3` placeholders removed.
- Tags normalised: comma-strings split into lists, lowercased, hyphen and
  space variants merged.
- Every post has an `image:` cover: existing file, YouTube thumbnail for
  video posts, or a generated branded card in `assets/img/posts/covers/`
  for text-only posts. Absolute `https://mylemans.online/...` image URLs made
  relative.
- Every post has a `description:` (written for the new cards and meta tags).
- `series:` + `series_order:` on the Hyper-V Guide, MDT, both RDS series,
  the UniFi API scripts and the 2026 home-server posts. The post layout
  shows a series box at the top.
- Three posts whose front-matter `date` did not match the filename now use
  the filename date.

Still to copy by hand from the old repo (binary, not done by the script):
`assets/img/posts/*` (video thumbnails and screenshots), `assets/img/privateglue`,
`assets/img/Hyper-V-Guide`, `assets/img/MDT`, `assets/img/steps-hetzner___*`,
`assets/scripts`, `assets/data`, `assets/primaryuserlocaladmin`.

## Content and marketing pass (Oct 2026)

- Homepage: positioning eyebrow instead of the disclaimer, one hero button,
  categories sorted by post count, post cards with thumbnails, YouTube
  section is a thumbnail facade (`_data/youtube.yml`) that loads the player
  on click.
- Blog index: real title tag, category pills collapse to seven on phones.
- Posts: TOC collapsed by default (H2 only), compact series box, no cover on
  video posts (the embed leads), author card + newsletter form at the end
  (`_data/author.yml`), YouTube embeds swapped for click-to-play facades
  (youtube-nocookie, nothing loads before a click).
- Category pages: intro text from `_data/categories.yml` (drafts, edit them).
- 48 images over 400 KB converted to WebP, max 1600 px wide (64.5 MB ->
  4.7 MB); the posts point at the `.webp` files. The original PNG/JPG files
  are still in `assets/img` and can be deleted.

## Google AdSense

Off by default (`adsense.enabled: false` in `_config.yml`). When enabled:

- `main.js` loads `adsbygoogle.js` only after the visitor accepts the cookie
  banner, and the banner text changes to mention advertising cookies.
- `{% include google-adsense.html %}` (already in 56 posts) renders an
  in-article `<ins class="adsbygoogle">` slot; `adsense.end_of_post: true`
  adds one after every article body. Auto ads are controlled in the
  AdSense console, not here.
- Before enabling for EEA visitors: set up Google's consent message in
  AdSense > Privacy & messaging (required since 2024), and update
  `privacy.html`, which currently says no advertising cookies are used.

## Cutover checklist

1. Deploy this image; confirm `https://mylemans.online/blog/` and a few
   `/posts/...` URLs work.
2. DNS: point `blog.mylemans.online` at the same host as `mylemans.online`
   (and make sure the reverse proxy passes that Host header through).
3. Verify `curl -I https://blog.mylemans.online/posts/first-home-nas-fygo-os/`
   returns `301` to `https://mylemans.online/posts/first-home-nas-fygo-os/`.
4. In `marcmylemans.github.io`: remove `CNAME`, disable Pages, archive the
   repo. Keep it: giscus discussions live in that repo.
5. Google Search Console: add the change of address from the blog property
   to the main property. Resubmit `https://mylemans.online/sitemap.xml`.
6. Update the RSS link anywhere it is published (`/feed.xml` on the main host now).
