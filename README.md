# FIFA 2026 – Pick Your 8

A World Cup 2026 prediction game. Players pick one team from each of 8 FIFA-ranking-based sets (6 teams per set, 48 teams total) and score points as their teams progress through the tournament.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **PostgreSQL** + **Prisma 7** (via `@prisma/adapter-pg`)
- **Auth.js v5** with Google OAuth (JWT sessions)
- **Tailwind CSS** + **shadcn/ui**
- Deploy: **Heroku** + Heroku Postgres

## Quick Start

See [SETUP.md](./SETUP.md) for full instructions.

```bash
npm install
# configure .env.local (see SETUP.md)
npx prisma migrate dev --name init
npm run db:seed
npm run db:seed-matches
npm run db:seed-knockout
npm run dev
```

## Game Rules

- 48 qualified nations split into **8 sets of 6** by April 2026 FIFA ranking
- Each player picks **1 team per set** → 8-team combo, up to **3 selections**
- Selections are locked when the admin starts the tournament
- **Scoring**: Win +3 · Draw +1 · Goal +0.3 (group) · Goal +0.5 (knockout)
- Selection score = sum of all 8 teams' individual scores

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed 48 teams + game state |
| `npm run db:seed-matches` | Seed 72 group stage matches |
| `npm run db:seed-knockout` | Seed 32 knockout matches (TBD teams) |

## Roles

- **PLAYER** (default) — sign in with Google, create selections, view leaderboard
- **ADMIN** — enter match results, manage game state, manage users
