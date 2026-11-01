# mylemans-vps

One Hostinger KVM 2 (2 vCPU, 8 GB, 100 GB) running the whole Mylemans Online
stack behind Caddy. Images are built by GitHub Actions and pushed to GHCR;
Watchtower on the box pulls them within five minutes of a push.

```
Cloudflare (proxied, cache)  →  Caddy :443
                                  ├─ mylemans.online / www / blog  →  site (Express + Jekyll output)
                                  └─ labs.mylemans.online          →  labs-web (nginx) ─ /api → labs-api ─ labs-db
```

## Why no "autoscaling"

A single VPS cannot scale out; there is no second machine to scale to. What
this setup does instead:

- **Cloudflare in front of every host.** Static assets and, if you add a cache
  rule, blog HTML are served from Cloudflare's edge. A video sending 50k people
  to one post never reaches the VPS. This is the real traffic lever.
- **Per-container memory and CPU limits** so a misbehaving container cannot
  take the box down. Everything together reserves well under 2 GB.
- **Restart policies and health checks**, so a crashed process comes back.
- **Vertical headroom.** Hostinger lets you resize the plan in place. At the
  current traffic (~20k views/month across the sites) KVM 2 is already
  oversized; the box will idle at a few percent CPU.

If you ever need more than one node, the compose file moves to Docker Swarm
unchanged (the `deploy:` keys are Swarm syntax already); that is the point to
look at a load balancer, not before.

## First-time setup

1. **Hostinger**: Ubuntu 24.04 template, add your SSH key, note the IPv4.
2. **Basics on the box**
   ```bash
   apt update && apt -y upgrade
   apt -y install ufw unattended-upgrades fail2ban
   ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
   curl -fsSL https://get.docker.com | sh
   mkdir -p /opt/mylemans && cd /opt/mylemans
   ```
3. Copy `docker-compose.yml`, `Caddyfile`, `backup.sh` and `.env.example` into
   `/opt/mylemans` (or `git clone` this repo there). `cp .env.example .env` and
   fill it in.
4. **Cloudflare DNS**: A records for `@`, `www`, `blog`, `labs` → the VPS IP,
   all proxied (orange cloud). SSL/TLS mode **Full (strict)**. "Always Use
   HTTPS" on. (`labs` is DNS-only today and points at Hetzner; `@`/`blog` are
   already proxied.)
5. **Migrate the Labs database** from the Hetzner box before switching DNS for
   `labs`: `sh deploy/backup.sh` there, copy the dump over, then on the new box
   `docker compose up -d labs-db` and restore it (see the bottom of `backup.sh`).
6. `docker compose up -d`. Caddy requests certificates on the first request to
   each host; give it a minute, then `docker compose logs caddy`.
7. Verify:
   ```bash
   curl -I https://mylemans.online/
   curl -I https://labs.mylemans.online/
   curl -I https://blog.mylemans.online/posts/first-home-nas-fygo-os/   # 301 to mylemans.online
   curl -s https://labs.mylemans.online/api/health
   ```
8. Backups: `crontab -e` and add the line from `backup.sh`. Also turn on
   Hostinger's weekly snapshot; `pgdata` and `caddy_data` are the only state.

## Day to day

- Push to `main` in either repo → GitHub Actions builds the image → Watchtower
  pulls it within 5 minutes and restarts only that container. Nothing to do
  on the box. `docker compose logs -f watchtower` shows it happening; a healthy
  run logs `Session done Failed=0 Scanned=3 Updated=n`.
- Clean-up: Watchtower's `--cleanup` removes replaced images. A weekly cron
  (Sunday 04:30) runs `docker system prune -af --filter until=168h` for stopped
  containers, unused networks and old unused images. Volumes are never pruned,
  so the Postgres data is safe. `docker system df` shows disk use.
- Force an update now: `docker compose pull && docker compose up -d`.
- Resource view: `docker stats --no-stream`.
- The GitHub Actions workflows in both repos need no DigitalOcean step any more;
  delete the DO app once DNS has moved.

## Decommission

- DigitalOcean App Platform app for Labs: delete after the `labs` DNS change.
- Hetzner: stop the Labs stack after the database migration and a day of
  watching the new one; keep the VPS if other things run there.
- `marcmylemans.github.io` and the GitHub Pages test site: see the cutover
  checklist in the `mylemans-online` README.
