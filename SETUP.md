# FIFA 2026 – Local Setup

## Prerequisites

- Node.js ≥ 20 (`node -v`)
- A PostgreSQL database (local Docker or cloud like Prisma Data Platform / Neon / Supabase)
- A Google Cloud project with OAuth 2.0 credentials

---

## 1. Clone and install

```bash
git clone <repo-url>
cd <repo-directory>
npm install
```

---

## 2. Environment variables

Create an `.env` file in the project root:

```
DATABASE_URL="postgresql://user:password@host:5432/fifa2026"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
AUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 3. Get your Google OAuth credentials

1. Go to https://console.cloud.google.com
2. Create a project (or use an existing one)
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret → paste into `.env.local`

---

## 4. Option A – Local PostgreSQL with Docker

```bash
# First time: create the container
docker run --name fifa2026-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fifa2026 \
  -p 5432:5432 \
  -d postgres:16

# Subsequently: just start it
docker start fifa2026-db

# Verify it's running
docker ps | grep fifa2026-db
```

Use this `DATABASE_URL`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fifa2026"
```

## 4. Option B – Cloud database (Prisma Data Platform, Neon, Supabase…)

Copy the connection string from your cloud dashboard and use it as `DATABASE_URL` in `.env`.

---

## 5. Database setup (first time only)

```bash
# Apply migrations and generate Prisma client
npx prisma migrate dev

# Seed teams, game state, and default league
npm run db:seed

# Seed all group-stage matches
npm run db:seed-matches

# Seed knockout-stage placeholders
npm run db:seed-knockout

# Seed leagues
npm run db:seed-leagues
```

---

## 6. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 7. Make yourself admin (first time only)

Sign in with Google first, then run:

```bash
npm run db:make-admin your@email.com
```

After that, you can promote others from the app at `/admin/users`.

---

## 8. Set up leagues (optional)

A "Default" league is created automatically by `db:seed`. To add sample leagues for local testing:

```bash
npm run db:seed-leagues
```

Then visit `http://localhost:3000/league/otv` to test the join flow.

To create leagues in the app, go to `/admin/leagues` after signing in as admin.

---

## 9. Run tests

```bash
# Run all unit tests once
npm test

# Watch mode
npx vitest

# Single file
npx vitest run lib/__tests__/countdown.test.ts
```

---

## 10. Type-check

```bash
npx tsc --noEmit
```

---

## 11. Deploy to Heroku (example)

```bash
# Push to GitHub + Heroku
git push origin main && git push heroku main

# Check what's pending before deploying
git log heroku/main..main --oneline

# Useful Heroku commands
heroku logs --tail
heroku ps
heroku restart
heroku run "npm run db:make-admin your@email.com"
```

---

## Game Flow

| Step | Who | What |
|---|---|---|
| Before **Jun 11 2026 19:00 UTC** | Players | Sign in with Google, create up to 3 selections |
| Jun 11 | Admin | Lock & Start → game state switches to STARTED |
| During tournament | Admin | Edit each match with goals + result → scores recalculate |
| Anytime | Everyone | Leaderboard, WC Results, bracket |
