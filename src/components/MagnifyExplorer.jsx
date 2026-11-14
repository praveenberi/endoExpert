import { useState } from 'react'

// Interactive magnification demo: zooming reveals finer canal anatomy.
export default function MagnifyExplorer() {
  const [zoom, setZoom] = useState(1)
  const fine = Math.min(1, Math.max(0, (zoom - 4) / 8))
  const finer = Math.min(1, Math.max(0, (zoom - 12) / 10))
  return (
    <div className="rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/10">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full bg-slate-950 ring-4 ring-accent/50">
        <svg viewBox="0 0 200 200" className="h-full w-full transition-transform duration-300" style={{ transform: `scale(${zoom})`, transformOrigin: '50% 62%' }}>
          <defs><linearGradient id="ro" x1="0" x2="1"><stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#94a3b8" /></linearGradient></defs>
          <path d="M60 30 Q100 10 140 30 Q150 70 135 100 Q128 170 112 190 Q100 140 100 120 Q100 140 88 190 Q72 170 65 100 Q50 70 60 30Z" fill="url(#ro)" opacity=".35" />
          <path d="M92 55 Q94 110 90 175" stroke="#2dd4bf" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M108 55 Q106 110 111 175" stroke="#2dd4bf" strokeWidth="3" fill="none" strokeLinecap="round" />
          <g opacity={fine} stroke="#5eead4" strokeWidth=".8" fill="none">
            <path d="M92 90 Q98 95 100 100 M108 90 Q102 95 100 100 M91 130 Q99 134 108 130" />
            <path d="M90 150 Q86 156 88 164 M111 150 Q116 156 113 164" />
          </g>
          <g opacity={finer} stroke="#a7f3d0" strokeWidth=".35" fill="none">
            <path d="M92 70 q-4 3 -7 2 M92 112 q-5 2 -8 6 M108 74 q5 2 8 1 M109 118 q5 3 7 7 M91 168 q-4 2 -6 6 M111 168 q4 2 6 6" />
          </g>
        </svg>
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-accent">{zoom.toFixed(1)}×</span>
      </div>
      <input type="range" min="1" max="24" step="0.5" value={zoom} onChange={(e) => setZoom(+e.target.value)}
        className="mt-5 w-full accent-teal-400" aria-label="Magnification" />
      <p className="mt-2 text-center text-xs text-slate-400">
        {zoom < 4 ? 'Naked-eye view: main canals only' : zoom < 12 ? 'Magnified: branching and accessory canals appear' : 'High magnification: fine canal detail becomes visible'}
      </p>
    </div>
  )
}
