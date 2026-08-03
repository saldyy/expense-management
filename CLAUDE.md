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
npm run typecheck    # tsc --noEmit
npm run db:generate  # drizzle-kit generate — regenerate SQL migrations from schema.ts
```

`npm run typecheck` must stay clean; `strict` is on.

There is no test runner or linter configured. Do not invent `npm test` / `npm run lint` — add the tooling first if a task needs it. When tests do arrive, colocate them (`money.test.ts` next to `money.ts`), not in a `__tests__/` folder.

## Architecture

Bare Expo SDK 57 app (React Native 0.86, React 19, TypeScript 6). Offline-first expense tracker: **SQLite on the device is the source of truth and there is no network layer at all.** Never introduce a fetch, a sync call, or a remote cache without being asked.

- **Expo Router, `src/app` is routes-only.** Every file under `src/app` is a route and should be a thin wrapper that renders a screen body from `src/screens`. Route-specific concerns (`useLocalSearchParams`, redirects) belong in the route file — see `src/app/transaction/[id].tsx`. Entry point is `"main": "expo-router/entry"` in `package.json`; there is no `App.tsx`.
- **Screens live in `src/screens/<name>/index.tsx`**, with their private sub-components colocated in `src/screens/<name>/components/`. Only genuinely reusable UI goes in `src/components`.
- **Drizzle ORM over `expo-sqlite`.** `src/db/client.ts` opens `expense.db` with `enableChangeListener: true` and exports the singleton `db`. Query helpers in `src/db/queries/*.ts` are module-level functions that import that singleton — they do **not** take a `db` argument.
- **Reads are live queries.** Read helpers return a Drizzle *query object* (not a promise) so screens pass them to `useLiveQuery` from `drizzle-orm/expo-sqlite` and re-render automatically after any write. If a list needs a manual refetch, `enableChangeListener` is missing — that is the bug, don't add a refetch.
- **Zustand holds UI/session state only** (`src/stores`). It must never mirror DB rows. `use-filter-store` holds the *inputs* to `listTransactionsQuery`; the rows come from `useLiveQuery`. `use-settings-store` persists locale/currency/theme via AsyncStorage.
- **Migrations are generated, not hand-written.** Edit `src/db/schema.ts`, run `npm run db:generate`, and commit the output in `src/db/migrations/` (both the `.sql` files and `migrations.js`). They are applied at startup by `useMigrations` in `src/app/_layout.tsx`. Never hand-edit a generated migration, and never reintroduce `PRAGMA user_version` gating.
- **`babel.config.js` and `metro.config.js` exist for Drizzle.** `inline-import` bundles the `.sql` files and Metro resolves the `sql` extension. The Reanimated/worklets Babel plugin is added by `babel-preset-expo` automatically — do not add it manually.
- **Native-affecting deps must be registered** in `app.json` `plugins`, and installed with `npx expo install` so the SDK-correct version is picked.

## Conventions

- Single quotes, 2-space indent, semicolons. Files are kebab-case; components use named exports (route files use `export default`, as Router requires).
- `StyleSheet.create` at the bottom of each component file, with alphabetically-ordered style keys. Colors come from `useTheme()` (`src/hooks/use-theme.ts`) and are applied inline; only layout goes in the StyleSheet. Spacing/radius/font tokens come from `src/theme.ts`.
- **Money is always an integer of minor units** (`amountMinor`). Never a float. All conversion and formatting lives in `src/utils/money.ts`; screens use the `useFormatCurrency()` hook.
- Timestamps are epoch milliseconds stored as `INTEGER`.
- **All rows are soft-deleted** (`deletedAt`) and carry `updatedAt`. Every read must filter `isNull(deletedAt)`. The one exception is `eraseAllData()` in `src/db/reset.ts` (Settings → Erase all data), which hard-deletes every table and reseeds — a deliberate, user-confirmed factory reset, not a pattern to reuse elsewhere.
- IDs are client-generated UUIDs from `src/utils/id.ts` — never rely on autoincrement.
- **All user-facing strings go through `t()`.** Add the key to both `src/i18n/locales/en.json` and `vi.json`; `en.json` is the source of truth for the typed key union. Seeded categories store an i18n key as their `name` and are resolved with `useCategoryName()`. The app always launches in English (`DEFAULT_LOCALE` in `src/i18n/index.ts`) regardless of device language — it does not read device locale — and only switches when the user picks a language in Settings.
- Import app code via the `@/` alias, not relative paths that climb directories.
- SQLite booleans are declared `{ mode: 'boolean' }` in the schema and passed as JS booleans.
