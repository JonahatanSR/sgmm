import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiGet, apiPut } from '../services/api'

type Employee = {
  id: string
  first_name?: string | null
  paternal_last_name?: string | null
  maternal_last_name?: string | null
  gender?: 'M' | 'F' | null
  birth_date?: string | null
}

export default function EditCollaborator() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  
  // Obtener datos del colaborador usando el endpoint de summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['collaborator', id],
    queryFn: () => apiGet(`/api/collaborator/${id}/summary`),
  })

  const [form, setForm] = useState<Employee>({ id })
  
  useEffect(() => {
    if (summaryData?.employee) {
      const emp = summaryData.employee;
      setForm({
        id: emp.id,
        first_name: emp.first_name,
        paternal_last_name: emp.paternal_last_name,
        maternal_last_name: emp.maternal_last_name,
        gender: emp.gender,
        birth_date: emp.birth_date,
      })
    }
  }, [summaryData])

  const valid = useMemo(() => !!form.first_name && !!form.paternal_last_name, [form])
  const save = useMutation({
    mutationFn: async () => apiPut(`/api/employees/${form.id}`, form),
    onSuccess: () => { 
      alert('Datos actualizados correctamente'); 
      navigate(`/collaborator/${id}`) 
    },
    onError: () => alert('Error al actualizar. Revisa los datos.'),
  })

  if (summaryLoading) return <div className="p-6">Cargando datos del colaborador…</div>

  const inputCls = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
  const labelCls = 'text-xs font-medium text-gray-600 mb-1 block'

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Editar colaborador</h2>
      <div className="card border border-gray-200">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}>
          <div>
            <label className={labelCls}>Apellido Paterno</label>
            <input className={inputCls} value={form.paternal_last_name ?? ''} onChange={e => setForm({ ...form, paternal_last_name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Apellido Materno</label>
            <input className={inputCls} value={form.maternal_last_name ?? ''} onChange={e => setForm({ ...form, maternal_last_name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Nombre(s)</label>
            <input className={inputCls} value={form.first_name ?? ''} onChange={e => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Sexo</label>
            <select className={inputCls} value={form.gender ?? ''} onChange={e => setForm({ ...form, gender: e.target.value as any })}>
              <option value="">-</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Fecha de nacimiento</label>
            <input
              className={inputCls}
              type="date"
              value={(form.birth_date ?? '').slice(0,10)}
              onChange={e => setForm({ ...form, birth_date: `${e.target.value}T00:00:00.000Z` })}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn-primary" disabled={!valid || save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Guardando…' : 'Actualizar'}</button>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
      </div>
    </div>
  )
}



