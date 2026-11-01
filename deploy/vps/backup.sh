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
