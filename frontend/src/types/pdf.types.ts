/**
 * Tipos TypeScript para el sistema de generación de PDFs
 * Basado en el esquema de base de datos y requerimientos del sistema
 */

// ===== TIPOS BASE =====

export interface EmployeeData {
  id: string; // employee_number
  google_id?: string;
  email: string;
  full_name: string;
  first_name?: string;
  paternal_last_name?: string;
  maternal_last_name?: string;
  birth_date?: string;
  gender?: 'M' | 'F';
  hire_date: string;
  company_id: string;
  department?: string;
  position?: string;
  policy_number?: string;
  status: 'ACTIVE' | 'INACTIVE';
  last_login?: string;
  login_count: number;
  last_ip_address?: string;
  last_user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface DependentData {
  id: string; // CUID
  dependent_id: string; // ID compuesto (ej: "3619-a01")
  employee_id: string; // employee_number
  first_name: string;
  paternal_last_name?: string;
  maternal_last_name?: string;
  birth_date: string;
  gender: 'M' | 'F';
  relationship_type_id: string;
  policy_start_date?: string;
  policy_end_date?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface RelationshipType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyData {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== TIPOS PARA PDF =====

export interface PDFCollaboratorData {
  employee: EmployeeData;
  dependents: DependentData[];
  relationshipTypes: RelationshipType[];
  company: CompanyData;
  generatedAt: string;
  generatedBy: string;
}

export interface PDFGenerationOptions {
  includeSignature: boolean;
  includeCompanyLogo: boolean;
  includeAuditInfo: boolean;
  filename?: string;
  format?: 'letter' | 'a4';
  orientation?: 'portrait' | 'landscape';
}

export interface PDFGenerationResult {
  success: boolean;
  filename?: string;
  error?: string;
  generatedAt: string;
  fileSize?: number;
}

// ===== TIPOS PARA PLANTILLAS =====

export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  htmlTemplate: string;
  cssStyles: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PDFTemplateData {
  template: PDFTemplate;
  data: PDFCollaboratorData;
  options: PDFGenerationOptions;
}

// ===== TIPOS PARA AUDIT TRAIL =====

export interface PDFAuditEntry {
  id: string;
  employee_id: string;
  action: 'PDF_GENERATED' | 'PDF_DOWNLOADED' | 'PDF_VIEWED';
  details: {
    filename: string;
    template_used: string;
    generation_method: 'HTML_TO_PDF' | 'DIRECT_PDF';
    file_size?: number;
    generation_time_ms?: number;
  };
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ===== TIPOS PARA CONFIGURACIÓN =====

export interface PDFConfig {
  defaultFormat: 'letter' | 'a4';
  defaultOrientation: 'portrait' | 'landscape';
  defaultFilename: string;
  compressionEnabled: boolean;
  imageQuality: number;
  fontFamily: string;
  fontSize: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// ===== TIPOS PARA ERRORES =====

export interface PDFError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type PDFErrorCode = 
  | 'ELEMENT_NOT_FOUND'
  | 'CANVAS_GENERATION_FAILED'
  | 'PDF_CREATION_FAILED'
  | 'DATA_VALIDATION_FAILED'
  | 'TEMPLATE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN_ERROR';

// ===== TIPOS PARA UTILIDADES =====

export interface PDFUtils {
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  calculateAge: (birthDate: string) => number;
  formatEmployeeId: (id: string) => string;
  formatDependentId: (id: string) => string;
}

// ===== TIPOS PARA COMPONENTES REACT =====

export interface PDFGeneratorProps {
  employeeId: string;
  onGenerate?: (result: PDFGenerationResult) => void;
  onError?: (error: PDFError) => void;
  options?: Partial<PDFGenerationOptions>;
  className?: string;
  children?: React.ReactNode;
}

export interface PDFPreviewProps {
  data: PDFCollaboratorData;
  template?: PDFTemplate;
  options?: Partial<PDFGenerationOptions>;
  onClose?: () => void;
  onGenerate?: () => void;
}

// ===== TIPOS PARA HOOKS =====

export interface UsePDFGenerationReturn {
  generatePDF: (data: PDFCollaboratorData, options?: Partial<PDFGenerationOptions>) => Promise<PDFGenerationResult>;
  isGenerating: boolean;
  lastResult?: PDFGenerationResult;
  error?: PDFError;
  clearError: () => void;
}

export interface UsePDFDataReturn {
  data: PDFCollaboratorData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
