import { useEffect, useState } from 'react'
import { useAdmin, PageTitle } from './shared'
import { saveDraft } from '../lib/store'

export default function PreviewPage() {
  const { draft, publish, dirty } = useAdmin()
  const [w, setW] = useState(1280)
  const [key, setKey] = useState(0)
  // Make sure the latest draft is persisted before the iframe loads it.
  useEffect(() => { saveDraft(draft).then(() => setKey((k) => k + 1)) }, []) // eslint-disable-line
  return (
    <>
      <PageTitle sub="This is the draft – exactly how the site will look once published.">Live Preview</PageTitle>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[['Mobile', 390], ['Tablet', 820], ['Desktop', 1280]].map(([l, v]) => <button key={l} className={`a-btn ${w === v ? 'a-btn-primary' : 'a-btn-light'}`} onClick={() => setW(v)}>{l}</button>)}
        <button className="a-btn a-btn-light" onClick={() => saveDraft(draft).then(() => setKey((k) => k + 1))}>Refresh preview</button>
        <button className="a-btn a-btn-primary ml-auto" disabled={!dirty} onClick={() => confirm('Publish to the live website?') && publish()}>Publish changes</button>
      </div>
      <div className="overflow-auto rounded-xl border border-slate-300 bg-slate-200 p-3">
        <iframe key={key} title="Draft preview" src="/?preview=draft" style={{ width: Math.min(w, 1600), maxWidth: '100%', height: '75vh' }} className="mx-auto block rounded-lg bg-white shadow-lg" />
      </div>
    </>
  )
}
