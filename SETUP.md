# FIFA 2026 – Setup Guide

## Prerequisites
- Node.js ≥ 20
- A PostgreSQL database (local or Heroku Postgres)
- A Google Cloud project with OAuth 2.0 credentials

---

## 1. Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-app.herokuapp.com/api/auth/callback/google` (prod)
4. Copy the **Client ID** and **Client Secret**

---

## 2. Environment Variables

Copy `.env.local` and fill in:

```bash
DATABASE_URL="postgresql://USER:PASS@HOST:5432/fifa2026"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
AUTH_SECRET="$(openssl rand -base64 32)"   # run this to generate
NEXTAUTH_URL="http://localhost:3000"        # change to prod URL when deploying
```

---

## 3. Database Setup

```bash
# Create tables (local dev)
npx prisma migrate dev --name init

# Seed: 48 teams + game state
npm run db:seed
```

---

## 4. Running Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 5. Deploy to Heroku

```bash
# Create app
heroku create your-app-name

# Add Postgres
heroku addons:create heroku-postgresql:essential-0

# Set env vars
heroku config:set GOOGLE_CLIENT_ID="..."
heroku config:set GOOGLE_CLIENT_SECRET="..."
heroku config:set AUTH_SECRET="$(openssl rand -base64 32)"
heroku config:set NEXTAUTH_URL="https://your-app-name.herokuapp.com"
heroku config:set NODE_ENV="production"

# Init git and push
git init
git add .
git commit -m "initial"
heroku git:remote -a your-app-name
git push heroku main

# Run migrations and seed on Heroku
heroku run npx prisma migrate deploy
heroku run npm run db:seed
```

---

## 6. Make Yourself Admin

After your first Google login, promote your account to Admin:

```bash
# Open Prisma Studio locally (with prod DATABASE_URL)
DATABASE_URL="..." npx prisma studio
# → find your User row, change role from PLAYER to ADMIN
```

Or via psql:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Once you're admin, you can promote others from `/admin/users`.

---

## 7. Game Flow

1. **PREPARING** state (default) – players can sign in and create up to 3 selections
2. Admin creates matches from `/admin/matches/new`
3. When tournament starts: Admin → Dashboard → **"Lock & Start"**
4. As matches are played: Admin edits each match with result + goals → scores auto-recalculate
5. Leaderboard updates live at `/leaderboard`

---

## Scoring Formula

| Event | Points |
|---|---|
| Win | +3 |
| Draw | +1 |
| Goal (group stage) | +0.3 |
| Goal (knockout) | +0.5 |

Selection score = sum of the 8 chosen teams' individual scores.
