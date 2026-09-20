# Общий контракт Этапа 2

Читайте этот файл только когда он указан в тикете в разделе «Контекст интерфейсов».

Код: `C:/Users/Denn/claude_projects/visteria-website`.
База знаний и ТЗ: `C:/Users/Denn/claude_projects/website_visteria`. Кода в базе знаний быть не должно.

## Границы, решённые в спецификации

| Модуль | Владеет | Выставляет | Прячет |
|---|---|---|---|
| `packages/db` | вся схема и запросы к ней | `listPublicProducts`, `getPublicProduct`, `cartRepo`, `orderRepo`, `wholesaleRepo`, `contentRepo`, `mediaRepo` | SQL и соединение |
| `apps/api` — `catalog` | публичное чтение каталога | `GET /catalog/products`, `GET /catalog/products/:slug`, `GET /catalog/categories` | белый список полей |
| `apps/api` — `cart` | корзина и её правила | `GET/POST/PATCH/DELETE /cart` | привязку к cookie, пересчёт сумм |
| `apps/api` — `checkout` | создание заказа | `POST /checkout` | валидацию, идемпотентность, постановку в очередь |
| `apps/api` — `wholesale` | заявки и доступ опта | `POST /wholesale/request`, `GET /wholesale/price`, `GET /wholesale/price.xlsx`, `GET /wholesale/price.pdf`, `GET /admin/wholesale`, `POST /admin/wholesale/:id/decision` (выгрузки и список добавлены таском 07, 20.09.2026) | выдачу и проверку ссылки |
| `apps/api` — `admin` | управление карточкой и медиа | `GET/PATCH /admin/products`, `POST /admin/media`, `POST /admin/products/:id/publish`, `GET /admin/products/:id/revisions` | правило приоритета полей, запись ревизий |
| `apps/api` — `webhooks` | приём событий МойСклад | `POST /webhooks/moysklad` | идемпотентность, проверку подлинности |
| `apps/api` — `access` | роли и сериализация | `requireRole()`, `serialize(entity, role)` | белые списки полей по ролям |
| `apps/sync-worker` — `orders` | обратная запись и сверка статусов | задания `order_push`, `order_status_poll` | контракт документов МойСклад |
| `apps/web` | экраны витрины, кроме главной | `/catalog`, `/catalog/[slug]`, `/cart`, `/checkout`, `/opt`, `/legal` | обращение к бэкенду |
| `apps/admin` | экраны управленки | приложение управленки | обращение к бэкенду |

**Швов для проверок три, и все уже существуют:** HTTP бэкенда, репозитории `packages/db` на
настоящем PostgreSQL, внедряемый транспорт МойСклад. Новых швов не заводить.

## Что построено Этапом 1 и переиспользуется

`@visteria/db`: `createDatabase(connectionString)` → `{db, pool, query, transaction, close}`,
`SqlExecutor`, `migrate(executor)`, `checkReadiness(executor)`,
`listPublicProducts(executor, CatalogQuery)`. Деньги — строки. `PublicProduct.id` — id карточки сайта.

`@visteria/moysklad-client`: `MoyskladClient` с Bearer, gzip, пагинацией по `nextHref`,
ограниченными повторами на 429 и 5xx, паузой на 401/403, `list<T>(path, limit=1000)`,
`stock(type, changedSince)`, безопасным `download` по белому списку хостов.

`@visteria/sync-worker`: `CatalogSync.run('full_catalog' | 'stock_incremental')`, очередь
`visteria-sync` на BullMQ, concurrency 1, `haltScheduleOnAuth`. **Синхронизация принята и
закоммичена — не переписывать.**

`@visteria/api`: `createApi({database, config, log})`, `GET /health`, `GET /ready`,
`GET /catalog/products`. Коды ошибок ровно четыре: `invalid_query` 400, `not_found` 404,
`too_many_requests` 429, `internal` 500. Ответ ошибки — `{error:{code, message, requestId}}`,
заголовок `X-Request-Id` в каждом ответе. CORS отвечает раньше лимита запросов.
Элемент `images` в публичном ответе — `{storageKey, alt, variants}`, метаданные файла наружу
не уходят.

**Схема базы создана целиком.** `orders`, `order_items`, `carts`, `cart_items`, `cart_events`,
`users`, `sessions`, `addresses`, `webhook_events`, `content_revision`, `media_asset`,
`product_site_image`, `badge`, `promo_codes` уже есть и стоят пустыми. Этап 2 их наполняет.
Новая таблица или колонка — только с обоснованием «почему существующей не хватило», в CONCERNS.

## Общие правила проекта

Node ≥22, pnpm 9.12.0, TypeScript, NestJS в бэкенде, Next.js 15 и Tailwind v4 на витрине,
React и Vite в управленке, PostgreSQL 16, Redis и BullMQ, Drizzle.

Команды: `pnpm install --frozen-lockfile`, `pnpm build` (обязательно до тестов — пакеты
экспортируют JS из `dist`), `pnpm typecheck`, `pnpm test`, `pnpm lint`.
Один файл тестов: `pnpm --filter <пакет> exec tsx --test test/<имя>.test.ts`.

Docker в системе есть. `pnpm infra:up` поднимает Redis и PostgreSQL, но порт 5432 бывает занят
чужим контейнером — тогда поднимай `postgres:16-alpine` на другом порту и передавай
`TEST_DATABASE_URL`. Это не отсутствие Docker.

## Чего не трогать никому

- **Главная страница витрины, бабочки, бренд, шрифты, `DESIGN.md`, `PRODUCT.md`,
  `packages/ui-kit`** — зона Клода, работа не закончена. Решение пользователя 09.09.2026.
- **`products`** — зеркало МойСклад, перезаписывается синхронизацией целиком. Правки руками
  там не выживают и падают молча. Всё человеческое пишется в `product_site`.
- Колонки `images[]` в `product_site` нет: фото связаны только через `product_site_image`.
- Корневые `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.base.json`,
  `eslint.config.mjs`, `.github/`, `.env.example`, `CLAUDE.md` — вне зон тасков.
  Новое имя переменной сообщается оркестратору, он вписывает.
- Значения секретов не читать и не писать. Только имена. В боевой МойСклад не ходить.

Не хватает зависимости — не ставь сам: верни `BLOCKED` или назови её в CONCERNS,
общий install запускает оркестратор одним процессом. Коммиты делает оркестратор после ревью.

## Из таска 11 — контролируемые ошибки (21.09.2026)

- Кодов ошибок семь: добавлен `not_configured` (503) — `POST /webhooks/moysklad` без `MOYSKLAD_WEBHOOK_TOKEN`.
- Правило ИНН одно: `@visteria/shared-types` → `INN_PATTERN`, `isInn(raw)`, `normalizeInn(raw)`; используют API, серверное действие и форма `/opt`.
- `apps/api` зависит от `@visteria/sync-worker` (`exports` `.` и `./orders`) ради reader-а статусов; `GET /wholesale/price` без поля `exports`.
- `ensure` → 404 на неизвестный `moyskladId`; корзина: `quantity` > int4 → 400 `invalid_query`; ранее назначенный неактивный бейдж не блокирует патч карточки.
