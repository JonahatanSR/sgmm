/**
 * Utilidades para el sistema de generación de PDFs
 * Funciones auxiliares para formateo, validación y manipulación de datos
 */

import type { PDFCollaboratorData, DependentData } from '../types/pdf.types';

// ===== UTILIDADES DE FORMATEO =====

/**
 * Formatea una fecha en formato legible
 * @param dateString Fecha en formato ISO string
 * @returns Fecha formateada (ej: "15 de enero de 2025")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-MX', options);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha en formato corto
 * @param dateString Fecha en formato ISO string
 * @returns Fecha formateada (ej: "15/01/2025")
 */
export const formatDateShort = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  } catch (error) {
    console.error('Error formateando fecha corta:', error);
    return dateString;
  }
};

/**
 * Calcula la edad basada en la fecha de nacimiento
 * @param birthDate Fecha de nacimiento en formato ISO string
 * @returns Edad en años
 */
export const calculateAge = (birthDate: string): number => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculando edad:', error);
    return 0;
  }
};

/**
 * Formatea el ID del empleado
 * @param employeeId ID del empleado
 * @returns ID formateado (ej: "3619")
 */
export const formatEmployeeId = (employeeId: string): string => {
  // Remover prefijos si existen
  return employeeId.replace(/^(emp-|employee-)/i, '');
};

/**
 * Formatea el ID del dependiente
 * @param dependentId ID del dependiente
 * @returns ID formateado (ej: "3619-a01")
 */
export const formatDependentId = (dependentId: string): string => {
  // Remover prefijos si existen
  return dependentId.replace(/^(dep-|dependent-)/i, '');
};

/**
 * Formatea el nombre completo de una persona
 * @param firstName Nombre
 * @param paternalLastName Apellido paterno
 * @param maternalLastName Apellido materno
 * @returns Nombre completo formateado
 */
export const formatFullName = (
  firstName: string,
  paternalLastName?: string,
  maternalLastName?: string
): string => {
  const parts = [firstName];
  if (paternalLastName) parts.push(paternalLastName);
  if (maternalLastName) parts.push(maternalLastName);
  return parts.join(' ');
};

/**
 * Formatea el género
 * @param gender Género (M/F)
 * @returns Género formateado
 */
export const formatGender = (gender: 'M' | 'F'): string => {
  return gender === 'M' ? 'Masculino' : 'Femenino';
};

/**
 * Formatea el estado
 * @param status Estado (ACTIVE/INACTIVE)
 * @returns Estado formateado
 */
export const formatStatus = (status: 'ACTIVE' | 'INACTIVE'): string => {
  return status === 'ACTIVE' ? 'Activo' : 'Inactivo';
};

// ===== UTILIDADES DE VALIDACIÓN =====

/**
 * Valida que los datos del colaborador estén completos
 * @param data Datos del colaborador
 * @returns true si los datos son válidos
 */
export const validateCollaboratorData = (data: PDFCollaboratorData): boolean => {
  try {
    // Validar empleado
    if (!data.employee || !data.employee.id || !data.employee.full_name) {
      return false;
    }

    // Validar compañía
    if (!data.company || !data.company.id || !data.company.name) {
      return false;
    }

    // Validar dependientes (pueden estar vacíos)
    if (data.dependents && !Array.isArray(data.dependents)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validando datos del colaborador:', error);
    return false;
  }
};

/**
 * Valida que un dependiente tenga los datos mínimos
 * @param dependent Datos del dependiente
 * @returns true si los datos son válidos
 */
export const validateDependentData = (dependent: DependentData): boolean => {
  try {
    return !!(
      dependent.id &&
      dependent.first_name &&
      dependent.birth_date &&
      dependent.gender &&
      dependent.relationship_type_id
    );
  } catch (error) {
    console.error('Error validando datos del dependiente:', error);
    return false;
  }
};

// ===== UTILIDADES DE MANIPULACIÓN =====

/**
 * Ordena los dependientes por fecha de nacimiento (más jóvenes primero)
 * @param dependents Lista de dependientes
 * @returns Lista ordenada
 */
export const sortDependentsByAge = (dependents: DependentData[]): DependentData[] => {
  return [...dependents].sort((a, b) => {
    const dateA = new Date(a.birth_date);
    const dateB = new Date(b.birth_date);
    return dateB.getTime() - dateA.getTime(); // Más jóvenes primero
  });
};

/**
 * Filtra dependientes activos
 * @param dependents Lista de dependientes
 * @returns Lista de dependientes activos
 */
export const filterActiveDependents = (dependents: DependentData[]): DependentData[] => {
  return dependents.filter(dependent => dependent.status === 'ACTIVE');
};

/**
 * Agrupa dependientes por tipo de relación
 * @param dependents Lista de dependientes
 * @param relationshipTypes Tipos de relación
 * @returns Objeto agrupado por tipo de relación
 */
export const groupDependentsByRelationship = (
  dependents: DependentData[],
  relationshipTypes: any[]
): Record<string, DependentData[]> => {
  const grouped: Record<string, DependentData[]> = {};
  
  dependents.forEach(dependent => {
    const relationshipType = relationshipTypes.find(rt => rt.id === dependent.relationship_type_id);
    const relationshipName = relationshipType?.name || 'Desconocido';
    
    if (!grouped[relationshipName]) {
      grouped[relationshipName] = [];
    }
    grouped[relationshipName].push(dependent);
  });
  
  return grouped;
};

// ===== UTILIDADES DE ARCHIVO =====

/**
 * Genera un nombre de archivo único para el PDF
 * @param employeeId ID del empleado
 * @param employeeName Nombre del empleado
 * @returns Nombre de archivo único
 */
export const generatePDFFilename = (employeeId: string, employeeName: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const cleanName = employeeName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
  
  return `colaborador_${employeeId}_${cleanName}_${timestamp}.pdf`;
};

/**
 * Calcula el tamaño de archivo en formato legible
 * @param bytes Tamaño en bytes
 * @returns Tamaño formateado (ej: "1.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ===== UTILIDADES DE CONFIGURACIÓN =====

/**
 * Obtiene la configuración por defecto para la generación de PDFs
 * @returns Configuración por defecto
 */
export const getDefaultPDFConfig = () => {
  return {
    format: 'letter' as const,
    orientation: 'portrait' as const,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    fontSize: 12,
    fontFamily: 'helvetica',
    compressionEnabled: true,
    imageQuality: 0.92
  };
};

/**
 * Valida las opciones de generación de PDF
 * @param options Opciones a validar
 * @returns Opciones validadas y completadas
 */
export const validatePDFOptions = (options: any) => {
  const defaultConfig = getDefaultPDFConfig();
  
  return {
    ...defaultConfig,
    ...options,
    margins: {
      ...defaultConfig.margins,
      ...options.margins
    }
  };
};
