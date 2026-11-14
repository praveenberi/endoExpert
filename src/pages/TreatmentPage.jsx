import { Link, useParams } from 'react-router-dom'
import { ContentProvider, useContent } from '../lib/ContentContext'
import { Navbar, Footer } from '../components/Chrome'
import { Img } from '../components/ui'

function Inner() {
  const { slug } = useParams()
  const { treatments } = useContent()
  const t = treatments.find((x) => x.slug === slug && x.published)
  const others = treatments.filter((x) => x.published && x.slug !== slug).slice(0, 3)
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-5 pb-24 pt-32">
        <div className="container-x max-w-3xl">
          {!t ? (
            <div className="text-center"><h1 className="text-3xl font-semibold">Treatment not found</h1><Link to="/#treatments" className="btn btn-primary mt-6">View all treatments</Link></div>
          ) : (
            <>
              <Link to="/#treatments" className="text-sm font-semibold text-brand">← All treatments</Link>
              <h1 className="mt-4 text-4xl font-semibold">{t.title}</h1>
              <p className="mt-3 text-lg text-brand">{t.summary}</p>
              {t.image && <Img src={t.image} alt={t.title} className="mt-8 aspect-video w-full rounded-3xl object-cover" />}
              <div className="mt-8 space-y-4 text-slate-600">{t.details.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>
              <Link to="/#contact" className="btn btn-primary mt-10">Book an appointment</Link>
              {others.length > 0 && (
                <div className="mt-16 border-t border-slate-200 pt-8">
                  <h2 className="text-xl font-semibold">Other treatments</h2>
                  <ul className="mt-3 space-y-2">{others.map((o) => <li key={o.id}><Link className="text-brand hover:underline" to={`/treatments/${o.slug}`}>{o.title}</Link></li>)}</ul>
                </div>
              )}
              <p className="mt-10 text-xs text-slate-400">This page is general information and is not a substitute for a clinical examination.</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
export default function TreatmentPage() { return <ContentProvider><Inner /></ContentProvider> }
