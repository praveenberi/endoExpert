import { useSearchParams } from 'react-router-dom'
import { ContentProvider, useContent } from '../lib/ContentContext'
import { Navbar, Footer } from '../components/Chrome'
import { SECTION_MAP, Custom } from '../components/Sections'
import { ScrollMascot } from '../components/Mascot'

function Page() {
  const { sections, customSections } = useContent()
  return (
    <>
      <Navbar />
      <main>
        {sections.filter((s) => s.visible).map((s) => {
          if (s.type === 'custom') {
            const data = customSections.find((c) => c.id === s.id)
            return data ? <Custom key={s.id} s={s} data={data} /> : null
          }
          const C = SECTION_MAP[s.type]
          return C ? <C key={s.id} s={s} /> : null
        })}
      </main>
      <Footer />
      <ScrollMascot />
    </>
  )
}

// ?preview=draft shows unpublished admin changes (used by the admin live preview).
export default function Site() {
  const [q] = useSearchParams()
  return <ContentProvider draft={q.get('preview') === 'draft'}><Page /></ContentProvider>
}
