import { getPrismaClient } from '../../../config/database';

export interface AuditEntry {
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
}

export class AuditService {
  private static instance: AuditService;
  private prisma: any;

  private constructor() {
    this.prisma = getPrismaClient();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Registra una acción en el audit trail
   * @param entry Datos de la acción a registrar
   * @returns Promise<boolean> - true si se registró exitosamente
   */
  public async logAction(entry: AuditEntry): Promise<boolean> {
    try {
      await this.prisma.audit_trails.create({
        data: {
          id: this.generateAuditId(),
          employee_id: entry.employee_id,
          dependent_id: entry.dependent_id,
          action: entry.action,
          table_name: entry.table_name,
          record_id: entry.record_id,
          old_values: entry.old_values,
          new_values: entry.new_values,
          actor_id: entry.actor_id,
          actor_role: entry.actor_role,
          actor_email: entry.actor_email,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent
        }
      });

      console.log(`✅ Audit log created: ${entry.action} by ${entry.actor_id}`);
      return true;
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      return false;
    }
  }

  /**
   * Registra la generación de un PDF
   * @param employeeId ID del empleado
   * @param actorId ID del actor (quien genera)
   * @param actorRole Rol del actor
   * @param actorEmail Email del actor
   * @param ipAddress IP de la acción
   * @param userAgent User agent
   * @param filename Nombre del archivo PDF
   * @param options Opciones de generación
   * @returns Promise<boolean>
   */
  public async logPDFGeneration(
    employeeId: string,
    actorId: string,
    actorRole: string,
    actorEmail: string,
    ipAddress: string,
    userAgent: string,
    filename: string,
    options: any
  ): Promise<boolean> {
    return this.logAction({
      employee_id: employeeId,
      action: 'PDF_GENERATED',
      table_name: 'pdf_generations',
      record_id: filename,
      new_values: {
        filename,
        generation_options: options,
        generated_at: new Date().toISOString()
      },
      actor_id: actorId,
      actor_role: actorRole,
      actor_email: actorEmail,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Registra la descarga de un PDF
   * @param employeeId ID del empleado
   * @param actorId ID del actor
   * @param actorRole Rol del actor
   * @param actorEmail Email del actor
   * @param ipAddress IP de la acción
   * @param userAgent User agent
   * @param filename Nombre del archivo PDF
   * @returns Promise<boolean>
   */
  public async logPDFDownload(
    employeeId: string,
    actorId: string,
    actorRole: string,
    actorEmail: string,
    ipAddress: string,
    userAgent: string,
    filename: string
  ): Promise<boolean> {
    return this.logAction({
      employee_id: employeeId,
      action: 'PDF_DOWNLOADED',
      table_name: 'pdf_generations',
      record_id: filename,
      new_values: {
        filename,
        downloaded_at: new Date().toISOString()
      },
      actor_id: actorId,
      actor_role: actorRole,
      actor_email: actorEmail,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Registra la visualización de un PDF
   * @param employeeId ID del empleado
   * @param actorId ID del actor
   * @param actorRole Rol del actor
   * @param actorEmail Email del actor
   * @param ipAddress IP de la acción
   * @param userAgent User agent
   * @param filename Nombre del archivo PDF
   * @returns Promise<boolean>
   */
  public async logPDFView(
    employeeId: string,
    actorId: string,
    actorRole: string,
    actorEmail: string,
    ipAddress: string,
    userAgent: string,
    filename: string
  ): Promise<boolean> {
    return this.logAction({
      employee_id: employeeId,
      action: 'PDF_VIEWED',
      table_name: 'pdf_generations',
      record_id: filename,
      new_values: {
        filename,
        viewed_at: new Date().toISOString()
      },
      actor_id: actorId,
      actor_role: actorRole,
      actor_email: actorEmail,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Obtiene el historial de auditoría de un empleado
   * @param employeeId ID del empleado
   * @param limit Límite de registros
   * @returns Promise<any[]>
   */
  public async getEmployeeAuditHistory(employeeId: string, limit: number = 50): Promise<any[]> {
    try {
      const auditHistory = await this.prisma.audit_trails.findMany({
        where: { employee_id: employeeId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return auditHistory;
    } catch (error) {
      console.error('❌ Error getting audit history:', error);
      return [];
    }
  }

  /**
   * Obtiene el historial de auditoría de PDFs
   * @param employeeId ID del empleado
   * @param limit Límite de registros
   * @returns Promise<any[]>
   */
  public async getPDFAuditHistory(employeeId: string, limit: number = 20): Promise<any[]> {
    try {
      const pdfHistory = await this.prisma.audit_trails.findMany({
        where: { 
          employee_id: employeeId,
          action: { in: ['PDF_GENERATED', 'PDF_DOWNLOADED', 'PDF_VIEWED'] }
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return pdfHistory;
    } catch (error) {
      console.error('❌ Error getting PDF audit history:', error);
      return [];
    }
  }

  /**
   * Genera un ID único para el audit trail
   * @returns string
   */
  private generateAuditId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `audit-${timestamp}-${random}`;
  }
}

// Exportar instancia singleton
export const auditService = AuditService.getInstance();
