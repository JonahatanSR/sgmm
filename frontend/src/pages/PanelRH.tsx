import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet, apiDelete } from '../services/api'

type Summary = {
  employee: {
    id: string
    full_name: string
    employee_number: string
    email: string
    company_id?: string
    paternal_last_name?: string | null
    maternal_last_name?: string | null
    first_name?: string | null
    gender?: 'M' | 'F' | null
    birth_date?: string | null
    hire_date?: string | null
  }
  dependents: {
    active: Array<{ id: string; first_name: string; paternal_last_name: string; maternal_last_name?: string | null; gender: 'M' | 'F'; birth_date: string; relationship_type_id: number; policy_start_date: string; dependent_id?: string }>
    inactive: Array<{ id: string; first_name: string; paternal_last_name: string; maternal_last_name?: string | null; gender: 'M' | 'F'; birth_date: string; relationship_type_id: number; policy_start_date?: string; policy_end_date?: string; dependent_id?: string }>
  }
}

export default function PanelRH() {
  const [query, setQuery] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [employeeId, setEmployeeId] = useState<string>('')
  const [suggestions, setSuggestions] = useState<Array<{ id: string; employee_number: string; email: string; full_name: string }>>([])
  const [loadingSuggest, setLoadingSuggest] = useState(false)

  const { data, isFetching, refetch } = useQuery<Summary>({
    queryKey: ['panel-summary', employeeId],
    queryFn: () => apiGet(`/api/collaborator/${employeeId}/summary`),
    enabled: !!employeeId,
  })

  const { data: companies, isLoading: loadingCompanies } = useQuery<Array<{ id: string; name: string; code: string }>>({
    queryKey: ['companies'],
    queryFn: () => apiGet('/api/companies'),
    staleTime: 0,
    gcTime: 0,
  })

  const { data: relTypes } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['relationship-types'],
    queryFn: () => apiGet('/api/relationship-types'),
    staleTime: 0,
    gcTime: 0,
  })

  const relMap = new Map<number, string>((relTypes || []).map(r => [r.id, r.name]))

  useEffect(() => {
    if (!companyId) setCompanyId('all')
  }, [companyId])

  const canSearch = useMemo(() => query.trim().length >= 3 && companyId.trim().length > 0, [query, companyId])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!canSearch) { setSuggestions([]); return }
      setLoadingSuggest(true)
      try {
        const list = await apiGet<Array<{ id: string; employee_number: string; email: string; full_name: string }>>(`/api/employees/search?query=${encodeURIComponent(query)}&companyId=${encodeURIComponent(companyId)}`)
        setSuggestions(list)
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSuggest(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, companyId, canSearch])

  const inputCls = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
  const labelCls = 'text-xs font-medium text-gray-600 mb-1 block'

  const formatDate = (iso?: string | null) => {
    if (!iso) return '-'
    const s = iso.slice(0, 10)
    const [y, m, d] = s.split('-')
    return `${d}/${m}/${y}`
  }
  const calcAge = (iso?: string | null) => {
    if (!iso) return '-'
    const [yStr, mStr, dStr] = iso.slice(0,10).split('-')
    const y = Number(yStr), m = Number(mStr), d = Number(dStr)
    const today = new Date()
    let age = today.getFullYear() - y
    const mm = today.getMonth() + 1
    const dd = today.getDate()
    if (mm < m || (mm === m && dd < d)) age--
    if (age < 0) return '0'
    return String(age)
  }

  return (
    <div className="space-y-4">
      <div className="card border border-gray-200">
        <div className="card-header">
          <h2 className="card-title">Revisión individual por colaborador</h2>
          <div className="card-instructions">
            <ul>
              <li>1) Selecciona una compañía (o “Todas las compañías”).</li>
              <li>2) Escribe al menos 3 caracteres de número, correo o nombre.</li>
              <li>3) Elige al colaborador en Sugerencias para cargar su resumen.</li>
              <li>4) Desde las tablas puedes editar, dar de baja o restaurar dependientes.</li>
              <li>5) Las acciones quedan registradas en auditoría.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2">
          <div className="w-64">
            <label className={labelCls}>Compañía</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={loadingCompanies}
              className={inputCls}
            >
              <option value="all">Todas las compañías</option>
              {(companies || []).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelCls}>Búsqueda</label>
            <input
              placeholder="Número, correo o nombre (mín. 3)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>&nbsp;</label>
            <button className="btn-primary" disabled={!canSearch} onClick={() => { if (suggestions[0]) { setEmployeeId(suggestions[0].id); refetch() } }}>Buscar</button>
          </div>
        </div>
      </div>

      {canSearch && (loadingSuggest || suggestions.length > 0) && (
        <div className="card">
          <div className="font-semibold mb-2">Sugerencias {loadingSuggest ? '(cargando...)' : ''}</div>
          <ul>
            {suggestions.map(s => (
              <li key={s.id} className="flex justify-between py-1 cursor-pointer" onClick={() => { setEmployeeId(s.id); setSuggestions([]) }}>
                <span>{s.full_name}</span>
                <span className="text-gray-500 text-xs">#{s.employee_number} · {s.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isFetching && <div>Cargando…</div>}
      {data && (
        <div className="space-y-4">
          <div className="card border border-gray-200">
            <div className="font-semibold">{data.employee.full_name}</div>
            <div className="text-xs text-gray-500">{data.employee.email}</div>
          </div>

          <div className="card border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Dependientes activos</h3>
            <table className="table-pro">
              <thead>
                <tr><th>Apellido Paterno</th><th>Apellido Materno</th><th>Nombre</th><th>Sexo</th><th>Fecha nacimiento</th><th className="text-right">Edad</th><th>Antigüedad Póliza</th><th>Parentesco</th><th>Acta</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.employee.paternal_last_name ?? '-'}</td>
                  <td>{data.employee.maternal_last_name ?? '-'}</td>
                  <td>{data.employee.first_name ?? '-'}</td>
                  <td>{data.employee.gender ?? '-'}</td>
                  <td>{formatDate(data.employee.birth_date ?? undefined)}</td>
                  <td className="text-right">{calcAge(data.employee.birth_date ?? undefined)}</td>
                  <td>{formatDate(data.employee.hire_date ?? undefined)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                {data.dependents.active.map(d => (
                  <tr key={d.id}>
                    <td>{d.paternal_last_name}</td>
                    <td>{d.maternal_last_name ?? '-'}</td>
                    <td>{d.first_name}</td>
                    <td>{d.gender}</td>
                    <td>{formatDate(d.birth_date)}</td>
                    <td className="text-right">{calcAge(d.birth_date)}</td>
                    <td>{formatDate(d.policy_start_date)}</td>
                    <td>{relMap.get(d.relationship_type_id) ?? d.relationship_type_id}</td>
                    <td>Completo</td>
                    <td className="space-x-2">
                      <button className="icon-btn" title="Editar" onClick={() => (window.location.href = `/dependents/${d.id}/edit`)}>✏️</button>
                      <button className="icon-btn" title="Baja" onClick={async () => { await apiDelete(`/api/dependents/${d.id}`); await refetch(); }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Histórico (baja)</h3>
            <table className="table-pro">
              <thead>
                <tr><th>Apellido Paterno</th><th>Apellido Materno</th><th>Nombre</th><th>Sexo</th><th>Fecha nacimiento</th><th>Edad</th><th>Inicio</th><th>Fin</th><th>Parentesco</th></tr>
              </thead>
              <tbody>
                {data.dependents.inactive.map(d => (
                  <tr key={d.id}>
                    <td>{d.paternal_last_name}</td>
                    <td>{d.maternal_last_name ?? '-'}</td>
                    <td>{d.first_name}</td>
                    <td>{d.gender}</td>
                    <td>{formatDate(d.birth_date)}</td>
                    <td>{calcAge(d.birth_date)}</td>
                    <td>{formatDate(d.policy_start_date)}</td>
                    <td>{formatDate(d.policy_end_date)}</td>
                    <td>{relMap.get(d.relationship_type_id) ?? d.relationship_type_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


