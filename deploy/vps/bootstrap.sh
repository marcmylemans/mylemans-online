#!/usr/bin/env bash
# One-shot setup for the Mylemans Online VPS (Ubuntu 24.04, run as root).
# Usage from your PC:  ssh root@72.62.27.132 'bash -s' < bootstrap.sh
# Idempotent: safe to run again.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "== 1/6 packages"
apt-get update -q
apt-get -y -q upgrade
apt-get -y -q install ufw unattended-upgrades fail2ban curl git ca-certificates

echo "== 2/6 firewall + fail2ban + auto security updates"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp  >/dev/null
ufw allow 443/tcp >/dev/null
ufw allow 443/udp >/dev/null          # HTTP/3
ufw --force enable
systemctl enable --now fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "== 3/6 docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "== 4/6 stack files in /opt/mylemans"
mkdir -p /opt/mylemans/backups
cd /opt/mylemans

cat > docker-compose.yml <<'YML'
# Mylemans Online: everything on one VPS.
#
#   caddy            reverse proxy + automatic TLS for all hosts
#   site             mylemans.online (+ www, + blog redirect)  ghcr.io/marcmylemans/mylemans-online
#   labs-web         labs.mylemans.online static app            ghcr.io/marcmylemans/mylemans-labs-site
#   labs-api         Labs accounts/progress API (Fastify)       ghcr.io/marcmylemans/mylemans-labs-api
#   labs-db          Postgres for the Labs API
#   watchtower       pulls new :latest images and restarts only the opted-in containers
#
# Configure in .env (copy .env.example). Bring up with:  docker compose up -d
#
# Memory/CPU limits keep one container from starving the rest on a 2 vCPU / 8 GB box.
# Totals: ~1.4 GB reserved at most, leaving headroom for the kernel page cache,
# which is what actually makes static sites fast.

name: mylemans

x-watched: &watched
  labels:
    com.centurylinklabs.watchtower.enable: "true"

services:

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"          # HTTP/3
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data        # certificates: keep this volume
      - caddy_config:/config
    depends_on:
      - site
      - labs-web
    deploy:
      resources:
        limits: { memory: 256M }
    logging: &logging
      driver: json-file
      options: { max-size: "10m", max-file: "3" }

  site:
    <<: *watched
    image: ghcr.io/marcmylemans/mylemans-online:latest
    container_name: mylemans-online
    restart: unless-stopped
    expose: ["80"]
    environment:
      RESEND_API_KEY: ${RESEND_API_KEY}
      RESEND_AUDIENCE_ID_NEWSLETTER: ${RESEND_AUDIENCE_ID_NEWSLETTER}
      RESEND_AUDIENCE_ID_SAFETUNNEL: ${RESEND_AUDIENCE_ID_SAFETUNNEL:-}
      LEGACY_BLOG_HOST: blog.mylemans.online
      CANONICAL_ORIGIN: https://mylemans.online
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 15s
    deploy:
      resources:
        limits: { memory: 512M, cpus: "1.0" }
    logging: *logging

  labs-web:
    <<: *watched
    image: ghcr.io/marcmylemans/mylemans-labs-site:latest
    container_name: mylemans-labs
    restart: unless-stopped
    expose: ["80"]
    depends_on:
      - labs-api
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1/"]
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits: { memory: 128M, cpus: "0.5" }
    logging: *logging

  # The labs-web nginx proxies /api to http://labs-api:3000 by service name,
  # so this service MUST be called labs-api.
  labs-api:
    <<: *watched
    image: ghcr.io/marcmylemans/mylemans-labs-api:latest
    container_name: mylemans-labs-api
    restart: unless-stopped
    expose: ["3000"]
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-mlabs}:${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}@labs-db:5432/${POSTGRES_DB:-mlabs}
      PUBLIC_URL: https://labs.mylemans.online
      COOKIE_SECURE: "true"
      RESEND_API_KEY: ${RESEND_API_KEY}
      RESEND_AUDIENCE_ID: ${RESEND_AUDIENCE_ID_NEWSLETTER:-}
      EMAIL_FROM: ${LABS_EMAIL_FROM:-noreply@mail.safetunnel.app}
      EMAIL_FROM_NAME: Mylemans Labs
      EMAIL_REPLY_TO: info@mylemans.online
    depends_on:
      labs-db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    deploy:
      resources:
        limits: { memory: 384M, cpus: "1.0" }
    logging: *logging

  labs-db:
    image: postgres:16-alpine
    container_name: mylemans-labs-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-mlabs}
      POSTGRES_USER: ${POSTGRES_USER:-mlabs}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$$POSTGRES_USER\" -d \"$$POSTGRES_DB\""]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 10s
    deploy:
      resources:
        limits: { memory: 512M }
    logging: *logging

  watchtower:
    # Maintained fork of containrrr/watchtower (abandoned; its Docker API 1.25
    # client is refused by Docker Engine 29+). Same flags, same labels.
    image: nickfedor/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    # Only containers with the watchtower.enable=true label are updated, so
    # Postgres, Caddy and Watchtower itself are never touched. Checks every
    # 5 minutes; a push to GitHub is live within that window.
    command: --label-enable --cleanup --interval 300
    deploy:
      resources:
        limits: { memory: 64M }
    logging: *logging

volumes:
  pgdata:
  caddy_data:
  caddy_config:
YML

cat > Caddyfile <<'CADDY'
# Caddy issues and renews Let's Encrypt certificates by itself (HTTP-01, which
# works behind the Cloudflare proxy). Cloudflare SSL mode must be "Full (strict)".

{
    email info@mylemans.online
}

(common) {
    encode zstd gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
}

# Main site + blog. www and the legacy blog host go to the same container:
# server.js already 301s blog.mylemans.online/* to https://mylemans.online/*.
mylemans.online, www.mylemans.online, blog.mylemans.online {
    import common
    @www host www.mylemans.online
    redir @www https://mylemans.online{uri} permanent
    reverse_proxy site:80
}

# Labs. The container's own nginx forwards /api to labs-api.
labs.mylemans.online {
    import common
    reverse_proxy labs-web:80
}
CADDY

cat > backup.sh <<'BACKUP'
#!/usr/bin/env sh
# Nightly Labs database dump, keeps 14 days. Run from the compose directory:
#   sh backup.sh
# Cron (as the user that owns the compose dir):
#   15 3 * * * cd /opt/mylemans && sh backup.sh >> backups/backup.log 2>&1
set -eu
mkdir -p backups
STAMP="$(date +%Y%m%d-%H%M%S)"
docker compose exec -T labs-db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "backups/mlabs-$STAMP.sql.gz"
find backups -name 'mlabs-*.sql.gz' -mtime +14 -delete
echo "$(date -Is) wrote backups/mlabs-$STAMP.sql.gz"

# Restore into an EMPTY database:
#   gunzip -c backups/mlabs-XXXX.sql.gz | docker compose exec -T labs-db psql -U mlabs -d mlabs
BACKUP
chmod +x backup.sh

if [ ! -f .env ]; then
cat > .env <<'ENV'
# Copy to .env next to docker-compose.yml. Never commit the real file.

# Labs database
POSTGRES_DB=mlabs
POSTGRES_USER=mlabs
POSTGRES_PASSWORD=change-me-to-a-long-random-string   # openssl rand -base64 32

# Resend (shared by the newsletter API on the main site and the Labs magic-link mail)
RESEND_API_KEY=
RESEND_AUDIENCE_ID_NEWSLETTER=
RESEND_AUDIENCE_ID_SAFETUNNEL=

# Sender for Labs sign-in mails (must be a verified Resend domain)
LABS_EMAIL_FROM=noreply@mail.safetunnel.app
ENV
  # a real Postgres password straight away, so the only thing left to fill is Resend
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 24)|" .env
  chmod 600 .env
  echo "   wrote .env (fill RESEND_API_KEY and RESEND_AUDIENCE_ID_NEWSLETTER)"
else
  echo "   .env already exists, left alone"
fi

echo "== 5/6 nightly database backup (03:15)"
( crontab -l 2>/dev/null | grep -v 'mylemans/backup.sh' | grep -v 'docker system prune' ; \
  echo "15 3 * * * cd /opt/mylemans && sh backup.sh >> backups/backup.log 2>&1" ; \
  echo "30 4 * * 0 docker system prune -af --filter until=168h >> /opt/mylemans/backups/prune.log 2>&1" ) | crontab -

echo "== 6/6 pull images (no containers started yet)"
docker compose pull --quiet || true

echo
echo "Done. Next:"
echo "  1. nano /opt/mylemans/.env        (RESEND_API_KEY, RESEND_AUDIENCE_ID_NEWSLETTER)"
echo "  2. Cloudflare: A records @, www, blog, labs -> $(curl -s -4 ifconfig.me 2>/dev/null || echo 'this IP'), proxied; SSL Full (strict)"
echo "  3. cd /opt/mylemans && docker compose up -d"
echo "  4. docker compose logs -f caddy   (certificates appear on first request per host)"
