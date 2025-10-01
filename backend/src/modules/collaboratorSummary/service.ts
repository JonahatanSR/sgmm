import { EmployeeRepository } from '../employees/domain';
import { DependentRepository } from '../dependents/domain';

export class CollaboratorSummaryService {
  constructor(
    private readonly employees: EmployeeRepository,
    private readonly dependents: DependentRepository,
  ) {}

  async getSummary(employeeId: string) {
    const employee = await this.employees.findById(employeeId);
    if (!employee) throw new Error('Employee not found');
    const active = await this.dependents.listActiveByEmployee(employeeId);
    const inactive = await this.dependents.listInactiveByEmployee(employeeId);
    return {
      employee,
      dependents: {
        active,
        inactive,
      },
    };
  }
}





