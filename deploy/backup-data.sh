#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/zblog}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/zblog-data-$STAMP.tar.gz" -C "$APP_DIR" data
find "$BACKUP_DIR" -name "zblog-data-*.tar.gz" -mtime +"$KEEP_DAYS" -delete

echo "Backup created: $BACKUP_DIR/zblog-data-$STAMP.tar.gz"
