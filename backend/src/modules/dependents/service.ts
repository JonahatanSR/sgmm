import { AuditLogger, Dependent, DependentRepository, RelationshipTypeRepository, SystemRules } from './domain';

export class DependentsService {
  constructor(
    private readonly repo: DependentRepository,
    private readonly relTypes: RelationshipTypeRepository,
    private readonly rules: SystemRules,
    private readonly audit: AuditLogger,
  ) {}

  async listActive(employeeId: string): Promise<Dependent[]> {
    return this.repo.listActiveByEmployee(employeeId);
  }

  async listInactive(employeeId: string): Promise<Dependent[]> {
    return this.repo.listInactiveByEmployee(employeeId);
  }

  async create(input: Omit<Dependent, 'id' | 'created_at' | 'updated_at' | 'status' | 'policy_end_date' | 'dependent_id' | 'dependent_seq' | 'deleted_at'>, userId: string): Promise<Dependent> {
    // Validación: birth_date no puede ser futura
    const now = new Date();
    if (input.birth_date && new Date(input.birth_date) > now) {
      throw new Error('birth_date cannot be in the future');
    }
    const current = await this.repo.listActiveByEmployee(input.employee_id);
    const max = await this.rules.getMaxDependentsPerEmployee();
    if (current.length >= max) throw new Error('Max dependents reached');

    const exists = await this.relTypes.exists(input.relationship_type_id);
    if (!exists) throw new Error('Invalid relationship type');

    const maxSeq = await this.repo.getMaxSeq(input.employee_id);
    const nextSeq = maxSeq + 1;
    // Build dependent_id: employee_number-aNN; we need employee_number → fetch via relation is heavier; build lazily at repo level or pass as param
    // Here we require employee_number in input for correctness or fetch it via repo; keep simple: repo will construct using join
    const created = await this.repo.create({ ...input, dependent_seq: nextSeq } as any);
    await this.audit.log({ userId, action: 'CREATE_DEPENDENT', entity: 'dependent', entityId: created.id, oldValues: null, newValues: created });
    return created;
  }

  async update(id: string, data: Partial<Dependent>, userId: string): Promise<Dependent> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error('Dependent not found');
    // Validación: birth_date no puede ser futura
    if (data.birth_date && new Date(data.birth_date) > new Date()) {
      throw new Error('birth_date cannot be in the future');
    }
    const updated = await this.repo.update(id, data);
    await this.audit.log({ userId, action: 'UPDATE_DEPENDENT', entity: 'dependent', entityId: id, oldValues: before, newValues: updated });
    return updated;
  }

  async softDelete(id: string, userId: string): Promise<Dependent> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error('Dependent not found');
    const now = new Date();
    const updated = await this.repo.update(id, { status: 'INACTIVE', policy_end_date: now } as any);
    await this.audit.log({ userId, action: 'DELETE_DEPENDENT', entity: 'dependent', entityId: id, oldValues: before, newValues: updated });
    return updated;
  }

  async restore(id: string, userId: string): Promise<Dependent> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error('Dependent not found');
    const updated = await this.repo.update(id, { status: 'ACTIVE', deleted_at: null } as any);
    await this.audit.log({ userId, action: 'UPDATE_DEPENDENT', entity: 'dependent', entityId: id, oldValues: before, newValues: updated });
    return updated;
  }
}


