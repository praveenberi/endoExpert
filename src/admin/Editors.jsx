import { useState } from 'react'
import { useAdmin, Card, PageTitle, Text, Check, Lines, ImageField, ListEditor, slugify } from './shared'
import { DAYS } from '../lib/defaultContent'
import { newId } from '../lib/store'
import { POSES, POSE_LABELS } from '../components/mascotRender'

// Immutable-ish path setter used by all forms: set('hero.heading', 'x')
const useSetter = () => {
  const { draft, update } = useAdmin()
  const set = (path, value) => update((d) => {
    const keys = path.split('.'); let o = d
    keys.slice(0, -1).forEach((k) => (o = o[k]))
    o[keys.at(-1)] = value
  })
  const get = (path) => path.split('.').reduce((o, k) => o?.[k], draft)
  return { set, get, draft }
}
const F = ({ p, label, area, rows, hint, type }) => {
  const { set, get } = useSetter()
  return <Text label={label} area={area} rows={rows} hint={hint} type={type} value={get(p)} onChange={(v) => set(p, v)} />
}

/* ───────────── Page content (all text, buttons, images) ───────────── */
const GROUPS = {
  hero: 'Hero', about: 'About', treatmentsSection: 'Treatments heading', why: 'Why choose us', technology: 'Technology',
  journey: 'Patient journey', testimonialsSection: 'Testimonials heading', faqSection: 'FAQ heading', contact: 'Contact', nav: 'Navigation & footer',
}
export function ContentPage() {
  const [g, setG] = useState('hero')
  const { set, get } = useSetter()
  const heading = (p) => (<><F p={`${p}.eyebrow`} label="Small heading (eyebrow)" /><F p={`${p}.heading`} label="Heading" /></>)
  return (
    <>
      <PageTitle sub="Edit every heading, paragraph, button and image. Changes save to draft automatically; press Publish to go live.">Page Content</PageTitle>
      <div className="mb-5 flex flex-wrap gap-2">{Object.entries(GROUPS).map(([k, l]) => (
        <button key={k} onClick={() => setG(k)} className={`a-btn ${g === k ? 'a-btn-primary' : 'a-btn-light'}`}>{l}</button>))}</div>

      {g === 'hero' && <Card title="Hero">
        {heading('hero')}<F p="hero.subtitle" label="Supporting text" area />
        <div className="grid gap-x-4 md:grid-cols-2">
          <F p="hero.primaryBtn.label" label="Primary button label" /><F p="hero.primaryBtn.href" label="Primary button link" hint="e.g. #contact or https://…" />
          <F p="hero.secondaryBtn.label" label="Secondary button label" /><F p="hero.secondaryBtn.href" label="Secondary button link" />
        </div>
        <ImageField label="Background image (optional)" value={get('hero.backgroundImage')} onChange={(v) => set('hero.backgroundImage', v)} category="hero" />
        <F p="hero.sideVideo" label="Hero side video (.mp4 URL, replaces the 3D tooth)" hint="Leave empty to show the 3D tooth model instead." />
        <Check label="Cute tooth follows visitors as they scroll" value={get('settings.scrollMascot') !== false} onChange={(v) => set('settings.scrollMascot', v)} />
        <Check label="Show rotating 3D tooth model" value={get('hero.show3d')} onChange={(v) => set('hero.show3d', v)} />
        <label className="a-label">3D rotation speed ({get('hero.toothSpeed')})</label>
        <input type="range" min="0" max="2" step="0.1" value={get('hero.toothSpeed')} onChange={(e) => set('hero.toothSpeed', +e.target.value)} />
      </Card>}

      {g === 'about' && <>
        <Card title="About">{heading('about')}<F p="about.body" label="Body text" area rows={9} hint="Leave a blank line between paragraphs." /></Card>
        <Card title="Philosophy / approach / commitment cards">
          <ListEditor items={get('about.pillars')} onChange={(v) => set('about.pillars', v)} blank={{ title: '', text: '' }} addLabel="Add card" titleOf={(x) => x.title} prefix="p"
            render={(it, up) => <><Text label="Title" value={it.title} onChange={(v) => up({ title: v })} /><Text label="Text" area value={it.text} onChange={(v) => up({ text: v })} /></>} />
        </Card>
        <Card title="Clinic photographs">
          <ListEditor items={(get('about.images') || []).map((src, i) => ({ id: `img${i}`, src }))} titleOf={(x) => `Photo ${x.id.slice(3) * 1 + 1}`} blank={{ src: '' }} addLabel="Add photo"
            onChange={(v) => set('about.images', v.map((x) => x.src))}
            render={(it, up) => <ImageField label="Photo" value={it.src} onChange={(v) => up({ src: v })} aspect={4 / 3} category="clinic" />} />
        </Card>
      </>}

      {g === 'treatmentsSection' && <Card title="Treatments section heading">{heading('treatmentsSection')}<F p="treatmentsSection.subtitle" label="Subtitle" /><p className="text-sm text-slate-500">Edit the treatments themselves under “Treatments”.</p></Card>}

      {g === 'why' && <Card title="Why choose us">{heading('why')}
        <ListEditor items={get('why.items')} onChange={(v) => set('why.items', v)} blank={{ icon: '✨', title: '', text: '' }} addLabel="Add highlight" titleOf={(x) => x.title} prefix="w"
          render={(it, up) => <><Text label="Icon (emoji)" value={it.icon} onChange={(v) => up({ icon: v })} /><Text label="Title" value={it.title} onChange={(v) => up({ title: v })} /><Text label="Text" area value={it.text} onChange={(v) => up({ text: v })} /></>} /></Card>}

      {g === 'technology' && <Card title="Technology">{heading('technology')}<F p="technology.body" label="Intro text" area />
        <p className="a-label">Videos (play one after another, then loop)</p>
        <div className="mb-6"><ListEditor items={get('technology.videos')} onChange={(v) => set('technology.videos', v)} blank={{ url: '', caption: '' }} addLabel="Add video" titleOf={(x) => x.caption || x.url} prefix="v"
          render={(it, up) => <><Text label="Video URL (.mp4)" value={it.url} onChange={(v) => up({ url: v })} hint="e.g. /videos/tech-1.mp4 or a full https link" /><Text label="Caption" value={it.caption} onChange={(v) => up({ caption: v })} /></>} /></div>
        <ListEditor items={get('technology.items')} onChange={(v) => set('technology.items', v)} blank={{ title: '', text: '' }} addLabel="Add technology" titleOf={(x) => x.title} prefix="x"
          render={(it, up) => <><Text label="Title" value={it.title} onChange={(v) => up({ title: v })} /><Text label="Text" area value={it.text} onChange={(v) => up({ text: v })} /></>} /></Card>}

      {g === 'journey' && <Card title="Patient journey">{heading('journey')}
        <ListEditor items={get('journey.steps')} onChange={(v) => set('journey.steps', v)} blank={{ title: '', text: '' }} addLabel="Add step" titleOf={(x) => x.title} prefix="j"
          render={(it, up) => <><Text label="Title" value={it.title} onChange={(v) => up({ title: v })} /><Text label="Text" area value={it.text} onChange={(v) => up({ text: v })} /></>} /></Card>}

      {g === 'testimonialsSection' && <Card title="Testimonials heading">{heading('testimonialsSection')}<F p="testimonialsSection.googleReviewsUrl" label="Google reviews link" hint="Shows a “Read our Google reviews” button." /></Card>}
      {g === 'faqSection' && <Card title="FAQ heading">{heading('faqSection')}</Card>}
      {g === 'contact' && <Card title="Contact section">{heading('contact')}<F p="contact.subtitle" label="Subtitle" /><p className="text-sm text-slate-500">Phone, address and hours are in “Website Settings”.</p></Card>}

      {g === 'nav' && <>
        <Card title="Menu items"><ListEditor items={get('nav')} onChange={(v) => set('nav', v)} blank={{ label: '', href: '#' }} addLabel="Add menu item" titleOf={(x) => x.label} prefix="n"
          render={(it, up) => <><Text label="Label" value={it.label} onChange={(v) => up({ label: v })} /><Text label="Link" value={it.href} onChange={(v) => up({ href: v })} hint="#section-id for in-page, or a full URL" /></>} /></Card>
        <Card title="Header button"><F p="navCta.label" label="Label" /><F p="navCta.href" label="Link" /></Card>
        <Card title="Footer"><F p="settings.footerText" label="Footer text" area rows={2} /></Card>
      </>}
    </>
  )
}

/* ───────────── Sections: order, visibility, custom sections ───────────── */
const NAMES = { hero: 'Hero', about: 'About', treatments: 'Treatments', why: 'Why choose us', doctor: 'Doctor', staff: 'Staff', technology: 'Technology', journey: 'Patient journey', testimonials: 'Testimonials', faq: 'FAQ', contact: 'Contact & booking' }
export function SectionsPage() {
  const { draft, update } = useAdmin()
  const [drag, setDrag] = useState(null)
  const s = draft.sections
  const custom = (id) => draft.customSections.find((c) => c.id === id)
  const reorder = (from, to) => update((d) => { const [m] = d.sections.splice(from, 1); d.sections.splice(to, 0, m) })
  const toggle = (i) => update((d) => { d.sections[i].visible = !d.sections[i].visible })
  const del = (i) => { if (!confirm('Delete this section from the website?')) return; update((d) => { const [r] = d.sections.splice(i, 1); d.customSections = d.customSections.filter((c) => c.id !== r.id) }) }
  const add = () => update((d) => {
    const id = newId('sec')
    d.sections.splice(d.sections.length - 1, 0, { id, type: 'custom', visible: true }) // before contact
    d.customSections.push({ id, eyebrow: '', heading: 'New section', body: 'Write something here…', image: '', layout: 'image-left', bg: 'white', btnLabel: '', btnHref: '' })
  })
  return (
    <>
      <PageTitle sub="Drag to reorder, hide or delete sections, and add new ones.">Sections & Layout</PageTitle>
      <Card title="Page sections" actions={<button className="a-btn a-btn-primary" onClick={add}>+ Add section</button>}>
        <ul>{s.map((x, i) => (
          <li key={x.id} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null && drag !== i) reorder(drag, i); setDrag(null) }}
            className="mb-2 flex cursor-grab items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 active:cursor-grabbing">
            <span className="text-slate-400" aria-hidden>⋮⋮</span>
            <span className={`flex-1 text-sm font-medium ${x.visible ? '' : 'text-slate-400 line-through'}`}>{x.type === 'custom' ? custom(x.id)?.heading || 'Custom section' : NAMES[x.type]} <span className="ml-1 text-xs text-slate-400">#{x.id}</span></span>
            <button className="a-btn a-btn-light !px-2 !py-1" disabled={i === 0} onClick={() => reorder(i, i - 1)} aria-label="Move up">↑</button>
            <button className="a-btn a-btn-light !px-2 !py-1" disabled={i === s.length - 1} onClick={() => reorder(i, i + 1)} aria-label="Move down">↓</button>
            <button className="a-btn a-btn-light !px-2 !py-1" onClick={() => toggle(i)}>{x.visible ? 'Hide' : 'Show'}</button>
            <button className="a-btn a-btn-danger !px-2 !py-1" onClick={() => del(i)}>Delete</button>
          </li>))}</ul>
      </Card>
      {draft.customSections.map((c, i) => (
        <Card key={c.id} title={`Custom section: ${c.heading}`}>
          {['eyebrow', 'heading'].map((k) => <Text key={k} label={k === 'eyebrow' ? 'Small heading' : 'Heading'} value={c[k]} onChange={(v) => update((d) => { d.customSections[i][k] = v })} />)}
          <Text label="Body" area rows={5} value={c.body} onChange={(v) => update((d) => { d.customSections[i].body = v })} />
          <ImageField label="Image" value={c.image} onChange={(v) => update((d) => { d.customSections[i].image = v })} category="sections" />
          <div className="grid gap-x-4 md:grid-cols-2">
            <label className="mb-4 block"><span className="a-label">Layout</span><select className="a-input" value={c.layout} onChange={(e) => update((d) => { d.customSections[i].layout = e.target.value })}><option value="image-left">Image left</option><option value="image-right">Image right</option></select></label>
            <label className="mb-4 block"><span className="a-label">Background</span><select className="a-input" value={c.bg} onChange={(e) => update((d) => { d.customSections[i].bg = e.target.value })}><option value="white">White</option><option value="tint">Light grey</option><option value="dark">Dark</option></select></label>
            <Text label="Button label" value={c.btnLabel} onChange={(v) => update((d) => { d.customSections[i].btnLabel = v })} />
            <Text label="Button link" value={c.btnHref} onChange={(v) => update((d) => { d.customSections[i].btnHref = v })} />
          </div>
        </Card>
      ))}
    </>
  )
}

/* ───────────── Treatments ───────────── */
export function TreatmentsPage() {
  const { set, get } = useSetter()
  return (
    <>
      <PageTitle sub="Each treatment gets its own page at /treatments/<slug>.">Treatments</PageTitle>
      <Card>
        <ListEditor items={get('treatments')} onChange={(v) => set('treatments', v)} prefix="t" addLabel="Add treatment" titleOf={(x) => `${x.icon} ${x.title}${x.published ? '' : '  (unpublished)'}`}
          blank={{ mascot: 'wave', slug: '', published: false, icon: '🦷', title: '', summary: '', details: '', image: '' }}
          render={(it, up) => <>
            <Text label="Title" value={it.title} onChange={(v) => up({ title: v, ...(it.slug === '' || it.slug === slugify(it.title) ? { slug: slugify(v) } : {}) })} />
            <Text label="URL slug" value={it.slug} onChange={(v) => up({ slug: slugify(v) })} />
            <Text label="Icon (emoji)" value={it.icon} onChange={(v) => up({ icon: v })} />
            <label className="mb-4 block"><span className="a-label">3D tooth character (shown when no photo)</span><select className="a-input" value={it.mascot || 'wave'} onChange={(e) => up({ mascot: e.target.value })}>{POSES.map((p) => <option key={p} value={p}>{POSE_LABELS[p]}</option>)}</select></label>
            <Text label="Short description (card)" area rows={2} value={it.summary} onChange={(v) => up({ summary: v })} />
            <Text label="Detailed information (treatment page)" area rows={7} value={it.details} onChange={(v) => up({ details: v })} hint="Blank line between paragraphs." />
            <ImageField label="Photograph" value={it.image} onChange={(v) => up({ image: v })} category="treatments" />
            <Check label="Published (visible on website)" value={it.published} onChange={(v) => up({ published: v })} />
          </>} />
      </Card>
    </>
  )
}

/* ───────────── Staff ───────────── */
export function StaffPage() {
  const { set, get } = useSetter()
  return (
    <>
      <PageTitle sub="Add the clinic team. Only add details that have been verified. Changes save to draft; press Publish to go live.">Staff</PageTitle>
      <Card title="Section heading"><F p="staff.eyebrow" label="Small heading" /><F p="staff.heading" label="Heading" /><F p="staff.subtitle" label="Subtitle" /></Card>
      <Card title="Team members">
        <ListEditor items={get('staff.members')} onChange={(v) => set('staff.members', v)} prefix="s" addLabel="Add staff member" titleOf={(x) => `${x.name || 'New member'}${x.role ? ' – ' + x.role : ''}${x.visible === false ? '  (hidden)' : ''}`}
          blank={{ name: '', role: '', qualification: '', experience: '', bio: '', photo: '', visible: true }}
          render={(it, up) => <>
            <Text label="Full name" value={it.name} onChange={(v) => up({ name: v })} />
            <Text label="Role / designation" value={it.role} onChange={(v) => up({ role: v })} hint="e.g. Dental Assistant, Receptionist" />
            <ImageField label="Photograph" value={it.photo} onChange={(v) => up({ photo: v })} aspect={4 / 3} category="staff" />
            <Text label="Qualification" value={it.qualification} onChange={(v) => up({ qualification: v })} />
            <Text label="Experience" value={it.experience} onChange={(v) => up({ experience: v })} hint="e.g. 5 years" />
            <Text label="About" area rows={4} value={it.bio} onChange={(v) => up({ bio: v })} />
            <Check label="Visible on website" value={it.visible !== false} onChange={(v) => up({ visible: v })} />
          </>} />
      </Card>
    </>
  )
}

/* ───────────── Doctor ───────────── */
export function DoctorPage() {
  const { set, get } = useSetter()
  return (
    <>
      <PageTitle sub="Only add qualifications and credentials that have been verified.">Doctor Profile</PageTitle>
      <Card>
        <F p="doctor.eyebrow" label="Small heading" /><F p="doctor.heading" label="Section heading" />
        <F p="doctor.name" label="Full name" /><F p="doctor.designation" label="Professional designation" />
        <ImageField label="Profile photograph" value={get('doctor.photo')} onChange={(v) => set('doctor.photo', v)} aspect={4 / 5} category="doctor" />
        <F p="doctor.intro" label="Introduction" area /><F p="doctor.biography" label="Biography" area rows={7} />
        <F p="doctor.experience" label="Clinical experience" />
        {[['qualifications', 'Qualifications'], ['specialisations', 'Specialisations / areas of expertise'], ['memberships', 'Professional memberships'], ['achievements', 'Achievements']].map(([k, l]) =>
          <Lines key={k} label={l} value={get(`doctor.${k}`)} onChange={(v) => set(`doctor.${k}`, v)} />)}
      </Card>
    </>
  )
}

/* ───────────── Testimonials ───────────── */
export function TestimonialsPage() {
  const { set, get } = useSetter()
  return (
    <>
      <PageTitle sub="Only add genuine feedback you have permission to publish. The section stays hidden while the list is empty.">Testimonials</PageTitle>
      <Card>
        <ListEditor items={get('testimonials')} onChange={(v) => set('testimonials', v)} prefix="r" addLabel="Add testimonial" titleOf={(x) => `${x.name || 'Patient'} – ${(x.text || '').slice(0, 40)}`}
          blank={{ name: '', text: '', source: 'Google review', published: true }}
          render={(it, up) => <>
            <Text label="Patient name / initials" value={it.name} onChange={(v) => up({ name: v })} />
            <Text label="Feedback" area value={it.text} onChange={(v) => up({ text: v })} />
            <Text label="Source" value={it.source} onChange={(v) => up({ source: v })} hint="e.g. Google review" />
            <Check label="Show on website" value={it.published} onChange={(v) => up({ published: v })} />
          </>} />
      </Card>
    </>
  )
}

/* ───────────── FAQ ───────────── */
export function FaqPage() {
  const { set, get } = useSetter()
  return (
    <>
      <PageTitle>FAQs</PageTitle>
      <Card>
        <ListEditor items={get('faqs')} onChange={(v) => set('faqs', v)} prefix="f" addLabel="Add question" titleOf={(x) => x.q} blank={{ q: '', a: '' }}
          render={(it, up) => <><Text label="Question" value={it.q} onChange={(v) => up({ q: v })} /><Text label="Answer" area rows={5} value={it.a} onChange={(v) => up({ a: v })} /></>} />
      </Card>
    </>
  )
}

/* ───────────── SEO ───────────── */
export function SeoPage() {
  const { set, get } = useSetter()
  return (
    <>
      <PageTitle>SEO</PageTitle>
      <Card>
        <F p="seo.title" label="Page title" hint="Aim for under 60 characters." /><F p="seo.description" label="Meta description" area rows={3} hint="Aim for under 160 characters." />
        <F p="seo.keywords" label="Keywords (comma separated)" /><F p="seo.canonical" label="Canonical URL" />
        <F p="seo.ogTitle" label="Open Graph title" /><F p="seo.ogDescription" label="Open Graph description" area rows={2} />
        <ImageField label="Social sharing image" value={get('seo.ogImage')} onChange={(v) => set('seo.ogImage', v)} aspect={1200 / 630} category="seo" />
        <p className="text-xs text-slate-500">Image alt text is edited alongside each image in the Media Library.</p>
      </Card>
    </>
  )
}

/* ───────────── Website settings: branding, contact, hours, social ───────────── */
const FONTS = ['Playfair Display', 'Inter', 'Poppins', 'Lora', 'Montserrat', 'Merriweather', 'DM Sans', 'Nunito', 'Cormorant Garamond', 'Roboto']
export function SettingsPage() {
  const { set, get } = useSetter()
  return (
    <>
      <PageTitle>Website Settings</PageTitle>
      <Card title="Branding">
        <F p="branding.clinicName" label="Clinic name" /><F p="branding.tagline" label="Tagline" />
        <ImageField label="Logo" value={get('branding.logo')} onChange={(v) => set('branding.logo', v)} category="branding" />
        <ImageField label="Favicon" value={get('branding.favicon')} onChange={(v) => set('branding.favicon', v)} aspect={1} category="branding" />
        <div className="grid gap-x-4 md:grid-cols-2">
          {[['primary', 'Primary brand colour'], ['secondary', 'Secondary / accent colour']].map(([k, l]) => (
            <label key={k} className="mb-4 block"><span className="a-label">{l}</span>
              <div className="flex gap-2"><input type="color" value={get(`branding.${k}`)} onChange={(e) => set(`branding.${k}`, e.target.value)} className="h-10 w-14 rounded border border-slate-300" /><input className="a-input" value={get(`branding.${k}`)} onChange={(e) => set(`branding.${k}`, e.target.value)} /></div></label>))}
          {[['headingFont', 'Heading font'], ['bodyFont', 'Body font']].map(([k, l]) => (
            <label key={k} className="mb-4 block"><span className="a-label">{l}</span>
              <select className="a-input" value={get(`branding.${k}`)} onChange={(e) => set(`branding.${k}`, e.target.value)}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select></label>))}
        </div>
      </Card>
      <Card title="Contact details">
        <div className="grid gap-x-4 md:grid-cols-2"><F p="settings.phone" label="Telephone" /><F p="settings.whatsapp" label="WhatsApp number" hint="With country code" /><F p="settings.email" label="Email" /></div>
        <F p="settings.clinicFullName" label="Clinic full name" /><F p="settings.address" label="Clinic address" area rows={3} /><F p="settings.mapUrl" label="Google Maps location link" hint="Shown as “Get directions on Google Maps”" /><F p="settings.whatsappMessage" label="WhatsApp pre-filled message" hint="Used by the “WhatsApp Us” button" /><F p="settings.mapEmbedUrl" label="Google Maps embed URL" hint="Maps → Share → Embed a map → copy the src URL" />
      </Card>
      <Card title="Operating hours & booking slots">
        <p className="mb-3 text-sm text-slate-500">Sunday is always closed for bookings.</p>
        {DAYS.map(([k, name]) => {
          const h = get(`settings.hours.${k}`)
          return (
            <div key={k} className="mb-2 flex flex-wrap items-center gap-3">
              <label className="flex w-32 items-center gap-2 text-sm"><input type="checkbox" disabled={k === 'sun'} checked={k === 'sun' ? false : h.open} onChange={(e) => set(`settings.hours.${k}.open`, e.target.checked)} />{name}</label>
              <input type="time" className="a-input !w-32" disabled={!h.open || k === 'sun'} value={h.start} onChange={(e) => set(`settings.hours.${k}.start`, e.target.value)} />
              <span>to</span>
              <input type="time" className="a-input !w-32" disabled={!h.open || k === 'sun'} value={h.end} onChange={(e) => set(`settings.hours.${k}.end`, e.target.value)} />
            </div>)
        })}
        <label className="mt-4 block"><span className="a-label">Appointment length (minutes)</span>
          <select className="a-input !w-40" value={get('settings.slotMinutes')} onChange={(e) => set('settings.slotMinutes', +e.target.value)}>{[15, 20, 30, 45, 60].map((m) => <option key={m}>{m}</option>)}</select></label>
      </Card>
      <Card title="Social links">{['instagram', 'facebook', 'youtube', 'linkedin'].map((k) => <F key={k} p={`settings.social.${k}`} label={k[0].toUpperCase() + k.slice(1)} />)}</Card>
    </>
  )
}
