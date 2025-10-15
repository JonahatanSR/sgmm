import { getPrismaClient } from '../../config/database';

export interface PrivacyAcceptanceData {
  employee_id: string;
  dependent_id?: string;
  acceptance_type: 'EMPLOYEE' | 'DEPENDENT';
  privacy_version: string;
  ip_address: string;
  user_agent: string;
}

export interface PrivacyAcceptanceResponse {
  id: string;
  employee_id: string;
  dependent_id?: string;
  acceptance_type: string;
  privacy_version: string;
  accepted_at: Date;
  ip_address: string;
  user_agent: string;
}

export class PrivacyService {
  private prisma = getPrismaClient();

  /**
   * Registra la aceptación del aviso de privacidad
   */
  async recordAcceptance(data: PrivacyAcceptanceData): Promise<PrivacyAcceptanceResponse> {
    try {
      const acceptance = await this.prisma.privacyAcceptance.create({
        data: {
          employee_id: data.employee_id,
          dependent_id: data.dependent_id,
          acceptance_type: data.acceptance_type,
          privacy_version: data.privacy_version,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
        },
      });

      return {
        id: acceptance.id,
        employee_id: acceptance.employee_id,
        dependent_id: acceptance.dependent_id || undefined,
        acceptance_type: acceptance.acceptance_type,
        privacy_version: acceptance.privacy_version,
        accepted_at: acceptance.accepted_at,
        ip_address: acceptance.ip_address,
        user_agent: acceptance.user_agent,
      };
    } catch (error) {
      console.error('Error recording privacy acceptance:', error);
      throw new Error('No se pudo registrar la aceptación del aviso de privacidad');
    }
  }

  /**
   * Verifica si un empleado ya aceptó el aviso de privacidad
   */
  async hasEmployeeAccepted(employee_id: string, version: string = 'v1.0'): Promise<boolean> {
    try {
      const acceptance = await this.prisma.privacyAcceptance.findFirst({
        where: {
          employee_id,
          acceptance_type: 'EMPLOYEE',
          privacy_version: version,
        },
      });

      return !!acceptance;
    } catch (error) {
      console.error('Error checking employee privacy acceptance:', error);
      return false;
    }
  }

  /**
   * Verifica si un dependiente ya tiene aceptación del aviso de privacidad
   */
  async hasDependentAccepted(dependent_id: string, version: string = 'v1.0'): Promise<boolean> {
    try {
      const acceptance = await this.prisma.privacyAcceptance.findFirst({
        where: {
          dependent_id,
          acceptance_type: 'DEPENDENT',
          privacy_version: version,
        },
      });

      return !!acceptance;
    } catch (error) {
      console.error('Error checking dependent privacy acceptance:', error);
      return false;
    }
  }

  /**
   * Obtiene el historial de aceptaciones de un empleado
   */
  async getEmployeeAcceptanceHistory(employee_id: string): Promise<PrivacyAcceptanceResponse[]> {
    try {
      const acceptances = await this.prisma.privacyAcceptance.findMany({
        where: {
          employee_id,
        },
        orderBy: {
          accepted_at: 'desc',
        },
      });

      return acceptances.map(acceptance => ({
        id: acceptance.id,
        employee_id: acceptance.employee_id,
        dependent_id: acceptance.dependent_id || undefined,
        acceptance_type: acceptance.acceptance_type,
        privacy_version: acceptance.privacy_version,
        accepted_at: acceptance.accepted_at,
        ip_address: acceptance.ip_address,
        user_agent: acceptance.user_agent,
      }));
    } catch (error) {
      console.error('Error getting employee acceptance history:', error);
      throw new Error('No se pudo obtener el historial de aceptaciones');
    }
  }

  /**
   * Obtiene estadísticas de aceptaciones
   */
  async getAcceptanceStats(): Promise<{
    total_acceptances: number;
    employee_acceptances: number;
    dependent_acceptances: number;
    latest_acceptance: Date | null;
  }> {
    try {
      const [total, employee, dependent, latest] = await Promise.all([
        this.prisma.privacyAcceptance.count(),
        this.prisma.privacyAcceptance.count({
          where: { acceptance_type: 'EMPLOYEE' }
        }),
        this.prisma.privacyAcceptance.count({
          where: { acceptance_type: 'DEPENDENT' }
        }),
        this.prisma.privacyAcceptance.findFirst({
          orderBy: { accepted_at: 'desc' },
          select: { accepted_at: true }
        })
      ]);

      return {
        total_acceptances: total,
        employee_acceptances: employee,
        dependent_acceptances: dependent,
        latest_acceptance: latest?.accepted_at || null,
      };
    } catch (error) {
      console.error('Error getting acceptance stats:', error);
      throw new Error('No se pudieron obtener las estadísticas de aceptaciones');
    }
  }

  /**
   * Genera un ID único para el dependiente
   */
  generateDependentId(employee_number: string, dependent_seq: number): string {
    return `${employee_number}-DEP-${dependent_seq.toString().padStart(3, '0')}`;
  }

  /**
   * Obtiene el siguiente número de secuencia para un dependiente
   */
  async getNextDependentSeq(employee_id: string): Promise<number> {
    try {
      const lastDependent = await this.prisma.dependent.findFirst({
        where: {
          employee_id,
          deleted_at: null, // Solo dependientes activos
        },
        orderBy: {
          dependent_seq: 'desc',
        },
      });

      return lastDependent ? lastDependent.dependent_seq + 1 : 1;
    } catch (error) {
      console.error('Error getting next dependent sequence:', error);
      throw new Error('No se pudo obtener el siguiente número de secuencia');
    }
  }
}
