# Схема базы данных сайта

Назначение БД сайта — не дублировать МойСклад "как есть", а хранить: (а) быстрый кэш каталога/остатков для витрины, (б) операционные данные, которых в МойСклад нет (пользователи сайта, сессии, избранное, корзины, аналитика показов), (в) журнал синхронизации.

## 1. Каталог (кэш из МойСклад)

**products** — кэш товаров
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | внутренний id |
| moysklad_id | uuid (unique) | id товара в МойСклад (`entity/product`) |
| name | text | |
| slug | text (unique) | для человекочитаемых URL |
| description | text | |
| category_id | uuid (FK → categories) | |
| price_retail | numeric | розничная цена (из прайс-листа МойСклад) |
| price_wholesale | numeric, nullable | оптовая цена (доступна только B2B-клиентам) |
| images | jsonb | ссылки на изображения (зеркалированы в S3) |
| attributes | jsonb | доп. поля из МойСклад (цвет, повод, состав и т.п.) |
| is_active | boolean | скрыт/показан на сайте (архивные товары МойСклад не показываем) |
| updated_at | timestamptz | момент последней синхронизации |

**`products` — зеркало МойСклад, людьми не редактируется.** Пишет в эту таблицу только синхронизатор; при каждом цикле синка строка перезаписывается целиком. Любая ручная правка здесь живёт до ближайшей синхронизации и исчезает молча. Редактируемая человеком часть карточки — отдельная таблица `product_site` (§8), связь по `moysklad_id`, витрина читает представление `v_product_public` (§9). **Почему так**: см. `18_admin-catalog-content.md` §1.1 — схема с одной таблицей и флагом «не перезаписывать» требует проверки флага в каждом месте синхронизатора, и первый же пропустивший её код стирает работу флориста без ошибки и без записи в `sync_log`.

Цена, остаток, категория и наличие остаются за `products` целиком: соответствующих полей в `product_site` нет физически, и добавлять их нельзя (`18_admin-catalog-content.md` §1.3).

**categories** — кэш групп товаров (`productfolder`)
| Поле | Тип |
|---|---|
| id | uuid (PK) |
| moysklad_id | uuid (unique) |
| parent_id | uuid, nullable (FK → categories) |
| name | text |
| slug | text |
| sort_order | int |

**stock_levels** — остатки по складам (обновляется чаще всего)
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) |
| product_id | uuid (FK → products) |
| store_id | uuid (FK → stores) |
| quantity | numeric | физический остаток |
| reserved | numeric | зарезервировано |
| available | numeric | доступно к продаже (quantity − reserved) |
| updated_at | timestamptz | |

Индекс: `(product_id, store_id)` unique — быстрый апдейт при синке.

**stores** — склады/точки (соответствуют `entity/store` в МойСклад)
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) |
| moysklad_id | uuid (unique) |
| name | text | напр. «Розница — Островского, 19а» |
| type | enum(retail, wholesale) | |
| address | text | |
| supports_pickup | boolean | доступен ли самовывоз с этого склада |
| working_hours | jsonb | |

## 2. Пользователи и доступ

**users**
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) |
| telegram_id | bigint, nullable (unique) | id пользователя Telegram — основной способ идентификации при входе через Telegram Login Widget (см. `05_personal-cabinet.md` §1) |
| vk_id | bigint, nullable (unique) | id пользователя VK — основной способ идентификации при входе через VK ID/OAuth |
| auth_provider | enum(telegram, vk) | каким способом создан/подтверждён аккаунт; хотя бы одно из `telegram_id`/`vk_id` обязательно заполнено |
| phone | text, nullable | не логин — контактный номер для координации доставки (курьер) и связи с контрагентом в МойСклад; больше не unique-идентификатор входа |
| email | text, nullable |
| name | text |
| role | enum(guest, retail_client, wholesale_client, **florist**, manager, admin) | `florist` добавлена 03.09.2026: сотрудник, который наполняет карточки и фото с телефона в зале, но не видит ни денег, ни клиентов — без отдельной роли этот доступ пришлось бы выдавать как `manager` (`18_admin-catalog-content.md` §12, `06_admin-dashboard.md` §8) |
| moysklad_counterparty_id | uuid, nullable | связь с контрагентом в МойСклад |
| wholesale_status | enum(none, pending, approved, rejected) | статус заявки на B2B-доступ |
| bonus_points_cache | int | кэш баланса баллов (источник истины — МойСклад `bonusprogram`, если используется, либо своя реализация — см. `05_personal-cabinet.md` §2.1) |
| lifetime_spent | numeric(12,2) | накопительная сумма покупок клиента за всё время — обновляется при переходе заказа в статус "оплачен"/"доставлен"; выводится в ЛК как «сколько купил» (см. `05_personal-cabinet.md` §2.1) |
| lifetime_orders_count | int | количество завершённых заказов клиента — обновляется тем же триггером, что и `lifetime_spent` |
| loyalty_tier | enum(base, regular, vip), nullable | опционально: уровень лояльности по порогам `lifetime_spent` (вторая волна, см. `05_personal-cabinet.md` §2.1) |
| created_at | timestamptz |

**addresses** — сохранённые адреса доставки
| Поле | Тип |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| label | text (напр. «Дом», «Офис») |
| full_address | text |
| comment | text |
| is_default | boolean |

**sessions** — сессии аутентификации (или использовать JWT + refresh-таблицу)

## 3. Заказы

**orders**
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) |
| order_number | serial | человекочитаемый номер |
| user_id | uuid, nullable (FK) | nullable — гостевой заказ |
| moysklad_order_id | uuid, nullable | id `customerorder` после синка |
| sberbank_order_id | text, nullable | `orderId`, полученный от Сбербанк Эквайринга при `register.do` (см. `11_payment-sberbank.md` §4) — не путать с `moysklad_order_id` |
| sync_id | uuid | idempotency-ключ для МойСклад (см. `02_moysklad-integration.md` §7) |
| status | enum(new, syncing, sync_failed, confirmed, assembling, out_for_delivery, delivered, cancelled) | |
| fulfillment_type | enum(delivery, pickup) | |
| store_id | uuid (FK → stores) | склад отгрузки/самовывоза |
| delivery_address_id | uuid, nullable | |
| delivery_date | date | |
| delivery_time_slot | text | напр. «14:00–16:00» |
| courier_dispatch_note | text, nullable | заметка менеджера о ручном вызове курьера (Яндекс Такси/Доставка) — не интеграция по API, просто поле для фиксации факта/деталей вызова, см. `06_admin-dashboard.md` §3 |
| comment | text | пожелания к букету, открытка и т.п. |
| subtotal | numeric | |
| discount | numeric | |
| bonus_points_used | int | |
| total | numeric | |
| payment_status | enum(unpaid, paid, refunded) | |
| payment_method | enum(online, cash_on_delivery, manager_link) | `online` — оплата через Сбербанк Эквайринг, см. `11_payment-sberbank.md` |
| created_at | timestamptz | |

**order_items**
| Поле | Тип |
|---|---|
| id | uuid (PK) |
| order_id | uuid (FK) |
| product_id | uuid (FK) |
| quantity | int |
| price_at_purchase | numeric |

**carts** — корзина (для авторизованных — в БД, для гостей — localStorage/cookie + опциональная синхронизация)

## 4. Промо и лояльность

**promo_codes**
| Поле | Тип |
|---|---|
| id | uuid (PK) |
| code | text (unique) |
| discount_type | enum(percent, fixed) |
| discount_value | numeric |
| valid_from / valid_to | timestamptz |
| usage_limit | int, nullable |
| used_count | int |

**bonus_transactions** — журнал начислений/списаний баллов (детальная история для ЛК клиента, см. `05_personal-cabinet.md` §2.1)
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) |
| user_id | uuid (FK → users) |
| order_id | uuid, nullable (FK → orders) | заказ, с которым связано начисление/списание (пусто для ручной корректировки/welcome-бонуса) |
| amount | int | положительное — начисление, отрицательное — списание |
| reason | enum(purchase_earn, purchase_redeem, welcome_bonus, manual_adjustment, expired) | |
| balance_after | int | снапшот баланса сразу после операции — чтобы не пересчитывать историю каждый раз |
| created_at | timestamptz | |

## 5. Синхронизация и аудит

**sync_log** — журнал каждого цикла синхронизации с МойСклад
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) |
| sync_type | enum(full_catalog, stock_incremental, webhook_event, order_push) | |
| status | enum(success, partial, failed) | |
| started_at / finished_at | timestamptz | |
| items_processed | int | |
| error_details | jsonb, nullable | |

**webhook_events** — сырые события от МойСклад (для отладки и повторной обработки)
| Поле | Тип |
|---|---|
| id | uuid (PK) |
| request_id | text (для дедупликации) |
| entity_type | text |
| action | text |
| payload | jsonb |
| processed | boolean |
| received_at | timestamptz |

## 6. Аналитика (для управленки, см. `06_admin-dashboard.md`)

**product_views** — событие просмотра карточки товара (для "популярные товары", воронки)
**cart_events** — добавление/удаление из корзины (для анализа брошенных корзин)
**revenue_daily** (материализованное представление или отдельная агрегирующая таблица, обновляется по крону) — для быстрой отдачи графиков дашборда без тяжёлых запросов "на лету"

## 7. Технические заметки

- Рекомендуемый инструмент миграций/ORM: **Prisma** или **Drizzle ORM** (TypeScript, соответствует стеку из `01_tech-stack-architecture.md`).
- Все поля `moysklad_id` — обязательно с уникальным индексом, это точка синхронизации между двумя системами.
- Денежные поля — `numeric(12,2)`, не `float`, во избежание ошибок округления.
- Часовой пояс сервера/БД — **Europe/Moscow**, чтобы совпадать с временными полями МойСклад (которые всегда в MSK).

Заметки этого раздела действуют и на разделы §8–§10, добавленные 04.09.2026.

## 8. Контент сайта (слой поверх МойСклад)

Раздел добавлен 04.09.2026. Сущности описаны в `18_admin-catalog-content.md` (владелец темы), здесь — их поля и типы. Расхождение читается в пользу позднейшего решения по правилу `17_readiness-audit.md` §3; если поле разошлось, источник истины по составу — `18_admin-catalog-content.md` §14.

Общие соглашения раздела (`18_admin-catalog-content.md` §14): **денежных полей в контентных таблицах нет вовсе** — иначе разграничение доступа к деньгам придётся защищать заново в каждом запросе к контенту; `updated_by` ссылается на `users.id`; удаление только мягкое (`archived_at` / `deleted_at`), физического удаления контента нет; ни одна таблица раздела не синхронизируется с МойСклад ни в какую сторону.

**product_site** — карточка сайта поверх позиции МойСклад (пишут только люди через управленку)
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| moysklad_id | uuid (unique) | точка связи с `products.moysklad_id`; уникальный индекс обязателен (§7) |
| title | text, nullable | витринное название; пусто — на витрине `products.name` |
| description_html | text, nullable | продающий текст; пусто — `products.description` |
| slug | text, nullable (unique) | пусто — `slug` из `products` |
| badges[] | uuid[] | ссылки на справочник `badge`; не enum в коде |
| sort_weight | int, default 0 | ручной порядок в каталоге: чем больше, тем раньше; в поиске не действует |
| seo_title | text, nullable | пусто — шаблон `15_seo-promotion.md` §2.2 |
| seo_description | text, nullable | пусто — шаблон `15_seo-promotion.md` §2.2 |
| h1 | text, nullable | пусто — значение `title` |
| is_published | boolean | публикация на витрине; не то же, что `products.is_active` |
| published_at | timestamptz, nullable | момент первой публикации |
| archived_at | timestamptz, nullable | мягкое снятие карточки (`18_admin-catalog-content.md` §7) |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| updated_by | uuid (FK → users) | |

**Колонки `images[]` в `product_site` нет.** Фото связаны с карточкой только через `product_site_image`. **Почему так** (`18_admin-catalog-content.md` §1.2): порядок фото редактируется перетаскиванием и должен переживать вставку кадра в середину, а массив в колонке этого не выражает; два места хранения одного списка неизбежно разойдутся.

Полей цены, остатка, категории и наличия в таблице нет и быть не может (§1 выше, `18_admin-catalog-content.md` §1.3).

**product_site_image** — связка карточки с фото
| Поле | Тип | Комментарий |
|---|---|---|
| product_site_id | uuid (FK → product_site) | |
| media_asset_id | uuid (FK → media_asset) | |
| position | int | порядок в галерее; первое фото — обложка карточки и `og:image` |

Первичный ключ — `(product_site_id, media_asset_id)`. Индекс: `(product_site_id, position)`.

**badge** — справочник меток карточки
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| code | text (unique) | машинное имя метки |
| label | text | что видит покупатель |
| color_token | text | токен из `01_brand/design-tokens.css`, а не произвольный цвет |
| sort_order | int | |
| is_active | boolean | `false` — метка не предлагается при выборе, но не удаляется и не пропадает с карточек |

**Почему справочник, а не enum в коде** (`18_admin-catalog-content.md` §5.1): стартовый набор меток — предложение, которое изменится уже на подтверждении заказчиком, а следующую метку придумает сезон; каждая новая метка не должна стоить релиза.

**collection** — подборка товаров
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| slug | text (unique) | |
| title | text | |
| subtitle | text, nullable | |
| description_html | text, nullable | |
| cover_media_asset_id | uuid, nullable (FK → media_asset) | |
| selection_mode | enum(manual, rule) | ручной список или правило отбора |
| rule | jsonb, nullable | условие отбора для `selection_mode = rule` |
| placement | enum(home, catalog, both) | где выводится |
| sort_weight | int | порядок среди подборок |
| seo_title / seo_description / h1 | text, nullable | пусто — шаблон `15_seo-promotion.md` §2.2 |
| is_published | boolean | |
| published_at | timestamptz, nullable | |
| archived_at | timestamptz, nullable | |
| created_at / updated_at | timestamptz | |
| updated_by | uuid (FK → users) | |

**collection_item** — состав подборки
| Поле | Тип | Комментарий |
|---|---|---|
| collection_id | uuid (FK → collection) | |
| product_site_id | uuid (FK → product_site) | |
| position | int | **свой** порядок внутри подборки, а не `product_site.sort_weight` |
| is_pinned | boolean | закрепление позиции вверху подборки по правилу |

Первичный ключ — `(collection_id, product_site_id)`. **Почему у подборки свой порядок**: один и тот же букет бывает третьим в «до 3000» и первым в «монобукетах»; общий вес такого не выражает.

**occasion_landing** — лендинг по поводу, `/povod/[slug]`
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| slug | text (unique) | маршрут `/povod/[slug]`, стартовый набор — `15_seo-promotion.md` §1.3 |
| title | text | он же H1 по умолчанию |
| h1 | text, nullable | |
| intro_html | text, nullable | вступительный текст |
| body_html | text, nullable | |
| cover_media_asset_id | uuid, nullable (FK → media_asset) | |
| collection_id | uuid, nullable (FK → collection) | товарная часть; своего списка товаров у лендинга нет |
| template | enum(default, restrained) | `restrained` — сдержанный шаблон для деликатных поводов |
| seo_title / seo_description | text, nullable | |
| publish_from | timestamptz, nullable | подготовка заранее, выпуск в назначенный день |
| is_published | boolean | после даты повода лендинг не снимается |
| published_at | timestamptz, nullable | |
| archived_at | timestamptz, nullable | |
| created_at / updated_at | timestamptz | |
| updated_by | uuid (FK → users) | |

**page_block** — блоки главной
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| page | enum(home) | пока только главная |
| type | enum(hero, promo_strip, collection, occasions, articles, text) | набор типов фиксирован: свободный конструктор ломает сетку и типографику `12_design-system-base.md` |
| position | int | порядок секций |
| title | text, nullable | |
| subtitle | text, nullable | |
| media_asset_id | uuid, nullable (FK → media_asset) | |
| link_url | text, nullable | |
| payload | jsonb | параметры конкретного типа, например `collection_id` |
| visible_from | timestamptz, nullable | |
| visible_to | timestamptz, nullable | акция гаснет сама, а не «пока кто-нибудь не заметит» |
| is_published | boolean | |
| created_at / updated_at | timestamptz | |
| updated_by | uuid (FK → users) | |

**article** — статья блога
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| slug | text (unique) | |
| title | text | |
| h1 | text, nullable | |
| excerpt | text, nullable | анонс в списке |
| body_html | text | |
| cover_media_asset_id | uuid, nullable (FK → media_asset) | |
| seo_title / seo_description | text, nullable | |
| author_user_id | uuid (FK → users) | |
| publish_from | timestamptz, nullable | отложенная публикация под сезонный календарь `15_seo-promotion.md` §6.3 |
| is_published | boolean | |
| published_at | timestamptz, nullable | |
| archived_at | timestamptz, nullable | |
| created_at / updated_at | timestamptz | |
| updated_by | uuid (FK → users) | |

**media_asset** — изображение: оригинал, кадрирования, alt
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| storage_key | text | ключ оригинала в S3-совместимом хранилище; оригинал не перезаписывается |
| variants | jsonb | карта «формат → ключ в хранилище» (плитка, карточка, Open Graph) |
| mime | text | |
| width / height | int | |
| bytes | int | |
| focal_point | jsonb | точка фокуса для автокадрирования |
| alt | text, nullable | пусто — подставляется из `title` карточки |
| source | enum(camera, file, moysklad_mirror) | откуда пришёл кадр |
| uploaded_by | uuid (FK → users) | |
| created_at | timestamptz | |
| deleted_at | timestamptz, nullable | мягкое удаление: файл убирается из выбора, но не из хранилища |

**content_revision** — журнал изменений контента, один на все сущности §8
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| entity_type | enum(product_site, collection, occasion_landing, page_block, article) | |
| entity_id | uuid | |
| action | enum(create, update, publish, unpublish, archive, restore) | откат записывается как `restore`, а не стирает историю |
| changed_fields | jsonb | какие поля затронуты |
| snapshot_before | jsonb | полное состояние до изменения |
| user_id | uuid (FK → users) | |
| created_at | timestamptz | |
| comment | text, nullable | необязательный комментарий автора правки |

Индекс: `(entity_type, entity_id, created_at)`. **Почему полный снимок, а не разница**: восстановление по цепочке разниц ломается, как только одна запись битая или пропущена, — а откат нужен обычно именно тогда, когда что-то уже пошло не так. **Почему один журнал на все сущности**: вопрос звучит как «кто это поменял», а не «кто поменял статью».

## 9. Правило приоритета полей — представление `v_product_public`

Витрина читает не таблицу, а представление: **непустое поле сайта побеждает поле МойСклад, пустое — уступает**. Правило живёт в одном месте, иначе оно расползается по запросам витрины и расходится с предпросмотром управленки. Источник правила — `18_admin-catalog-content.md` §1.2.

| Поле представления | Откуда берётся |
|---|---|
| `title` | `coalesce(product_site.title, products.name)` |
| `description_html` | `coalesce(product_site.description_html, products.description)` |
| `slug` | `coalesce(product_site.slug, products.slug)` |
| `images` | непустой список `product_site_image` (по `position`) → иначе `products.images` |
| `badges` | `product_site.badges[]` → иначе пусто (у `products` источника нет) |
| `sort_weight` | `product_site.sort_weight` → иначе сортировка каталога по умолчанию |
| `seo_title` / `seo_description` | поле сайта → иначе шаблон `15_seo-promotion.md` §2.2 (подставляется на рендере, не в представлении) |
| `h1` | `coalesce(product_site.h1, title)` |
| цена, категория, остаток, наличие | только `products` / `stock_levels` — сайт не переопределяет никогда |
| видимость на витрине | `product_site.is_published = true` **и** `products.is_active = true` **и** `product_site.archived_at is null` |

Псевдокод сути:

```sql
select
  coalesce(nullif(ps.title, ''), p.name)                     as title,
  coalesce(nullif(ps.description_html, ''), p.description)   as description_html,
  coalesce(nullif(ps.slug, ''), p.slug)                      as slug,
  p.price_retail, p.price_wholesale, p.category_id           -- сайт не переопределяет
from products p
left join product_site ps on ps.moysklad_id = p.moysklad_id;
```

**Почему пустое поле сайта — не ошибка**: заполнять `product_site` необязательно, карточка работает и без единой ручной правки. Сайт запускается на данных МойСклад, а витринный вид набирается карточка за карточкой, без «сначала заполните 300 позиций».

**Предпросмотр в управленке идёт через то же представление** с подставленным черновиком (`18_admin-catalog-content.md` §3): предпросмотр, собранный отдельным кодом, со временем расходится с витриной и начинает врать.

## 10. Отчётность (таблицы `report_*`)

Раздел добавлен 04.09.2026. Владелец темы — `19_management-reporting.md` §11, здесь — поля и типы. Отчётность **читает** данные МойСклад и раскладывает их в агрегаты; собственной бухгалтерии сайт не ведёт (`19_management-reporting.md` §1.1).

**Терминология.** В этом разделе «списание товара» и «потери» означают документ `loss` МойСклад плюс недостачу по инвентаризации. Это **не** списание бонусных баллов из §4 (`bonus_transactions.reason = purchase_redeem`) — совпадение слова названо как расхождение №14 в `17_readiness-audit.md` §5 и разведено в шапке `19_management-reporting.md`. Голое «списание» в комментариях этого раздела не употребляется.

**Общее поле детализации у всех агрегатов** (`19_management-reporting.md` §11): `source_documents jsonb` — массив `{type, id, uuidHref, qty, sum}` со ссылками на первичные документы МойСклад, до 50 элементов (`значение по умолчанию`); при превышении `source_truncated = true`, и детализация уходит запросом в МойСклад. **Почему так**: детализация до документа нужна на каждой строке, а ходить за ней в МойСклад на каждый клик — упереться в лимиты `02_moysklad-integration.md` §3.

**Правило обновления** (`19_management-reporting.md` §7): инкрементальный прогон каждые 30 минут (продажи и списание товара за текущий день), ночной прогон в 04:00 МСК (полный пересчёт окна, снимок остатков, ABC/XYZ, оборачиваемость, экран «что мешает считать»), окно перерасчёта — последние 14 дней; закрытый период старше окна переписывается только вручную кнопкой, роль `admin`. Пересчёт **идемпотентен**: строки агрегата за период удаляются и записываются заново в одной транзакции с проставлением `run_id`. **Почему так**: документы в МойСклад проводят задним числом, а повторный запуск после сбоя не должен удваивать выручку.

**report_run** — журнал пересчёта
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| report_type | enum(sales_daily, writeoff_daily, purchase_daily, stock_daily, cost, turnover, abc_xyz, data_quality) | что пересчитывалось |
| period_from / period_to | date | окно пересчёта |
| trigger | enum(scheduled_incremental, scheduled_nightly, manual, initial_backfill) | |
| status | enum(success, partial, failed) | |
| started_at / finished_at | timestamptz | |
| data_as_of | timestamptz | момент, на который данные достоверны — **минимум** по всем источникам |
| source_lag | jsonb | по каждой сущности МойСклад — время последней успешной выгрузки |
| rows_written | int | |
| error_details | jsonb, nullable | по формату `sync_log.error_details` (§5) |

**report_cost** — себестоимость единицы
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| product_id | uuid (FK → products) | |
| moysklad_product_id | uuid | |
| store_id | uuid, nullable (FK → stores) | null — среднее по компании |
| valid_from / valid_to | date, `valid_to` nullable | период действия значения |
| cost_per_unit | numeric(12,2) | |
| method | enum(supply_weighted_avg, enter_price, stock_report) | каким источником получено (`19_management-reporting.md` §2.3) |
| is_estimated | boolean | значение восстановлено, а не взято из приёмки |
| source_document_type / source_document_id | text / uuid, nullable | |
| source_uuid_href | text, nullable | ссылка в интерфейс МойСклад |
| updated_at | timestamptz | |

Индекс: `(product_id, store_id, valid_from)`. Если ни один источник не дал цену, себестоимость **не подставляется** ни нулём, ни средним по категории — строка помечается и уходит в `report_data_quality`.

**report_sales_daily** — продажи, выручка и маржа
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| date | date | |
| product_id / category_id / store_id | uuid | разрезы «по товару» и «по категории» |
| channel | enum(retail, wholesale) | розница/опт |
| order_id | uuid, nullable (FK → orders) | заполнено, если продажа сопоставлена с заказом сайта; null — продажа вне сайта |
| qty | numeric | |
| revenue | numeric(12,2) | без НДС/с НДС — по учётной политике заказчика (`19_management-reporting.md` §12.1) |
| discount | numeric(12,2) | |
| cost | numeric(12,2) | себестоимость проданного |
| gross_profit | numeric(12,2) | `revenue − cost`, **хранится**, не вычисляется на лету |
| returns_qty / returns_amount | numeric | из `salesreturn` |
| cost_is_estimated | boolean | хотя бы часть себестоимости восстановлена |
| source_documents / source_truncated | jsonb / boolean | |
| run_id | uuid (FK → report_run) | |

Индексы: `(date, product_id, store_id, channel)` unique, `(order_id)`, `(date, category_id)`.

**report_writeoff_daily** — списание товара и потери
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| date | date | |
| product_id / category_id / store_id | uuid | |
| document_type | enum(loss, inventory_shortage) | списание товара или недостача по инвентаризации |
| qty | numeric | |
| cost_amount | numeric(12,2) | стоимость списанного товара по себестоимости |
| reason_code / reason_text | text, nullable | причина списания товара из документа МойСклад ⚠️ (состав полей проверить при реализации) |
| source_documents / source_truncated | jsonb / boolean | |
| run_id | uuid (FK → report_run) | |

Речь о **списании товара** (увядший, испорченный, разбитый), а не о списании бонусных баллов из §4. Доля от закупки в таблице **не хранится** — считается отчётом за период из этого агрегата и `report_purchase_daily`.

**report_purchase_daily** — закупки
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| date | date | |
| product_id / category_id / store_id | uuid | |
| supplier_id | uuid, nullable (FK → report_supplier) | |
| document_type | enum(supply, purchasereturn) | приёмка или возврат поставщику |
| qty | numeric | |
| amount | numeric(12,2) | |
| avg_price | numeric(12,2) | средняя закупочная цена в документе |
| source_documents / source_truncated | jsonb / boolean | |
| run_id | uuid (FK → report_run) | |

**report_supplier** — справочник поставщиков
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| moysklad_id | uuid (unique) | `counterparty` в роли поставщика; уникальный индекс обязателен (§7) |
| name | text | |
| uuid_href | text | ссылка в интерфейс МойСклад |
| first_supply_at / last_supply_at | timestamptz | |
| updated_at | timestamptz | |

Отдельной синхронизации справочника поставщиков нет — поставщик подтягивается из поля агента приёмки (`19_management-reporting.md` §2.2).

**report_stock_daily** — ежедневный снимок остатков
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| date | date | снимок на конец дня |
| product_id / store_id | uuid | |
| quantity / reserved / available | numeric | |
| cost_amount | numeric(12,2) | стоимость остатка по себестоимости |
| run_id | uuid (FK → report_run) | |

Индекс: `(date, product_id, store_id)` unique. Таблица нужна потому, что `stock_levels` (§1) хранит только текущее состояние, а оборачиваемость считается по среднему остатку за период.

**report_turnover** — оборачиваемость
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| period_from / period_to | date | |
| scope | enum(product, category) | |
| product_id / category_id | uuid, nullable | заполнено то, что соответствует `scope` |
| store_id | uuid, nullable | |
| channel | enum(retail, wholesale), nullable | |
| avg_stock | numeric | средний остаток за период из `report_stock_daily` |
| sold_qty | numeric | |
| turnover_days | numeric(8,2) | средний срок до продажи |
| turnover_ratio | numeric(8,2) | |
| days_without_movement | int | |
| run_id | uuid (FK → report_run) | |

**report_abc_xyz** — классификация ассортимента
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| period_from / period_to | date | |
| scope | enum(product, category) | |
| product_id / category_id | uuid, nullable | |
| revenue_share / revenue_cumulative | numeric(5,2) | доля и накопленная доля выручки, % |
| abc_class | enum(A, B, C) | |
| demand_cv | numeric(6,2) | коэффициент вариации спроса, % |
| xyz_class | enum(X, Y, Z) | |
| combined_class | text | напр. `AX` |
| recommendation | enum(keep, watch, reduce, withdraw), nullable | подсказка, не действие |
| params | jsonb | пороги, с которыми считали (80/15/5, границы CV) |
| run_id | uuid (FK → report_run) | |

**report_plan** — плановые показатели
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| period_from / period_to | date | |
| scope | enum(total, channel, category, store) | |
| channel / category_id / store_id | nullable | заполняется по `scope` |
| metric | enum(revenue, gross_profit, orders_count, avg_check) | |
| plan_value | numeric(12,2), **nullable** | пусто до заполнения заказчиком — интерфейс показывает `[ПЛАН ПРОДАЖ — впишет заказчик]` |
| comment | text, nullable | |
| created_by | uuid (FK → users) | только роль `admin` |
| created_at / updated_at | timestamptz | |

Значения по умолчанию у `plan_value` нет и быть не может: план — решение заказчика, правдоподобное число здесь хуже пустого поля.

**report_data_quality** — «что мешает считать»
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| issue_type | enum(no_purchase_price, writeoff_without_reason, store_no_movements, negative_stock, unmapped_product, sync_failed_documents, inventory_shortage_without_loss, sales_outside_site) | перечень — `19_management-reporting.md` §5 |
| severity | enum(blocking, warning, info) | |
| object_type / object_id / object_name | text / uuid nullable / text | к чему относится |
| moysklad_uuid_href | text, nullable | переход к объекту в МойСклад |
| period_from / period_to | date, nullable | |
| affected_reports | text[] | какие отчёты искажает |
| details | jsonb | |
| detected_at | timestamptz | |
| resolved_at | timestamptz, nullable | запись не удаляется |

**report_export** — выгрузки и фоновые отчёты
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| report_type | text | какой отчёт |
| params | jsonb | период, фильтры, пороги |
| format | enum(xlsx, csv) | |
| requested_by | uuid (FK → users) | |
| requested_role | enum(manager, admin) | роль на момент запроса — проверяется повторно при скачивании |
| status | enum(queued, running, ready, failed, expired) | |
| file_path | text, nullable | объект в S3 |
| file_size / rows_count | int, nullable | |
| data_as_of | timestamptz | та же отметка актуальности, что в отчёте |
| expires_at | timestamptz | срок жизни ссылки, по умолчанию 7 дней |
| notified_at | timestamptz, nullable | |
| error_details | jsonb, nullable | |

**report_digest_log** — журнал дайджестов (вторая волна, `19_management-reporting.md` §13)
| Поле | Тип | Комментарий |
|---|---|---|
| id | uuid (PK) | |
| period_from / period_to | date | неделя, за которую сводка |
| recipient_user_id | uuid (FK → users) | только роль `admin` |
| channel | enum(telegram) | |
| status | enum(sent, failed, skipped_no_data) | |
| data_as_of | timestamptz | |
| payload_summary | jsonb | какие цифры ушли |
| sent_at | timestamptz | |
| error_details | jsonb, nullable | |

Доступ к денежным полям этих таблиц — `19_management-reporting.md` §9: проверка на сервере на каждом эндпойнте, вырезание полей в сериализаторе по белому списку для роли. `florist` не видит раздел отчётности вовсе.
