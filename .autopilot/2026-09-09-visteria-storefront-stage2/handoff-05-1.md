СДЕЛАНО: HTTP редактора: чтение двух слоёв, PATCH с серверными правами, публикация, preview, журнал и rollback.
СДЕЛАНО: Потоковый upload через внедряемый MediaStorage, лимит 25 МБ, server key, cleanup при сбое БД.
СДЕЛАНО: UI редактора, автосохранение и localStorage draft, источники полей, счётчики, бейджи, preview, журнал.
ФАЙЛЫ: apps/api/src/admin/controller.ts, editor.ts, media-storage.ts, index.ts готовы и typecheck зелёный.
ФАЙЛЫ: apps/api/src/app.ts только прокидывает optional mediaStorage в AdminRuntime.
ФАЙЛЫ: apps/api/test/admin-editor.test.ts — один файл, четыре HTTP-сценария; apps/admin/src/editor.tsx и media-queue.ts готовы.
РЕШЕНИЯ: Фото идёт сырым image stream, не JSON/base64; MediaStorage фиксирует объект атомарно до записи media_asset.
РЕШЕНИЯ: Файл очереди хранится в IndexedDB и повторно отправляется при событии online; роль в UI не является защитой.
РЕШЕНИЯ: Preview читает getPublicProductBySiteId, поэтому неопубликованный черновик честно не маскируется под витрину.
ТУПИКИ: Обычный tsx на хосте падает uv_os_get_passwd ENOMEM; filter exec дополнительно не видит tsx bin.
ТУПИКИ: Vite build после зелёного tsc не читает каталог выше workspace из-за sandbox Access denied.
ТУПИКИ: Временный os.userInfo preload запускает all-api test дольше 30 секунд без доступного финального вывода.
ДАЛЬШЕ: Прогнать admin-editor.test.ts у оркестратора, исправить runtime-падения и подтвердить точное число тестов.
ДАЛЬШЕ: Записать content_revision для attach/detach/reorder/alt/focus и закрыть lifecycle исчезнувшего товара.
ДАЛЬШЕ: Добавить защищённое manager/admin редактирование badge, затем admin build и финальный отчёт тикета 05.
