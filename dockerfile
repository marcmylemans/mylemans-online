# ---------------------------------------------------------------------
# Stage 1: build the static site with Jekyll
# ---------------------------------------------------------------------
FROM ruby:3.3-alpine AS jekyll

RUN apk add --no-cache build-base git

WORKDIR /src

# Gems first, so the bundle layer is cached between content commits.
COPY Gemfile Gemfile.lock* ./
RUN bundle config set --local without 'development test' \
    && bundle install --jobs 4 --retry 3

# .git is needed by _plugins/posts-lastmod-hook.rb (last-modified dates).
COPY . .
ENV JEKYLL_ENV=production
# A new value per CI run, so the build cache never reuses an old Jekyll build.
# Without it, a scheduled rebuild of an unchanged commit (to publish a post whose
# date has just passed) could come straight from cache and still leave it out.
ARG SITE_BUILD=local
RUN echo "site build ${SITE_BUILD}" && bundle exec jekyll build --destination /site

# ---------------------------------------------------------------------
# Stage 2: serve it with the existing Express app (newsletter API +
# blog.mylemans.online redirects)
# ---------------------------------------------------------------------
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-fund --no-audit \
    && npm cache clean --force

COPY server.js ./
COPY --from=jekyll /site ./public

EXPOSE 80
CMD ["node", "server.js"]
