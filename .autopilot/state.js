window.STATE =
{
  "slug": "visteria-dev-readiness",
  "dir": "2026-09-03-visteria-dev-readiness--wip",
  "title": "Вистерия — готовность к разработке и достройка ТЗ",
  "mode": "semi",
  "depth": "deep",
  "polish": null,
  "tier": "T2",
  "briefFile": "2026-09-03-brief.md",
  "memoryFile": "CLAUDE.md",
  "skillDir": "C:/Users/Denn/.claude/skills/autopilot",
  "startedAt": "2026-09-03T20:50:00+03:00",
  "updatedAt": "2026-09-04T08:19:16+03:00",
  "finishedAt": null,
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
      "status": "active",
      "startedAt": "2026-09-03T21:25:22+03:00",
      "note": "2 из 7 тасков сдано"
    },
    {
      "id": "review",
      "status": "active",
      "startedAt": "2026-09-04T08:08:37+03:00",
      "note": "01 и 03 на ревью"
    },
    {
      "id": "final",
      "status": "pending"
    }
  ],
  "requirements": {
    "total": 14,
    "done": 4,
    "inTicket": 10,
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
      "status": "repair",
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
      ]
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
      "status": "in-progress",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0,
      "startedAt": "2026-09-04T08:19:16+03:00"
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
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
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
      "status": "review",
      "retries": 1,
      "repairs": 0,
      "handoffs": 0,
      "startedAt": "2026-09-04T08:08:37+03:00",
      "tests": {
        "passed": 9,
        "failed": 0
      }
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
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
    }
  ],
  "singlePass": null,
  "tests": null,
  "debt": {
    "placeholders": [],
    "assumptions": [],
    "emptyEnv": []
  },
  "additions": [],
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
    "AGENT_SERVER_SETUP_TASK.md покрывает только подготовку сервера; изоляция проектов, релизы, TLS, секреты, бэкап, security gate и мониторинг не покрыты ничем"
  ],
  "reviewers": {
    "manifestSpec": null,
    "craft": null
  },
  "blind": null
}
