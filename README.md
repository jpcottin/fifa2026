# FIFA 2026 – Pick Your 8

A World Cup 2026 prediction game. Players are invited to a league and create a selection by picking one team (i.e. country) from each of 8 FIFA-ranking-based sets (6 teams per set, 48 teams total) and score points as their selection's teams progress through the tournament.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **PostgreSQL** + **Prisma 7** (via `@prisma/adapter-pg`)
- **Auth.js v5** with Google OAuth (JWT sessions)
- **Tailwind CSS** + **shadcn/ui**
- Deploy: **Heroku** + Heroku Postgres

## Quick Start

See [SETUP.md](./SETUP.md) for full instructions.

## Game Rules

- 48 qualified nations split into **8 sets of 6** by April 2026 FIFA ranking
- Each player picks **1 team per set** → 8-team combo, up to **3 selections**
- Selections are **final once submitted** — they cannot be changed or deleted
- Selections close on **June 11, 2026 at 19:00 UTC** and are locked when the admin starts the tournament
- **Scoring**: Win +3 · Draw +1 · Goal +0.3 (group) · Goal +0.5 (knockout)
- Selection score = sum of all 8 teams' individual scores
- Extra time and penalty shootouts do not change the scoring outcome — only regular-time goals and the match result (win/draw/loss) count

## Leagues

The app supports multiple isolated groups of players competing on separate leaderboards — called **leagues**.

- The **admin** creates leagues from `/admin/leagues` (e.g. "OTV" → `/league/otv`, "LetsPlay" → `/league/letsplay`)
- The admin copies the invite URL and shares it with each group
- Players visit their league URL, sign in with Google, and are automatically enrolled
- Each player belongs to **one league** — the admin can reassign them from `/admin/users`
- The leaderboard is scoped to the player's league; admins can filter across all leagues
- **Match results are entered once** by the admin and instantly affect scoring in all leagues

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run db:seed` | Seed 48 teams + game state + default league |
| `npm run db:seed-matches` | Seed 72 group stage matches |
| `npm run db:seed-knockout` | Seed 32 knockout matches (TBD teams) |
| `npm run db:seed-leagues` | Seed sample OTV and LetsPlay leagues (local dev) |
| `npm run db:make-admin <email>` | Promote a user to Admin |

## Auto-advance

After every `PATCH /api/matches/:id` call, `autoAdvanceKnockout()` runs automatically and fills in knockout match slots as soon as their prerequisites are resolved:

- **R32 winner/runner-up slots** (8 of 16): filled when both referenced groups have played all 6 matches.
- **R32 3rd-place slots** (8 of 16): `team1` (the group winner) is filled automatically as soon as that group completes. `team2` (the 3rd-place qualifier from a cross-group pool, e.g. "best 3rd of C/D/F/G/H") requires the official FIFA assignment table and must be set manually by the admin after all groups finish.
- **R16 → QF → SF → Final / 3rd place**: filled as each upstream knockout match gets a result.

Slots are identified by their `note` field. New match records are created automatically (with `winner = UPCOMING`) when both teams can be resolved; existing UPCOMING records are updated if the teams change.

Auto-advance never overwrites a match that already has a result (`winner ≠ UPCOMING`) or has `teamsLocked = true`. Setting `teamsLocked` happens automatically when an admin explicitly patches team IDs via `PATCH /api/matches/:id`.

### Bracket display for partial-TBD slots

Once `team1` is filled but `team2` is still the TBD placeholder, the bracket shows the known team normally (with flag) and renders the pending side as its seeding spec in italic — for example:

```
🇫🇷 France
3rd C/D/F/G/H   ← italic, filled by admin after groups finish
```

This applies to both the web bracket (`/wc-results`) and the Android app. Once the admin sets `team2` and the team's name no longer starts with "TBD", both sides render normally.

## Tests

```bash
npm test   # runs Vitest — 83 unit tests covering rankGroup, advancer, eliminated, resolveSpec, SLOTS, NOTE_BY_NUM, shortNote, normalizeSlug, isValidSlug
```

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
| `leagueId` | String? | FK → League; null for admins without a league |

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
| `extraTime` | Boolean | `true` when the knockout match went to extra time; default `false` |
| `pkTeam1Goals`, `pkTeam2Goals` | Int? | Penalty shootout goals (set when `extraTime = true` and `winner = DRAW`; the team with more PK goals advances) |
| `note` | String? | Human-readable description for TBD knockout matchups (e.g. "Runner-up Group A vs Runner-up Group B"); also used by auto-advance to identify slots |
| `teamsLocked` | Boolean | When `true`, auto-advance will not overwrite `team1Id`/`team2Id`. Set automatically when an admin explicitly patches team IDs; reset with `{ "teamsLocked": false }` |

### `League`
A named group of players competing on a shared leaderboard.

| Column | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `name` | String | Display name (e.g. "OTV") |
| `slug` | String | Unique URL key (e.g. "otv") — used at `/league/:slug` |
| `createdAt` | DateTime | |

### `Selection`
A player's 8-team combo. Immutable once submitted.

| Column | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | String | FK → User |
| `leagueId` | String | FK → League |
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

### Health

#### `GET /api/health`
Public. Returns `{"status":"ok"}` and performs a lightweight `SELECT 1` database ping. Use this to verify the server and database are reachable (e.g. uptime monitoring).

```json
{ "status": "ok" }
```

---

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
Update any subset of match fields. Triggers a full score recalculation for all teams and selections, then runs **auto-advance**: knockout slots whose prerequisites are now resolved (group complete, or upstream match has a result) are automatically created or updated with the correct teams.

Extra time and penalty shootout fields:
```json
{ "winner": "TEAM1", "team1Goals": 2, "team2Goals": 1, "extraTime": true }
{ "winner": "DRAW",  "team1Goals": 1, "team2Goals": 1, "extraTime": true,
  "pkTeam1Goals": 5, "pkTeam2Goals": 3 }
```

For PK games `winner` stays `DRAW`; the team with more PK goals is treated as the advancer by auto-advance and by the bracket display.

Manually overriding teams on an UPCOMING knockout match (patching `team1Id` or `team2Id`) automatically sets `teamsLocked = true`, preventing auto-advance from overwriting the change. To hand control back to auto-advance:
```json
{ "teamsLocked": false }
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

### Leagues

#### `GET /api/leagues` — **Admin**
Returns all leagues with member counts.

#### `POST /api/leagues` — **Admin**
Create a league. Slug is auto-generated from the name if omitted.

```json
{ "name": "OTV", "slug": "otv" }
```

#### `GET /api/leagues/:slug`
Public. Returns the league name and slug (used by the join page).

#### `POST /api/leagues/:slug/join`
Authenticated. Enroll the current user in this league. Returns 400 if the user is already in a different league.

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
Change a user's role and/or league.

```json
{ "role": "ADMIN" }
{ "leagueId": "<league-id>" }
{ "leagueId": null }
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
