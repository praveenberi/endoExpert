import { useEffect, useMemo, useState } from 'react'
import { listAppointments, updateAppointment } from '../lib/store'
import { slotsFor, label } from '../components/Booking'
import { useAdmin, Card, PageTitle } from './shared'

// Contact helpers: WhatsApp (10-digit Indian numbers get +91) and phone call.
const waLink = (r, clinic) => {
  let n = String(r.mobile || '').replace(/\D/g, ''); if (n.length === 10) n = '91' + n
  const msg = `Hello ${r.name}, this is ${clinic} regarding your appointment on ${r.date} at ${label(String(r.time).slice(0, 5))} (Ref ${r.ref}).`
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`
}
const IconBtn = ({ href, title, cls, children, ext }) => (
  <a href={href} title={title} aria-label={title} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})} className={`grid h-8 w-8 place-items-center rounded-full text-white shadow-sm hover:brightness-110 ${cls}`}>{children}</a>
)

const STATUS = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-slate-200 text-slate-700', completed: 'bg-blue-100 text-blue-800' }

export default function AppointmentsPage() {
  const { draft, flash } = useAdmin()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('all')
  const [date, setDate] = useState('')
  const [resched, setResched] = useState(null)
  const load = () => listAppointments().then(setRows).catch((e) => flash(e.message))
  useEffect(() => { load() }, [])
  const shown = useMemo(() => rows.filter((r) => (status === 'all' || r.status === status) && (!date || r.date === date)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [rows, status, date])

  const setS = async (r, s) => { try { await updateAppointment(r.id, { status: s }); flash(`Marked ${s}`); load() } catch (e) { flash(e.message) } }
  const open = resched ? slotsFor(resched.date, draft.settings) : []
  const clash = (d, t) => rows.some((r) => r.id !== resched?.id && r.date === d && String(r.time).slice(0, 5) === t && ['pending', 'confirmed'].includes(r.status))
  async function saveResched() {
    try { await updateAppointment(resched.id, { date: resched.date, time: resched.time, status: 'confirmed' }); setResched(null); flash('Appointment rescheduled and confirmed'); load() }
    catch (e) { flash(e.message.includes('duplicate') ? 'That slot is already taken' : e.message) }
  }

  return (
    <>
      <PageTitle sub="Patient details are visible to authorised staff only.">Appointments</PageTitle>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <select className="a-input !w-44" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{Object.keys(STATUS).map((s) => <option key={s}>{s}</option>)}</select>
          <input type="date" className="a-input !w-44" value={date} onChange={(e) => setDate(e.target.value)} />
          {date && <button className="a-btn a-btn-light" onClick={() => setDate('')}>Clear date</button>}
          <button className="a-btn a-btn-light ml-auto" onClick={load}>Refresh</button>
        </div>
        {shown.length === 0 ? <p className="text-sm text-slate-500">No appointments match.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2 pr-3">When</th><th className="pr-3">Patient</th><th className="pr-3">Treatment</th><th className="pr-3">Status</th><th /></tr></thead>
            <tbody className="divide-y divide-slate-100">{shown.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="py-3 pr-3 whitespace-nowrap font-medium">{r.date}<br /><span className="font-normal text-slate-500">{label(String(r.time).slice(0, 5))}</span></td>
                <td className="pr-3"><b>{r.name}</b><br /><a className="text-brand" href={`tel:${r.mobile}`}>{r.mobile}</a>{r.email && <><br />{r.email}</>}{r.message && <p className="mt-1 max-w-xs text-xs text-slate-500">“{r.message}”</p>}<p className="text-xs text-slate-400">Ref {r.ref}</p>
                  {r.mobile && <div className="mt-2 flex gap-2">
                    <IconBtn ext href={waLink(r, draft.branding.clinicName)} title={`WhatsApp ${r.name}`} cls="bg-[#25D366]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" /></svg></IconBtn>
                    <IconBtn href={`tel:${r.mobile}`} title={`Call ${r.name}`} cls="bg-brand"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg></IconBtn>
                  </div>}</td>
                <td className="pr-3">{r.treatment || '—'}</td>
                <td className="pr-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[r.status]}`}>{r.status}</span></td>
                <td className="space-x-1 whitespace-nowrap text-right">
                  {r.status === 'pending' && <><button className="a-btn a-btn-primary !px-2 !py-1" onClick={() => setS(r, 'confirmed')}>Confirm</button><button className="a-btn a-btn-danger !px-2 !py-1" onClick={() => confirm('Reject this request?') && setS(r, 'rejected')}>Reject</button></>}
                  {['pending', 'confirmed'].includes(r.status) && <><button className="a-btn a-btn-light !px-2 !py-1" onClick={() => setResched({ ...r, time: String(r.time).slice(0, 5) })}>Reschedule</button><button className="a-btn a-btn-light !px-2 !py-1" onClick={() => confirm('Cancel this appointment?') && setS(r, 'cancelled')}>Cancel</button></>}
                  {r.status === 'confirmed' && <button className="a-btn a-btn-light !px-2 !py-1" onClick={() => setS(r, 'completed')}>Done</button>}
                </td></tr>))}</tbody></table></div>)}
      </Card>
      {resched && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setResched(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 !font-body font-semibold">Reschedule {resched.name}</h3>
            <input type="date" className="a-input mb-3" value={resched.date} onChange={(e) => setResched({ ...resched, date: e.target.value, time: '' })} />
            {resched.date && open.length === 0 && <p className="mb-3 text-sm text-amber-700">Clinic is closed on this day.</p>}
            <div className="mb-4 flex flex-wrap gap-2">{open.map((t) => (
              <button key={t} disabled={clash(resched.date, t)} onClick={() => setResched({ ...resched, time: t })} className={`rounded-lg border px-3 py-1.5 text-sm disabled:line-through disabled:opacity-40 ${resched.time === t ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>{label(t)}</button>))}</div>
            <div className="flex justify-end gap-2"><button className="a-btn a-btn-light" onClick={() => setResched(null)}>Close</button><button className="a-btn a-btn-primary" disabled={!resched.time} onClick={saveResched}>Save & confirm</button></div>
          </div>
        </div>)}
    </>
  )
}
