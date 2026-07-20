---
name: run-baby-food
description: Build, run, and drive the baby-food weekly meal planner (Vite + React, client-only). Use when asked to start baby-food, run its dev server, take a screenshot of its UI, or click through/verify a change in the running app.
---

This is a client-only Vite/React SPA (no backend, state in `localStorage`). Drive it by starting
the Vite dev server and scripting a headless browser against it. `chromium-cli` is not installed
on this host, so this skill ships its own minimal Playwright-based REPL driver at
`.claude/skills/run-baby-food/driver.mjs` that speaks a similar line-oriented command language —
pipe commands to it via a heredoc.

All paths below are relative to the repo root (`C:\works\baby-food`).

## Prerequisites

This was verified on Windows (Git Bash), not Linux — there is no Linux-specific package list
here. You need Node.js (already required by the app itself) and network access once to fetch a
Chromium binary for Playwright.

## Setup

The driver has its own tiny `package.json` inside the skill directory, kept separate from the
app's own `package.json`/lockfile:

```bash
cd .claude/skills/run-baby-food
npm install               # installs playwright into this skill dir only
npx playwright install chromium   # downloads a browser binary (one-time, cached)
cd ../../..                # back to repo root
```

The app itself needs its own deps installed as usual (`npm install` at repo root) before `npm run
dev` will work.

## Build

No separate build step is needed to *run* the app in dev mode (see below). To type-check +
produce a production bundle: `npm run build` (runs `tsc -b && vite build`).

## Run (agent path)

1. Start the dev server in the background and wait for it to actually serve (note the `base:
   '/baby-food/'` path from `vite.config.ts` — the app is not served at `/`):

   ```bash
   npm run dev > /tmp/dev.log 2>&1 &
   timeout 30 bash -c 'until curl -sf http://localhost:5173/baby-food/ >/dev/null; do sleep 1; done'
   ```

2. Pipe commands to the driver, one per line, via stdin:

   ```bash
   node .claude/skills/run-baby-food/driver.mjs <<'EOF'
   nav /
   wait-for text=離乳食 週間プランナー
   screenshot 01-planner.png
   click button:has-text("設定")
   wait-for text=赤ちゃんの誕生日
   fill input[type="date"] 2026-01-12
   click button:has-text("食材マスタ")
   wait-for text=食材マスタ
   text li:has-text("はちみつ")
   screenshot 02-ingredients.png
   quit
   EOF
   ```

3. Stop the dev server when done. `pkill -f vite` looks natural but **does not work on this
   host** (see Gotchas) — find the PID actually bound to the port and kill that:

   ```bash
   pid=$(netstat -ano | grep ':5173' | grep LISTENING | awk '{print $NF}')
   taskkill //PID "$pid" //F //T
   ```

Screenshots land in `.claude/skills/run-baby-food/screenshots/` (gitignored). `BASE_URL` env var
overrides the default `http://localhost:5173/baby-food/` if the port is busy (`vite` picks the
next free port and logs it — check `/tmp/dev.log` if `curl` never succeeds).

Driver commands:

| command | what it does |
|---|---|
| `nav <path>` | navigate; `<path>` is relative to `BASE_URL`, or a full URL |
| `reload` | reload current page |
| `wait-for text=<substring>` | wait for text to appear anywhere on the page |
| `wait-for <css selector>` | wait for a selector to appear |
| `click <selector>` | click; selector may contain spaces (descendant/`:has()` combinators) |
| `click-file-chooser <selector> <path>` | click a button that opens a native file picker, feed it `<path>` (for the backup "アップロード" button) |
| `fill <selector> <value...>` | fill an input; selector is the first token (no spaces), value is everything after |
| `select <selector> <label...>` | choose a `<select>` option by its visible label text (Playwright `.fill()` doesn't work on `<select>` elements) |
| `text <selector>` | print `innerText` of the first match |
| `options <selector>` | print `innerText` of all matches as a JSON array (e.g. `select option`) |
| `attr <selector...> <name>` | print an attribute's value (`null` if absent, `""` if present with no value — e.g. a `disabled` boolean attribute); last token is the attribute name, everything before it is the selector |
| `set-local-storage <key> <json...>` | `localStorage.setItem(key, json)` in the page |
| `get-local-storage <key>` | print `localStorage.getItem(key)` |
| `screenshot [name]` | save a full-page PNG (default name is timestamped) |
| `quit` | close the browser and exit |

Console errors, page errors, and JS `confirm()`/`alert()` dialogs (auto-accepted) are logged as
they occur, prefixed `[console-error]` / `[page-error]` / `[dialog]`.

## Run (human path)

`npm run dev` → open `http://localhost:5173/baby-food/` in a browser. `Ctrl-C` to stop. This is
what a human would do; an agent in a headless container should use the driver above instead.

## Test

`npm run test` (vitest) covers reducer logic and pure utility functions under `tests/` — it does
**not** touch components or UI (`CLAUDE.md`'s Commands section has the file list). So for anything
UI-visible, `npm run test` passing is not sufficient verification: drive the app with this skill's
driver as above. Full verification is `npm run build` (type-check) + `npm run lint` (oxlint) +
`npm run test` + driving the app.

---

## Gotchas

- **The app is not served at `/`.** `vite.config.ts` sets `base: '/baby-food/'` for GitHub Pages.
  `curl http://localhost:5173/` alone will 404 the readiness check — poll
  `http://localhost:5173/baby-food/` instead, and `nav /` in the driver resolves against that same
  base.
- **Selectors with spaces broke naive positional parsing.** The `attr` and `fill` commands
  originally split the line on spaces and took fixed positional slots for selector/value, which
  silently mis-parsed any selector containing a descendant combinator (e.g. `select
  option:has-text("はちみつ")`) — `fill` is fine (its selector is always a single atomic token in
  practice, e.g. `input[type="date"]`), but `attr` needed fixing to treat the *last* token as the
  attribute name and join everything before it as the selector.
- **`attr ... disabled` on a present-but-valueless boolean attribute returns `""`, not `"true"`.**
  HTML renders `<option disabled>` as `disabled=""`; that's Playwright's `getAttribute` behavior,
  not a driver bug. Treat `null` as absent and any other string (including `""`) as present.
- **`window.confirm()` is used for delete/backup-restore confirmations** (`IngredientMasterPage`,
  `BackupControls`). Playwright auto-dismisses unhandled dialogs, which silently no-ops those
  flows. The driver auto-accepts all dialogs and logs `[dialog] <message>` — if a click that should
  show a confirm dialog appears to do nothing, check for that log line.
- **`pkill -f vite` / `pkill -f "npm run dev"` silently do nothing on this host.** This Git
  Bash/MSYS environment's `ps aux` doesn't expose full command lines the way `pkill -f` needs to
  match on, so pattern-based kills find nothing and the dev server (and its child `node` process)
  keeps running — the next `npm run dev` then binds a *different* port (5174, 5175, ...) instead of
  failing loudly, which is easy to miss. Kill by the PID actually bound to the port instead (see
  "Run (agent path)" step 3). If `curl`'s readiness check times out, `netstat -ano | grep LISTEN`
  for stray `517x` ports before assuming something else is wrong.
- **`localStorage` is per-origin, so it persists across `nav`/`reload` within one driver session**
  but not across separate `node driver.mjs` invocations against a fresh browser context — use
  `set-local-storage` at the start of a session to seed state (e.g. simulating a pre-migration
  `babyFoodApp.v2` payload) rather than assuming prior runs left anything behind.
- **CSS Modules class names are hashed, so `.popover`/`.stepper`/etc. selectors from the source
  `.module.css` files never match in the rendered DOM.** Use text/role-based selectors
  (`button:has-text("保存")`, `label:has-text("既定のグラム数") button >> nth=0`) instead of
  guessing at a component's CSS Modules class name.
- **`fill` on a `<select>` throws "Element is not an `<input>`..."** — use the `select` command
  (added for this reason) instead, which calls Playwright's `selectOption({ label })`.

## Troubleshooting

- **`curl` readiness check times out**: another process is already on 5173, so Vite picked a
  different port and logged it (`Local: http://localhost:5174/baby-food/`) — check `/tmp/dev.log`
  and set `BASE_URL` accordingly before running the driver.
- **`npx playwright install chromium` prints nothing and exits 0**: this means it's already cached
  (`%USERPROFILE%\AppData\Local\ms-playwright` on Windows) from a prior install — not a failure.
