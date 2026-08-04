# 🎓 ItStek

> Образовательная платформа — FastAPI + React + PostgreSQL

## Запуск одной командой

Нужен только **Docker Desktop** — ни Python, ни Node ставить не надо.

```bash
./start.sh
```

Скрипт сам создаст `.env`, соберёт образы, поднимет всё, дождётся ответа API и
откроет сайт в браузере. Запускать можно сколько угодно раз.

На Windows — из Git Bash той же командой. Если запускать скрипт нельзя,
работает и обычное:

```bash
cp .env.example .env
docker compose up --build
```

| Что | Адрес |
|---|---|
| Сайт | http://localhost:8080 |
| Админка | http://localhost:8080/admin |
| Документация API | http://localhost:8080/api/docs |

Вход в админку — из `FIRST_ADMIN_EMAIL` / `FIRST_ADMIN_PASSWORD`
(по умолчанию `admin@itstek.com` / `admin123`). Администратор создаётся
**только пока таблица пользователей пуста** — менять эти переменные позже
бесполезно. Порт сайта задаётся через `APP_PORT` в `.env`.

Остановить: `docker compose down`. Логи: `docker compose logs -f backend`.

---

## Деплой на Replit

Docker там не работает, поэтому проект умеет второй режим: **один процесс на
одном порту** — бэкенд сам отдаёт собранный фронтенд, nginx не нужен.
Включается переменной `STATIC_DIR`, всё остальное в коде не меняется.

Файлы `.replit` и `replit-start.sh` уже в репозитории. Порядок:

1. В Replit — **Create Repl → Import from GitHub**, указать репозиторий.
2. Панель **Tools → PostgreSQL → Create a database**. Replit сам подставит
   `DATABASE_URL`; схему `postgresql://` приложение приведёт к нужному
   драйверу самостоятельно.
3. Панель **Secrets** — добавить:
   - `SECRET_KEY` — любая случайная строка (`openssl rand -hex 32`);
   - `FIRST_ADMIN_PASSWORD` — свой пароль, **обязательно до первого запуска**;
   - `BOT_TOKEN` и `CHAT_ID`, если нужны уведомления.
4. Нажать **Run**. Первый запуск долгий: ставятся зависимости и собирается
   фронтенд. Дальше стартует за секунды.

Бесплатно доступен только адрес из редактора — он живёт, пока открыта вкладка,
и засыпает следом. Постоянная публикация (Deployments) у Replit на платном
тарифе.

Тот же режим годится для Render и обычной виртуалки:

```bash
STATIC_DIR=/путь/к/frontend/dist uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Возможности

- 📚 Каталог курсов
- 📝 Заявки — ФИО, телефон с проверкой формата, Telegram по желанию
- 🧭 Тест профориентации на `/test`, подбирает курс по ответам
- 🏆 Сертификаты с публичной проверкой на `/verify` и генерацией PDF
- 🏷️ Бегущая строка со скидками, расписание задаётся в админке
- 🎯 Воронка заявок, аналитика на дашборде
- 👩‍🏫 Управление курсами и преподавателями
- 👥 Две роли — **администратор** (вся панель) и **менеджер** (только заявки)
- 📱 Уведомления о заявках в Telegram
- 🌐 Три языка интерфейса — узбекский, русский, английский

## Стек

| Слой | Технологии |
|---|---|
| Фронтенд | React (Vite) + TailwindCSS |
| Бэкенд | FastAPI + Python 3.13 + SQLAlchemy 2.0 |
| База | PostgreSQL + Alembic |
| Инфраструктура | Docker Compose + Nginx |
| Авторизация | JWT |

---

## Настройка

Все параметры — в корневом `.env`, полный список с комментариями лежит в
`.env.example`. Что важно знать:

- **Telegram не обязателен.** Пустые `BOT_TOKEN` / `CHAT_ID` — уведомления
  просто пропускаются, заявки всё равно сохраняются. Проверить связку:
  `GET /api/telegram/test`.
- **Переменные `VITE_*` запекаются в бандл при сборке**, а не читаются в
  рантайме. Поменяли номер телефона или ссылки на соцсети — нужен
  `docker compose up --build`, простого перезапуска мало.

---

## Разработка с горячей перезагрузкой

База в Docker, бэкенд и фронтенд — на хосте. Дополнительно нужны Python 3.13+,
[uv](https://docs.astral.sh/uv/) и Node 20+.

### 1. База

Базе нужно открыть порт наружу — этим занимается отдельный файл
`docker-compose.dev.yml`, в обычном запуске он не участвует.

```bash
# Возьмите свободный порт: 5432 обычно занят локально установленным PostgreSQL.
echo "POSTGRES_PORT=55432" >> .env

docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres
```

Проверка, что база доступна с хоста:

```bash
set -a; . ./.env; set +a
PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select current_database()"
```

### 2. Бэкенд

```bash
cd backend
uv sync

set -a; . ../.env; set +a
export DATABASE_URL="postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}"

uv run alembic upgrade head
uv run uvicorn app.main:app --port 8000 --reload
```

`DATABASE_URL` нужно задавать явно: значение по умолчанию указывает на хост
`postgres`, который существует только внутри сети Compose.

### 3. Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Откроется http://localhost:5173. Запросы `/api/*` Vite проксирует на
`localhost:8000` — это уже настроено в `vite.config.js`.

---

## Миграции

```bash
# внутри Docker
docker compose exec backend uv run alembic upgrade head
docker compose exec backend uv run alembic current

# с хоста (нужен экспортированный DATABASE_URL, см. выше)
cd backend
uv run alembic upgrade head
uv run alembic revision -m "описание"
```

`--autogenerate` используйте осторожно и всегда читайте получившийся файл
перед применением.

---

## Частые команды

```bash
docker compose logs -f backend          # логи бэкенда
docker compose logs -f frontend nginx   # логи фронта и прокси
docker compose restart backend          # перезапустить один сервис
docker compose up -d --build backend    # пересобрать после правок бэкенда
docker compose down                     # остановить всё
docker compose down -v                  # остановить и СТЕРЕТЬ базу
```

Сброс базы с нуля (данные пропадут, админ создастся заново):

```bash
docker compose down -v && ./start.sh
```

---

## Грабли

**`sh: vite: Permission denied`, сборка падает с кодом 126.** Возникало, когда
в папке проекта лежал `node_modules`, установленный на хосте: `COPY . .`
затирал им то, что установил `npm install` внутри образа, и на системе без
права на исполнение (Windows, распакованный архив, флешка) `vite` переставал
запускаться. Лечится файлами `.dockerignore` в `frontend/` и `backend/` —
они уже в репозитории, отдельных действий не требуется. Если ошибка всё же
всплыла, соберите начисто:

```bash
docker compose build --no-cache frontend && ./start.sh
```

**`FATAL: database "itstek" does not exist`, бэкенд перезапускается по кругу.**
PostgreSQL создаёт базу из `POSTGRES_DB` только когда том с данными пуст. Если
том остался от прерванного первого запуска или от другого значения
`POSTGRES_DB`, `initdb` пропускается и база не появляется. Бэкенд теперь
создаёт её сам при старте, так что достаточно пересобрать образ:

```bash
docker compose up -d --build backend
```

Либо начисто: `docker compose down -v && ./start.sh` (⚠️ стирает все данные).
Либо руками, не теряя том:

```bash
docker compose exec postgres psql -U postgres -c 'create database itstek'
docker compose restart backend
```

**`address already in use`, контейнер не стартует.** Порт на хосте занят другой
программой. Запуск через Docker публикует наружу **только** порт сайта
(`APP_PORT`, по умолчанию 8080) — база наружу не выставляется специально, чтобы
проект поднимался и на машинах с локальным PostgreSQL. Если ошибка про 8080 —
впишите в `.env` другой порт:

```bash
echo "APP_PORT=8081" >> .env
./start.sh
```

**Порт 5432 может быть занят** — это касается только гибридного режима. Если на
машине уже стоит PostgreSQL (Homebrew, Postgres.app), он держит 5432, иногда и
5433. Docker при этом может спокойно написать `Started`, но подключение с хоста
уйдёт в чужую базу, и вы получите `FATAL: password authentication failed` с
*правильным* паролем. Симптом обманчивый: пароль ни при чём. Проверить, кто
отвечает:

```bash
docker compose stop postgres
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres   # отвечает — значит порт чужой
docker compose start postgres
```

Лечится свободным портом в `POSTGRES_PORT` (например, 55432).

**Миграции и `create_all` конфликтуют.** При старте приложение вызывает
`Base.metadata.create_all` (`backend/app/main.py`), поэтому на чистой базе
таблицы создаёт оно, а не Alembic: `alembic_version` остаётся пустым, и
следующая `alembic upgrade head` падает с «таблица уже существует». Новые
колонки при этом не добавляются вовсе — `create_all` не делает `ALTER`. Пока
лечится вручную (`alembic stamp` + `upgrade`); правильное решение — убрать
`create_all` и прогонять миграции при старте.

**`npm run lint` не работает.** ESLint 9 ждёт `eslint.config.js`, а его в
проекте нет. Сборка (`npm run build`) при этом проходит нормально.
