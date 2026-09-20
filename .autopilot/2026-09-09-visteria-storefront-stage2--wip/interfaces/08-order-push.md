# Контракт подсистемы: order push

Читайте этот файл только когда он указан в тикете в разделе «Контекст интерфейсов».

## Из таска 08 — запись заказа в МойСклад (13.09.2026, принят, коммит `1d8a519`)

`MoyskladClient` выставляет запись документов: `post<T>(path: string, body: unknown): Promise<T>`
и `put<T>(path: string, body: unknown): Promise<T>`. Значения секретов и идентификаторов
не зашиваются; организация берётся по имени переменной `MOYSKLAD_ORGANIZATION_ID`.

`apps/sync-worker/src/orders` выставляет `OrderPush.run({orderId, orderNumber, idempotencyKey})`,
но identity документа МойСклад (`externalCode` и имя) берёт только из сохранённого
`orders.order_number`; произвольные поля job не создают второй документ. `post`/`put` мутации
в клиенте МойСклад не ретраятся вслепую: повтор задания сначала ищет документ по `externalCode`.

`enqueuePendingOrderPushes(db, queue, limit = 100): Promise<number>` восстанавливает сохранённые
заказы `new` без `moysklad_order_id` и кладёт `order_push` со стабильным `jobId`. Runner вызывает
recovery при старте и каждые `ORDER_PUSH_RECOVERY_INTERVAL_MS` (по умолчанию 180000).
Успешный push сохраняет только `orders.moysklad_order_id`, локальный бизнес-статус не меняет:
статусы приходят в таске 09 через webhook/polling. `courierDispatchNote` входит в описание
нового `customerorder` и обновляет описание существующего документа через `PUT`.
