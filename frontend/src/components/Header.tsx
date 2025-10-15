import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../services/api'

export default function Header() {
  const loc = useLocation()
  const segs = loc.pathname.replace(/^\//, '').split('/')
  const collabId = segs[0] === 'collaborator' && segs[1] ? segs[1] : ''

  const { data: collabSummary } = useQuery<{ employee?: { full_name?: string } }>({
    queryKey: ['collaborator', collabId],
    queryFn: () => apiGet(`/api/collaborator/${collabId}/summary`),
    enabled: Boolean(collabId),
    staleTime: 0,
    gcTime: 0,
  })


  let parts = segs
  if (collabId) {
    const name = collabSummary?.employee?.full_name
    if (name) {
      parts = [...segs]
      parts[1] = name
    }
  }
  const breadcrumb = parts.length > 1 ? parts.join(' › ') : ''

  return (
    <header className="fixed top-0 left-0 right-0 z-50 text-white bg-[var(--color-primary)] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-bold hover:opacity-90">SGMM</Link>
          {breadcrumb ? <span className="text-sm text-white/85">{breadcrumb}</span> : null}
        </div>
        <nav className="flex gap-4 text-sm items-center">
          <Link to="/admin/audit" className="hover:underline">Auditoría</Link>
          <Link to="/panel" className="hover:underline">Panel RH</Link>
        </nav>
      </div>
    </header>
  )
}


