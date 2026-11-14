import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useContent } from '../lib/ContentContext'
import { A, Heading, Img, Reveal } from './ui'
import Booking, { label as timeLabel } from './Booking'
import VideoPlaylist from './VideoPlaylist'
import { Mascot } from './Mascot'

const Tooth3D = lazy(() => import('./Tooth3D'))
const nl = (s) => (s || '').split(/\n{2,}/).filter(Boolean)

export function Hero({ s }) {
  const { hero } = useContent()
  return (
    <section id={s.id} className="relative flex min-h-screen items-center overflow-hidden bg-ink px-5 pt-24 text-white">
      {hero.videoUrl && /\.(mp4|webm)(\?|$)/i.test(hero.videoUrl) && <video src={hero.videoUrl} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-30" />}
      {hero.backgroundImage && <img src={hero.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgb(var(--brand)/0.45),transparent_60%)]" />
      <div className="container-x relative grid items-center gap-8 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="eyebrow !text-accent">{hero.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight !text-white md:text-6xl">{hero.heading}</h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {hero.primaryBtn.label && <A href={hero.primaryBtn.href} className="btn btn-primary">{hero.primaryBtn.label}</A>}
            {hero.secondaryBtn.label && <A href={hero.secondaryBtn.href} className="btn btn-ghost">{hero.secondaryBtn.label}</A>}
          </div>
        </motion.div>
        <div className="h-[340px] md:h-[560px]" aria-hidden="true">
          {hero.sideVideo
            ? <video src={hero.sideVideo} autoPlay muted loop playsInline preload="auto" className="h-full w-full rounded-3xl object-contain" />
            : hero.show3d && <Suspense fallback={null}><Tooth3D speed={hero.toothSpeed} /></Suspense>}
        </div>
      </div>
    </section>
  )
}

export function About({ s }) {
  const { about } = useContent()
  return (
    <section id={s.id} className="section bg-white">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <div>
          <Heading eyebrow={about.eyebrow} title={about.heading} center={false} />
          <div className="-mt-6 space-y-4 text-slate-600">{nl(about.body).map((p, i) => <Reveal key={i} delay={i * 0.08}><p>{p}</p></Reveal>)}</div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-center"><Mascot pose="heart" className="h-36 w-36" /></div>
          {about.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-3">{about.images.map((src, i) => <Img key={i} src={src} className="aspect-[4/3] w-full rounded-2xl object-cover" />)}</div>
          )}
          {about.pillars.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <div className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-lg font-semibold">{p.title}</h3><p className="mt-1 text-slate-600">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Treatments({ s }) {
  const { treatmentsSection: h, treatments } = useContent()
  return (
    <section id={s.id} className="section bg-slate-50">
      <div className="container-x">
        <Heading eyebrow={h.eyebrow} title={h.heading} sub={h.subtitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.filter((t) => t.published).map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.08}>
              <motion.article whileHover={{ y: -6, rotateX: 2 }} className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-xl">
                {t.image ? <Img src={t.image} alt={t.title} className="h-40 w-full object-cover" /> : <div className="grid h-40 place-items-center bg-gradient-to-br from-brand/10 to-accent/20"><Mascot pose={t.mascot || 'wave'} className="h-36 w-36" /></div>}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold">{t.title}</h3>
                  <p className="mt-2 flex-1 text-slate-600">{t.summary}</p>
                  <Link to={`/treatments/${t.slug}`} className="mt-4 text-sm font-semibold text-brand hover:underline">Learn more →</Link>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Why({ s }) {
  const { why } = useContent()
  return (
    <section id={s.id} className="section bg-white">
      <div className="container-x">
        <div className="relative"><Heading eyebrow={why.eyebrow} title={why.heading} /><Mascot pose="shield" className="absolute -top-4 right-0 hidden h-28 w-28 md:block" /></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {why.items.map((w, i) => (
            <Reveal key={w.id} delay={(i % 3) * 0.08}>
              <motion.div whileHover={{ y: -6, scale: 1.02 }} className="h-full rounded-2xl border border-slate-200 p-6">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }} className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-2xl">{w.icon}</motion.div>
                <h3 className="text-lg font-semibold">{w.title}</h3><p className="mt-1 text-slate-600">{w.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const List = ({ title, items }) => items?.length ? (
  <div><h4 className="text-sm font-semibold uppercase tracking-wide text-brand">{title}</h4>
    <ul className="mt-2 space-y-1 text-slate-600">{items.map((x, i) => <li key={i}>• {x}</li>)}</ul></div>
) : null

export function Doctor({ s }) {
  const { doctor: d } = useContent()
  return (
    <section id={s.id} className="section bg-slate-50">
      <div className="container-x grid items-center gap-12 md:grid-cols-[360px_1fr]">
        <Reveal className="relative"><Img src={d.photo} alt={d.name} ph="Doctor photo" className="aspect-[4/5] w-full rounded-3xl object-cover shadow-xl" /><Mascot pose="stethoscope" className="absolute -bottom-6 -right-4 h-28 w-28" /></Reveal>
        <div>
          <Heading eyebrow={d.eyebrow} title={d.heading} center={false} />
          <Reveal className="-mt-6">
            <h3 className="text-2xl font-semibold">{d.name}</h3>
            <p className="font-medium text-brand">{d.designation}</p>
            <p className="mt-4 text-slate-600">{d.intro}</p>
            {d.biography && nl(d.biography).map((p, i) => <p key={i} className="mt-3 text-slate-600">{p}</p>)}
            {d.experience && <p className="mt-3 text-slate-600"><b>Experience:</b> {d.experience}</p>}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <List title="Qualifications" items={d.qualifications} />
              <List title="Areas of expertise" items={d.specialisations} />
              <List title="Memberships" items={d.memberships} />
              <List title="Achievements" items={d.achievements} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function Technology({ s }) {
  const { technology: t } = useContent()
  return (
    <section id={s.id} className="section bg-ink text-slate-200">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <div>
          <Heading eyebrow={t.eyebrow} title={t.heading} sub={t.body} light center={false} />
          <ul className="-mt-4 space-y-4">
            {t.items.map((x, i) => (
              <Reveal key={x.id} delay={i * 0.06}><li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div><b className="text-white">{x.title}</b><p className="text-sm text-slate-400">{x.text}</p></div></li></Reveal>
            ))}
          </ul>
        </div>
        <div className="relative"><VideoPlaylist videos={t.videos} /><Mascot pose="magnifier" className="absolute -right-3 -top-12 h-28 w-28" /></div>
      </div>
    </section>
  )
}

export function Journey({ s }) {
  const { journey: j } = useContent()
  return (
    <section id={s.id} className="section bg-white">
      <div className="container-x">
        <div className="relative"><Heading eyebrow={j.eyebrow} title={j.heading} /><Mascot pose="brush" className="absolute -top-4 left-0 hidden h-28 w-28 md:block" /></div>
        <div className="relative grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent md:block" />
          {j.steps.map((st, i) => (
            <Reveal key={st.id} delay={i * 0.15} className="relative text-center">
              <motion.div whileHover={{ scale: 1.1 }} className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-lg font-bold text-white shadow-lg shadow-brand/30">{String(i + 1).padStart(2, '0')}</motion.div>
              <h3 className="mt-4 text-lg font-semibold">{st.title}</h3><p className="mt-1 text-sm text-slate-600">{st.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials({ s }) {
  const { testimonialsSection: h, testimonials } = useContent()
  const list = testimonials.filter((t) => t.published !== false)
  const [i, setI] = useState(0)
  if (!list.length) return null // never show placeholder/fabricated reviews
  const t = list[i % list.length]
  return (
    <section id={s.id} className="section bg-slate-50">
      <div className="container-x max-w-3xl">
        <Heading eyebrow={h.eyebrow} title={h.heading} />
        <AnimatePresence mode="wait">
          <motion.figure key={t.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <blockquote className="text-lg text-slate-700">“{t.text}”</blockquote>
            <figcaption className="mt-4 font-semibold">{t.name}{t.source && <span className="ml-2 text-sm font-normal text-slate-500">· {t.source}</span>}</figcaption>
          </motion.figure>
        </AnimatePresence>
        <div className="mt-6 flex items-center justify-center gap-3">
          {list.map((_, k) => <button key={k} aria-label={`Review ${k + 1}`} onClick={() => setI(k)} className={`h-2.5 rounded-full transition-all ${k === i % list.length ? 'w-8 bg-brand' : 'w-2.5 bg-slate-300'}`} />)}
        </div>
        {h.googleReviewsUrl && <p className="mt-6 text-center"><A href={h.googleReviewsUrl} className="btn btn-outline">Read our Google reviews</A></p>}
      </div>
    </section>
  )
}

export function FAQ({ s }) {
  const { faqSection: h, faqs } = useContent()
  const [open, setOpen] = useState(0)
  return (
    <section id={s.id} className="section bg-white">
      <div className="container-x max-w-3xl">
        <div className="relative"><Heading eyebrow={h.eyebrow} title={h.heading} /><Mascot pose="mirror" className="absolute -top-4 right-0 hidden h-28 w-28 md:block" /></div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {faqs.map((f, i) => (
            <div key={f.id}>
              <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}<motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-2xl text-brand">+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-slate-600">{f.a}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Staff({ s }) {
  const { staff: t } = useContent()
  const list = (t.members || []).filter((m) => m.visible !== false)
  return (
    <section id={s.id} className="section bg-white">
      <div className="container-x">
        <Heading eyebrow={t.eyebrow} title={t.heading} sub={t.subtitle} />
        {list.length === 0 ? <p className="text-center text-slate-500">Our team details will be added soon.</p> : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((m, i) => (
              <Reveal key={m.id || i} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
                <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-brand/10 to-accent/20">
                  {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" className="h-full w-full object-cover" /> : <Mascot pose="heart" className="h-32 w-32" />}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{m.name}</h3>
                  {m.role && <p className="font-medium text-brand">{m.role}</p>}
                  {m.qualification && <p className="mt-1 text-sm text-slate-500">{m.qualification}</p>}
                  {m.experience && <p className="mt-3 text-sm text-slate-600"><b>Experience:</b> {m.experience}</p>}
                  {m.bio && <p className="mt-3 text-slate-600">{m.bio}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function Contact({ s }) {
  const { contact: c, settings: st } = useContent()
  const wa = (st.whatsapp || '').replace(/\D/g, '')
  const waHref = wa && `https://wa.me/${wa}${st.whatsappMessage ? `?text=${encodeURIComponent(st.whatsappMessage)}` : ''}`
  const lines = (x) => (x || '').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)
  const rows = [
    ['Clinic', st.clinicFullName],
    ['Address', st.address && lines(st.address)],
    ['Phone', st.phone && <a href={`tel:${st.phone}`} className="hover:underline">{st.phone}</a>],
    ['WhatsApp', waHref && <a href={waHref} target="_blank" rel="noreferrer" className="hover:underline">{st.whatsapp}</a>],
    ['Email', st.email && <a href={`mailto:${st.email}`} className="hover:underline">{st.email}</a>],
    ['Location', st.mapUrl && <a href={st.mapUrl} target="_blank" rel="noreferrer" className="font-medium underline">Get directions on Google Maps →</a>],
  ].filter((r) => r[1])
  const hours = Object.entries(st.hours)
  const names = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
  return (
    <section id={s.id} className="section bg-gradient-to-br from-ink to-brand text-white">
      <div className="container-x">
        <div className="relative"><Heading eyebrow={c.eyebrow} title={c.heading} sub={c.subtitle} light /><Mascot pose="wave" className="absolute -top-2 left-0 hidden h-28 w-28 md:block" /></div>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">Operating hours</p>
              <table className="mt-2 text-sm"><tbody>{hours.map(([k, h]) => (
                <tr key={k}><td className="pr-6 py-0.5 text-slate-300">{names[k]}</td><td>{h.open && k !== 'sun' ? `${timeLabel(h.start)} – ${timeLabel(h.end)}` : 'Closed'}</td></tr>))}</tbody></table>
            </div>
            {rows.length > 0 && (
              <div className="divide-y divide-white/15 rounded-3xl bg-white/10 px-6 py-2 backdrop-blur">
                {rows.map(([k, v]) => <div key={k} className="py-3"><p className="text-xs font-semibold uppercase tracking-widest text-accent">{k}</p><p className="mt-1 text-base leading-relaxed">{v}</p></div>)}
              </div>
            )}
            {waHref && (
              <a href={waHref} target="_blank" rel="noreferrer" className="btn inline-flex items-center gap-2 !bg-[#25D366] !text-white shadow-lg hover:brightness-95">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" /></svg>
                WhatsApp Us
              </a>
            )}
            {st.mapEmbedUrl && <iframe title="Clinic location" src={st.mapEmbedUrl} loading="lazy" className="h-56 w-full rounded-2xl border-0" />}
            <p className="text-sm"><Link to="/manage-appointment" className="underline">Already booked? Manage your appointment</Link></p>
          </div>
          <Booking />
        </div>
      </div>
    </section>
  )
}

export function Custom({ s, data }) {
  const rev = data.layout === 'image-right'
  return (
    <section id={s.id} className={`section ${data.bg === 'dark' ? 'bg-ink text-slate-200' : data.bg === 'tint' ? 'bg-slate-50' : 'bg-white'}`}>
      <div className={`container-x grid items-center gap-10 ${data.image ? 'md:grid-cols-2' : 'max-w-3xl'}`}>
        {data.image && <Img src={data.image} alt={data.heading} className={`aspect-[4/3] w-full rounded-3xl object-cover ${rev ? 'md:order-2' : ''}`} />}
        <div>
          <Heading eyebrow={data.eyebrow} title={data.heading} light={data.bg === 'dark'} center={false} />
          <div className="-mt-6 space-y-3">{nl(data.body).map((p, i) => <p key={i}>{p}</p>)}</div>
          {data.btnLabel && <A href={data.btnHref || '#'} className="btn btn-primary mt-6">{data.btnLabel}</A>}
        </div>
      </div>
    </section>
  )
}

export const SECTION_MAP = { hero: Hero, about: About, treatments: Treatments, why: Why, doctor: Doctor, staff: Staff, technology: Technology, journey: Journey, testimonials: Testimonials, faq: FAQ, contact: Contact }
