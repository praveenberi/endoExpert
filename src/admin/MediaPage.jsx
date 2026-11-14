import { useEffect, useState } from 'react'
import { listMedia, uploadMedia, updateMedia, deleteMedia, processImage } from '../lib/store'
import { useAdmin, Card, PageTitle } from './shared'

const CATS = ['general', 'hero', 'clinic', 'treatments', 'doctor', 'staff', 'branding', 'sections', 'seo']
const ASPECTS = [['Original', ''], ['Square 1:1', 1], ['Landscape 4:3', 4 / 3], ['Wide 16:9', 16 / 9], ['Portrait 4:5', 4 / 5]]

function used(draft, url) { return JSON.stringify(draft).includes(JSON.stringify(url).slice(1, -1)) }

export default function MediaPage() {
  const { draft, flash, update } = useAdmin()
  const [items, setItems] = useState([])
  const [cat, setCat] = useState('general')
  const [aspect, setAspect] = useState('')
  const [maxW, setMaxW] = useState(1600)
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(false)
  const load = () => listMedia().then(setItems)
  useEffect(() => { load() }, [])

  async function upload(files) {
    setBusy(true)
    for (const f of files) {
      if (!f.type.startsWith('image/')) { flash(`${f.name}: only images can be uploaded here`); continue }
      try { await uploadMedia(await processImage(f, { maxWidth: maxW, aspect: aspect || null }), { name: f.name, category: cat }) }
      catch (e) { flash(e.message) }
    }
    setBusy(false); load()
  }
  const remove = async (m) => {
    const inUse = used(draft, m.url)
    if (!confirm(inUse ? 'This image is used on the website. Deleting it will leave a gap. Delete anyway?' : 'Delete this image permanently?')) return
    await deleteMedia(m); load()
  }
  const shown = items.filter((m) => filter === 'all' || m.category === filter)

  return (
    <>
      <PageTitle sub="Upload, crop, categorise and delete photographs. Choose an image in any editor with the “Library” button.">Photos & Media</PageTitle>
      <Card title="Upload">
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <label><span className="a-label">Category</span><select className="a-input" value={cat} onChange={(e) => setCat(e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label><span className="a-label">Crop</span><select className="a-input" value={aspect} onChange={(e) => setAspect(e.target.value ? +e.target.value : '')}>{ASPECTS.map(([l, v]) => <option key={l} value={v}>{l}</option>)}</select></label>
          <label><span className="a-label">Max width (px)</span><select className="a-input" value={maxW} onChange={(e) => setMaxW(+e.target.value)}>{[800, 1200, 1600, 2400].map((w) => <option key={w}>{w}</option>)}</select></label>
        </div>
        <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload([...e.dataTransfer.files]) }}
          className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 hover:border-brand">
          {busy ? 'Uploading…' : 'Drag & drop images here, or click to choose (multiple allowed)'}
          <input type="file" accept="image/*" multiple hidden onChange={(e) => { upload([...e.target.files]); e.target.value = '' }} />
        </label>
      </Card>
      <Card title={`Library (${shown.length})`} actions={<select className="a-input !w-40" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>}>
        {shown.length === 0 ? <p className="text-sm text-slate-500">No images yet.</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{shown.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-lg border border-slate-200">
              <img src={m.url} alt={m.alt} className="aspect-video w-full object-cover" />
              <div className="space-y-2 p-3">
                <input className="a-input" placeholder="Alt text (describe the image)" defaultValue={m.alt} onBlur={(e) => e.target.value !== m.alt && updateMedia(m.id, { alt: e.target.value }).then(load)} />
                <select className="a-input" value={m.category} onChange={(e) => updateMedia(m.id, { category: e.target.value }).then(load)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
                <div className="flex gap-2"><button className="a-btn a-btn-light flex-1 justify-center" onClick={() => { navigator.clipboard?.writeText(m.url); flash('Image URL copied') }}>Copy URL</button>
                  <button className="a-btn a-btn-danger" onClick={() => remove(m)}>Delete</button></div>
                {used(draft, m.url) && <p className="text-xs text-green-700">In use on website</p>}
              </div>
            </div>))}</div>)}
      </Card>
      <Card title="Videos">
        <p className="mb-3 text-sm text-slate-500">Videos are linked by URL (not uploaded) to keep the site fast.</p>
        <label><span className="a-label">Hero background video – direct .mp4 / .webm URL (optional)</span>
          <input className="a-input" value={draft.hero.videoUrl || ''} placeholder="https://…" onChange={(e) => update((d) => { d.hero.videoUrl = e.target.value })} /></label>
      </Card>
    </>
  )
}
