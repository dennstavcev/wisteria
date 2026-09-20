# Контракт данных: опт

Читайте этот файл только для задач оптового направления.

`wholesaleRepo`: `createRequest`, `get`, `list`,
`decide(id, 'approved'|'rejected', decidedBy, comment?)`,
`issueAccess(requestId, token, ttlDays)`, `resolveAccess(token)`, `revokeAccess(token)`,
`listPrice()` (весь опубликованный прайс с `priceWholesale`, без лимита — таск 07, 20.09.2026).
`decide` принимает только заявку в `pending`; иначе бросает `WholesaleRequestDecided`.
В базе хранится только sha256 токена, не сам токен.

Первый аргумент методов данных — `executor: SqlExecutor`; транзакцию открывает вызывающий.
Деньги передаются строками. Таблица `wholesale_request` и поля связи сессии уже существуют;
схему без отдельного обоснования не расширять.


## Из таска 07 — опт (принят 20.09.2026, коммит `2e1f4b2`)

Конфигурация API: `WHOLESALE_MINIMUM_ORDER` (пусто — видимая заглушка «[МИНИМАЛЬНАЯ ПАРТИЯ ОПТА —
впишет заказчик]»), `WHOLESALE_ACCESS_TTL_DAYS` (по умолчанию 180). Срок ответа менеджера —
константа-заглушка `RESPONSE_TERM_PLACEHOLDER` в `apps/api/src/wholesale/config.ts`.
`GET /wholesale/price` → `{access:{status: request_required|approved|expired, expiresAt}, minimumOrder,
items, exports}`; до одобрения `items` без `priceWholesale`, `exports` пусты. Одобрение и `issueAccess`
идут в одной транзакции; в `sessions` только sha256 токена, `purpose='client'`. Витрина: `/opt`,
прокси выгрузок `/opt/price/[format]`; управленка: вкладка «Опт», ссылка складывается с
`VITE_STOREFRONT_ORIGIN`. PDF — `pdfkit` со встроенным DejaVu Sans; Excel — ручной OOXML.
