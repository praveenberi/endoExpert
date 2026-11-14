import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getDraft, saveDraft, publish as publishContent, getPublished, newId, listMedia, uploadMedia, processImage } from '../lib/store'

/* ───────────── Draft editing context (auto-saves drafts) ───────────── */
const Ctx = createContext(null)
export const useAdmin = () => useContext(Ctx)

export function AdminProvider({ children }) {
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState('saved') // saved | saving | error
  const [dirty, setDirty] = useState(false) // unpublished changes
  const [toast, setToast] = useState('')
  const timer = useRef()

  const refreshDirty = useCallback(async () => {
    const [d, p] = await Promise.all([getDraft(), getPublished()])
    setDirty(JSON.stringify(d) !== JSON.stringify(p))
  }, [])
  useEffect(() => { getDraft().then(setDraft); refreshDirty() }, [refreshDirty])

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2800) }

  const update = useCallback((fn) => {
    setDraft((prev) => {
      const next = structuredClone(prev)
      fn(next)
      setStatus('saving'); setDirty(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => saveDraft(next).then(() => setStatus('saved')).catch((e) => { setStatus('error'); flash(e.message) }), 600)
      return next
    })
  }, [])

  const publish = async (label) => {
    clearTimeout(timer.current)
    try { await publishContent(draft, label || 'Published'); setDirty(false); setStatus('saved'); flash('Published – changes are live.') }
    catch (e) { flash(`Publish failed: ${e.message}`) }
  }
  const replaceDraft = (c) => { setDraft(c); saveDraft(c).then(() => { setDirty(true); setStatus('saved') }) }

  if (!draft) return <div className="p-10 text-slate-500">Loading content…</div>
  return (
    <Ctx.Provider value={{ draft, update, publish, dirty, status, flash, replaceDraft, refreshDirty }}>
      {children}
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-xl" role="status">{toast}</div>}
    </Ctx.Provider>
  )
}

/* ───────────── Form primitives ───────────── */
export const Card = ({ title, children, actions }) => (
  <section className="a-card mb-6">
    {(title || actions) && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="!font-body text-base font-semibold text-slate-900">{title}</h2>{actions}</div>}
    {children}
  </section>
)
export const PageTitle = ({ children, sub }) => (
  <div className="mb-6"><h1 className="!font-body text-2xl font-bold text-slate-900">{children}</h1>{sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}</div>
)

export function Text({ label, value, onChange, area, rows = 4, placeholder, type = 'text', hint }) {
  return (
    <label className="mb-4 block">
      <span className="a-label">{label}</span>
      {area
        ? <textarea rows={rows} className="a-input" value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <input type={type} className="a-input" value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}
export const Check = ({ label, value, onChange }) => (
  <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />{label}</label>
)

// Edits a string[] with one entry per line.
export const Lines = ({ label, value, onChange, hint }) => (
  <Text label={label} area rows={4} hint={hint || 'One item per line'} value={(value || []).join('\n')} onChange={(v) => onChange(v.split('\n').map((x) => x.trimStart()).filter((x, i, a) => x || i < a.length - 1))} />
)

/* ───────────── Image field with upload + media-library picker ───────────── */
export function ImageField({ label, value, onChange, aspect, category = 'general' }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const { flash } = useAdmin()
  async function pick(file) {
    if (!file) return
    setBusy(true)
    try {
      const blob = await processImage(file, { maxWidth: 1600, aspect })
      const row = await uploadMedia(blob, { name: file.name, category })
      onChange(row.url)
    } catch (e) { flash(e.message) }
    setBusy(false)
  }
  return (
    <div className="mb-4">
      <span className="a-label">{label}</span>
      <div className="flex items-start gap-3">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : 'No image'}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="a-btn a-btn-light cursor-pointer">{busy ? 'Uploading…' : 'Upload'}<input type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} /></label>
          <button type="button" className="a-btn a-btn-light" onClick={() => setOpen(true)}>Library</button>
          {value && <button type="button" className="a-btn a-btn-danger" onClick={() => onChange('')}>Remove</button>}
        </div>
      </div>
      {open && <MediaPicker onClose={() => setOpen(false)} onPick={(u) => { onChange(u); setOpen(false) }} />}
    </div>
  )
}

function MediaPicker({ onClose, onPick }) {
  const [items, setItems] = useState(null)
  useEffect(() => { listMedia().then(setItems) }, [])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex justify-between"><h3 className="!font-body font-semibold">Choose from media library</h3><button onClick={onClose} className="a-btn a-btn-light">Close</button></div>
        {!items ? 'Loading…' : items.length === 0 ? <p className="text-sm text-slate-500">No images yet. Upload one first.</p> : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{items.map((m) => (
            <button key={m.id} onClick={() => onPick(m.url)} className="overflow-hidden rounded-lg border border-slate-200 hover:ring-2 hover:ring-brand"><img src={m.url} alt={m.alt} className="aspect-square w-full object-cover" /></button>))}</div>
        )}
      </div>
    </div>
  )
}

/* ───────────── Generic reorderable list editor ───────────── */
export function ListEditor({ items, onChange, render, blank, addLabel = 'Add item', titleOf, prefix = 'i' }) {
  const [openId, setOpenId] = useState(null)
  const move = (i, d) => { const a = [...items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a) }
  const patch = (i, p) => onChange(items.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const del = (i) => { if (confirm('Delete this item? This cannot be undone until you restore a previous version.')) onChange(items.filter((_, k) => k !== i)) }
  return (
    <div>
      {items.length === 0 && <p className="mb-3 text-sm text-slate-500">Nothing here yet.</p>}
      {items.map((it, i) => {
        const open = openId === it.id
        return (
          <div key={it.id} className="mb-2 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" onClick={() => setOpenId(open ? null : it.id)} className="flex-1 truncate text-left text-sm font-medium text-slate-800">
                <span className="mr-2 text-slate-400">{open ? '▾' : '▸'}</span>{titleOf(it) || '(untitled)'}
              </button>
              <button type="button" className="a-btn a-btn-light !px-2 !py-1" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className="a-btn a-btn-light !px-2 !py-1" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
              <button type="button" className="a-btn a-btn-danger !px-2 !py-1" onClick={() => del(i)}>Delete</button>
            </div>
            {open && <div className="border-t border-slate-200 p-4">{render(it, (p) => patch(i, p))}</div>}
          </div>
        )
      })}
      <button type="button" className="a-btn a-btn-primary mt-2" onClick={() => { const n = { id: newId(prefix), ...blank }; onChange([...items, n]); setOpenId(n.id) }}>+ {addLabel}</button>
    </div>
  )
}

export const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
