СДЕЛАНО: SQL записи webhook/idempotency/status update вынесен в packages/db; polling проходит все связанные non-terminal заказы пачками и читает МойСклад через expand=state.
ФАЙЛЫ: готово в packages/db/src/order-status-map.ts, packages/db/src/index.ts, apps/sync-worker/src/orders/index.ts, apps/sync-worker/test/order-status.test.ts; начато в apps/api/src/webhooks/index.ts и apps/api/src/app.ts.
РЕШЕНИЯ: limit в order_status_poll теперь размер пачки одного прохода, а не общий потолок, чтобы не зависать на первых 100 заказах навсегда.
РЕШЕНИЯ: unknown webhook/status events сохраняются в webhook_events с processed=false и не меняют orders.status; незавершённый requestId можно обработать повтором.
РЕШЕНИЯ: статус МойСклад сопоставляется только через MOYSKLAD_ORDER_STATUS_MAP по точному state.name; alias и названия не угадываются.
ТУПИКИ: попытка заменить HMAC на secret query + User-Agent была отклонена системой как риск утечки секрета в URL-логах; обход не делался.
ТУПИКИ: у МойСклад webhook в найденной документации есть requestId query и payload events[].meta/action, но нет документированной подписи/custom header для проверки подлинности.
ДАЛЬШЕ: выбрать и согласовать безопасный способ подлинности реального webhook без секрета в URL либо явно принять URL-secret риск.
ДАЛЬШЕ: после решения auth обновить apps/api/src/webhooks/index.ts и apps/api/test/webhooks.test.ts под окончательный контракт МойСклад.
ДАЛЬШЕ: снова выполнить pnpm build, затем pnpm --filter @visteria/api exec tsx --test test/webhooks.test.ts и pnpm --filter @visteria/sync-worker exec tsx --test test/order-status.test.ts.
