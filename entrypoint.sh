#!/bin/sh
set -e

if [ "$NODE_ENV" = "development" ]; then
    echo "Running migrations (dev)…"
    cd api && npx prisma migrate dev --name "init" || echo "Migrations already applied, continuing…"
    echo "Seeding…"
    npx prisma db seed || echo "Seed already applied, continuing…"
    cd ..
else
    echo "Running migrations (prod)…"
    cd api
    if ! npx prisma migrate deploy --schema=prisma/schema.prisma; then
        echo "❌ migrate failed, exiting…"
        exit 1
    fi
    echo "Seeding (optional)…"
    npx prisma db seed || echo "Seed already applied, continuing…"
    cd ..
fi

exec "$@"
