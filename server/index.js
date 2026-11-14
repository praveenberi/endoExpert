// ENDO EXPERT API + static file server (Express + PostgreSQL).
import 'dotenv/config'
import express from 'express'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROD = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 4000
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is not set (see .env.example).'); process.exit(1) }
if (PROD && !process.env.JWT_SECRET) { console.error('JWT_SECRET must be set in production.'); process.exit(1) }
const SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
const useSsl = process.env.DATABASE_SSL === 'true' || (PROD && process.env.DATABASE_SSL !== 'false' && !isLocal)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: useSsl ? { rejectUnauthorized: false } : undefined })
const q = (text, params) => pool.query(text, params)

async function init() {
  await q(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  if (email && process.env.ADMIN_PASSWORD) {
    const { rowCount } = await q('select 1 from admin_users where email = $1', [email])
    if (!rowCount) {
      await q('insert into admin_users (email, password_hash) values ($1, $2)', [email, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)])
      console.log(`Created admin user ${email}`)
    }
  }
  const { rows } = await q('select count(*)::int n from admin_users')
  if (!rows[0].n) console.warn('No admin user yet - set ADMIN_EMAIL and ADMIN_PASSWORD and restart.')
}

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(express.json({ limit: '5mb' }))
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)
const fail = (res, code, message) => res.status(code).json({ error: message })

/* -- auth -- */
const attempts = new Map() // ip -> { n, t }  (simple login throttle)
function auth(req, res, next) {
  const h = req.headers.authorization || ''
  try { req.user = jwt.verify(h.replace(/^Bearer /, ''), SECRET); next() } catch { fail(res, 401, 'Not signed in') }
}
app.post('/api/auth/login', wrap(async (req, res) => {
  const a = attempts.get(req.ip) || { n: 0, t: Date.now() }
  if (Date.now() - a.t > 15 * 60e3) { a.n = 0; a.t = Date.now() }
  if (a.n >= 10) return fail(res, 429, 'Too many attempts. Try again in a few minutes.')
  const email = String(req.body.email || '').trim().toLowerCase(), password = String(req.body.password || '')
  const { rows } = await q('select id, email, password_hash from admin_users where email = $1', [email])
  const ok = rows[0] && await bcrypt.compare(password, rows[0].password_hash)
  if (!ok) { attempts.set(req.ip, { n: a.n + 1, t: a.t }); return fail(res, 401, 'Incorrect email or password.') }
  attempts.delete(req.ip)
  res.json({ token: jwt.sign({ id: rows[0].id, email: rows[0].email }, SECRET, { expiresIn: '12h' }), email: rows[0].email })
}))
app.get('/api/auth/me', auth, (req, res) => res.json({ email: req.user.email }))
app.post('/api/auth/change-password', auth, wrap(async (req, res) => {
  const { current, next } = req.body
  if (!next || String(next).length < 8) return fail(res, 400, 'New password must be at least 8 characters.')
  const { rows } = await q('select password_hash from admin_users where id = $1', [req.user.id])
  if (!rows[0] || !(await bcrypt.compare(String(current || ''), rows[0].password_hash))) return fail(res, 401, 'Current password is incorrect.')
  await q('update admin_users set password_hash = $1 where id = $2', [await bcrypt.hash(String(next), 10), req.user.id])
  res.json({ ok: true })
}))

/* -- content -- */
app.get('/api/content/published', wrap(async (_req, res) => {
  const { rows } = await q('select published from site_content where id = 1')
  res.json({ content: rows[0]?.published || null })
}))
app.get('/api/content/draft', auth, wrap(async (_req, res) => {
  const { rows } = await q('select draft, published from site_content where id = 1')
  res.json({ draft: rows[0]?.draft || null, published: rows[0]?.published || null })
}))
app.put('/api/content/draft', auth, wrap(async (req, res) => {
  await q(`insert into site_content (id, draft, updated_at) values (1, $1, now())
           on conflict (id) do update set draft = excluded.draft, updated_at = now()`, [JSON.stringify(req.body.content)])
  res.json({ ok: true })
}))
app.post('/api/content/publish', auth, wrap(async (req, res) => {
  const c = JSON.stringify(req.body.content)
  await q(`insert into site_content (id, draft, published, updated_at) values (1, $1, $1, now())
           on conflict (id) do update set draft = excluded.draft, published = excluded.published, updated_at = now()`, [c])
  await q('insert into content_revisions (label, content) values ($1, $2)', [req.body.label || 'Published', c])
  await q('delete from content_revisions where id not in (select id from content_revisions order by id desc limit 25)')
  res.json({ ok: true })
}))
app.get('/api/revisions', auth, wrap(async (_req, res) => {
  const { rows } = await q('select id::text, label, created_at, content from content_revisions order by id desc limit 25')
  res.json(rows)
}))

/* -- appointments (public booking) -- */
const digits = (s) => String(s || '').replace(/\D/g, '')
const APPT = "id::text, ref, name, mobile, email, treatment, date::text, to_char(time, 'HH24:MI') as time, message, status, created_at"
app.get('/api/appointments/booked', wrap(async (req, res) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(req.query.date || ''))) return res.json([])
  const { rows } = await q("select to_char(time, 'HH24:MI') t from appointments where date = $1 and status in ('pending','confirmed')", [req.query.date])
  res.json(rows.map((r) => r.t))
}))
app.post('/api/appointments', wrap(async (req, res) => {
  const b = req.body, mobile = digits(b.mobile)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !/^\d{2}:\d{2}$/.test(b.time || '')) return fail(res, 400, 'Invalid date or time')
  const d = new Date(b.date + 'T00:00:00')
  if (d.getDay() === 0) return fail(res, 400, 'Sunday bookings are not available')
  if (b.date < new Date().toISOString().slice(0, 10)) return fail(res, 400, 'Date is in the past')
  if (String(b.name || '').trim().length < 2 || mobile.length < 8) return fail(res, 400, 'Please enter a valid name and mobile number')
  const ref = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase()
  try {
    await q('insert into appointments (ref, name, mobile, email, treatment, date, time, message) values ($1,$2,$3,$4,$5,$6,$7,$8)',
      [ref, String(b.name).trim().slice(0, 120), mobile, String(b.email || '').slice(0, 200), String(b.treatment || '').slice(0, 200), b.date, b.time, String(b.message || '').slice(0, 1000)])
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'That slot has just been taken - please choose another.')
    throw e
  }
  res.json({ ref })
}))
app.post('/api/appointments/lookup', wrap(async (req, res) => {
  const { rows } = await q("select ref, name, treatment, date::text, to_char(time,'HH24:MI') as time, status from appointments where ref = $1 and mobile = $2",
    [String(req.body.ref || '').trim().toUpperCase(), digits(req.body.mobile)])
  res.json(rows[0] || null)
}))
app.post('/api/appointments/cancel', wrap(async (req, res) => {
  await q("update appointments set status = 'cancelled' where ref = $1 and mobile = $2 and status in ('pending','confirmed')",
    [String(req.body.ref || '').trim().toUpperCase(), digits(req.body.mobile)])
  res.json({ ok: true })
}))

/* -- appointments (admin) -- */
app.get('/api/admin/appointments', auth, wrap(async (_req, res) => {
  const { rows } = await q(`select ${APPT} from appointments order by date, time`)
  res.json(rows)
}))
app.patch('/api/admin/appointments/:id', auth, wrap(async (req, res) => {
  const allowed = ['status', 'date', 'time'], keys = Object.keys(req.body).filter((k) => allowed.includes(k))
  if (!keys.length) return fail(res, 400, 'Nothing to update')
  try {
    await q(`update appointments set ${keys.map((k, i) => `${k} = $${i + 1}`).join(', ')} where id = $${keys.length + 1}`, [...keys.map((k) => req.body[k]), req.params.id])
  } catch (e) {
    if (e.code === '23505') return fail(res, 409, 'That slot is already booked.')
    if (e.code === '22P02' || e.code === '23514') return fail(res, 400, 'Invalid value.')
    throw e
  }
  res.json({ ok: true })
}))

/* -- media (stored in Postgres) -- */
const mediaRow = (r) => ({ id: r.id, url: `/api/media/${r.id}/file`, name: r.name, alt: r.alt, category: r.category, mime: r.mime, created_at: r.created_at })
app.get('/api/media', auth, wrap(async (_req, res) => {
  const { rows } = await q('select id, name, alt, category, mime, created_at from media order by created_at desc')
  res.json(rows.map(mediaRow))
}))
app.post('/api/media', auth, express.raw({ type: '*/*', limit: '60mb' }), wrap(async (req, res) => {
  const mime = String(req.headers['content-type'] || '').split(';')[0]
  if (!/^(image|video)\/[\w.+-]+$/.test(mime) || mime === 'image/svg+xml' || !Buffer.isBuffer(req.body) || !req.body.length) return fail(res, 400, 'Upload an image or video file.')
  const id = 'm' + crypto.randomBytes(6).toString('hex')
  const dec = (h) => { try { return decodeURIComponent(h || '') } catch { return '' } }
  const { rows } = await q('insert into media (id, name, alt, category, mime, data) values ($1,$2,$3,$4,$5,$6) returning id, name, alt, category, mime, created_at',
    [id, dec(req.headers['x-name']).slice(0, 200), dec(req.headers['x-alt']).slice(0, 300), dec(req.headers['x-category']).slice(0, 50) || 'general', mime, req.body])
  res.json(mediaRow(rows[0]))
}))
app.get('/api/media/:id/file', wrap(async (req, res) => {
  const { rows } = await q('select mime, data from media where id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).end()
  res.set({ 'Content-Type': rows[0].mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' }).send(rows[0].data)
}))
app.patch('/api/media/:id', auth, wrap(async (req, res) => {
  await q('update media set alt = coalesce($1, alt), category = coalesce($2, category) where id = $3', [req.body.alt ?? null, req.body.category ?? null, req.params.id])
  res.json({ ok: true })
}))
app.delete('/api/media/:id', auth, wrap(async (req, res) => { await q('delete from media where id = $1', [req.params.id]); res.json({ ok: true }) }))

app.use('/api', (_req, res) => fail(res, 404, 'Not found'))

/* -- built site (production) -- */
const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', setHeaders: (r, p) => { if (p.endsWith('index.html')) r.setHeader('Cache-Control', 'no-cache') } }))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.use((err, _req, res, _next) => { console.error(err); fail(res, 500, 'Something went wrong. Please try again.') })

init().then(() => app.listen(PORT, () => console.log(`ENDO EXPERT running on http://localhost:${PORT}`)))
  .catch((e) => { console.error('Database init failed:', e.message); process.exit(1) })
