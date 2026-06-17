#!/bin/sh
set -e

echo "[entrypoint] Gerando Prisma Client..."
npx prisma generate

echo "[entrypoint] Aplicando migrations..."
npx prisma migrate deploy

echo "[entrypoint] Importando seed (se banco vazio)..."
node scripts/import-seed.js

exec "$@"
