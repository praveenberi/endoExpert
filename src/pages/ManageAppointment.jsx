import { useState } from 'react'
import { ContentProvider } from '../lib/ContentContext'
import { Navbar, Footer } from '../components/Chrome'
import { lookupAppointment, cancelOwnAppointment } from '../lib/store'
import { label } from '../components/Booking'

function Inner() {
  const [ref, setRef] = useState('')
  const [mobile, setMobile] = useState('')
  const [appt, setAppt] = useState(null)
  const [msg, setMsg] = useState('')
  async function find(e) {
    e.preventDefault(); setMsg(''); setAppt(null)
    const a = await lookupAppointment(ref, mobile).catch(() => null)
    a ? setAppt(a) : setMsg('No appointment found. Check your reference code and mobile number.')
  }
  async function cancel() {
    if (!confirm('Cancel this appointment?')) return
    try { await cancelOwnAppointment(ref, mobile); setAppt({ ...appt, status: 'cancelled' }); setMsg('Your appointment has been cancelled.') }
    catch (x) { setMsg(x.message) }
  }
  const active = appt && ['pending', 'confirmed'].includes(appt.status)
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-5 pb-24 pt-32">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-semibold">Manage your appointment</h1>
          <form onSubmit={find} className="a-card mt-6 space-y-4">
            <label className="block"><span className="a-label">Reference code</span><input className="a-input uppercase" value={ref} onChange={(e) => setRef(e.target.value)} required /></label>
            <label className="block"><span className="a-label">Mobile number used to book</span><input className="a-input" inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required /></label>
            <button className="btn btn-primary w-full">Find appointment</button>
          </form>
          {msg && <p className="mt-4 text-sm font-medium text-slate-700" role="status">{msg}</p>}
          {appt && (
            <div className="a-card mt-4">
              <p className="text-sm text-slate-500">Status: <b className="capitalize text-ink">{appt.status}</b></p>
              <p className="mt-2 text-lg font-semibold">{appt.date} · {label(String(appt.time).slice(0, 5))}</p>
              <p className="text-slate-600">{appt.name}{appt.treatment ? ` · ${appt.treatment}` : ''}</p>
              {active && <button onClick={cancel} className="a-btn a-btn-danger mt-4">Cancel appointment</button>}
              {active && <p className="mt-3 text-xs text-slate-500">To reschedule, cancel and book a new slot, or contact the clinic.</p>}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
export default function ManageAppointment() { return <ContentProvider><Inner /></ContentProvider> }
