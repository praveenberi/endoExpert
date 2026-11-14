// Create or reset an admin user:  npm run create-admin -- you@example.com NewPassword
import 'dotenv/config'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const [email, password] = process.argv.slice(2)
if (!email || !password || password.length < 8) { console.error('Usage: npm run create-admin -- <email> <password (min 8 chars)>'); process.exit(1) }
const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL is not set.'); process.exit(1) }
const local = /localhost|127\.0\.0\.1/.test(url)
const ssl = process.env.DATABASE_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DATABASE_SSL !== 'false' && !local)
const pool = new pg.Pool({ connectionString: url, ssl: ssl ? { rejectUnauthorized: false } : undefined })
await pool.query(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql'), 'utf8'))
await pool.query(`insert into admin_users (email, password_hash) values ($1, $2)
  on conflict (email) do update set password_hash = excluded.password_hash`, [email.trim().toLowerCase(), await bcrypt.hash(password, 10)])
console.log('Admin user saved:', email.trim().toLowerCase())
await pool.end()
