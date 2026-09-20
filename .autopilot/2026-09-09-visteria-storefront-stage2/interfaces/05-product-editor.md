# Контракт подсистемы: product editor

Читайте этот файл только когда он указан в тикете в разделе «Контекст интерфейсов».

## Из таска 05 — управленка: карточка товара, фото, публикация, журнал (13.09.2026, код зелёный, ждёт финальное ревью)

Эндпойнты карточки: `GET /admin/products/:id`, `GET /admin/products/:id/preview`,
`PATCH /admin/products/:id`, `POST /admin/products/:id/publish`,
`POST /admin/products/:id/archive`, `POST /admin/products/:id/restore`,
`GET /admin/products/:id/revisions`,
`POST /admin/products/:id/revisions/:revisionId/rollback`.

Медиа карточки: `POST /admin/media?productSiteId&uploadId&filename&width&height&source&alt`,
`PATCH /admin/products/:siteId/media/:assetId`, `DELETE /admin/products/:siteId/media/:assetId`,
`PATCH /admin/products/:siteId/media-order`. `uploadId` обязателен и входит в `storageKey`;
`media_asset.storage_key` уникален миграцией `0006_media_asset_storage_key_unique.sql`, поэтому
повтор или конкурентный upload с тем же client id возвращает один asset и одну связь карточки.
Production-хранилище берёт корень из `MEDIA_STORAGE_ROOT`, пишет через временный файл и атомарное
переименование; тесты подставляют `MediaStorage`.

Публикация не правит зеркало МойСклад и не публикует исчезнувший товар: inactive mirror снимает
публикацию, сохраняет человеческий контент и блокирует повторную публикацию русской причиной.
Флорист правит `card.edit`, включая `badges` и `sortWeight`, но не `slug`, SEO, снятие публикации,
архив и rollback. CRUD бейджей (`GET/POST/PATCH/DELETE /admin/badges`) открыт менеджеру и админу;
флорист только выбирает активные бейджи из справочника.
