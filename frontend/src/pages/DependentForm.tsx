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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const { data: relTypes } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['relationship-types'],
    queryFn: () => apiGet('/api/relationship-types'),
    staleTime: 0,
    gcTime: 0,
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
    relationship_type_id: 1, // Default to first relationship type
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

  // Update form when relationship types are loaded
  useEffect(() => {
    if (relTypes && relTypes.length > 0 && !isEdit) {
      setForm(prev => ({
        ...prev,
        relationship_type_id: relTypes[0].id
      }))
    }
  }, [relTypes, isEdit])

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
      const dependentData = await res.json()
      
      // Registrar la aceptación de privacidad DESPUÉS de crear el dependiente
      if (privacyAccepted && dependentData.id) {
        try {
          await fetch('/api/privacy/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: employeeId,
              dependent_id: dependentData.id,
              acceptance_type: 'DEPENDENT',
              privacy_version: 'v1.0'
            })
          })
          console.log('✅ Aceptación de privacidad registrada para dependiente:', dependentData.id)
        } catch (error) {
          console.warn('No se pudo registrar la aceptación de privacidad:', error)
          // No fallar por esto, solo registrar en consola
        }
      }
      
      return dependentData
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
            <select 
              value={Number(form.relationship_type_id)} 
              onChange={e => setForm({ ...form, relationship_type_id: Number(e.target.value) })} 
              className="form-control"
              disabled={!relTypes || relTypes.length === 0}
            >
              {!relTypes || relTypes.length === 0 ? (
                <option value="">Cargando tipos de parentesco...</option>
              ) : (
                relTypes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))
              )}
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
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                  >
                    Aviso de Privacidad
                  </button>{' '}
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

        {/* Modal de Aviso de Privacidad - Solo informativo */}
        {showPrivacyModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Aviso de Privacidad - Siegfried Rhein
                  </h2>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4 text-gray-700">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      AVISO DE PRIVACIDAD CORTO
                    </h3>
                    
                    <div className="text-sm leading-relaxed space-y-3">
                      <p>
                        <strong>Siegfried Rhein, S.A. de C.V.</strong>, conocido comercialmente como 
                        Siegfried Rhein, con domicilio en calle Antonio Dovalí Jaime 70, Torre D, 
                        Piso 12, Colonia Santa Fe, Alcaldía Álvaro Obregón, C.P. 01210, Ciudad de 
                        México, México, y con portal de Internet{' '}
                        <a 
                          href="http://www.siegfried.com.mx" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          http://www.siegfried.com.mx
                        </a>, utilizará sus datos personales aquí recabados únicamente con la 
                        finalidad de gestionar la inscripción, actualización, altas y bajas en el 
                        seguro de gastos médicos mayores contratado por Siegfried Rhein, S.A. de C.V., 
                        así como para dar seguimiento a trámites administrativos relacionados.
                      </p>
                      
                      <p>
                        Sus datos serán tratados de forma confidencial y únicamente serán compartidos 
                        con la aseguradora y terceros estrictamente necesarios para cumplir con los 
                        fines señalados.
                      </p>
                      
                      <p>
                        Usted podrá manifestar su negativa para el tratamiento de datos personales y 
                        podrá ejercer en cualquier momento sus derechos ARCO (acceso, rectificación, 
                        cancelación y oposición), contactando al Departamento de Datos Personales a 
                        través del correo electrónico{' '}
                        <a 
                          href="mailto:privacidad@siegfried.com.mx"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          privacidad@siegfried.com.mx
                        </a>.
                      </p>
                      
                      <p>
                        Para mayor información acerca del tratamiento de sus datos personales, de los 
                        derechos que puede hacer valer y/o las modificaciones o actualizaciones que 
                        pueda sufrir el presente aviso de privacidad, usted puede consultar el aviso 
                        de privacidad integral, puesto a su disposición en la página de internet{' '}
                        <a 
                          href="http://www.siegfried.com.mx" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          http://www.siegfried.com.mx
                        </a>.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}



