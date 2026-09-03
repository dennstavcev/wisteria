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
  "updatedAt": "2026-09-03T21:26:07+03:00",
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
      "startedAt": "2026-09-03T21:25:22+03:00"
    },
    {
      "id": "review",
      "status": "pending"
    },
    {
      "id": "final",
      "status": "pending"
    }
  ],
  "requirements": {
    "total": 14,
    "done": 1,
    "inTicket": 13,
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
      "status": "in-progress",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0,
      "startedAt": "2026-09-03T21:26:07+03:00"
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
      "status": "in-progress",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0,
      "startedAt": "2026-09-03T21:26:07+03:00"
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
      "status": "in-progress",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0,
      "startedAt": "2026-09-03T21:26:07+03:00"
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
        "05_website-plan/06_admin-dashboard.md"
      ],
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
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
        "05_website-plan/16_ui-design-task.md"
      ],
      "status": "pending",
      "retries": 0,
      "repairs": 0,
      "handoffs": 0
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
  "concerns": [],
  "reviewers": {
    "manifestSpec": null,
    "craft": null
  },
  "blind": null
}
