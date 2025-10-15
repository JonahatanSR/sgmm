export interface Employee {
  id: string;
  employee_number: string;
  email: string;
  full_name: string;
  first_name?: string | null;
  paternal_last_name?: string | null;
  maternal_last_name?: string | null;
  birth_date?: Date | null;
  gender?: 'M' | 'F' | null;
  hire_date: Date;
  company_id: string;
  policy_number?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface EmployeeRepository {
  findById(id: string): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  findByEmployeeNumber(employeeNumber: string): Promise<Employee | null>;
  update(id: string, data: Partial<Employee>): Promise<Employee>;
  search?(query: string, companyId: string): Promise<Employee[]>;
}

export type AuditAction = 'UPDATE_EMPLOYEE';

export interface AuditLogger {
  log(params: {
    userId: string;
    action: AuditAction;
    entity: 'employee';
    entityId: string;
    oldValues: unknown;
    newValues: unknown;
    context?: { userRole?: 'EMPLOYEE' | 'HR_ADMIN' | 'SUPER_ADMIN'; actorEmail?: string; companyId?: string };
  }): Promise<void>;
}


