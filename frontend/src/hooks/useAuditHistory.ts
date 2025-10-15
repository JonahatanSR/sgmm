import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../services/api';

interface AuditEntry {
  id: string;
  employee_id: string;
  dependent_id?: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: any;
  new_values?: any;
  actor_id: string;
  actor_role: string;
  actor_email?: string;
  ip_address: string;
  user_agent?: string;
  timestamp: string;
}

interface AuditHistoryResponse {
  success: boolean;
  data: AuditEntry[];
  count: number;
}

/**
 * Hook para obtener historial de auditoría de un empleado
 * @param employeeId ID del empleado
 * @param limit Límite de registros
 * @returns Historial de auditoría
 */
export const useAuditHistory = (employeeId: string, limit: number = 50) => {
  return useQuery<AuditHistoryResponse>({
    queryKey: ['audit-history', employeeId, limit],
    queryFn: () => apiGet<AuditHistoryResponse>(`/api/audit/employee/${employeeId}?limit=${limit}`),
    enabled: !!employeeId,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false
  });
};

/**
 * Hook para obtener historial de PDFs de un empleado
 * @param employeeId ID del empleado
 * @param limit Límite de registros
 * @returns Historial de PDFs
 */
export const usePDFAuditHistory = (employeeId: string, limit: number = 20) => {
  return useQuery<AuditHistoryResponse>({
    queryKey: ['pdf-audit-history', employeeId, limit],
    queryFn: () => apiGet<AuditHistoryResponse>(`/api/audit/employee/${employeeId}/pdfs?limit=${limit}`),
    enabled: !!employeeId,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false
  });
};

export default useAuditHistory;
