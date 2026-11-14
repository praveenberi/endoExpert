import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Site from './pages/Site'
import TreatmentPage from './pages/TreatmentPage'
import ManageAppointment from './pages/ManageAppointment'

const Admin = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/treatments/:slug" element={<TreatmentPage />} />
        <Route path="/manage-appointment" element={<ManageAppointment />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Site />} />
      </Routes>
    </Suspense>
  )
}
