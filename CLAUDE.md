# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm install          # install deps
npm start            # expo start (Metro dev server, QR + platform menu)
npm run android      # expo start --android
npm run ios          # expo start --ios
npm run web          # expo start --web
npx tsc --noEmit     # typecheck
```

`npx tsc --noEmit` currently reports two pre-existing errors in the scaffolded `App.tsx` (an implicit `any` on `Item`'s `onPressItem` param, and a null-check on `getFirstAsync` in `migrateDbIfNeeded`). They predate any new work — don't assume you caused them, and fix them if you touch those lines.

There is no test runner, linter, or build script configured — `package.json` defines only the four `expo start` variants. Do not invent `npm test` / `npm run lint`; add the tooling first if a task needs it.

## Architecture

Bare Expo SDK 57 app (React Native 0.86, React 19, TypeScript 6) with no navigation library and no `src/` directory. `App.tsx` is the single entry point and currently holds everything: components, SQLite queries, the migration function, and styles, separated by `//#region` markers.

Key structural facts:

- **Not yet an expense app.** The repo is the upstream `expo/examples` *with-sqlite* todo demo (see `README.md`, still titled "SQLite Example"), renamed to `expense-management` in `app.json`/`package.json`. The `ItemEntity` todo model and its `items` table are placeholder scaffolding to be replaced, not domain code to preserve.
- **No Expo Router.** Routing is absent entirely; `App.tsx` is registered directly. Adding screens means either introducing a navigation library or building an `app/` directory and switching to `expo-router` — both are structural changes worth confirming first.
- **SQLite access pattern.** `SQLiteProvider` (from `expo-sqlite`) wraps the tree in `App`, opening `db.db` and running `onInit={migrateDbIfNeeded}`. Components reach the handle via `useSQLiteContext()`; DB helpers are plain module-level functions taking `db: SQLiteDatabase` as their first argument rather than hooks. Multi-statement reads use `db.withExclusiveTransactionAsync`.
- **Migrations are version-gated, not tracked in files.** `migrateDbIfNeeded` compares `PRAGMA user_version` against a `DATABASE_VERSION` constant and applies each step in sequence. To change the schema: bump `DATABASE_VERSION`, add an `if (currentDbVersion === N)` block that migrates forward and reassigns `currentDbVersion`, and leave earlier blocks intact — the final `PRAGMA user_version = ${DATABASE_VERSION}` write applies to all paths. Editing an existing migration in place will not re-run on devices that already stored the newer version.
- **`expo-sqlite` is registered as a config plugin** in `app.json`; native-affecting deps must be added there too.

## Conventions

- Single quotes, 2-space indent, semicolons; `StyleSheet.create` at the bottom of the file with alphabetically-grouped style keys.
- SQLite booleans are stored as `INT` but passed/read as JS booleans through the `expo-sqlite` binding — keep parameters as `true`/`false`, not `1`/`0`.
- Always parameterize queries with `?` placeholders and positional args, as the existing helpers do.
