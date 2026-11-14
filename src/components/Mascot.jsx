import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useMascot } from './mascotRender'
import { useContent } from '../lib/ContentContext'

export function Mascot({ pose = 'wave', className = 'h-24 w-24', float = true, alt = '' }) {
  const url = useMascot(pose)
  if (!url) return <div className={className} />
  return (
    <motion.img src={url} alt={alt} aria-hidden={alt ? undefined : true} draggable={false} className={`select-none object-contain drop-shadow-xl ${className}`}
      animate={float ? { y: [0, -8, 0], rotate: [-2, 2, -2] } : undefined} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} />
  )
}

// Which pose to show for the section currently in view.
const SECTION_POSE = { hero: 'wave', about: 'heart', treatments: 'mirror', why: 'shield', doctor: 'stethoscope', staff: 'heart', technology: 'magnifier', journey: 'brush', testimonials: 'heart', faq: 'magnifier', contact: 'wave' }

// One cute tooth that travels across the page as the visitor scrolls.
export function ScrollMascot() {
  const { sections, settings } = useContent()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const [pose, setPose] = useState('wave')
  const types = Object.fromEntries(sections.map((s) => [s.id, s.type]))

  // Zig-zag across the viewport: left → right → left … once every ~third of the page.
  const x = useTransform(scrollYProgress, [0, 0.17, 0.34, 0.5, 0.67, 0.84, 1], ['76vw', '4vw', '76vw', '4vw', '76vw', '4vw', '76vw'])
  const rotate = useTransform(scrollYProgress, (v) => Math.sin(v * 60) * 8)
  const y = useTransform(scrollYProgress, (v) => Math.sin(v * 90) * 6)

  useEffect(() => {
    const els = sections.filter((s) => s.visible).map((s) => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => setPose(SECTION_POSE[types[e.target.id]] || 'wave'))
    }, { rootMargin: '-45% 0px -45% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections]) // eslint-disable-line

  const url = useMascot(pose)
  if (settings.scrollMascot === false) return null
  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed bottom-3 left-0 z-30" style={reduce ? { left: 'auto', right: 12 } : { x, y, rotate }}>
      <AnimatePresence mode="wait">
        {url && <motion.img key={pose} src={url} alt="" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.25 }}
          className="h-20 w-20 select-none drop-shadow-2xl sm:h-28 sm:w-28" draggable={false} />}
      </AnimatePresence>
    </motion.div>
  )
}
