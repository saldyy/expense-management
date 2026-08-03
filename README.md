# Expense Management

An offline-first expense tracker built with Expo SDK 57. Everything lives on the
device — there is no account, no server, and no sync. SQLite is the source of
truth.

<p>
  <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
</p>

## Stack

| Concern          | Choice                                                  |
| ---------------- | ------------------------------------------------------- |
| Navigation       | Expo Router (file-based, `src/app`)                     |
| Database         | SQLite via `expo-sqlite` + Drizzle ORM                  |
| Reactivity       | `useLiveQuery` — reads re-run automatically after writes |
| State management | Zustand (UI/session state only)                          |
| Localization     | i18next + react-i18next (en, vi — defaults to English)  |
| Animation        | react-native-reanimated                                  |

## Getting started

```bash
npm install
npm start        # then press i / a, or scan the QR code
```

## Project structure

```
src/
  app/            Expo Router routes ONLY — thin files that render a screen
  screens/        screen bodies, with private sub-components colocated
  components/     reusable UI primitives
  db/             client, schema, generated migrations, queries, seed
  stores/         Zustand stores (UI state — never DB rows)
  i18n/           i18next setup + locale JSON
  hooks/          reusable hooks
  utils/          money, date and id helpers
  theme.ts        color schemes and spacing/typography tokens
```

## Working with the database

The schema lives in `src/db/schema.ts`. Migrations are **generated** — never
hand-written:

```bash
# 1. edit src/db/schema.ts
npm run db:generate      # writes src/db/migrations/NNNN_*.sql
# 2. commit the generated files
```

They are applied at startup by `useMigrations` in `src/app/_layout.tsx`.

Two rules worth knowing before you write a query:

- **Money is stored as an integer of minor units** (`amountMinor`), never a
  float. Use the helpers in `src/utils/money.ts`.
- **Deletes are soft** (`deletedAt`), so every read filters `isNull(deletedAt)`.

## Scripts

| Script                | Does                                    |
| --------------------- | --------------------------------------- |
| `npm start`           | Metro dev server                        |
| `npm run ios`         | open on iOS                             |
| `npm run android`     | open on Android                         |
| `npm run web`         | open in the browser                     |
| `npm run typecheck`   | `tsc --noEmit`                          |
| `npm run db:generate` | regenerate migrations from the schema   |

## Notes

- [Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/)
- [Drizzle + Expo SQLite](https://orm.drizzle.team/docs/connect-expo-sqlite)
