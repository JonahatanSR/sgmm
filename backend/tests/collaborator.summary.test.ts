import { CollaboratorSummaryService } from '../src/modules/collaboratorSummary/service';
import { Employee } from '../src/modules/employees/domain';
import { Dependent } from '../src/modules/dependents/domain';

const employeeBase: Employee = {
  id: 'e1', employee_number: '100', email: 'a@b.com', full_name: 'A B',
  hire_date: new Date('2020-01-01'), company_id: 'c1', created_at: new Date(), updated_at: new Date(),
  first_name: 'A', paternal_last_name: 'B', maternal_last_name: null, birth_date: new Date('1990-01-01'), gender: 'M', policy_number: null,
};

const depsActive: Dependent[] = [
  { id: 'd1', employee_id: 'e1', first_name: 'Ana', paternal_last_name: 'P', maternal_last_name: null, birth_date: new Date('2015-01-01'), gender: 'F', relationship_type_id: 1, policy_start_date: new Date('2022-01-01'), policy_end_date: null, status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
];

const depsInactive: Dependent[] = [
  { id: 'd2', employee_id: 'e1', first_name: 'Luis', paternal_last_name: 'P', maternal_last_name: null, birth_date: new Date('2012-01-01'), gender: 'M', relationship_type_id: 1, policy_start_date: new Date('2021-01-01'), policy_end_date: new Date('2023-01-01'), status: 'INACTIVE', created_at: new Date(), updated_at: new Date() },
];

describe('CollaboratorSummaryService', () => {
  it('retorna resumen consolidado', async () => {
    const employeeRepo = {
      async findById(id: string) { return id === 'e1' ? employeeBase : null; },
      async update() { throw new Error('not needed'); },
    } as any;

    const depRepo = {
      async listActiveByEmployee(emp: string) { return emp === 'e1' ? depsActive : []; },
      async listInactiveByEmployee(emp: string) { return emp === 'e1' ? depsInactive : []; },
    } as any;

    const service = new CollaboratorSummaryService(employeeRepo, depRepo);
    const result = await service.getSummary('e1');
    expect(result.employee.id).toBe('e1');
    expect(result.dependents.active.length).toBe(1);
    expect(result.dependents.inactive.length).toBe(1);
  });
});





