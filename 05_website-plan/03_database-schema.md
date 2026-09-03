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
| role | enum(guest, retail_client, wholesale_client, manager, admin) | |
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
