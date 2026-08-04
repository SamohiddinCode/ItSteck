#!/usr/bin/env bash
# Запуск на платформе с одним процессом и одним портом (Replit, Render и т. п.):
# бэкенд сам отдаёт собранный фронтенд, nginx не нужен.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Сборка фронтенда — только если её ещё нет, иначе каждый рестарт ждал бы минуту.
if [ ! -f frontend/dist/index.html ]; then
  echo "→ собираю фронтенд…"
  cd frontend
  npm install --no-audit --no-fund
  npm run build
  cd "$ROOT"
fi

cd backend
echo "→ ставлю зависимости бэкенда…"
uv sync --no-dev

# Абсолютный путь: uvicorn стартует из backend/, относительный сюда не годится.
export STATIC_DIR="$ROOT/frontend/dist"

echo "→ старт на порту ${PORT:-8000}"
exec uv run uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
