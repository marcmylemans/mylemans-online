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

## Migration checklist (posts are NOT moved yet)

1. Copy `_posts/*` from `marcmylemans.github.io` into `_posts/`.
   About twenty files there have no `.md` extension
   (`2022-12-17-Server2022-HyperV-EnableDeduplication`, the `UnifiAPI_*`
   ones, `GL-E750V2`, `T-Shirt-Collection`, ...) and a few are not posts at
   all (`switchconfig`, `hyper-v-config`, `new_post_template`,
   `Create_Secure_VPS`). Rename the real ones to `.md`, drop the rest.
2. Copy `assets/img/posts/` and any other `assets/` folders the posts
   reference (`assets/data`, `assets/scripts`, `MDT Source files`, ...).
3. Build locally and fix anything Liquid complains about. Posts that use
   Chirpy-only includes will show up here.
4. Optional but worth it: add a `description:` to the older posts. Cards and
   `<meta name="description">` fall back to the first 160 characters otherwise.
5. Point `/404.html`, `/youtube.html` and `/sponsor.html` at `/blog/` instead
   of `blog.mylemans.online` (left as-is until the posts are live here).

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
