export type Gender = 'M' | 'F';

export interface Dependent {
  id: string;
  employee_id: string;
  first_name: string;
  paternal_last_name: string;
  maternal_last_name?: string | null;
  birth_date: Date;
  gender: Gender;
  relationship_type_id: number;
  policy_start_date: Date;
  policy_end_date?: Date | null;
  deleted_at?: Date | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: Date;
  updated_at: Date;
}

export interface DependentRepository {
  findById(id: string): Promise<Dependent | null>;
  listActiveByEmployee(employeeId: string): Promise<Dependent[]>;
  listInactiveByEmployee(employeeId: string): Promise<Dependent[]>;
  create(data: Omit<Dependent, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: Dependent['status'] }): Promise<Dependent>;
  update(id: string, data: Partial<Dependent>): Promise<Dependent>;
  getMaxSeq(employeeId: string): Promise<number>;
}

export interface RelationshipTypeRepository {
  exists(id: number): Promise<boolean>;
}

export interface AuditLogger {
  log(params: {
    userId: string;
    action: 'CREATE_DEPENDENT' | 'UPDATE_DEPENDENT' | 'DELETE_DEPENDENT';
    entity: 'dependent';
    entityId: string;
    oldValues: unknown;
    newValues: unknown;
    context?: { userRole?: 'EMPLOYEE' | 'HR_ADMIN' | 'SUPER_ADMIN'; actorEmail?: string; companyId?: string };
  }): Promise<void>;
}

export interface SystemRules {
  getMaxDependentsPerEmployee(): Promise<number>;
}


