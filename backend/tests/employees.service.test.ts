import { EmployeeService } from '../src/modules/employees/service';
import { AuditLogger, EmployeeRepository } from '../src/modules/employees/domain';

const makeRepo = (employee: any): EmployeeRepository => ({
  async findById(id: string) {
    return id === employee.id ? employee : null;
  },
  async findByEmail(email: string) {
    return email === employee.email ? employee : null;
  },
  async update(id: string, data: any) {
    if (id !== employee.id) throw new Error('not found');
    return { ...employee, ...data, updated_at: new Date() };
  },
});

const makeAudit = (collector: any[]): AuditLogger => ({
  async log(evt) {
    collector.push(evt);
  },
});

describe('EmployeeService', () => {
  it('getById devuelve el empleado', async () => {
    const base = {
      id: 'e1', employee_number: '100', email: 'a@b.com', full_name: 'A B',
      hire_date: new Date('2020-01-01'), company_id: 'c1', created_at: new Date(), updated_at: new Date(),
    } as any;
    const service = new EmployeeService(makeRepo(base), makeAudit([]));
    const found = await service.getById('e1');
    expect(found?.id).toBe('e1');
  });

  it('update audita cambios', async () => {
    const base = {
      id: 'e1', employee_number: '100', email: 'a@b.com', full_name: 'A B',
      hire_date: new Date('2020-01-01'), company_id: 'c1', created_at: new Date(), updated_at: new Date(),
    } as any;
    const events: any[] = [];
    const service = new EmployeeService(makeRepo(base), makeAudit(events));
    const updated = await service.update('e1', { full_name: 'Nuevo Nombre' } as any, 'u123');
    expect(updated.full_name).toBe('Nuevo Nombre');
    expect(events.length).toBe(1);
    expect(events[0]).toMatchObject({ action: 'UPDATE_EMPLOYEE', entityId: 'e1', userId: 'u123' });
  });
});

describe('EmployeeRepository - findByEmail', () => {
  it('findByEmail encuentra el empleado cuando el email existe', async () => {
    const employee = {
      id: 'emp-123',
      employee_number: '3619',
      email: 'jonahatan.angeles@siegfried.com.mx',
      full_name: 'Jonahatan Angeles',
      hire_date: new Date('2020-01-01'),
      company_id: 'company-1',
      created_at: new Date(),
      updated_at: new Date(),
    } as any;

    const repository = makeRepo(employee);
    const found = await repository.findByEmail('jonahatan.angeles@siegfried.com.mx');

    expect(found).not.toBeNull();
    expect(found?.id).toBe('emp-123');
    expect(found?.email).toBe('jonahatan.angeles@siegfried.com.mx');
    expect(found?.full_name).toBe('Jonahatan Angeles');
    expect(found?.employee_number).toBe('3619');
  });

  it('findByEmail retorna null cuando el email no existe', async () => {
    const employee = {
      id: 'emp-123',
      employee_number: '3619',
      email: 'jonahatan.angeles@siegfried.com.mx',
      full_name: 'Jonahatan Angeles',
      hire_date: new Date('2020-01-01'),
      company_id: 'company-1',
      created_at: new Date(),
      updated_at: new Date(),
    } as any;

    const repository = makeRepo(employee);
    const found = await repository.findByEmail('noexiste@ejemplo.com');

    expect(found).toBeNull();
  });

  it('findByEmail distingue correctamente entre emails diferentes', async () => {
    const employee = {
      id: 'emp-456',
      employee_number: '4000',
      email: 'maria.lopez@siegfried.com.mx',
      full_name: 'María López',
      hire_date: new Date('2021-03-15'),
      company_id: 'company-1',
      created_at: new Date(),
      updated_at: new Date(),
    } as any;

    const repository = makeRepo(employee);
    
    // Email correcto
    const found = await repository.findByEmail('maria.lopez@siegfried.com.mx');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('emp-456');
    
    // Email similar pero diferente
    const notFound = await repository.findByEmail('maria.lopez@otro-dominio.com');
    expect(notFound).toBeNull();
  });

  it('findByEmail maneja correctamente el caso de email vacío', async () => {
    const employee = {
      id: 'emp-123',
      employee_number: '3619',
      email: 'jonahatan.angeles@siegfried.com.mx',
      full_name: 'Jonahatan Angeles',
      hire_date: new Date('2020-01-01'),
      company_id: 'company-1',
      created_at: new Date(),
      updated_at: new Date(),
    } as any;

    const repository = makeRepo(employee);
    const found = await repository.findByEmail('');

    expect(found).toBeNull();
  });
});





