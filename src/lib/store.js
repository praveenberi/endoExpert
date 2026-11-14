// Data layer. Uses Supabase when configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY),
// otherwise falls back to browser localStorage so the whole product is demo-able offline.
import { createClient } from '@supabase/supabase-js'
import { defaultContent } from './defaultContent'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const hasSupabase = Boolean(URL && KEY)
export const sb = hasSupabase ? createClient(URL, KEY) : null

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { throw new Error('Local storage is full – use smaller images or configure Supabase.') } },
}

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

/* ───────────── Content ───────────── */
export async function getPublished() {
  if (!hasSupabase) return withDefaults(LS.get('ee_published', null))
  const { data } = await sb.from('site_content').select('published').eq('id', 1).maybeSingle()
  return withDefaults(data?.published)
}
export async function getDraft() {
  if (!hasSupabase) return withDefaults(LS.get('ee_draft', null) || LS.get('ee_published', null))
  const { data } = await sb.from('site_content').select('draft,published').eq('id', 1).maybeSingle()
  return withDefaults(data?.draft || data?.published)
}
export async function saveDraft(content) {
  if (!hasSupabase) { LS.set('ee_draft', content); return }
  const { error } = await sb.from('site_content').upsert({ id: 1, draft: content, updated_at: new Date().toISOString() })
  if (error) throw error
}
export async function publish(content, label = 'Published') {
  const entry = { id: newId('r'), label, created_at: new Date().toISOString(), content }
  if (!hasSupabase) {
    LS.set('ee_published', content); LS.set('ee_draft', content)
    LS.set('ee_revisions', [entry, ...LS.get('ee_revisions', [])].slice(0, 15))
    return
  }
  const { error } = await sb.from('site_content').upsert({ id: 1, draft: content, published: content, updated_at: entry.created_at })
  if (error) throw error
  await sb.from('content_revisions').insert({ label, content })
}
export async function listRevisions() {
  if (!hasSupabase) return LS.get('ee_revisions', [])
  const { data } = await sb.from('content_revisions').select('id,label,created_at,content').order('created_at', { ascending: false }).limit(25)
  return data || []
}
export async function hasUnpublished() {
  const [d, p] = await Promise.all([getDraft(), getPublished()])
  return JSON.stringify(d) !== JSON.stringify(p)
}

/* ───────────── Auth ───────────── */
const DEMO_PW = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin123'
export async function getSession() {
  if (hasSupabase) { const { data } = await sb.auth.getSession(); return data.session ? { email: data.session.user.email } : null }
  return LS.get('ee_session', null)
}
export async function signIn(email, password) {
  if (hasSupabase) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: ok } = await sb.rpc('is_admin')
    if (!ok) { await sb.auth.signOut(); throw new Error('This account does not have admin access.') }
    return { email: data.user.email }
  }
  if (password !== DEMO_PW) throw new Error('Incorrect password (demo mode).')
  const s = { email: email || 'admin@demo', demo: true }
  LS.set('ee_session', s); return s
}
export async function signOut() { if (hasSupabase) await sb.auth.signOut(); else localStorage.removeItem('ee_session') }
export async function resetPassword(email) {
  if (!hasSupabase) throw new Error('Password reset needs Supabase. In demo mode, change VITE_DEMO_ADMIN_PASSWORD in .env.')
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin/login` })
  if (error) throw error
}

/* ───────────── Appointments ───────────── */
const refCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()
const norm = (m) => (m || '').replace(/\D/g, '')

export async function createAppointment(a) {
  if (hasSupabase) {
    const { data, error } = await sb.rpc('create_appointment', {
      p_name: a.name, p_mobile: a.mobile, p_email: a.email || '', p_treatment: a.treatment || '',
      p_date: a.date, p_time: a.time, p_message: a.message || '',
    })
    if (error) throw new Error(error.message.includes('slot') ? 'That slot has just been taken – please choose another.' : error.message)
    return data
  }
  const list = LS.get('ee_appts', [])
  if (list.some((x) => x.date === a.date && x.time === a.time && !['cancelled', 'rejected'].includes(x.status)))
    throw new Error('That slot has just been taken – please choose another.')
  const ref = refCode()
  list.push({ id: newId('a'), ref, ...a, mobile: norm(a.mobile), status: 'pending', created_at: new Date().toISOString() })
  LS.set('ee_appts', list); return ref
}
export async function bookedSlots(date) {
  if (hasSupabase) { const { data } = await sb.rpc('booked_slots', { p_date: date }); return (data || []).map((r) => (typeof r === 'string' ? r : r.slot_time).slice(0, 5)) }
  return LS.get('ee_appts', []).filter((x) => x.date === date && !['cancelled', 'rejected'].includes(x.status)).map((x) => x.time)
}
export async function listAppointments() {
  if (hasSupabase) { const { data, error } = await sb.from('appointments').select('*').order('date').order('time'); if (error) throw error; return data }
  return LS.get('ee_appts', [])
}
export async function updateAppointment(id, patch) {
  if (hasSupabase) { const { error } = await sb.from('appointments').update(patch).eq('id', id); if (error) throw error; return }
  LS.set('ee_appts', LS.get('ee_appts', []).map((x) => (x.id === id ? { ...x, ...patch } : x)))
}
export async function lookupAppointment(ref, mobile) {
  if (hasSupabase) { const { data } = await sb.rpc('lookup_appointment', { p_ref: ref.trim().toUpperCase(), p_mobile: norm(mobile) }); return data?.[0] || null }
  return LS.get('ee_appts', []).find((x) => x.ref === ref.trim().toUpperCase() && norm(x.mobile) === norm(mobile)) || null
}
export async function cancelOwnAppointment(ref, mobile) {
  if (hasSupabase) { const { error } = await sb.rpc('cancel_appointment', { p_ref: ref.trim().toUpperCase(), p_mobile: norm(mobile) }); if (error) throw error; return }
  const l = LS.get('ee_appts', [])
  LS.set('ee_appts', l.map((x) => (x.ref === ref.trim().toUpperCase() && norm(x.mobile) === norm(mobile) ? { ...x, status: 'cancelled' } : x)))
}

/* ───────────── Media ───────────── */
export async function uploadMedia(blob, meta) {
  const id = newId('m')
  if (hasSupabase) {
    const path = `${meta.category || 'general'}/${id}-${(meta.name || 'image').replace(/[^\w.-]/g, '_')}`
    const { error } = await sb.storage.from('media').upload(path, blob, { contentType: blob.type, upsert: false })
    if (error) throw error
    const url = sb.storage.from('media').getPublicUrl(path).data.publicUrl
    const row = { id, path, url, alt: meta.alt || '', category: meta.category || 'general' }
    const { error: e2 } = await sb.from('media').insert(row)
    if (e2) throw e2
    return row
  }
  const url = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob) })
  const row = { id, url, alt: meta.alt || '', category: meta.category || 'general', created_at: new Date().toISOString() }
  LS.set('ee_media', [row, ...LS.get('ee_media', [])]); return row
}
export async function listMedia() {
  if (hasSupabase) { const { data } = await sb.from('media').select('*').order('created_at', { ascending: false }); return data || [] }
  return LS.get('ee_media', [])
}
export async function updateMedia(id, patch) {
  if (hasSupabase) { await sb.from('media').update(patch).eq('id', id); return }
  LS.set('ee_media', LS.get('ee_media', []).map((m) => (m.id === id ? { ...m, ...patch } : m)))
}
export async function deleteMedia(item) {
  if (hasSupabase) { if (item.path) await sb.storage.from('media').remove([item.path]); await sb.from('media').delete().eq('id', item.id); return }
  LS.set('ee_media', LS.get('ee_media', []).filter((m) => m.id !== item.id))
}

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
