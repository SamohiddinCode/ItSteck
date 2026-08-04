#!/usr/bin/env bash
# Один вход в проект: готовит .env, собирает образы, поднимает всё и ждёт,
# пока API действительно ответит. Запускать можно сколько угодно раз.
set -euo pipefail

cd "$(dirname "$0")"

say()  { printf '\033[0;36m%s\033[0m\n' "$*"; }
ok()   { printf '\033[0;32m%s\033[0m\n' "$*"; }
fail() { printf '\033[0;31m%s\033[0m\n' "$*" >&2; }

# --- Docker -----------------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  fail "Docker не установлен. Поставьте Docker Desktop: https://docker.com/get-started"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  fail "Docker не запущен. Откройте Docker Desktop и дождитесь, пока он стартует."
  exit 1
fi

# Старые установки знают только docker-compose с дефисом.
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  fail "Не найден docker compose. Обновите Docker Desktop."
  exit 1
fi

# --- .env -------------------------------------------------------------------
if [ ! -f .env ]; then
  cp .env.example .env
  # Свой ключ для каждой установки: дефолтный из примера в прод не годится.
  if command -v openssl >/dev/null 2>&1; then
    SECRET=$(openssl rand -hex 32)
    # BSD и GNU sed по-разному понимают -i, поэтому через временный файл.
    sed "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET}|" .env > .env.tmp && mv .env.tmp .env
  fi
  ok "Создан .env (скопирован из .env.example)"
  say "   Telegram-уведомления пока выключены — впишите BOT_TOKEN и CHAT_ID, если нужны."
fi

APP_PORT=$(grep -E '^APP_PORT=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '"'"'"' \r')
APP_PORT=${APP_PORT:-8080}
BASE="http://localhost:${APP_PORT}"

# --- Запуск -----------------------------------------------------------------
say "Собираю и поднимаю контейнеры…"
say "   Первый раз это занимает 10–15 минут: образы качаются и собираются с нуля."
if ! $DC up -d --build; then
  echo
  fail "Не удалось поднять контейнеры."
  fail "Если в ошибке выше написано 'address already in use' — порт ${APP_PORT} уже"
  fail "чем-то занят. Впишите в .env другой, например APP_PORT=8081, и запустите снова."
  exit 1
fi

# Холодный старт медленный: postgres разворачивает том, бэкенд создаёт базу,
# таблицы и первого администратора. Три минуты — с запасом.
WAIT_SECONDS=180
say "Жду, пока API ответит (до ${WAIT_SECONDS} c)…"
for i in $(seq 1 "$WAIT_SECONDS"); do
  if curl -fs "${BASE}/api/health" >/dev/null 2>&1; then
    ok "API готов"
    break
  fi
  if [ "$i" = "$WAIT_SECONDS" ]; then
    fail "API не ответил за ${WAIT_SECONDS} c. Контейнеры могли всё же подняться — проверьте:"
    fail "  $DC ps"
    fail "  $DC logs backend"
    exit 1
  fi
  sleep 1
done

ADMIN_EMAIL=$(grep -E '^FIRST_ADMIN_EMAIL=' .env 2>/dev/null | tail -1 | cut -d= -f2- || true)
ADMIN_PASS=$(grep -E '^FIRST_ADMIN_PASSWORD=' .env 2>/dev/null | tail -1 | cut -d= -f2- || true)

echo
ok "Готово."
echo "  Сайт      ${BASE}"
echo "  Админка   ${BASE}/admin    ${ADMIN_EMAIL:-admin@itstek.com} / ${ADMIN_PASS:-admin123}"
echo "  API-доки  ${BASE}/api/docs"
echo
echo "  Остановить:  $DC down"
echo "  Логи:        $DC logs -f backend"
echo

# --- Открыть в браузере -----------------------------------------------------
if command -v open >/dev/null 2>&1; then open "$BASE"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$BASE" >/dev/null 2>&1
elif command -v start >/dev/null 2>&1; then start "$BASE"
fi
