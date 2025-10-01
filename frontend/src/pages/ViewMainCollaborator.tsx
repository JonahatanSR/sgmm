import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { apiGet, apiDelete } from '../services/api';
import { useState } from 'react';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';

type Summary = {
  employee: {
    id: string;
    full_name: string;
    employee_number: string;
    email: string;
    company_id: string;
    birth_date?: string;
    gender?: 'M' | 'F';
    paternal_last_name?: string | null;
    maternal_last_name?: string | null;
    first_name?: string | null;
    hire_date?: string;
  };
  dependents: {
    active: Array<{ id: string; first_name: string; paternal_last_name: string; maternal_last_name?: string | null; gender: 'M' | 'F'; birth_date: string; relationship_type_id: number; policy_start_date: string; dependent_id?: string }>;
    inactive: Array<{ id: string; first_name: string; paternal_last_name: string; maternal_last_name?: string | null; gender: 'M' | 'F'; birth_date: string; relationship_type_id: number; policy_start_date?: string; policy_end_date?: string; dependent_id?: string }>;
  };
};

export default function ViewMainCollaborator() {
  const { id = '' } = useParams();
  const { data, isLoading, error, refetch } = useQuery<Summary>({
    queryKey: ['collaborator', id],
    queryFn: () => apiGet<Summary>(`/api/collaborator/${id}/summary`),
  });
  const { data: relTypes } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['relationship-types'],
    queryFn: () => apiGet('/api/relationship-types'),
    staleTime: 60_000,
  });

  const relMap = new Map<number, string>((relTypes || []).map(r => [r.id, r.name]));

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const s = iso.slice(0, 10); // YYYY-MM-DD, evita desfase por timezone
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  };
  const calcAge = (iso?: string) => {
    if (!iso) return '-';
    const [yStr, mStr, dStr] = iso.slice(0, 10).split('-');
    const y = Number(yStr), m = Number(mStr), d = Number(dStr);
    const today = new Date();
    let age = today.getFullYear() - y;
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    if (mm < m || (mm === m && dd < d)) age--;
    if (age < 0) return '0';
    return String(age);
  };

  // Hooks deben declararse antes de cualquier return condicional
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!id) return <div className="p-6">Falta id de colaborador en la ruta.</div>;
  if (isLoading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6">Error cargando datos.</div>;

  const e = data!.employee;
  const active = data!.dependents.active;
  const inactive = data!.dependents.inactive;

  return (
    <div className="p-6 space-y-6">
      <div className="card border border-gray-200">
        <h3 className="text-xl font-semibold">Seguro de Gastos Médicos Mayores</h3>
        <div className="text-sm text-gray-600 mb-4">Actualización de información</div>
        <div className="text-sm space-y-2">
          <p>I. Registra a tu dependiente en dicho formato para darlo de Alta, Baja o Continuidad en el Seguro de Gastos Médicos Mayores.</p>
          <p>El titular y el primer dependiente son un beneficio que otorga Siegfried Rhein, a partir del segundo dependiente se te descontará vía nómina:
          <br/>$400.00 (Cuatrocientos 00/100 M.N.) pesos quincenales del 15 de Enero hasta el 15 de Diciembre del 2025.</p>
          <p>Únicamente se puede dar de alta familiares directos (hijos, cónyuge o concubino, incluye parejas heterosexuales y homoparentales).</p>
          <p>II. En caso de Alta de nuevo dependiente será necesario entregar copia del Acta de Matrimonio para cónyuge, concubino o Acta de Nacimiento si son hijos.</p>
          <p>Posterior a este periodo sólo se aceptarán altas o bajas en caso de: Recién nacidos o casados, Divorcios o Fallecimientos, notificándolo hasta 15 días naturales después de la fecha del evento.</p>
        </div>
      </div>

      <div className="card border border-gray-200">
        <SectionHeader
          title={e.full_name}
          breadcrumb={null}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <div className="text-sm text-gray-500">Nombre</div>
            <div className="font-medium">{e.full_name}</div>
            <div className="text-sm text-gray-500 mt-2">Email</div>
            <div className="font-medium">{e.email}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-sm text-gray-500">Sexo</div><div className="font-medium">{e.gender ?? '-'}</div></div>
            <div><div className="text-sm text-gray-500">Fecha nacimiento</div><div className="font-medium">{formatDate(e.birth_date)}</div></div>
            <div><div className="text-sm text-gray-500">Edad</div><div className="font-medium">{calcAge(e.birth_date)}</div></div>
            <div><div className="text-sm text-gray-500">Antigüedad póliza</div><div className="font-medium">{formatDate(e.hire_date)}</div></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => (window.location.href = `/collaborator/${id}/edit`)}>Editar</button>
          <button className="btn-secondary" onClick={() => window.location.href = `/dependents/new/${id}`}>Añadir dependiente</button>
          <button className="btn-secondary" onClick={() => window.open(`/api/pdf/renewal-form?employeeId=${id}`, '_blank')}>Generar PDF</button>
          <button className="btn-secondary" onClick={() => refetch()}>Actualizar</button>
        </div>
      </div>

      <div className="card border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Dependientes activos</h3>
        <table className="table-pro">
          <thead>
            <tr><th>Apellido Paterno</th><th>Apellido Materno</th><th>Nombre</th><th>Sexo</th><th>Fecha nacimiento</th><th className="text-right">Edad</th><th>Antigüedad Póliza</th><th>Parentesco</th><th>Acta</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{e.paternal_last_name ?? '-'}</td>
              <td>{e.maternal_last_name ?? '-'}</td>
              <td>{e.first_name ?? '-'}</td>
              <td>{e.gender ?? '-'}</td>
              <td>{formatDate(e.birth_date)}</td>
              <td className="text-right">{calcAge(e.birth_date)}</td>
              <td>{formatDate(e.hire_date)}</td>
              <td>-</td>
              <td>-</td>
            </tr>
            {active.map(d => (
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
                  <button className="icon-btn" title="Baja" onClick={() => setToDelete({ id: d.id, name: `${d.paternal_last_name} ${d.first_name}` })}>🗑️</button>
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
            {inactive.map(d => (
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

      <Modal
        open={!!toDelete}
        title="Baja de dependiente"
        onClose={() => setToDelete(null)}
        actions={
          <>
            <button
              className="btn-primary"
              onClick={async () => {
                if (!toDelete) return;
                await apiDelete(`/api/dependents/${toDelete.id}`);
                setToDelete(null);
                await refetch();
              }}
            >
              Aceptar
            </button>
          </>
        }
      >
        ¿Deseas dar de baja a {toDelete?.name}? Esta acción añadirá la fecha de terminación al dependiente y no se podrá deshacer.
      </Modal>
    </div>
  );
}


