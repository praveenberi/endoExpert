import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/ContentContext'
import { A } from './ui'

export function Logo({ dark = false }) {
  const { branding: b } = useContent()
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white p-1 shadow"><img src={b.logo || '/logo.png'} alt="" className="h-full w-auto object-contain" /></span>
      <span className="leading-tight">
        <span className={`block font-heading text-lg font-bold tracking-wide ${dark ? 'text-white' : 'text-ink'}`}>{b.clinicName}</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-brand">{b.tagline}</span>
      </span>
    </Link>
  )
}

export function Navbar() {
  const { nav, navCta } = useContent()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  // Links are in-page anchors; from sub-pages they navigate home first.
  const href = (h) => (h.startsWith('#') && location.pathname !== '/' ? `/${h}` : h)
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition ${scrolled || open ? 'bg-white/90 shadow-sm backdrop-blur' : 'bg-transparent'}`}>
      <div className="container-x flex items-center justify-between px-5 py-3">
        <div className={scrolled || open || location.pathname !== '/' ? '' : '[&_span]:!text-white [&_span.text-brand]:!text-accent'}><Logo /></div>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {nav.map((n) => <A key={n.id} href={href(n.href)} className={`text-sm font-medium transition hover:text-brand ${scrolled || location.pathname !== '/' ? 'text-slate-700' : 'text-white/90'}`}>{n.label}</A>)}
          {navCta.label && <A href={href(navCta.href)} className="btn btn-primary !py-2">{navCta.label}</A>}
        </nav>
        <button className={`lg:hidden ${scrolled || open || location.pathname !== '/' ? 'text-ink' : 'text-white'}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M5 5l14 14M19 5L5 19' : 'M3 6h18M3 12h18M3 18h18'} /></svg>
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 bg-white px-5 pb-5 lg:hidden">
          {nav.map((n) => <A key={n.id} href={href(n.href)} className="py-2 font-medium text-slate-700" ><span onClick={() => setOpen(false)}>{n.label}</span></A>)}
          {navCta.label && <A href={href(navCta.href)} className="btn btn-primary mt-2">{navCta.label}</A>}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  const { settings: s, branding: b, nav } = useContent()
  const soc = Object.entries(s.social).filter(([, v]) => v)
  return (
    <footer className="bg-ink px-5 py-12 text-slate-400">
      <div className="container-x flex flex-col items-start justify-between gap-8 md:flex-row">
        <div className="max-w-sm"><Logo dark /><p className="mt-3 text-sm">{s.footerText}</p></div>
        <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">{nav.map((n) => <li key={n.id}><A href={n.href.startsWith('#') ? `/${n.href}` : n.href} className="hover:text-white">{n.label}</A></li>)}</ul>
        {soc.length > 0 && <ul className="flex gap-4 text-sm capitalize">{soc.map(([k, v]) => <li key={k}><A href={v} className="hover:text-white">{k}</A></li>)}</ul>}
      </div>
      <p className="container-x mt-10 border-t border-white/10 pt-6 text-xs">© {new Date().getFullYear()} {b.clinicName} – {b.tagline}. All rights reserved.</p>
    </footer>
  )
}
