import { useEffect, useState } from 'react'
import { listRevisions } from '../lib/store'
import { useAdmin, Card, PageTitle } from './shared'

export default function RevisionsPage() {
  const { replaceDraft, flash, refreshDirty } = useAdmin()
  const [rows, setRows] = useState(null)
  useEffect(() => { listRevisions().then(setRows) }, [])
  const restore = (r) => {
    if (!confirm(`Restore the version from ${new Date(r.created_at).toLocaleString()}? It loads into your draft – nothing goes live until you publish.`)) return
    replaceDraft(structuredClone(r.content)); setTimeout(refreshDirty, 300); flash('Restored into draft. Review it, then Publish.')
  }
  return (
    <>
      <PageTitle sub="A snapshot is saved every time you publish.">Version History</PageTitle>
      <Card>
        {!rows ? 'Loading…' : rows.length === 0 ? <p className="text-sm text-slate-500">No published versions yet.</p> : (
          <ul className="divide-y divide-slate-100">{rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3 text-sm"><span>{new Date(r.created_at).toLocaleString()} <span className="text-slate-400">· {r.label}</span></span>
              <button className="a-btn a-btn-light" onClick={() => restore(r)}>Restore to draft</button></li>))}</ul>)}
      </Card>
    </>
  )
}
