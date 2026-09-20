# Контракт данных: заказы

Читайте этот файл только для задач, которые создают, обновляют или сверяют заказы.

`orderRepo`: `create(OrderInput)` идемпотентно по `syncId`, `get(id)`,
`getBySyncId(syncId)`, `getByNumber(number)`, `list(OrderQuery)`,
`setStatus(id, status, {moyskladOrderId?, courierDispatchNote?})`.

Отказ — `OrderRejected` с кодом `empty_order`, `invalid_quantity`, `not_purchasable`
или `insufficient_stock`. Первый аргумент методов данных — `executor: SqlExecutor`;
транзакцию открывает вызывающий. Деньги передаются строками.

Таблица `webhook_events` уже существует. Новая таблица или колонка допустима только с
обоснованием, почему существующей структуры не хватает.

## Из таска 09 — статусы заказа (принят 20.09.2026, коммит `87b9852`)

`POST /webhooks/moysklad?token=<MOYSKLAD_WEBHOOK_TOKEN>&requestId=<moysklad-request-id>`
принимает реальный формат МойСклад `payload.events[].meta/action`. Токен в query — явная мера
подлинности из-за отсутствия документированной HMAC/custom-header подписи у JSON API webhook;
логи приложения пишут path без query.

Статус не доверяется телу webhook: API передаёт чтение в принятый worker-контур
`createMoyskladOrderStateReader(options?)`, который через `@visteria/moysklad-client` читает
`entity/customerorder?expand=state&filter=id=<uuid>`. Локальный статус меняется только после
сопоставления `state.name` через `MOYSKLAD_ORDER_STATUS_MAP`.

`processMoyskladWebhookStatus(executor, requestId, payload, events)` записывает webhook
идемпотентно по `requestId`. `listOrdersForStatusPoll(executor, {limit, after?})` проходит
связанные non-terminal заказы пачками; `setOrderStatusFromMoysklad(executor, orderId, status)`
применяет результат. Unknown events сохраняются в `webhook_events` с `processed=false` и не
меняют `orders.status`.
