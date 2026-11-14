import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/ContentContext'
import { createAppointment, bookedSlots } from '../lib/store'

const KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5)
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
export const label = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }

// Time slots for a date from the admin-configured opening hours. Sundays are always closed.
export function slotsFor(dateStr, settings) {
  if (!dateStr) return []
  const d = new Date(dateStr + 'T00:00:00')
  const h = settings.hours[KEYS[d.getDay()]]
  if (d.getDay() === 0 || !h?.open) return []
  const out = []
  for (let m = toMin(h.start); m + settings.slotMinutes <= toMin(h.end); m += settings.slotMinutes) out.push(fmt(m))
  return out
}

export default function Booking() {
  const { settings, treatments } = useContent()
  const empty = { name: '', mobile: '', email: '', treatment: '', date: '', time: '', message: '' }
  const [f, setF] = useState(empty)
  const [taken, setTaken] = useState([])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value, ...(k === 'date' ? { time: '' } : {}) }))
  const today = iso(new Date())
  const slots = useMemo(() => slotsFor(f.date, settings), [f.date, settings])
  const closedDay = Boolean(f.date) && slots.length === 0

  useEffect(() => {
    if (f.date && !closedDay) bookedSlots(f.date).then(setTaken).catch(() => setTaken([]))
  }, [f.date, closedDay])

  const now = new Date()
  const past = (t) => f.date === today && toMin(t) <= now.getHours() * 60 + now.getMinutes()

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (f.name.trim().length < 2) return setErr('Please enter your name.')
    if (f.mobile.replace(/\D/g, '').length < 8) return setErr('Please enter a valid mobile number.')
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Please enter a valid email address.')
    if (!f.date) return setErr('Please choose a date.')
    if (closedDay) return setErr('The clinic is closed on that day (Sundays are not available).')
    if (!f.time) return setErr('Please choose a time slot.')
    setBusy(true)
    try {
      const ref = await createAppointment(f)
      setDone({ ref, ...f })
      setF(empty)
    } catch (x) {
      setErr(x.message || 'Something went wrong. Please try again.')
    }
    setBusy(false)
  }

  if (done)
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl" role="status">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-accent/20 text-2xl text-brand">✓</div>
        <h3 className="text-2xl font-semibold">Request received</h3>
        <p className="mt-2 text-slate-600">
          {done.name}, we have your request for <b>{done.date}</b> at <b>{label(done.time)}</b>. The clinic will confirm shortly.
        </p>
        <p className="mt-4 text-sm text-slate-500">Your reference code</p>
        <p className="font-mono text-3xl font-bold tracking-widest text-brand">{done.ref}</p>
        <p className="mt-3 text-xs text-slate-500">Keep this code and your mobile number to view or cancel your appointment.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/manage-appointment" className="btn btn-outline">Manage appointment</Link>
          <button className="btn btn-primary" onClick={() => setDone(null)}>Book another</button>
        </div>
      </div>
    )

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 text-left shadow-xl md:p-8" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="a-label">Patient name *</span>
          <input className="a-input" value={f.name} onChange={set('name')} autoComplete="name" /></label>
        <label className="block"><span className="a-label">Mobile number *</span>
          <input className="a-input" value={f.mobile} onChange={set('mobile')} inputMode="tel" autoComplete="tel" /></label>
        <label className="block"><span className="a-label">Email address</span>
          <input type="email" className="a-input" value={f.email} onChange={set('email')} autoComplete="email" /></label>
        <label className="block"><span className="a-label">Preferred treatment</span>
          <select className="a-input" value={f.treatment} onChange={set('treatment')}>
            <option value="">Not sure / consultation</option>
            {treatments.filter((t) => t.published).map((t) => <option key={t.id}>{t.title}</option>)}
          </select></label>
        <label className="block"><span className="a-label">Preferred date *</span>
          <input type="date" min={today} className="a-input" value={f.date} onChange={set('date')} /></label>
      </div>
      {closedDay && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          The clinic is closed on this day. Sundays are not available – please choose another date.
        </p>
      )}
      {f.date && !closedDay && (
        <div>
          <span className="a-label">Preferred time *</span>
          <div className="flex flex-wrap gap-2">
            {slots.map((t) => {
              const off = taken.includes(t) || past(t)
              return (
                <button type="button" key={t} disabled={off} onClick={() => setF((p) => ({ ...p, time: t }))}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${f.time === t ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-800 hover:border-brand'} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:line-through`}>
                  {label(t)}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <label className="block"><span className="a-label">Message</span>
        <textarea rows="3" className="a-input" value={f.message} onChange={set('message')} /></label>
      {err && <p className="text-sm font-medium text-red-600" role="alert">{err}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Request appointment'}</button>
      <p className="text-center text-xs text-slate-400">Your details are used only to manage your appointment.</p>
    </form>
  )
}
