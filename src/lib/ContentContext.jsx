import { createContext, useContext, useEffect, useState } from 'react'
import { getPublished, getDraft } from './store'

const Ctx = createContext(null)
export const useContent = () => useContext(Ctx)

const hexToRgb = (h) => {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(h || '')
  return m ? `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}` : null
}
const setMeta = (sel, attr, key, val) => {
  let el = document.querySelector(sel)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', val || '')
}

export function applyBranding(c) {
  const b = c.branding, r = document.documentElement.style
  const p = hexToRgb(b.primary), s = hexToRgb(b.secondary)
  if (p) r.setProperty('--brand', p)
  if (s) r.setProperty('--accent', s)
  r.setProperty('--font-heading', `'${b.headingFont}'`)
  r.setProperty('--font-body', `'${b.bodyFont}'`)
  const fams = [...new Set([b.headingFont, b.bodyFont])].map((f) => `family=${f.trim().replace(/ /g, '+')}:wght@400;500;600;700`).join('&')
  const link = document.getElementById('gfont')
  if (link) link.href = `https://fonts.googleapis.com/css2?${fams}&display=swap`
  if (b.favicon) {
    let l = document.querySelector("link[rel='icon']")
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l) }
    l.href = b.favicon
  }
}

export function ContentProvider({ draft = false, children }) {
  const [content, setContent] = useState(null)
  useEffect(() => {
    let alive = true
    ;(draft ? getDraft : getPublished)().then((c) => alive && setContent(c)).catch(() => alive && setContent(null))
    return () => { alive = false }
  }, [draft])

  useEffect(() => {
    if (!content) return
    applyBranding(content)
    const s = content.seo
    document.title = s.title
    setMeta('meta[name=description]', 'name', 'description', s.description)
    setMeta('meta[name=keywords]', 'name', 'keywords', s.keywords)
    setMeta('meta[property="og:title"]', 'property', 'og:title', s.ogTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', s.ogDescription)
    setMeta('meta[property="og:image"]', 'property', 'og:image', s.ogImage)
    let can = document.querySelector("link[rel='canonical']")
    if (s.canonical) {
      if (!can) { can = document.createElement('link'); can.rel = 'canonical'; document.head.appendChild(can) }
      can.href = s.canonical
    } else can?.remove()
  }, [content])

  if (!content) return <div className="grid min-h-screen place-items-center text-slate-400">Loading…</div>
  return <Ctx.Provider value={content}>{children}</Ctx.Provider>
}
