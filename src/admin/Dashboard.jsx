import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAppointments, listMedia } from '../lib/store'
import { useAdmin, Card, PageTitle } from './shared'

export default function Dashboard() {
  const { draft, dirty } = useAdmin()
  const [appts, setAppts] = useState([])
  const [media, setMedia] = useState(0)
  useEffect(() => { listAppointments().then(setAppts).catch(() => {}); listMedia().then((m) => setMedia(m.length)) }, [])
  const today = new Date().toISOString().slice(0, 10)
  const stat = (label, value, to) => (
    <Link to={to} className="a-card block transition hover:shadow-md"><p className="text-3xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></Link>)
  const upcoming = appts.filter((a) => a.date >= today && ['pending', 'confirmed'].includes(a.status)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 6)
  return (
    <>
      <PageTitle sub={`${dirty ? 'You have unpublished changes' : 'Website is up to date'}`}>Dashboard</PageTitle>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat('Pending appointments', appts.filter((a) => a.status === 'pending').length, '../appointments')}
        {stat('Upcoming confirmed', appts.filter((a) => a.status === 'confirmed' && a.date >= today).length, '../appointments')}
        {stat('Published treatments', draft.treatments.filter((t) => t.published).length, '../treatments')}
        {stat('Media files', media, '../media')}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Next appointments">
          {upcoming.length === 0 ? <p className="text-sm text-slate-500">No upcoming appointments.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">{upcoming.map((a) => (
              <li key={a.id} className="flex justify-between py-2"><span><b>{a.name}</b> · {a.treatment || 'Consultation'}</span><span className="text-slate-500">{a.date} {String(a.time).slice(0, 5)} · {a.status}</span></li>))}</ul>)}
        </Card>
        <Card title="Quick actions">
          <div className="flex flex-wrap gap-2">
            <Link className="a-btn a-btn-light" to="../content">Edit page content</Link>
            <Link className="a-btn a-btn-light" to="../media">Upload photos</Link>
            <Link className="a-btn a-btn-light" to="../preview">Preview changes</Link>
            <Link className="a-btn a-btn-light" to="../settings">Contact & hours</Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Tip: nothing you edit appears on the public website until you press <b>Publish</b>.</p>
        </Card>
      </div>
    </>
  )
}
