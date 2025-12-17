#!/bin/bash
set -e

echo "Running production migrations..."

# Try to deploy migrations
if ! npx prisma migrate deploy; then
  echo "Migration failed, attempting to resolve..."

  # Mark failed migrations as rolled back
  npx prisma migrate resolve --rolled-back 20251215041919_init || true

  # Try deploying again
  npx prisma migrate deploy
fi

echo "Migrations completed successfully"
