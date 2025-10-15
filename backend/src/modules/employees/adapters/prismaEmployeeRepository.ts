import { PrismaClient } from '@prisma/client';
import { Employee, EmployeeRepository } from '../domain';

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Employee | null> {
    return (await this.prisma.employee.findUnique({ where: { id } })) as unknown as Employee | null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return (await this.prisma.employee.findUnique({ where: { email } })) as unknown as Employee | null;
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<Employee | null> {
    return (await this.prisma.employee.findUnique({ where: { employee_number: employeeNumber } })) as unknown as Employee | null;
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const allowed: Partial<Employee> = {};
    const fields: (keyof Employee)[] = [
      'first_name',
      'paternal_last_name',
      'maternal_last_name',
      'full_name',
      'birth_date',
      'gender',
      'policy_number',
    ];
    for (const key of fields) {
      if (key in data) {
        // @ts-expect-error index
        allowed[key] = data[key];
      }
    }
    const updated = await this.prisma.employee.update({ where: { id }, data: allowed as any });
    return updated as unknown as Employee;
  }

  async search(query: string, companyId: string): Promise<Employee[]> {
    const q = query.trim();
    const tokens = q.split(/\s+/).filter(t => t.length >= 3);
    const whereNameTokens = tokens.map(t => ({ full_name: { contains: t, mode: 'insensitive' as const } }));
    const where: any = {
      OR: [
        { employee_number: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        ...(tokens.length ? [{ AND: whereNameTokens }] : []),
      ],
    };
    if (companyId && companyId !== 'all') {
      where.company_id = companyId;
    }
    const rows = await this.prisma.employee.findMany({ where, take: 10, orderBy: { full_name: 'asc' } });
    return rows as unknown as Employee[];
  }

  async create(data: Partial<Employee>): Promise<Employee> {
    const created = await this.prisma.employee.create({
      data: {
        email: data.email || '',
        full_name: data.full_name || '',
        employee_number: data.employee_number || '',
        company_id: data.company_id || '',
        hire_date: new Date(),
        status: 'ACTIVE'
      }
    });
    return created as unknown as Employee;
  }
}



