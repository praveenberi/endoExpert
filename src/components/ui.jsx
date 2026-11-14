import { motion } from 'framer-motion'

export function Img({ src, alt = '', className = '', ph = 'Photo' }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={className} />
  return (
    <div className={`grid place-items-center bg-gradient-to-br from-brand/10 to-accent/20 text-xs font-medium uppercase tracking-widest text-brand/60 ${className}`}>
      {ph}
    </div>
  )
}

export const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
)

export function Heading({ eyebrow, title, sub, light = false, center = true }) {
  return (
    <Reveal className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow ${light ? '!text-accent' : ''}`}>{eyebrow}</p>}
      <h2 className={`mt-3 text-3xl font-semibold md:text-4xl ${light ? '!text-white' : ''}`}>{title}</h2>
      {sub && <p className={`mx-auto mt-4 max-w-2xl ${light ? 'text-slate-300' : 'text-slate-500'}`}>{sub}</p>}
    </Reveal>
  )
}

// Links: in-page anchors scroll, everything else navigates.
export const A = ({ href = '#', className = '', children }) => (
  <a href={href} className={className} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noreferrer' } : {})}>{children}</a>
)
