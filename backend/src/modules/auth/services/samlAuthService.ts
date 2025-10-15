import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/environment';
import { getPrismaClient } from '../../../config/database';
import { PrismaEmployeeRepository } from '../../employees/adapters/prismaEmployeeRepository';
import { samlProcessor, type SamlUserData } from './samlProcessor';

/**
 * Interfaz para el resultado de la autenticación SAML
 */
export interface SamlAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    full_name: string;
    company_id: string;
    employee_number: string;
    role: string;
  };
  token?: string;
  error?: string;
}

/**
 * Servicio de autenticación SAML
 * 
 * Este servicio se encarga de:
 * - Procesar respuestas SAML de Google Workspace
 * - Crear o actualizar usuarios en la base de datos
 * - Generar tokens JWT para la sesión
 * - Manejar la lógica de negocio de autenticación
 * 
 * Sigue los principios SOLID:
 * - Single Responsibility: Solo maneja autenticación SAML
 * - Open/Closed: Extensible para otros tipos de autenticación
 * - Liskov Substitution: Implementa interfaz clara
 * - Interface Segregation: Interfaces específicas
 * - Dependency Inversion: Depende de abstracciones
 */
export class SamlAuthService {
  private readonly employeeRepository: PrismaEmployeeRepository;

  constructor() {
    const prisma = getPrismaClient();
    this.employeeRepository = new PrismaEmployeeRepository(prisma);
  }

  /**
   * Autentica un usuario usando una respuesta SAML de Google
   * 
   * @param samlResponse - La respuesta SAML codificada en base64
   * @param relayState - El estado de retorno (opcional)
   * @returns Resultado de la autenticación con datos del usuario y token
   */
  async authenticateUser(samlResponse: string, relayState?: string): Promise<SamlAuthResult> {
    try {
      console.log('🔐 [SAML AUTH] Iniciando autenticación SAML');
      
      // 1. Procesar la respuesta SAML
      const userData = await samlProcessor.processSamlResponse(samlResponse);
      console.log('✅ [SAML AUTH] Usuario procesado:', {
        email: userData.email,
        fullName: userData.fullName,
        domain: userData.domain
      });

      // 2. Validar dominio de empresa
      if (!this.isValidCompanyDomain(userData.domain)) {
        console.warn('⚠️ [SAML AUTH] Dominio no autorizado:', userData.domain);
        return {
          success: false,
          error: 'Dominio de empresa no autorizado'
        };
      }

      // 3. Buscar o crear usuario
      const employee = await this.findOrCreateEmployee(userData);
      console.log('✅ [SAML AUTH] Usuario encontrado/creado:', {
        id: employee.id,
        email: employee.email,
        companyId: employee.company_id
      });

      // 4. Generar token JWT
      const token = this.generateJwtToken(employee);
      console.log('✅ [SAML AUTH] Token JWT generado');

      // 5. Retornar resultado exitoso
      return {
        success: true,
        user: {
          id: employee.employee_number, // Usar employee_number como ID estándar
          email: employee.email,
          full_name: employee.full_name,
          company_id: employee.company_id,
          employee_number: employee.employee_number,
          role: 'employee' // Valor por defecto
        } as any, // Temporal hasta actualizar tipos
        token
      };

    } catch (error: any) {
      console.error('❌ [SAML AUTH] Error en autenticación:', error);
      return {
        success: false,
        error: error.message || 'Error interno de autenticación'
      };
    }
  }

  /**
   * Valida si el dominio de la empresa está autorizado
   */
  private isValidCompanyDomain(domain: string): boolean {
    console.log('🔍 [SAML AUTH] Validando dominio:', domain);
    
    // Por ahora, permitir cualquier dominio para desarrollo
    // En el futuro, se puede implementar una lista de dominios autorizados
    const isValid = Boolean(domain && domain.length > 0);
    console.log('🔍 [SAML AUTH] Dominio válido:', isValid);
    return isValid;
  }

  /**
   * Busca un empleado existente o crea uno nuevo
   */
  private async findOrCreateEmployee(userData: SamlUserData) {
    try {
      // 1. Buscar empleado existente por email
      let employee = await this.employeeRepository.findByEmail(userData.email);
      
      if (employee) {
        console.log('👤 [SAML AUTH] Empleado existente encontrado:', employee.email);
        
        // Actualizar datos si es necesario
        if (this.shouldUpdateEmployee(employee, userData)) {
          employee = await this.updateEmployeeData(employee.id, userData);
          console.log('🔄 [SAML AUTH] Datos del empleado actualizados');
        }
        
        return employee;
      }

      // 2. Crear nuevo empleado
      console.log('👤 [SAML AUTH] Creando nuevo empleado:', userData.email);
      employee = await this.createNewEmployee(userData);
      console.log('✅ [SAML AUTH] Nuevo empleado creado:', employee.id);
      
      if (!employee) {
        throw new Error('No se pudo crear el empleado');
      }
      
      return employee;
    } catch (error: any) {
      console.error('❌ [SAML AUTH] Error buscando/creando empleado:', error);
      throw new Error(`Error gestionando empleado: ${error.message}`);
    }
  }

  /**
   * Determina si se deben actualizar los datos del empleado
   */
  private shouldUpdateEmployee(employee: any, userData: SamlUserData): boolean {
    return (
      employee.full_name !== userData.fullName ||
      employee.email !== userData.email
    );
  }

  /**
   * Actualiza los datos de un empleado existente
   */
  private async updateEmployeeData(employeeId: string, userData: SamlUserData) {
    return await this.employeeRepository.update(employeeId, {
      full_name: userData.fullName,
      email: userData.email,
      updated_at: new Date()
    });
  }

  /**
   * Crea un nuevo empleado
   */
  private async createNewEmployee(userData: SamlUserData) {
    // Generar número de empleado único
    const employeeNumber = this.generateEmployeeNumber(userData.domain);
    
    // Crear empleado con datos básicos
    return await this.employeeRepository.create({
      email: userData.email,
      full_name: userData.fullName,
      employee_number: employeeNumber,
      company_id: await this.getOrCreateCompany(userData.domain)
    });
  }

  /**
   * Genera un número de empleado único
   */
  private generateEmployeeNumber(domain: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const domainPrefix = domain.split('.')[0].toUpperCase().slice(0, 3);
    return `${domainPrefix}-${timestamp}`;
  }

  /**
   * Obtiene o crea una empresa basada en el dominio
   */
  private async getOrCreateCompany(domain: string): Promise<string> {
    // Mapear dominios a companies existentes
    if (domain === 'siegfried.com.mx') {
      return 'company-sr-001';
    }
    if (domain === 'weserpharma.com.mx') {
      return 'company-wp-001';
    }
    
    // Por defecto, usar Siegfried Rhein
    return 'company-sr-001';
  }

  /**
   * Genera un token JWT para la sesión del usuario
   */
  private generateJwtToken(employee: any): string {
    const payload = {
      userId: employee.id,
      email: employee.email,
      companyId: employee.company_id,
      employeeNumber: employee.employee_number,
      fullName: employee.full_name,
      role: employee.role || 'employee',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      algorithm: 'HS256'
    } as SignOptions);
  }
}

/**
 * Instancia singleton del servicio de autenticación SAML
 */
export const samlAuthService = new SamlAuthService();
