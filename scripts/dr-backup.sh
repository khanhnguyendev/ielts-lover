#!/usr/bin/env bash
# IELTS Lover — Supabase Backup Script
# Usage: ./scripts/dr-backup.sh
#
# Requires:
#   - supabase CLI: npm i -g supabase
#   - DATABASE_URL env var or pass as argument
#
# Exports schema + data from ielts_lover_v1 to ./backups/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Database URL: use arg, env var, or prompt
DB_URL="${1:-${DATABASE_URL:-}}"
if [ -z "$DB_URL" ]; then
  echo "❌ No database URL provided."
  echo ""
  echo "Usage:"
  echo "  ./scripts/dr-backup.sh <DATABASE_URL>"
  echo ""
  echo "Or set DATABASE_URL env var:"
  echo "  export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres'"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "🗄️  IELTS Lover — Backup"
echo "========================"
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Output:    $BACKUP_DIR/"
echo ""

# 1. Schema-only dump
SCHEMA_FILE="$BACKUP_DIR/schema_${TIMESTAMP}.sql"
echo "📐 Dumping schema..."
supabase db dump --db-url "$DB_URL" --schema ielts_lover_v1 --data-only false > "$SCHEMA_FILE" 2>/dev/null || \
  pg_dump "$DB_URL" --schema=ielts_lover_v1 --schema-only > "$SCHEMA_FILE"
echo "   ✅ $SCHEMA_FILE ($(wc -c < "$SCHEMA_FILE" | xargs) bytes)"

# 2. Data dump
DATA_FILE="$BACKUP_DIR/data_${TIMESTAMP}.sql"
echo "📦 Dumping data..."
pg_dump "$DB_URL" --schema=ielts_lover_v1 --data-only > "$DATA_FILE"
echo "   ✅ $DATA_FILE ($(wc -c < "$DATA_FILE" | xargs) bytes)"

# 3. Cleanup old backups (keep last 5)
echo ""
echo "🧹 Cleaning up old backups (keeping last 5 pairs)..."
cd "$BACKUP_DIR"
ls -t schema_*.sql 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
ls -t data_*.sql 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

echo ""
echo "✅ Backup complete!"
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null | awk '{print "   " $5 "  " $9}'
