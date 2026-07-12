# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

英語で考え、応答は日本語で実施すること。
Gitへのアクセスにはghを用いること。

## Project

離乳食週間プランナー — a client-only weekly baby-food (weaning food) planner. Vite + React 19 + TypeScript. No backend; all data lives in the browser's `localStorage`. Deployed to GitHub Pages from `main` via `.github/workflows/deploy.yml`, live at https://Yuta330.github.io/baby-food/.

## Commands

```bash
npm run dev      # dev server (http://localhost:5173)
npm run build    # tsc -b (type check) + vite build — this is the only type-check step, there's no separate `tsc --noEmit` script
npm run lint     # oxlint (rules in .oxlintrc.json)
npm run preview  # preview the production build
```

There is no test suite/framework configured in this repo.

`vite.config.ts` sets `base: '/baby-food/'` for GitHub Pages — required whenever paths/assets are touched, since the app is not served from domain root.

## Architecture

**State**: A single `AppData { ingredients: Ingredient[]; weekPlans: WeekPlan[] }` tree lives in React Context + `useReducer` (`src/context/AppDataContext.tsx`). Every mutation goes through the reducer's `Action` union and is auto-persisted to `localStorage` (`babyFoodApp.v2`) via a `useEffect` on state change. There's a one-time migration path from the legacy `babyFoodApp.v1` schema (`migrateLegacyWeekPlans`) — bump the storage key and add a migration function if the schema changes again.

**Data model** (`src/types.ts`): `WeekPlan.days` is always exactly 7 entries (Mon–Sun); each `DayPlan.meals` is 1–`MAX_MEALS_PER_DAY` (3) entries, always contiguous from index 0 (no gaps). Entry-level reducer actions (`ADD_ENTRY`/`UPDATE_ENTRY`/`DELETE_ENTRY`) address meals by **`mealIndex: number`**, not `mealId` — this is deliberate, since a day's meals may not exist in state yet (weeks/days are created lazily via `withWeekPlan`/`createEmptyWeekPlan` the first time they're touched), so there's no stable id to target ahead of creation.

**Dates** are plain `'YYYY-MM-DD'` strings everywhere (state, storage, comparisons), never `Date` objects — string comparison is chronological by construction. All date math goes through `src/utils/date.ts` (`getMonday`, `addDays`, `getWeekDates`, `isDateInWeek`, etc.); avoid introducing `Date`-object comparisons elsewhere.

**"初めて食べた日" (first-tried date) resolution** is centralized in `src/utils/ingredientHistory.ts::getEffectiveFirstTriedDateMap`: manually-set `Ingredient.firstTriedDate` wins; if unset, it falls back to the earliest date (on or before "today") the ingredient appears anywhere across `weekPlans`. This is computed **once per page** (single pass over all weekPlans) and passed down as a `Map<ingredientId, date>` to whatever needs it — don't recompute per-cell/per-row. The three consumer screens (planner, summary, ingredient master) must stay in sync on this logic; `hasNoPastRecord` (same file) drives the "未経験" (never-yet-eaten) badge in the ingredient master.

**Layout**: The planner (`src/components/planner/`) is structured day-major (`DayCard` per day, each owning its own labels) specifically so responsive layout switching (7-column desktop grid ↔ single-column mobile stack) can be done with CSS media queries alone in `PlannerGrid.module.css`, with no JS-based view branching.

**Backup/restore** (`src/utils/backup.ts` + `src/components/layout/BackupControls.tsx`): downloads/uploads the entire `AppData` as a versioned JSON file (`schemaVersion`/`exportedAt`/`data`). Import fully replaces state (`REPLACE_ALL` action) — no merge.

**Styling**: CSS Modules per component, with shared tokens (colors, highlight/info badge variables) as CSS custom properties in `src/index.css`. Food categories are the fixed 3-color group (赤/黄/緑, `src/types.ts`) used consistently for both grouping and highlight styling.

## Conventions

- Commit messages and all user-facing text/UI copy are Japanese; think in English, respond to the user in Japanese (per instruction above).
- When asked to commit/push, split changes into logically-cohesive commits (by feature/concern), not by file count — one commit per feature is fine even if it touches many files, but unrelated concurrent changes should be split into separate commits.
