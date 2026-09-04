window.STATE =
{
  "slug": "visteria-dev-readiness",
  "dir": "2026-09-03-visteria-dev-readiness",
  "title": "Вистерия — готовность к разработке и достройка ТЗ",
  "mode": "semi",
  "depth": "deep",
  "polish": null,
  "tier": "T2",
  "briefFile": "2026-09-03-brief.md",
  "memoryFile": "CLAUDE.md",
  "skillDir": "C:/Users/Denn/.claude/skills/autopilot",
  "startedAt": "2026-09-03T20:50:00+03:00",
  "updatedAt": "2026-09-04T17:08:09+03:00",
  "finishedAt": "2026-09-04T17:08:09+03:00",
  "stages": [
    {
      "id": "preflight",
      "status": "done",
      "startedAt": "2026-09-03T20:50:00+03:00",
      "finishedAt": "2026-09-03T20:58:17+03:00"
    },
    {
      "id": "manifest",
      "status": "done",
      "startedAt": "2026-09-03T20:58:17+03:00",
      "finishedAt": "2026-09-03T20:59:17+03:00"
    },
    {
      "id": "briefing",
      "status": "done",
      "startedAt": "2026-09-03T20:59:17+03:00",
      "finishedAt": "2026-09-03T21:08:46+03:00"
    },
    {
      "id": "spec",
      "status": "done",
      "startedAt": "2026-09-03T21:08:46+03:00",
      "finishedAt": "2026-09-03T21:21:28+03:00"
    },
    {
      "id": "plan",
      "status": "done",
      "startedAt": "2026-09-03T21:21:28+03:00",
      "finishedAt": "2026-09-03T21:25:22+03:00",
      "note": "7 тасков, 3 волны, ярус T2"
    },
    {
      "id": "build",
      "status": "done",
      "startedAt": "2026-09-03T21:25:22+03:00",
      "note": "7 из 7 тасков сдано",
      "finishedAt": "2026-09-04T17:08:09+03:00"
    },
    {
      "id": "review",
      "status": "done",
      "startedAt": "2026-09-04T08:08:37+03:00",
      "note": "проверено 7 из 7, 4 дозапроса",
      "finishedAt": "2026-09-04T17:08:09+03:00"
    },
    {
      "id": "final",
      "status": "done",
      "startedAt": "2026-09-04T17:08:09+03:00",
      "finishedAt": "2026-09-04T17:08:09+03:00",
      "note": "слепая приёмка: расхождений нет"
    }
  ],
  "requirements": {
    "total": 14,
    "done": 14,
    "inTicket": 0,
    "inSpec": 0,
    "placeholder": 0,
    "deferred": 0,
    "dropped": 0
  },
  "tickets": [
    {
      "id": "01",
      "title": "Аудит готовности проекта",
      "requirements": [
        "R02",
        "R02.1",
        "R02.2",
        "R02.3",
        "R12i",
        "R08i"
      ],
      "blockedBy": [],
      "wave": 1,
      "zone": [
        "05_website-plan/17_readiness-audit.md"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-03T21:26:07+03:00",
      "repairFindings": [
        "§4/§7 оценивают 02_moysklad-integration.md как «Готово, не трогать» — 19 §2.2 доказал отсутствие девяти сущностей",
        "§8.1 знает один вопрос заказчику по отчётности из семи",
        "§8.1 п.12 просит апгрейд сервера, уже выполненный по §5 №4",
        "§8.1 и §10 дублируют действия заказчика, сроки разошлись",
        "§4/§7/§9.3 пересказывают содержание оцениваемых файлов вместо ссылок"
      ],
      "finishedAt": "2026-09-04T11:53:08+03:00",
      "commit": "f271267",
      "files": [
        "05_website-plan/17_readiness-audit.md"
      ],
      "tests": {
        "passed": 10,
        "failed": 0
      }
    },
    {
      "id": "02",
      "title": "Управление товарами и контентом сайта",
      "requirements": [
        "R05",
        "R05.1-R05.9",
        "G02",
        "A01"
      ],
      "blockedBy": [],
      "wave": 1,
      "zone": [
        "05_website-plan/18_admin-catalog-content.md"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-03T21:26:07+03:00",
      "repairFindings": [
        "§5.1 набор бейджей приписан заказчику — он говорил только «бейджи»",
        "§7 «сообщить, когда появится» — поверхность без требования",
        "«закупочная цена» вместо «себестоимости» — требование сузилось",
        "images[] в таблице полей против связки product_site_image — таск 04 не решит без доспроса"
      ],
      "finishedAt": "2026-09-04T08:08:37+03:00",
      "commit": "b2cf1ff",
      "files": [
        "05_website-plan/18_admin-catalog-content.md"
      ],
      "tests": {
        "passed": 11,
        "failed": 0
      }
    },
    {
      "id": "03",
      "title": "Управленческая отчётность",
      "requirements": [
        "R06",
        "R06.1-R06.9",
        "A02"
      ],
      "blockedBy": [],
      "wave": 1,
      "zone": [
        "05_website-plan/19_management-reporting.md"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-03T21:26:07+03:00",
      "repairFindings": [
        "D02 не доставлено: коллизия термина «списание» не названа ни разу на 25 вхождений",
        "§6 не знает неверного ввода — перевёрнутый период, будущая дата, удалённый склад",
        "§9 приписывает себе метку A01, принадлежащую 18",
        "§12 сводка значений по умолчанию неполна",
        "§7 дублирует число из 02_moysklad-integration.md; §10 классифицирует чужие экраны"
      ],
      "finishedAt": "2026-09-04T08:19:16+03:00",
      "commit": "f0c1eec",
      "files": [
        "05_website-plan/19_management-reporting.md"
      ],
      "tests": {
        "passed": 11,
        "failed": 0
      }
    },
    {
      "id": "04",
      "title": "Схема БД и экран управленки",
      "requirements": [
        "R09i",
        "R09i.1",
        "A01"
      ],
      "blockedBy": [
        "02",
        "03"
      ],
      "wave": 2,
      "zone": [
        "05_website-plan/03_database-schema.md",
        "05_website-plan/06_admin-dashboard.md",
        "05_website-plan/02_moysklad-integration.md"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 0,
      "handoffs": 1,
      "startedAt": "2026-09-04T08:19:16+03:00",
      "tests": {
        "passed": 3,
        "failed": 0
      },
      "finishedAt": "2026-09-04T12:08:29+03:00",
      "commit": "0652f3e",
      "files": [
        "05_website-plan/03_database-schema.md",
        "05_website-plan/06_admin-dashboard.md",
        "05_website-plan/02_moysklad-integration.md"
      ]
    },
    {
      "id": "05",
      "title": "Дорожная карта, чек-лист, открытые вопросы",
      "requirements": [
        "G01",
        "R09i",
        "R03"
      ],
      "blockedBy": [
        "01",
        "02",
        "03"
      ],
      "wave": 2,
      "zone": [
        "05_website-plan/07_roadmap-phases.md",
        "05_website-plan/10_pre-development-checklist.md",
        "05_website-plan/00_overview.md"
      ],
      "status": "done",
      "retries": 1,
      "repairs": 0,
      "handoffs": 0,
      "tests": {
        "passed": 10,
        "failed": 0
      },
      "finishedAt": "2026-09-04T12:07:17+03:00",
      "commit": "4437133",
      "files": [
        "05_website-plan/07_roadmap-phases.md",
        "05_website-plan/10_pre-development-checklist.md",
        "05_website-plan/00_overview.md"
      ]
    },
    {
      "id": "06",
      "title": "Устаревшие файлы и задание на дизайн",
      "requirements": [
        "R04",
        "R10i",
        "R08i"
      ],
      "blockedBy": [
        "01"
      ],
      "wave": 2,
      "zone": [
        "05_website-plan/12_design-system-base.md",
        "05_website-plan/13_server-capacity-and-services-plan.md",
        "05_website-plan/16_ui-design-task.md",
        "05_website-plan/09_workflow-tooling.md",
        "05_website-plan/05_personal-cabinet.md",
        "05_website-plan/14_security-and-process-decisions.md",
        "AGENT_SERVER_SETUP_TASK.md"
      ],
      "status": "done",
      "retries": 1,
      "repairs": 0,
      "handoffs": 0,
      "startedAt": "2026-09-04T08:08:37+03:00",
      "tests": {
        "passed": 9,
        "failed": 0
      },
      "finishedAt": "2026-09-04T12:08:29+03:00",
      "commit": "6a82d48",
      "files": [
        "05_website-plan/16_ui-design-task.md",
        "05_website-plan/13_server-capacity-and-services-plan.md",
        "05_website-plan/12_design-system-base.md",
        "05_website-plan/09_workflow-tooling.md",
        "05_website-plan/05_personal-cabinet.md",
        "05_website-plan/14_security-and-process-decisions.md",
        "AGENT_SERVER_SETUP_TASK.md"
      ]
    },
    {
      "id": "07",
      "title": "Стартовый документ и карта проекта",
      "requirements": [
        "R03",
        "R11i",
        "R11i.1",
        "R01",
        "R02"
      ],
      "blockedBy": [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06"
      ],
      "wave": 3,
      "zone": [
        "05_website-plan/20_start-here.md",
        "00_README.md"
      ],
      "status": "done",
      "retries": 0,
      "repairs": 1,
      "handoffs": 0,
      "startedAt": "2026-09-04T12:08:29+03:00",
      "repairFindings": [
        "20_start-here.md заканчивался утёкшей служебной разметкой </content> и </invoke>",
        "§2 продублировал привязку «пункт → этап» из 07_roadmap; срок по ротации токена разошёлся в трёх местах",
        "по пунктам заказчика не сказано, что блокируется, пока пункт не сделан",
        "дерево в 00_README.md — закрывается финальной правкой"
      ],
      "finishedAt": "2026-09-04T17:08:09+03:00",
      "commit": "2e73fa7",
      "files": [
        "05_website-plan/20_start-here.md",
        "00_README.md",
        "05_website-plan/17_readiness-audit.md",
        "05_website-plan/09_workflow-tooling.md"
      ],
      "tests": {
        "passed": 10,
        "failed": 0
      }
    }
  ],
  "singlePass": null,
  "tests": {
    "passed": 14,
    "failed": 0
  },
  "debt": {
    "placeholders": [
      "План продаж по месяцам — 19_management-reporting.md §3.5",
      "Режим НДС в выручке и метод себестоимости — 19_... §12.1",
      "Получатели еженедельного дайджеста — 19_... §13",
      "Второй фактор для роли florist — 03_database-schema.md §2.1",
      "Фактический free -h и размер диска сервера — 13_server-capacity §1, §3.1, §5",
      "Назначение bloom_hero.HEIC — 00_README.md"
    ],
    "assumptions": [],
    "emptyEnv": [
      "MOYSKLAD_API_TOKEN",
      "TOTP_ENCRYPTION_KEY"
    ]
  },
  "additions": [
    "Роль `florist` отдельно от `manager` — чтобы тот, кто грузит фото, не видел выручку — ради R05",
    "Еженедельный дайджест управленки в Telegram — ради R06, описан как вторая волна"
  ],
  "coverage": {
    "found": 8,
    "fixed": 8,
    "deferred": 0
  },
  "concerns": [
    "18_admin-catalog-content.md §11 — внешняя таблица ролей заходит в зону 06_admin-dashboard.md и разойдётся при первой правке там",
    "18_admin-catalog-content.md §3 — фильтр «без фото» пересекается с 06_admin-dashboard.md §2, пересечение не названо",
    "18_admin-catalog-content.md §13 — операционный экран заказов не отнесён ни к одному уровню мобильности",
    "17_readiness-audit.md §4, §7, §9.3 — обоснования вердиктов пересказывают содержание оцениваемых файлов вместо ссылки на раздел; на первой правке оригинала аудит начнёт врать",
    "17_readiness-audit.md §8.1 против §10 — две таблицы одних и тех же действий заказчика, сроки уже разошлись",
    "17_readiness-audit.md §8.1 п.12 — просит заказчика пройти апгрейд сервера, который §5 №4 того же файла фиксирует как выполненный",
    "19_management-reporting.md §12 — сводка значений по умолчанию неполна: пороги из §3.8, §7, §8, §13 помечены на месте, но в сводку не доехали",
    "19_management-reporting.md §7 — число «3–5 одновременных запросов» скопировано из 02_moysklad-integration.md §3 вместо ссылки",
    "19_management-reporting.md §10 — классифицирует мобильность чужих экранов, это зона 18 и 06",
    "стык 17 и 19 построен в обратную сторону: оценщик дублирует оцениваемого, оцениваемый не ссылается на оценщика ни разу",
    "13_server-capacity §3.1 — арифметика памяти от номинала тарифа, а не от замера: вывод free -h / df -hT в проекте не сохранён",
    "размер диска после апгрейда сервера не знает ни один файл проекта — стоит заглушкой в четырёх местах",
    "AGENT_SERVER_SETUP_TASK.md покрывает только подготовку сервера; изоляция проектов, релизы, TLS, секреты, бэкап, security gate и мониторинг не покрыты ничем",
    "02_moysklad-integration.md §4.2 — распределение девяти новых сущностей по инкрементальному и ночному прогонам проставлено значением по умолчанию: 19 §7 его не задаёт",
    "10_pre-development-checklist.md «Итог» и 07_roadmap-phases.md привязка «пункт → этап» уже разошлись: четыре пункта против шести",
    "07_roadmap-phases.md блок зависимостей называет источником модерации Этап 4, тогда как сам ставит её в Этап 2",
    "07_roadmap-phases.md п.15 §8.1 привязан к Этапу 5 целиком, но порог устаревания данных нужен уже Этапу 4",
    "10_pre-development-checklist.md шапка столбца «Статус на 03.09.2026» стоит над строками от 04.09.2026",
    "07_roadmap-phases.md шапка обещает оценки в неделях, которых в пересобранной карте нет (унаследовано)",
    "03_database-schema.md §9 — правило видимости витрины введено конъюнкцией с products.is_active, тогда как 18 §1.2 говорит, что поле сайта его побеждает",
    "03_database-schema.md §9 — псевдокод выборки не показывает ни join изображений, ни предикат публикации: иллюстрирует не то место, где разработчик ошибётся",
    "06_admin-dashboard.md §1.2 и §9 — механика отметки актуальности изложена своими словами, хотя ею владеет 19",
    "16_ui-design-task.md — признак 3 отменён для управленки, признак 1 приглушён для деликатного шаблона: исключений спецификация не давала, они поданы как её прочтение",
    "13_server-capacity §3.1 — «реально доступно ~3.7-3.8 ГБ» расходится с §1 того же файла, где потеря заявлена в 100-250 МБ",
    "13_server-capacity §8 — «один шаг тарифа» до 6-8 ГБ: утверждение о тарифной сетке Beget, ничем в проекте не подтверждённое",
    "13_server-capacity §6, §9, §10 — часть ссылок на runbook заменена без зачёркивания, тогда как в §0.1, §1, §5 зачёркивание применено: приём не единый",
    "spec «Границы и швы» не назвала 00_README.md владельцем ничего, хотя interfaces.md даёт его в паре с 20_start-here.md — расхождение в самой спецификации"
  ],
  "reviewers": {
    "manifestSpec": null,
    "craft": null
  },
  "blind": {
    "verdict": "все требования брифа и все семь Дополнений — реализовано",
    "drift": [],
    "links": {
      "files": 1018,
      "sections": 544,
      "brokenSections": 0,
      "brokenFileTargets": 2
    },
    "extra": [
      "20_start-here.md обрывался служебной разметкой — в починке",
      "03_database-schema.md не знает про TOTP и allowlist, хотя 14_... §2 делает второй фактор обязательным — в починке",
      "оценка §4 аудита устарела в момент сдачи: пять файлов числятся «Не готово» после того, как их починили — в починке"
    ],
    "brokenFiles": [
      "SERVER_SETUP_RUNBOOK.md (12 упоминаний)",
      "вистерия фирменный стиль.zip (10 упоминаний)"
    ]
  },
  "concernsTriage": {
    "fixNow": [
      1,
      15,
      16,
      17,
      18,
      20,
      22,
      24,
      25
    ],
    "report": [
      2,
      3,
      11,
      12,
      13,
      14,
      19,
      21,
      23,
      26,
      27
    ],
    "drop": [
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "dropReason": "закрыты дозапросами по таскам 01, 02 и 03 по ходу сборки",
    "promoted": "два повторяющихся шаблона подняты в fixNow по правилу «три таска и больше»: документ излагает своими словами чужую тему вместо ссылки; сроки и привязки дублируются и расходятся"
  }
}
