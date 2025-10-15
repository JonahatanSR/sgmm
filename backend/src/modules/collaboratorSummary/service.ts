import { EmployeeRepository } from '../employees/domain';
import { DependentRepository } from '../dependents/domain';

export class CollaboratorSummaryService {
  constructor(
    private readonly employees: EmployeeRepository,
    private readonly dependents: DependentRepository,
  ) {}

  async getSummary(employeeIdOrNumber: string) {
    console.log('🔍 [CollaboratorSummaryService] Buscando empleado:', employeeIdOrNumber);
    
    // Intentar buscar por employee_number primero, luego por ID
    let employee = await this.employees.findByEmployeeNumber(employeeIdOrNumber);
    console.log('🔍 [CollaboratorSummaryService] Resultado findByEmployeeNumber:', employee ? 'encontrado' : 'no encontrado');
    
    if (!employee) {
      // Si no se encuentra por employee_number, buscar por ID
      console.log('🔍 [CollaboratorSummaryService] Buscando por ID...');
      employee = await this.employees.findById(employeeIdOrNumber);
      console.log('🔍 [CollaboratorSummaryService] Resultado findById:', employee ? 'encontrado' : 'no encontrado');
    }
    
    if (!employee) {
      console.log('❌ [CollaboratorSummaryService] Empleado no encontrado');
      throw new Error('Employee not found');
    }
    
    console.log('✅ [CollaboratorSummaryService] Empleado encontrado:', employee.employee_number);
    
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





