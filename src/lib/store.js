// Data layer: talks to the Express + PostgreSQL API in /server (same origin; proxied to :4000 by Vite in dev).
import { defaultContent } from './defaultContent'

export function mergeDeep(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) return over === undefined ? base : over
  if (base && typeof base === 'object' && over && typeof over === 'object') {
    const out = { ...base }
    for (const k of Object.keys(over)) out[k] = mergeDeep(base[k], over[k])
    return out
  }
  return over === undefined ? base : over
}
// One-time upgrade of content saved by an older version (v2 adds the Staff section and clinic contact details).
function migrate(c) {
  if (!c || (c._v || 0) >= 4) return c
  const o = structuredClone(c)
  if (Array.isArray(o.sections) && !o.sections.some((s) => s.type === 'staff')) {
    const i = o.sections.findIndex((s) => s.type === 'doctor')
    o.sections.splice(i < 0 ? o.sections.length : i + 1, 0, { id: 'team', type: 'staff', visible: true })
  }
  const st = (o.settings ||= {})
  if (o.doctor && !o.doctor.photo) delete o.doctor.photo
  for (const k of ['whatsapp', 'address', 'mapUrl']) if (!st[k]) delete st[k] // let the new defaults fill blanks
  o._v = 4
  delete st.hours // v4: new clinic opening hours (10:00–20:30, Sunday closed)
  return o
}
const withDefaults = (c) => mergeDeep(structuredClone(defaultContent), migrate(c) || {})
const uid = () => Math.random().toString(36).slice(2, 10)
export const newId = (p = 'id') => `${p}${uid()}`

/* ───────────── API client (Express + PostgreSQL) ───────────── */
const TOKEN_KEY = 'ee_token'
const token = { get: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }, set: (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {} } }
async function api(path, { method = 'GET', body, raw, headers = {}, auth = false } = {}) {
  const h = { ...headers }
  if (auth && token.get()) h.Authorization = 'Bearer ' + token.get()
  if (body !== undefined) h['Content-Type'] = 'application/json'
  let res
  try { res = await fetch('/api' + path, { method, headers: h, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined) }) }
  catch { throw new Error('Cannot reach the server. Please check your connection and try again.') }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && auth) token.set(null)
    throw new Error(data.error || 'Request failed (' + res.status + ')')
  }
  return data
}
const A = { auth: true }

/* ───────────── Content ───────────── */
export async function getPublished() {
  const { content } = await api('/content/published')
  return withDefaults(content)
}
export async function getDraft() {
  const { draft, published } = await api('/content/draft', A)
  return withDefaults(draft || published)
}
export const saveDraft = (content) => api('/content/draft', { ...A, method: 'PUT', body: { content } })
export const publish = (content, label = 'Published') => api('/content/publish', { ...A, method: 'POST', body: { content, label } })
export const listRevisions = () => api('/revisions', A)
export async function hasUnpublished() {
  const [d, p] = await Promise.all([getDraft(), getPublished()])
  return JSON.stringify(d) !== JSON.stringify(p)
}

/* ───────────── Auth ───────────── */
export async function getSession() {
  if (!token.get()) return null
  try { return await api('/auth/me', A) } catch { return null }
}
export async function signIn(email, password) {
  const r = await api('/auth/login', { method: 'POST', body: { email, password } })
  token.set(r.token); return { email: r.email }
}
export async function signOut() { token.set(null) }
export const changePassword = (current, next) => api('/auth/change-password', { ...A, method: 'POST', body: { current, next } })

/* ───────────── Appointments ───────────── */
const norm = (m) => (m || '').replace(/D/g, '')
export async function createAppointment(a) {
  const r = await api('/appointments', { method: 'POST', body: a })
  return r.ref
}
export const bookedSlots = (date) => api('/appointments/booked?date=' + encodeURIComponent(date))
export const listAppointments = () => api('/admin/appointments', A)
export const updateAppointment = (id, patch) => api('/admin/appointments/' + id, { ...A, method: 'PATCH', body: patch })
export const lookupAppointment = (ref, mobile) => api('/appointments/lookup', { method: 'POST', body: { ref, mobile: norm(mobile) } })
export const cancelOwnAppointment = (ref, mobile) => api('/appointments/cancel', { method: 'POST', body: { ref, mobile: norm(mobile) } })

/* ───────────── Media (stored in PostgreSQL) ───────────── */
export function uploadMedia(blob, meta) {
  return api('/media', {
    ...A, method: 'POST', raw: blob,
    headers: { 'Content-Type': blob.type || 'application/octet-stream', 'X-Name': encodeURIComponent(meta.name || 'file'), 'X-Alt': encodeURIComponent(meta.alt || ''), 'X-Category': encodeURIComponent(meta.category || 'general') },
  })
}
export const listMedia = () => api('/media', A)
export const updateMedia = (id, patch) => api('/media/' + id, { ...A, method: 'PATCH', body: patch })
export const deleteMedia = (item) => api('/media/' + item.id, { ...A, method: 'DELETE' })

/* Resize / crop an image file in the browser before upload. */
export function processImage(file, { maxWidth = 1600, aspect = null, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const src = URL_.createObjectURL(file)
    img.onload = () => {
      let sw = img.width, sh = img.height, sx = 0, sy = 0
      if (aspect) {
        if (sw / sh > aspect) { const nw = sh * aspect; sx = (sw - nw) / 2; sw = nw }
        else { const nh = sw / aspect; sy = (sh - nh) / 2; sh = nh }
      }
      const scale = Math.min(1, maxWidth / sw)
      const c = document.createElement('canvas')
      c.width = Math.round(sw * scale); c.height = Math.round(sh * scale)
      c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height)
      URL_.revokeObjectURL(src)
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Image processing failed'))), type, quality)
    }
    img.onerror = () => reject(new Error('Could not read image'))
    img.src = src
  })
}
const URL_ = window.URL
