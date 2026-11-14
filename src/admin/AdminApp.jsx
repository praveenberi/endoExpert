import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { getSession, signIn, signOut, resetPassword, hasSupabase } from '../lib/store'
import { AdminProvider, useAdmin } from './shared'
import Dashboard from './Dashboard'
import { ContentPage, SectionsPage, TreatmentsPage, DoctorPage, StaffPage, TestimonialsPage, FaqPage, SeoPage, SettingsPage } from './Editors'
import MediaPage from './MediaPage'
import AppointmentsPage from './AppointmentsPage'
import PreviewPage from './PreviewPage'
import RevisionsPage from './RevisionsPage'
import './admin.css'

function Login({ onDone }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try { onDone(await signIn(email, pw)) } catch (x) { setErr(x.message || 'Sign-in failed') }
    setBusy(false)
  }
  async function reset() {
    setErr(''); setInfo('')
    try { await resetPassword(email); setInfo('Password reset email sent.') } catch (x) { setErr(x.message) }
  }
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={go} className="a-card w-full max-w-sm space-y-4">
        <div><h1 className="!font-body text-xl font-bold">ENDO EXPERT Admin</h1><p className="text-sm text-slate-500">Sign in to manage the website</p></div>
        {!hasSupabase && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Demo mode: Supabase is not configured. Data is stored in this browser only. Default password is set by VITE_DEMO_ADMIN_PASSWORD.</p>}
        <label className="block"><span className="a-label">Email</span><input type="email" className="a-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required={hasSupabase} /></label>
        <label className="block"><span className="a-label">Password</span><input type="password" className="a-input" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required /></label>
        {err && <p className="text-sm font-medium text-red-600" role="alert">{err}</p>}
        {info && <p className="text-sm font-medium text-green-700">{info}</p>}
        <button className="a-btn a-btn-primary w-full justify-center" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <button type="button" onClick={reset} className="w-full text-center text-xs text-slate-500 hover:underline">Forgot password?</button>
      </form>
    </div>
  )
}

const NAV = [
  ['dashboard', 'Dashboard'], ['content', 'Page Content'], ['sections', 'Sections & Layout'], ['media', 'Photos & Media'],
  ['treatments', 'Treatments'], ['doctor', 'Doctor Profile'], ['staff', 'Staff'], ['appointments', 'Appointments'], ['testimonials', 'Testimonials'],
  ['faqs', 'FAQs'], ['seo', 'SEO'], ['settings', 'Website Settings'], ['preview', 'Live Preview'], ['revisions', 'Version History'],
]

function Shell({ session, onLogout }) {
  const { dirty, status, publish } = useAdmin()
  const [menu, setMenu] = useState(false)
  return (
    <div className="admin min-h-screen bg-slate-100 text-slate-800 md:flex">
      <aside className={`${menu ? 'block' : 'hidden'} w-full shrink-0 bg-slate-900 p-4 text-slate-300 md:block md:w-60`}>
        <p className="mb-5 px-2 font-bold text-white">ENDO EXPERT <span className="text-xs font-normal text-teal-300">Admin</span></p>
        <nav className="space-y-1">{NAV.map(([p, l]) => (
          <NavLink key={p} to={p} onClick={() => setMenu(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-teal-600 text-white' : 'hover:bg-slate-800'}`}>{l}</NavLink>))}</nav>
        <a href="/" target="_blank" rel="noreferrer" className="mt-6 block px-3 text-sm text-teal-300 hover:underline">View live site ↗</a>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button className="a-btn a-btn-light md:hidden" onClick={() => setMenu(!menu)}>☰ Menu</button>
          <span className="text-xs text-slate-500">{status === 'saving' ? 'Saving draft…' : status === 'error' ? 'Save failed' : 'Draft saved'}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${dirty ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{dirty ? 'Unpublished changes' : 'Live site up to date'}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline">{session.email}</span>
            <button className="a-btn a-btn-primary" disabled={!dirty} onClick={() => confirm('Publish all changes to the live website?') && publish()}>Publish</button>
            <button className="a-btn a-btn-light" onClick={onLogout}>Log out</button>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="sections" element={<SectionsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="treatments" element={<TreatmentsPage />} />
            <Route path="doctor" element={<DoctorPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="faqs" element={<FaqPage />} />
            <Route path="seo" element={<SeoPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="preview" element={<PreviewPage />} />
            <Route path="revisions" element={<RevisionsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [session, setSession] = useState(undefined)
  const nav = useNavigate()
  useEffect(() => { getSession().then(setSession) }, [])
  useEffect(() => { document.title = 'Admin – ENDO EXPERT'; document.querySelector('meta[name=robots]')?.remove(); const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.appendChild(m); return () => m.remove() }, [])
  if (session === undefined) return <div className="p-10 text-slate-500">Loading…</div>
  if (!session) return <Login onDone={(s) => { setSession(s); nav('/admin/dashboard') }} />
  return (
    <AdminProvider>
      <Shell session={session} onLogout={async () => { await signOut(); setSession(null) }} />
    </AdminProvider>
  )
}
