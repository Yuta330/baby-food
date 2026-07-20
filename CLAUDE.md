# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

英語で考え、応答は日本語で実施すること。
Gitへのアクセスにはghを用いること。

## Project

離乳食週間プランナー — a client-only weekly baby-food (weaning food) planner. Vite + React 19 + TypeScript. No backend; all data lives in the browser's `localStorage`. Deployed to GitHub Pages from `main` via `.github/workflows/deploy.yml`, live at https://Yuta330.github.io/baby-food/. Non-`main` branches get their own preview deploy via `.github/workflows/deploy-dev.yml` (see Commands).

## Commands

```bash
npm run dev         # dev server (http://localhost:5173)
npm run build       # tsc -b (type check) + vite build — this is the only type-check step, there's no separate `tsc --noEmit` script
npm run lint        # oxlint (rules in .oxlintrc.json)
npm run preview     # preview the production build
npm run test        # vitest run
npm run test:watch  # vitest (watch mode)
```

Tests live under `tests/` (not co-located `src/**/*.test.ts`), mirroring `src`'s structure: `tests/context/AppDataContext.test.ts`, `tests/utils/date.test.ts`, `tests/utils/ingredientHistory.test.ts`, `tests/utils/ingredientRecommendation.test.ts`, `tests/utils/mealSchedule.test.ts`. Coverage is reducer logic + pure utility functions only — no component/UI tests; verify UI changes by driving the app (see the `run-baby-food` skill). Vitest config is embedded in `vite.config.ts`'s `test:` block (`environment: 'node'`, `include: ['tests/**/*.test.ts']`) rather than a separate `vitest.config.ts`. `.github/workflows/ci.yml` runs `lint` → `test` → `build` on every PR and push to `main`.

`vite.config.ts` sets `base: process.env.VITE_BASE ?? '/baby-food/'` for GitHub Pages — required whenever paths/assets are touched, since the app is not served from domain root. `.github/workflows/deploy-dev.yml` deploys any push to a branch other than `main`/`gh-pages` as a preview under `/baby-food/dev/`, building with `VITE_BASE=/baby-food/dev/` and `VITE_STORAGE_KEY_SUFFIX=.dev` so the preview's `localStorage` data (see below) stays isolated from production.

## Architecture

**State**: A single `AppData { ingredients: Ingredient[]; weekPlans: WeekPlan[]; settings: AppSettings; recipes: Recipe[] }` tree lives in React Context + `useReducer` (`src/context/AppDataContext.tsx`). Every mutation goes through the reducer's `Action` union and is auto-persisted to `localStorage` via a `useEffect` on state change, under key `` `babyFoodApp.v2${import.meta.env.VITE_STORAGE_KEY_SUFFIX ?? ''}` `` (see Commands — the suffix isolates the dev-preview deploy's data from production). There's a one-time migration path from the legacy, unsuffixed `babyFoodApp.v1` schema (`migrateLegacyWeekPlans`) — bump the storage key and add a migration function if the schema changes again.

**Data model** (`src/types.ts`): `WeekPlan.days` is always exactly 7 entries (Mon–Sun); each `DayPlan.meals` is 1–`MAX_MEALS_PER_DAY` (3) entries, always contiguous from index 0 (no gaps). Entry-level reducer actions (`ADD_ENTRY`/`UPDATE_ENTRY`/`DELETE_ENTRY`) address meals by **`mealIndex: number`**, not `mealId` — this is deliberate, since a day's meals may not exist in state yet (weeks/days are created lazily via `withWeekPlan`/`createEmptyWeekPlan` the first time they're touched), so there's no stable id to target ahead of creation. `Ingredient.defaultGrams` plus the `GRAM_STEP`/`MIN_GRAMS`/`MAX_GRAMS` constants drive the 5g-step gram stepper's default value and bounds.

**食事数の自動決定**: `getDefaultMealCount(date, schedule)` (`src/utils/mealSchedule.ts`) is a pure function that returns 1–3 from `AppSettings.mealCountSchedule`'s `secondMealStartDate`/`thirdMealStartDate` via plain `'YYYY-MM-DD'` string comparison against `date`. `WeekPlannerPage.tsx`/`DayCard.tsx` use it to decide a day's default meal count; the schedule itself is set via `SettingsPage.tsx`, dispatching `SET_MEAL_COUNT_SCHEDULE`.

**料理(レシピ)ベースの登録**: `Recipe { id, name, items: RecipeItem[] }` (`AppData.recipes`) is a separate ingredient-list master, CRUD'd via `ADD_RECIPE`/`UPDATE_RECIPE`/`DELETE_RECIPE` in `src/components/recipes/` (`RecipeMasterPage.tsx`, `RecipeList.tsx`, `RecipeForm.tsx`), seeded from `src/data/presetRecipes.ts`. Adding a recipe to a meal (`src/components/planner/MealRecipeSection.tsx`) gram-scales each `RecipeItem` by a multiplier and dispatches the batch action `ADD_ENTRIES` (still `mealIndex`-addressed, sibling to `ADD_ENTRY`) with one `PlanEntry` per item, all sharing a `recipeGroupId`; each entry keeps `recipeId` (source recipe, for display after master edits/deletes) and `baseGrams` (pre-multiplier snapshot, for re-scaling). `DELETE_RECIPE_GROUP`/`RESCALE_RECIPE_GROUP` operate on the whole group by that id.

**Dates** are plain `'YYYY-MM-DD'` strings everywhere (state, storage, comparisons), never `Date` objects — string comparison is chronological by construction. All date math goes through `src/utils/date.ts` (`getMonday`, `addDays`, `getWeekDates`, `isDateInWeek`, etc.); avoid introducing `Date`-object comparisons elsewhere.

**"初めて食べた日" (first-tried date) resolution** is centralized in `src/utils/ingredientHistory.ts::getEffectiveFirstTriedDateMap`: manually-set `Ingredient.firstTriedDate` wins; if unset, it falls back to the earliest date the ingredient appears anywhere across `weekPlans` (past or future). This is computed **once per page** (single pass over all weekPlans) and passed down as a `Map<ingredientId, date>` to whatever needs it — don't recompute per-cell/per-row. The three consumer screens (planner, summary, ingredient master) must stay in sync on this logic; `hasNoPastRecord` (same file) drives the "未経験" (never-yet-eaten) badge in the ingredient master.

**Layout**: The planner (`src/components/planner/`) is structured day-major (`DayCard` per day, each owning its own labels) specifically so responsive layout switching (7-column desktop grid ↔ single-column mobile stack) can be done with CSS media queries alone in `PlannerGrid.module.css`, with no JS-based view branching.

**Backup/restore** (`src/utils/backup.ts` + `src/components/layout/BackupControls.tsx`): downloads/uploads the entire `AppData` as a versioned JSON file (`schemaVersion`/`exportedAt`/`data`). Import fully replaces state (`REPLACE_ALL` action) — no merge.

**Styling**: CSS Modules per component, with shared tokens (colors, highlight/info badge variables) as CSS custom properties in `src/index.css`. Food categories are the fixed 3-color group (赤/黄/緑, `src/types.ts`) used consistently for both grouping and highlight styling.

## Conventions

- Commit messages and all user-facing text/UI copy are Japanese; think in English, respond to the user in Japanese (per instruction above).
- When asked to commit/push, split changes into logically-cohesive commits (by feature/concern), not by file count — one commit per feature is fine even if it touches many files, but unrelated concurrent changes should be split into separate commits.
