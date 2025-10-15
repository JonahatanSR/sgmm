import { EmployeeRepository } from '../employees/domain';
import { DependentRepository } from '../dependents/domain';

export class CollaboratorSummaryService {
  constructor(
    private readonly employees: EmployeeRepository,
    private readonly dependents: DependentRepository,
  ) {}

  async getSummary(employeeIdOrNumber: string) {
    // Ahora el ID es el mismo que employee_number, buscar directamente por ID
    const employee = await this.employees.findById(employeeIdOrNumber);
    if (!employee) throw new Error('Employee not found');
    
    const active = await this.dependents.listActiveByEmployee(employee.id);
    const inactive = await this.dependents.listInactiveByEmployee(employee.id);
    return {
      employee,
      dependents: {
        active,
        inactive,
      },
    };
  }
}





