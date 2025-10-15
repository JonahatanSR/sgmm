import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../services/api';
import type { PDFCollaboratorData } from '../types/pdf.types';

/**
 * Hook personalizado para obtener datos del colaborador para generación de PDF
 * @param employeeId ID del empleado
 * @returns Datos del colaborador y dependientes para PDF
 */
export const usePDFData = (employeeId: string) => {
  return useQuery<PDFCollaboratorData>({
    queryKey: ['pdf-data', employeeId],
    queryFn: () => apiGet<PDFCollaboratorData>(`/api/pdf/collaborator-data/${employeeId}`),
    enabled: !!employeeId,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false
  });
};

export default usePDFData;
