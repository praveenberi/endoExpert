import { useEffect, useRef, useState } from 'react'

// Plays the videos one after another and loops back to the first.
export default function VideoPlaylist({ videos }) {
  const list = (videos || []).filter((v) => v.url)
  const [i, setI] = useState(0)
  const ref = useRef(null)
  const cur = list[i % Math.max(list.length, 1)]

  useEffect(() => { ref.current?.play().catch(() => {}) }, [i])
  if (!cur) return null
  return (
    <div className="rounded-3xl bg-slate-900/60 p-3 ring-1 ring-white/10">
      <video ref={ref} key={cur.id || cur.url} src={cur.url} autoPlay muted playsInline preload="auto"
        onEnded={() => setI((n) => (n + 1) % list.length)} className="aspect-video w-full rounded-2xl bg-black object-cover" />
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <p className="text-sm text-slate-300" aria-live="polite">{cur.caption}</p>
        <div className="flex shrink-0 gap-2">
          {list.map((v, k) => (
            <button key={v.id || v.url} aria-label={`Play video ${k + 1}`} onClick={() => setI(k)}
              className={`h-2.5 rounded-full transition-all ${k === i % list.length ? 'w-7 bg-accent' : 'w-2.5 bg-white/30'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
