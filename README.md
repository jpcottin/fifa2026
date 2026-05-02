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
- Selections are **final once submitted** — they cannot be changed or deleted
- Selections close on **June 11, 2026 at 19:00 UTC** and are locked when the admin starts the tournament
- **Scoring**: Win +3 · Draw +1 · Goal +0.3 (group) · Goal +0.5 (knockout)
- Selection score = sum of all 8 teams' individual scores

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run db:seed` | Seed 48 teams + game state |
| `npm run db:seed-matches` | Seed 72 group stage matches |
| `npm run db:seed-knockout` | Seed 32 knockout matches (TBD teams) |
| `npm run db:make-admin <email>` | Promote a user to Admin |

## Roles

- **PLAYER** (default) — sign in with Google, create selections, view leaderboard
- **ADMIN** — enter match results, manage game state, manage users

---

## Database Schema

Seven tables managed by Prisma + PostgreSQL.

### `User`
Created automatically on first Google sign-in.

| Column | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `email` | String | Unique |
| `name`, `image` | String? | From Google profile |
| `role` | `PLAYER` \| `ADMIN` | Default: `PLAYER` |

### `Team`
48 qualified nations + 2 TBD placeholders for knockout fixtures.

| Column | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `name` | String | Unique |
| `set` | Int | 1–8 (FIFA ranking groups); 0 for TBD placeholders |
| `flagEmoji` | String | e.g. `🇧🇷` |
| `score` | Float | Recalculated after every match result |

### `Match`
One row per fixture, group stage and knockout.

| Column | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `team1Id`, `team2Id` | String | FK → Team |
| `date` | DateTime? | Scheduled kick-off |
| `phase` | `GROUP` \| `R32` \| `R16` \| `QF` \| `SF` \| `THIRD` \| `FINAL` | |
| `winner` | `UPCOMING` \| `TEAM1` \| `TEAM2` \| `DRAW` | Default: `UPCOMING` |
| `team1Goals`, `team2Goals` | Int | Default: 0 |
| `note` | String? | Human-readable description for TBD knockout matchups (e.g. "Runner-up Group A vs Runner-up Group B") |

### `Selection`
A player's 8-team combo. Immutable once submitted.

| Column | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | String | FK → User |
| `name` | String | Player-chosen label |
| `teamIds` | String[] | Exactly 8 team IDs, one per set |
| `score` | Float | Recalculated after every match result |

### `GameState`
A single row (`id = "singleton"`) controlling the game lifecycle.

| Column | Type | Notes |
|---|---|---|
| `state` | `PREPARING` \| `STARTED` | `PREPARING`: selections open; `STARTED`: selections locked |

### `Account` / `Session` / `VerificationToken`
Auth.js internals for the Google OAuth flow. Not accessed directly by the application.

---

## REST API

All endpoints require authentication via session cookie (web) or `Authorization: Bearer <token>` (mobile app), except `GET /api/stats` which is public. Endpoints marked **Admin** additionally require the `ADMIN` role.

### Stats

#### `GET /api/stats`
Public. Returns player and selection counts for the home screen.

```json
{ "totalPlayers": 12, "totalSelections": 27 }
```

---

### Teams

#### `GET /api/teams`
Returns all teams ordered by score descending.

```json
[{ "id": "...", "name": "Brazil", "set": 1, "flagEmoji": "🇧🇷", "score": 12.5 }]
```

---

### Matches

#### `GET /api/matches`
Returns all matches with full team objects, ordered by date.

#### `POST /api/matches` — **Admin**
Create a match.

```json
{ "team1Id": "...", "team2Id": "...", "date": "2026-06-15T18:00:00Z",
  "phase": "GROUP", "winner": "UPCOMING", "team1Goals": 0, "team2Goals": 0 }
```

#### `PATCH /api/matches/:id` — **Admin**
Update any subset of match fields. Triggers a full score recalculation for all teams and selections.

```json
{ "winner": "TEAM1", "team1Goals": 2, "team2Goals": 0 }
```

#### `DELETE /api/matches/:id` — **Admin**
Delete a match and recalculate all scores.

---

### Selections

#### `GET /api/selections`
Returns all selections with user info (name, image), ordered by score.

#### `POST /api/selections`
Create a selection. Enforces:
- Deadline not passed (June 11, 2026 19:00 UTC)
- Game state is `PREPARING`
- User has fewer than 3 selections
- Exactly 8 team IDs, one from each set (1–8)

```json
{ "name": "My Dream Team", "teamIds": ["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8"] }
```

#### `DELETE /api/selections/:id` — **Admin**
Delete a selection. Regular players cannot delete their own selections once submitted.

---

### Game State

#### `GET /api/game-state`
Returns the current game state.

```json
{ "id": "singleton", "state": "PREPARING" }
```

#### `PATCH /api/game-state` — **Admin**
Switch game state to lock selections and start the tournament.

```json
{ "state": "STARTED" }
```

---

### Users (Admin)

#### `GET /api/admin/users` — **Admin**
Returns all users (id, name, email, image, role, createdAt).

#### `PATCH /api/admin/users/:id` — **Admin**
Change a user's role.

```json
{ "role": "ADMIN" }
```

#### `DELETE /api/admin/users/:id` — **Admin**
Delete a user. Cannot delete yourself.

---

### Mobile Authentication

#### `POST /api/auth/mobile`
Exchange a Google ID token (from native Google Sign-In) for a 30-day JWT used as a Bearer token on subsequent API calls.

```json
// Request
{ "idToken": "<google-id-token>" }

// Response
{ "token": "<jwt>" }
```

The JWT is then passed as `Authorization: Bearer <token>` on all subsequent requests from the mobile app.
