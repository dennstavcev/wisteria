# Контракт подсистемы: data access

Читайте этот файл только когда он указан в тикете в разделе «Контекст интерфейсов».

## Из таска 01 — слой данных и доступ (09.09.2026, ждёт ревью)

Первый аргумент везде `executor: SqlExecutor`. Деньги — строки. Транзакцию открывает вызывающий.

**Каталог:** `listPublicProducts(CatalogQuery)`, `getPublicProduct(slug)`, `getPublicProductBySiteId(siteId)`, `listPublicCategories()`, `listSimilarProducts(siteId, limit=4)`, `listStoreAvailability(moyskladId)`.

**`cartRepo`:** `create(userId?)`, `get(cartId)`, `getForUser(userId)`, `addItem(cartId, productId, qty)`, `setQuantity(cartId, productId, qty)`, `setQuantityIfCurrent(cartId, productId, qty, expected)`, `removeItem(cartId, productId)`, `clear(cartId)`, `attachUser(cartId, userId)`.

`setQuantityIfCurrent` дописан таском 04 (11.09.2026): критерий «две вкладки одного покупателя не
затирают друг друга молча» невыразим через `setQuantity`, который всегда перезаписывает.
Отдаёт `{applied: true, mutation}` либо `{applied: false, cart, current}` — версия разошлась,
и чужое изменение осталось нетронутым.

`addItem` прибавляет к уже лежащему ОДНИМ оператором (`ON CONFLICT DO UPDATE` считает сумму
под блокировкой строки): два одновременных «в корзину» дают две штуки. Транзакция для этого
не нужна, и `SqlExecutor` остаётся тем же одиночным запросом — вызывающему её открывать незачем.

**Деньги корзины считаются один раз и только здесь.** `packages/db/src/cart.ts`, выражение
`PAYABLE`: оплачиваемое количество позиции — `least(quantity, остаток)`, у непродаваемого товара
ноль. `CartLine.payable`, `CartLine.lineTotal` (цена × `payable`) и `CartView.subtotal` (сумма
`lineTotal`) приходят посчитанными из SQL; `apps/api` и витрина их только показывают.
**Оформление заказа берёт к оплате `CartView.subtotal` и позиции по `payable`, а не по `quantity`**
— иначе покупателю выставят счёт за букет, который кончился, пока он думал. Второго определения
оплачиваемой суммы в проекте нет; заводить его в `checkout` нельзя.

**`orderRepo`:** `create(OrderInput)` — идемпотентно по `syncId`, `get(id)`, `getBySyncId(syncId)`, `getByNumber(n)`, `list(OrderQuery)`, `setStatus(id, status, {moyskladOrderId?, courierDispatchNote?})`. Отказ — `OrderRejected` с кодом `empty_order`, `invalid_quantity`, `not_purchasable`, `insufficient_stock`.

**`wholesaleRepo`:** `createRequest`, `get`, `list`, `decide(id, 'approved'|'rejected', decidedBy, comment?)`, `issueAccess(requestId, token, ttlDays)`, `resolveAccess(token)`, `revokeAccess(token)`. **В базе лежит только sha256 токена, не сам токен.**

**`contentRepo`:** `list(AdminProductQuery)`, `get(siteId)`, `getByMoyskladId(ms)`, `ensure(ms, userId)`, `update(siteId, patch, userId, comment?)`, `publishCheck(siteId)` → `{ok, blocking: no_mirror|no_price|no_slug|no_photo, warnings: no_description|no_seo}`, `setPublished`, `setArchived`, `revisions(entityType, entityId, {limit, offset})`, `rollback(revisionId, userId)`.

**`mediaRepo`:** `create`, `get`, `update(id, {alt?, focalPoint?, variants?})`, `softDelete`, `listImages(siteId)`, `attach(siteId, assetId, position?)`, `detach`, `reorder(siteId, assetIds[])`.

**Доступ, `apps/api/src/access`:** `requireRole(actual, allowed[])` → роль либо `AccessDenied`; `serialize(kind, entity, role)`, `serializeMany(kind, entities, role)`, `allowedFields(kind, role)`, `ROLE_FIELDS`. Виды сущностей: `product`, `order`, `orderLine`, `cart`, `cartLine`, `customer`, `wholesaleRequest`, `mediaAsset`, `revision`.

Сигнатура именно `serialize(kind, entity, role)`, а не `serialize(entity, role)`: белый список задан по виду сущности, а сущность о себе этого не сообщает. Вложенные списки — `order.items`, `cart.items` — режутся своим списком, иначе цена покупки уехала бы наружу внутри позиции.

**`requireRole` закрыт по умолчанию:** пустая роль получает отказ. Кто заполняет роль актора в запросе — вопрос тасков эндпойнтов, здесь не решён. Таски 03 и 05, это ваш вопрос.

### Права на запись — контракт для эндпойнтов управленки

Белые списки выше описывают только **чтение**: какие поля уходят наружу. Кому позволено эти поля **менять** — второй контракт, в том же модуле `apps/api/src/access`. Своего разграничения эндпойнтам не придумывать: и `contentRepo.update`, и `contentRepo.rollback` принимают любой патч, поэтому право спрашивается здесь или не спрашивается нигде.

```ts
type ContentWrite = 'card.edit' | 'card.publish' | 'card.unpublish' | 'card.archive' | 'card.slug' | 'card.seo'
  | 'collection.edit' | 'landing.edit' | 'badge.manage' | 'revision.rollback';
CONTENT_WRITE: Readonly<Record<ContentWrite, readonly ActorRole[]>>
requireWrite(action: ContentWrite, actual: UserRole | null | undefined): ActorRole  // роль либо AccessDenied
canWrite(action: ContentWrite, actual: UserRole | null | undefined): boolean        // только для отрисовки
actionsForPatch(patch: object): ContentWrite[]                                      // без повторов, отсортированы
requirePatch(patch: object, actual: UserRole | null | undefined): ActorRole
```

| Действие | Репозиторий | `florist` | `manager` | `admin` |
|---|---|---|---|---|
| `card.edit` — карточка, фото, бейджи на ней, `sort_weight` | `contentRepo.update`, `mediaRepo.*` | да | да | да |
| `card.publish` | `setPublished(true)` | да | да | да |
| `card.unpublish` | `setPublished(false)` | **нет** | да | да |
| `card.archive` | `setArchived` | **нет** | да | да |
| `card.slug` — адрес страницы | `update({slug})` | **нет** | да | да |
| `card.seo` — `seoTitle`, `seoDescription`, `h1` | `update({seo*, h1})` | **нет** | да | да |
| `collection.edit` — подборки | таск подборок | да | да | да |
| `landing.edit` — лендинги, блоки главной, блог | таск контента | **нет** | да | да |
| `badge.manage` — завести или переименовать бейдж | таск бейджей | **нет** | да | да |
| `revision.rollback` | `contentRepo.rollback` | **нет** | да | да |

Значения — таблица прав `18_admin-catalog-content.md` §12, строка в строку. Чтение журнала изменений — тоже строка §12, но она уже выражена белым списком `revision`, открытым всем трём ролям, и второй раз не заводится.

**Патч разбирается по полям.** Правка карточки — один вызов с произвольным набором полей, и «флористу нельзя менять slug» иначе невыразимо: отдельного эндпойнта под slug нет. `actionsForPatch` переводит `ProductSitePatch` в права: `title`, `descriptionHtml`, `badges`, `sortWeight` → `card.edit`; `slug` → `card.slug`; `seoTitle`, `seoDescription`, `h1` → `card.seo`.

**Закрыто по умолчанию, как и чтение.** Поле, не названное в этой таблице, не пишет никто — `actionsForPatch` отвечает `AccessDenied` даже администратору. Новое поле слоя сайта приходит закрытым, и открыть его можно только вписав строку в `PATCH_WRITE`.

Эндпойнт управленки спрашивает оба контракта: `requireWrite`/`requirePatch` — можно ли писать, `serialize(kind, entity, role)` — что вернуть в ответе.

### Шесть изменений схемы, каждое обосновано в шапке миграции `0003_storefront_stage2.sql`

Список здесь и нумерованный список в шапке миграции — одно и то же, слово в слово.
Изменение, которого нет в обоих, считается незаявленным.

1. `carts.user_id` стал необязательным: гость не заводится в `users`.
2. `orders` получили контакты гостевого заказа и адрес текстом: `addresses.user_id` обязателен, адрес гостя туда не ложится.
3. `orders.card_text` отдельно от `comment`: открытка печатается, пожелание читает менеджер.
4. Индекс `orders_status_time` на `orders (status, created_at)`: `orderRepo.list` только так заказы и читает — отбор по статусу, сортировка по времени; без индекса каждое открытие экрана управленки идёт полным проходом по таблице, которая растёт и не чистится.
5. Новая таблица `wholesale_request` — с индексом `wholesale_request_status_time` и проверкой `wholesale_decision_complete`: в схеме был только флаг `users.wholesale_status`, а компании, ИНН, объёму и автору решения места не было.
6. `sessions.user_id` стал необязательным, добавлены `wholesale_request_id` и проверка «субъект обязателен»: форма заявки не даёт ни Telegram, ни VK, а идентичность пользователя их требует.

Флористу отдаётся розничная цена — она и так на витрине — но не оптовая.
Имена дополнительных полей МойСклад для повода, состава и цвета приходят из конфигурации.
Незнакомое имя даёт пустую выдачу, и это зафиксировано тестом.
