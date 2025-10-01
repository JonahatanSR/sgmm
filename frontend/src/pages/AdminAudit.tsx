import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../services/api'

type AuditRow = {
  id: string
  action: string
  table_name: string
  record_id: string
  timestamp: string
  user_id: string
  old_values?: any
  new_values?: { after?: any; changes?: Array<{ field: string; before: any; after: any }> }
}

export default function AdminAudit() {
  const { data, isLoading, error, refetch } = useQuery<AuditRow[]>({
    queryKey: ['admin-audit'],
    queryFn: () => apiGet('/api/admin/audit'),
    staleTime: 10_000,
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Auditoría (últimos 50)</h2>
        <button className="btn-secondary shadow-sm" onClick={() => refetch()}>Refrescar</button>
      </div>
      {isLoading && <div className="badge">Cargando…</div>}
      {error && <div className="badge">Error al cargar auditoría</div>}
      <div className="card border border-gray-200">
        <table className="table-pro">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Acción</th>
              <th>Tabla</th>
              <th>Registro</th>
              <th>Usuario</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.action}</td>
                <td>{r.table_name}</td>
                <td>{r.record_id}</td>
                <td>{r.user_id}</td>
                <td>
                  {r.new_values?.changes && r.new_values.changes.length > 0 ? (
                    <details>
                      <summary>{r.new_values.changes.length} cambio(s)</summary>
                      <ul style={{ fontSize: 12 }}>
                        {r.new_values.changes.map((c, idx) => (
                          <li key={idx}><strong>{c.field}:</strong> {String(c.before)} → {String(c.after)}</li>
                        ))}
                      </ul>
                    </details>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}



