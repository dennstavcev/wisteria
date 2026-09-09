# Границы, решённые в спецификации

Код: C:/Users/Denn/claude_projects/visteria-website. База знаний: C:/Users/Denn/claude_projects/website_visteria. Код в базе знаний запрещён. Не менять apps/web, apps/admin, packages/ui-kit, бренд и анимацию — пользователь оставил дизайн Клоду.

| Модуль | Владеет | Выставляет | Прячет |
|---|---|---|---|
| db | вся схема, миграции, безопасная выборка каталога | schema, создание подключения, migrate | SQL и соединение |
| moysklad-client | транспорт JSON API 1.2 | клиент с пагинацией и ограничениями; внедряемый fetch | токен, backoff, таймеры |
| sync-worker | перенос каталога/остатков, журнал и курсор | запуск полного и инкрементального прогона, очередь | запись зеркала, расписание |
| api | публичные health/readiness и чтение каталога | HTTP с валидацией и белым списком полей | подключение к БД |
| infra | воспроизводимый локальный запуск и CI | compose и команды проверок | ресурсы сервисов |

Швы проверки: миграции на PostgreSQL, клиент через внедряемый транспорт, воркер через клиент и реальную тестовую БД, API через HTTP. Проверять ошибки, повторный прогон, отсутствие утечки закрытых полей и сохранность product_site.

## Общие правила

Node >=22, pnpm (имеющийся packageManager), TypeScript, NestJS, PostgreSQL16, Redis/BullMQ, Drizzle. Команды после таска01: pnpm install --frozen-lockfile; pnpm typecheck; pnpm test; pnpm build; pnpm lint. Версии проверять официальной документацией/реестром, фиксировать lockfile. Зависимости ставит оркестратор, исполнитель сообщает нужные либо просит оркестратора разрешить установку. Для первого инфраструктурного таска установка необходимых зависимостей разрешена пользователем через запрос разработки и оркестратором явно.

Не читать .env/значения секретов. Только пустые имена переменных в .env.example. Не обращаться к боевым сервисам. Не развёртывать production. Изменения только в зоне таска. Соседний репозиторий за границей writable root: используй require_escalated с конкретным обоснованием для необходимых записей/установки; не обходи sandbox. git -c safe.directory=C:/Users/Denn/claude_projects/visteria-website вместо изменения global config. Коммиты выполняет оркестратор после ревью.

Docker не обнаружен в PATH. Не считать тесты БД пройденными без запуска; допустим PostgreSQL-совместимый встроенный тестовый runtime с честным указанием границ проверки, отдельно подготовить тесты PostgreSQL16 для CI.

## Выявленные пробелы ТЗ

Роль florist не добавлять в staff_allowlist без решения пользователя; не открывать авторизацию. Структуру названных без колонок sessions/carts/analytics обосновать технически в docs. Для report_sales_daily сохранить дневную гранулярность, не записывать случайный order_id; source_documents обеспечивают детализацию. Системное авторство медиа обсудить техническим решением без фиктивного пользователя. Удалённые зеркала сохранять неактивными. freeStock не путать с quantity/reserve. Идентификаторы типов цен/настройки складов задаются конфигурацией без угадывания по именам.

## D01 — уточнение интеграции
Перед таском02 обязательно прочитать moysklad-source-check.md; он уточняет ошибочную трактовку stockType=quantity в ТЗ и реальные контракты остатков/изображений.

## Построено таском 01 — ожидает независимого ревью

@visteria/db: schema, createDatabase(connectionString) → {db,pool,query,transaction,close}, SqlExecutor, migrate(executor):Promise<void>, checkReadiness(executor):Promise<boolean>, listPublicProducts(executor,CatalogQuery):Promise<PublicProduct[]>.
@visteria/db/schema: именованные таблицы/enum Drizzle. SqlExecutor.query<T>(text,params?) → Promise<{rows:T[]}>. migrate требует выделенного соединения; CLI получает pool.connect/release. PublicProduct.id — id карточки сайта; деньги — строки. stock_levels CHECK available=quantity-reserved, воркер сохраняет согласованный снимок.

Команды: npx --yes pnpm@9.12.0 install --frozen-lockfile (CI=true); npx --yes pnpm@9.12.0 typecheck/test/build/lint. 4/4 теста PGlite; PostgreSQL16/Docker/CI ещё не запускались. Корневые scripts пока включают db/shared-types — нужно расширить на API и sync после реализации. Источники: docs/database-foundation.md, docs/local-development.md в репозитории кода.

## Совместная работа с Клодом — 08.09.2026
Пользователь передал дизайн Клоду. Не менять apps/web, apps/admin, packages/ui-kit, бренд, DESIGN.md/PRODUCT.md. Корневые манифесты и lockfile читать непосредственно перед точечной правкой; сохранять параллельные изменения. Синхронизировать установку backend-зависимостей единственным процессом.

## Таск01 принят — 08.09.2026, коммит 05c9fd0

Сигнатуры выше сохранены. 7/7 тестов проходят, typecheck/build/lint зелёные; оба независимых ревью закрыты. Timezone Europe/Moscow настроен в пуле, миграторе, Compose/CI. Непустые slug уникальны, несколько пустых разрешены. can_buy требует розничную цену; безопасный handler ошибок пула. Код зафиксирован локально от Codex (локальная служебная identity, пользовательские Git-настройки не менялись).

Установка следующих зависимостей только после сообщения оркестратору: исполнители меняют свои package.json, общий pinned pnpm install запускается одним процессом. Корневые конфиги/lockfile и фронтенд вне зон тасков02/03.

## Из таска 03 — бэкенд читает каталог (вернулся 09.09.2026, ждёт ревью)

`createApi(options): Promise<INestApplication>`; `ApiOptions {database: SqlExecutor; config?: Partial<ApiConfig>; log?: Log}`.
`readApiConfig(env): ApiConfig`, `ConfigError`; `ApiConfig {port; corsAllowedOrigins: readonly string[]; rateLimit {windowMs, limit}; trustProxy}`.
`parseCatalogQuery(raw): ParsedQuery`, `toPublicItem(PublicProduct): PublicCatalogItem`, `CatalogPage`, `ApiError(code, status, message)`, `LogEntry`/`Log`.

HTTP-контракт, на него опирается витрина:
- `GET /health` → 200 `{status:"ok"}`; `GET /ready` → 200 `{status:"ready"}` либо 503 `{status:"unavailable"}`. Обе вне rate-limit.
- `GET /catalog/products?limit=1..100(20)&offset=>=0(0)&categoryId=uuid` → 200 `{items, limit, offset}`. Неизвестные параметры игнорируются.
- Карточка в ответе — ровно 15 полей: id, title, descriptionHtml, slug, priceRetail, categoryId, images, badges, sortWeight, seoTitle, seoDescription, h1, available, canBuy, availability. `productId` и `moyskladId` вырезаны намеренно.
- Ошибка — `{error:{code, message, requestId}}`; коды invalid_query 400, not_found 404, too_many_requests 429, internal 500. Заголовок `X-Request-Id` есть в каждом ответе.
- Общего числа карточек в ответе нет: `listPublicProducts` счётчика не возвращает. Последняя страница определяется по `items.length < limit`. Нужен `total` — это правка @visteria/db, отдельным решением.

Имена переменных: DATABASE_URL, API_PORT, API_CORS_ORIGINS, API_RATE_LIMIT_WINDOW_MS, API_RATE_LIMIT_MAX, API_TRUST_PROXY. В корневом `.env.example` их ещё нет.
Счётчик rate-limit живёт в памяти процесса: несколько экземпляров за Caddy потребуют общего хранилища и `API_TRUST_PROXY`.
В `apps/api/tsconfig.json` включены `experimentalDecorators` и `useDefineForClassFields:false`; внедрение через `@Inject(RUNTIME)`, `emitDecoratorMetadata` не нужен.

## Из таска 02 — синхронизация МойСклад (вернулся 09.09.2026, ждёт ревью)

`CatalogSync(db: SyncDatabase, client: MoyskladClient, options: SyncOptions).run(kind: 'full_catalog'|'stock_incremental') → Promise<SyncRunResult{status, itemsProcessed, details}>`.
`SyncOptions {retailPriceTypeId, wholesalePriceTypeId, stores: Record<uuid,'retail'|'wholesale'>, now?, images?: ImageMirror, overlapMs?}`; `SyncDatabase = SqlExecutor + transaction`.
`fetchCatalog`/`applyCatalog`, `fetchStock`/`applyStock`, `formatMoscow(Date)`, `changedSinceFor(cursor, startedAt, overlapMs)`, `STOCK_CURSOR='stock_incremental'`.
Изображения: `ImageMirror {put(key, body, contentType)}`, `createS3ImageMirror(S3MirrorConfig) → ImageMirror & {close}`, `readImageSize(bytes)`.
Очередь: `SYNC_QUEUE='visteria-sync'`, `createSyncQueue(connection)`, `scheduleSync(queue, SyncSchedule)`, `createSyncWorker(connection, sync)` — concurrency 1, очередь отделена от API.
Единственное изменение в клиенте: `list<T>(path, limit=1000)`, лимит зажат в диапазон 1…1000.

D01 применён: `stock` → quantity, `freeStock` → available, `reserve` только сверкой. Поле quantity МойСклад не используется.
`stock_levels.reserved` считает Postgres как `quantity − available`: три показателя приходят тремя снимками, и CHECK по расхождению валил бы прогон. Расхождение отчёта по reserve копится в счётчике `reserveMismatch`, статус прогона partial.
`media_asset` требует width/height, МойСклад их не отдаёт: размеры читаются из заголовка файла PNG/JPEG/GIF/WebP, нераспознанный формат пропускается со счётчиком.
`MOYSKLAD_IMAGE_HOSTS` без значения означает, что зеркалирование изображений выключено. Реальный хост файлового хранилища МойСклад без аккаунта не подтверждён.

Имена переменных: MOYSKLAD_RETAIL_PRICE_TYPE_ID, MOYSKLAD_WHOLESALE_PRICE_TYPE_ID, MOYSKLAD_STORES, MOYSKLAD_IMAGE_HOSTS, S3_REGION, SYNC_FULL_CATALOG_CRON, SYNC_STOCK_INTERVAL_MS. В корневом `.env.example` их ещё нет.
Не проверено локально и записано в README: PostgreSQL 16, Redis и BullMQ, реальные ответы МойСклад, запись в S3. Очередь и runner покрыты только typecheck и build.

## Из таска 04 — корневой .env.example, 09.09.2026

Все имена, которые читает код, теперь в корневом `.env.example`, значений нет ни у одного.
Порядок разделов: база, API, МойСклад, хранилище изображений, очередь и расписание, затем имена из ТЗ,
которые кодом пока не читаются (TOTP, Сбербанк, Telegram, VK) — они помечены честно.
`TEST_DATABASE_URL` читает только тест `packages/db/test/database.test.ts` и CI, а не рантайм; помечена необязательной.
Умолчания расписания в `.env.example` намеренно не повторяются: единственный источник — `DEFAULT_SCHEDULE` в `apps/sync-worker/src/queue.ts`.
Заводя новую переменную, вписывай имя сюда же — корень теперь принадлежит этому таску, а не «никому».

## Дозапрос по таску 02 — принят 09.09.2026, коммит f8d9b38

`isAuthError(error): boolean` в `apps/sync-worker/src/errors.ts`.
`SyncRunner {run(kind): Promise<SyncRunResult>}`, `syncProcessor(sync)`, `PausableQueue {pause(): Promise<void>}`, `JobFailures {on('failed', listener)}`, `haltScheduleOnAuth(worker, queue, report?): void` в `apps/sync-worker/src/queue.ts`.
Остальные сигнатуры прежние.

`S3_REGION` идёт через `required()` наравне с остальными `S3_*`: значения по умолчанию нет.
Ошибка авторизации ставит расписание на паузу в настоящем runner и отменяет оставшиеся попытки через `AuthStop extends UnrecoverableError`. Пауза живёт в Redis и снимается стартом процесса: после перевыпуска токена сервис перезапускает оператор.
`syncImages` пробрасывает отказ базы и ошибку авторизации наружу; в счётчик `imagesFailed` попадают только сбои скачивания и зеркалирования.

## Из таска 05 — публичный контракт API приведён в порядок (09.09.2026, ждёт ревью)

Заменяет часть раздела «Из таска 03». Витрина подключается к этому, а не к прежнему описанию.

- Кодов ошибок ровно четыре: `invalid_query` 400, `not_found` 404, `too_many_requests` 429, `internal` 500. `invalid_request`, `method_not_allowed` и запасной `error` из ответа исчезли; статус вне таблицы отдаётся как 500 `internal`.
- Элемент `items[].images` теперь `{storageKey: string, alt: string|null, variants: object}`. Поля файла — `key`, `mime`, `bytes`, `filename`, `width`, `height` — наружу не уходят, элемент без ключа отбрасывается.
- CORS отвечает раньше лимита: заголовок есть и на 429. Preflight `OPTIONS` бюджет лимита не расходует вообще.
- В журнале `code` несёт код (`invalid_config`, `startup_failed`), текст ушёл в отдельное поле `message`.
- Новые экспорты `apps/api`: `ERROR_CODES`, `ErrorCode`, `errorResponse(exception, requestId)`, `statusResponse(status, requestId)`, `PublicImage`, `startupFailure(error): LogEntry`.

Зеркало МойСклад пишет ключ файла полем `key`, карточка сайта — `storageKey`; API сводит их к одному имени, связь закреплена тестом на обеих ветках представления.
`width` и `height` в публичное изображение не попадают: `v_product_public` их для ручной галереи не отдаёт. Понадобятся витрине — это правка `packages/db`.

## Из таска 06 — запуск воркера и утверждения остатков (09.09.2026, ждёт ревью)

Воркер запускается: `ioredis` 5.11.1 вписан в `apps/sync-worker`. Это необязательная peer-зависимость `bullmq`, и без явного объявления в манифесте она не резолвится — процесс умирал в `createSyncQueue` до расписания. Ни один тест с подставной очередью такого не ловит по построению.

`StockCounters.negativeReserved` — несогласованный снимок: строка не пишется, растёт счётчик, прогон получает статус `partial`. Добавлен в `DEGRADED`.
Величины разных снимков больше не смешиваются молча. Выбрано направление «счётчик и partial», а не «пишем и надеемся на CHECK».

В `src/stock.ts` были три сырых байта NUL как разделитель ключа карты: git считал файл бинарным и не показывал диффа, то есть правку нельзя было отревьюить. Заменены на escape-последовательность, поведение то же.

Проверено мутацией: подмена `stockType` со `stock` на `quantity` красит четыре теста, включая утверждение D01. Формат `changedSince` сверяется с литеральной строкой, а не с результатом той же функции.
