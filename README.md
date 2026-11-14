# ENDO EXPERT – Microendodontics website

React + Vite (Tailwind, Framer Motion, Three.js) front end with an admin CMS, backed by an
**Express API and PostgreSQL**. Content, appointments, admin accounts and uploaded photos/videos
all live in PostgreSQL – no other services are needed.

## Run locally

1. Create a **UTF-8** PostgreSQL database, e.g. `createdb endoexpert`.
2. `cp .env.example .env` and fill in `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   (quote values containing `#` or spaces).
3. Install and start both processes:
   ```bash
   npm install
   npm run server     # API on :4000 – creates tables and the first admin on start
   npm run dev        # site on http://localhost:5173 (proxies /api to :4000)
   ```
4. Admin: <http://localhost:5173/admin> – sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Deploy (single Node service)

The Express server serves both the API and the built site.

| Setting | Value |
|---|---|
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Node | 18 or newer |

Environment variables:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string (Render, Railway, Neon, Supabase-as-plain-Postgres, RDS …) |
| `JWT_SECRET` | yes | Long random string, signs admin login tokens |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first run | Creates the first admin if that email doesn't exist yet |
| `NODE_ENV` | recommended | `production` (SSL to the database is then enabled automatically for non-local hosts) |
| `DATABASE_SSL` | optional | `true` / `false` to force SSL on or off |
| `PORT` | optional | Most hosts set this for you |

Tables are created automatically from `server/schema.sql` when the server starts.
Reset or add an admin later with `npm run create-admin -- you@example.com NewPassword`.

### Vercel

The repo also deploys to Vercel as-is: the site is built to `dist`, and every `/api/*` call runs the
same Express app as a serverless function (`api/index.js`, config in `vercel.json`).
Set `DATABASE_URL` (use Neon's pooled string), `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in
Project → Settings → Environment Variables, then redeploy. Vercel limits request bodies to ~4.5 MB,
so upload photos in the admin (they are resized automatically) and host large videos as files in
`public/` or via a URL.

## Project layout

- `server/app.js` – Express API (content draft/publish, revisions, booking, media, admin auth); `server/index.js` starts it as a normal server; `api/index.js` runs it on Vercel
- `server/schema.sql` – PostgreSQL schema (idempotent)
- `src/lib/store.js` – front-end data layer (calls `/api`)
- `src/lib/defaultContent.js` – seed copy; everything is editable in the admin
- `src/components/` – public sections, 3D tooth mascot, booking form · `src/admin/` – CMS pages

## Notes

- Sunday bookings are blocked on both the form and the server; slots follow the opening hours in
  Admin → Website Settings. One active booking per time slot is enforced by a database index.
- Admin changes autosave to a draft; **Publish** makes them live and keeps version history.
- Uploads are stored in PostgreSQL (`media` table, up to 60 MB each). Larger videos can be
  referenced by URL instead.
- Testimonials are empty by default – only add real patient reviews.
