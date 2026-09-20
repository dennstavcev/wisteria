# Контракт данных: опт

Читайте этот файл только для задач оптового направления.

`wholesaleRepo`: `createRequest`, `get`, `list`,
`decide(id, 'approved'|'rejected', decidedBy, comment?)`,
`issueAccess(requestId, token, ttlDays)`, `resolveAccess(token)`, `revokeAccess(token)`.
В базе хранится только sha256 токена, не сам токен.

Первый аргумент методов данных — `executor: SqlExecutor`; транзакцию открывает вызывающий.
Деньги передаются строками. Таблица `wholesale_request` и поля связи сессии уже существуют;
схему без отдельного обоснования не расширять.
