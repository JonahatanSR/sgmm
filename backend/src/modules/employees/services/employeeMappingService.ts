import { getPrismaClient } from '../../../config/database';

/**
 * Interfaz para el mapeo de empleados
 */
export interface EmployeeMapping {
  id: number;
  email: string;
  employee_number: string;
  full_name?: string;
  department?: string;
  position?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Servicio para manejar el mapeo de empleados
 * 
 * Este servicio se encarga de:
 * - Mapear emails a números de empleado
 * - Gestionar la tabla de mapeo de empleados
 * - Proporcionar datos de empleados para SAML
 */
export class EmployeeMappingService {
  private prisma: any;

  constructor() {
    this.prisma = getPrismaClient();
  }

  /**
   * Busca un empleado por email en la tabla de mapeo
   */
  async findByEmail(email: string): Promise<EmployeeMapping | null> {
    try {
      const mapping = await this.prisma.$queryRaw`
        SELECT * FROM employee_mappings 
        WHERE email = ${email} AND is_active = true
        LIMIT 1
      `;
      
      return mapping[0] || null;
    } catch (error: any) {
      console.error('❌ Error buscando mapeo de empleado:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo mapeo de empleado
   */
  async createMapping(data: {
    email: string;
    employee_number: string;
    full_name?: string;
    department?: string;
    position?: string;
  }): Promise<EmployeeMapping | null> {
    try {
      const result = await this.prisma.$queryRaw`
        INSERT INTO employee_mappings (email, employee_number, full_name, department, position)
        VALUES (${data.email}, ${data.employee_number}, ${data.full_name || ''}, ${data.department || ''}, ${data.position || ''})
        RETURNING *
      `;
      
      return result[0] || null;
    } catch (error: any) {
      console.error('❌ Error creando mapeo de empleado:', error);
      return null;
    }
  }

  /**
   * Actualiza un mapeo existente
   */
  async updateMapping(email: string, data: {
    employee_number?: string;
    full_name?: string;
    department?: string;
    position?: string;
    is_active?: boolean;
  }): Promise<EmployeeMapping | null> {
    try {
      const result = await this.prisma.$queryRaw`
        UPDATE employee_mappings 
        SET 
          employee_number = COALESCE(${data.employee_number}, employee_number),
          full_name = COALESCE(${data.full_name}, full_name),
          department = COALESCE(${data.department}, department),
          position = COALESCE(${data.position}, position),
          is_active = COALESCE(${data.is_active}, is_active),
          updated_at = NOW()
        WHERE email = ${email}
        RETURNING *
      `;
      
      return result[0] || null;
    } catch (error: any) {
      console.error('❌ Error actualizando mapeo de empleado:', error);
      return null;
    }
  }

  /**
   * Carga múltiples mapeos desde una lista
   */
  async bulkCreateMappings(mappings: Array<{
    email: string;
    employee_number: string;
    full_name?: string;
    department?: string;
    position?: string;
  }>): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];

    for (const mapping of mappings) {
      try {
        await this.createMapping(mapping);
        success++;
      } catch (error: any) {
        errors.push(`Error con ${mapping.email}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  /**
   * Obtiene todos los mapeos activos
   */
  async getAllMappings(): Promise<EmployeeMapping[]> {
    try {
      const mappings = await this.prisma.$queryRaw`
        SELECT * FROM employee_mappings 
        WHERE is_active = true 
        ORDER BY employee_number
      `;
      
      return mappings;
    } catch (error: any) {
      console.error('❌ Error obteniendo mapeos:', error);
      return [];
    }
  }

  /**
   * Desactiva un mapeo
   */
  async deactivateMapping(email: string): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`
        UPDATE employee_mappings 
        SET is_active = false, updated_at = NOW()
        WHERE email = ${email}
      `;
      
      return true;
    } catch (error: any) {
      console.error('❌ Error desactivando mapeo:', error);
      return false;
    }
  }
}

export const employeeMappingService = new EmployeeMappingService();
