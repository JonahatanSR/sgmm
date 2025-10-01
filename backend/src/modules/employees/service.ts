import { AuditLogger, Employee, EmployeeRepository } from './domain';

export class EmployeeService {
  constructor(
    private readonly repository: EmployeeRepository,
    private readonly audit: AuditLogger,
  ) {}

  async getById(id: string): Promise<Employee | null> {
    return this.repository.findById(id);
  }

  async update(id: string, data: Partial<Employee>, userId: string): Promise<Employee> {
    const before = await this.repository.findById(id);
    if (!before) throw new Error('Employee not found');

    const updated = await this.repository.update(id, data);
    await this.audit.log({
      userId,
      action: 'UPDATE_EMPLOYEE',
      entity: 'employee',
      entityId: id,
      oldValues: before,
      newValues: updated,
    });
    return updated;
  }
}





