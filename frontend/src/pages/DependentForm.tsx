import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiGet, apiPut } from '../services/api'

type Dependent = {
  id?: string
  employee_id?: string
  first_name: string
  paternal_last_name: string
  maternal_last_name?: string | null
  gender: 'M' | 'F'
  birth_date: string
  relationship_type_id: number
  policy_start_date?: string
}

type Toast = { id: number; message: string }

export default function DependentForm() {
  const navigate = useNavigate()
  const { id, employeeId } = useParams()
  const isEdit = Boolean(id)
  
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const { data: relTypes } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['relationship-types'],
    queryFn: () => apiGet('/api/relationship-types'),
    staleTime: 60_000,
  })

  const { data: existing, isFetching } = useQuery<Dependent>({
    queryKey: ['dependent', id],
    queryFn: () => apiGet(`/api/dependents/${id}`),
    enabled: isEdit,
  })

  const [form, setForm] = useState<Dependent>(() => ({
    first_name: '',
    paternal_last_name: '',
    maternal_last_name: '',
    gender: 'M',
    birth_date: '',
    relationship_type_id: relTypes?.[0]?.id ?? 1,
    policy_start_date: new Date().toISOString(),
  }))

  useEffect(() => {
    if (existing) {
      setForm({
        id: existing.id,
        employee_id: existing.employee_id,
        first_name: existing.first_name,
        paternal_last_name: existing.paternal_last_name,
        maternal_last_name: existing.maternal_last_name ?? '',
        gender: existing.gender,
        birth_date: existing.birth_date,
        relationship_type_id: existing.relationship_type_id,
        policy_start_date: existing.policy_start_date,
      })
    }
  }, [existing])

  const valid = useMemo(() => {
    return (
      form.first_name.trim() &&
      form.paternal_last_name.trim() &&
      form.gender &&
      form.birth_date &&
      Number.isFinite(Number(form.relationship_type_id)) &&
      privacyAccepted
    )
  }, [form, privacyAccepted])

  const [toasts, setToasts] = useState<Toast[]>([])
  const pushToast = (message: string) => {
    const t: Toast = { id: Date.now(), message }
    setToasts(prev => [...prev, t])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        return apiPut(`/api/dependents/${id}`, form)
      }
      if (!employeeId) throw new Error('Falta employeeId')
      const payload = {
        first_name: form.first_name,
        paternal_last_name: form.paternal_last_name,
        maternal_last_name: form.maternal_last_name,
        gender: form.gender,
        birth_date: form.birth_date,
        relationship_type_id: Number(form.relationship_type_id),
        policy_start_date: form.policy_start_date,
      }
      const res = await fetch(`/api/employees/${employeeId}/dependents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    onSuccess: () => {
      pushToast('Datos guardados correctamente')
      const target = isEdit ? `/collaborator/${existing?.employee_id}` : `/collaborator/${employeeId}`
      setTimeout(() => navigate(target), 600)
    },
    onError: () => pushToast('Error al guardar. Verifica los datos.'),
  })

  return (
    <div className="p-6 space-y-4">
      <div className="card border border-gray-200">
        <div className="card-header">
          <h2 className="card-title">Datos del dependiente</h2>
          <div className="card-subtitle">Completa la información requerida para alta, baja o continuidad.</div>
          <div className="card-instructions">
            <ul>
              <li>I. Registra a tu dependiente para Alta, Baja o Continuidad en el SGMM.</li>
              <li>El titular y el primer dependiente son beneficio de SR; desde el segundo, descuento quincenal de $400 MXN del 15 Ene al 15 Dic 2025.</li>
              <li>Solo familiares directos (hijos, cónyuge o concubino; hetero u homoparentales).</li>
              <li>Para alta: acta de matrimonio (cónyuge/concubino) o acta de nacimiento (hijos).</li>
              <li>Fuera de periodo: solo recién nacidos/casados, divorcios o fallecimientos, reportar dentro de 15 días naturales.</li>
            </ul>
          </div>
          {isFetching && isEdit ? <div className="text-xs text-gray-500 mt-2">Cargando datos…</div> : null}
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Apellido Paterno</label>
            <input value={form.paternal_last_name} onChange={e => setForm({ ...form, paternal_last_name: e.target.value })} className="form-control" />
          </div>
          <div>
            <label className="form-label">Apellido Materno</label>
            <input value={form.maternal_last_name ?? ''} onChange={e => setForm({ ...form, maternal_last_name: e.target.value })} className="form-control" />
          </div>
          <div>
            <label className="form-label">Nombre(s)</label>
            <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="form-control" />
          </div>

          <div>
            <label className="form-label">Sexo</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as 'M' | 'F' })} className="form-control">
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div>
            <label className="form-label">Fecha de nacimiento</label>
            <input
              type="date"
              max={new Date().toISOString().slice(0,10)}
              value={form.birth_date?.slice(0,10)}
              onChange={e => setForm({ ...form, birth_date: `${e.target.value}T00:00:00.000Z` })}
              className="form-control"
            />
          </div>
          <div>
            <label className="form-label">Parentesco</label>
            <select value={Number(form.relationship_type_id)} onChange={e => setForm({ ...form, relationship_type_id: Number(e.target.value) })} className="form-control">
              {(relTypes || []).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Fecha Antigüedad (automática)</label>
            <input type="date" disabled value={(form.policy_start_date ?? '').slice(0,10)} className="form-control" />
          </div>
        </div>

        {/* Aviso de Privacidad */}
        <div className="card-footer border-t border-gray-200 pt-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="privacy-acceptance"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label htmlFor="privacy-acceptance" className="text-sm text-gray-700 cursor-pointer">
                  He leído y acepto el{' '}
                  <a 
                    href="/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Aviso de Privacidad
                  </a>{' '}
                  de Siegfried Rhein, S.A. de C.V. para el tratamiento de los datos personales 
                  del dependiente con la finalidad de gestionar la inscripción, actualización, 
                  altas y bajas en el seguro de gastos médicos mayores.
                </label>
                {!privacyAccepted && (
                  <p className="text-xs text-red-600 mt-1">
                    Debes aceptar el aviso de privacidad para continuar.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <button className="btn-primary" disabled={!valid || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
            </button>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
          </div>
        </div>
      </div>

      {toasts.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  )
}



