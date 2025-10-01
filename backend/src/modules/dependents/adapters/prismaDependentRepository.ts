import { PrismaClient } from '@prisma/client';
import { Dependent, DependentRepository, RelationshipTypeRepository } from '../domain';

export class PrismaDependentRepository implements DependentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Dependent | null> {
    return (await this.prisma.dependent.findUnique({ where: { id } })) as unknown as Dependent | null;
  }

  async listActiveByEmployee(employeeId: string): Promise<Dependent[]> {
    const rows = await this.prisma.dependent.findMany({ where: { employee_id: employeeId, status: 'ACTIVE' }, orderBy: { dependent_seq: 'asc' } });
    return rows as unknown as Dependent[];
  }

  async listInactiveByEmployee(employeeId: string): Promise<Dependent[]> {
    const rows = await this.prisma.dependent.findMany({ where: { employee_id: employeeId, status: 'INACTIVE' }, orderBy: { dependent_seq: 'asc' } });
    return rows as unknown as Dependent[];
  }

  async create(data: any): Promise<Dependent> {
    // Ensure dependent_id is generated from employee_number + aNN
    const { employee_id, dependent_seq } = data;
    if (!employee_id || !dependent_seq) {
      throw new Error('employee_id and dependent_seq are required to create dependent');
    }
    const employee = await this.prisma.employee.findUnique({ where: { id: employee_id }, select: { employee_number: true } });
    if (!employee) throw new Error('Employee not found for dependent');
    const depId = `${employee.employee_number}-a${String(dependent_seq).padStart(2, '0')}`;
    const row = await this.prisma.dependent.create({ data: { ...data, dependent_id: depId } });
    return row as unknown as Dependent;
  }

  async update(id: string, data: Partial<Dependent>): Promise<Dependent> {
    const row = await this.prisma.dependent.update({ where: { id }, data: data as any });
    return row as unknown as Dependent;
  }

  async getMaxSeq(employeeId: string): Promise<number> {
    const res = await this.prisma.dependent.aggregate({ where: { employee_id: employeeId }, _max: { dependent_seq: true } });
    return res._max.dependent_seq ?? 0;
  }
}

export class PrismaRelationshipTypeRepository implements RelationshipTypeRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async exists(id: number): Promise<boolean> {
    const found = await this.prisma.relationshipType.findUnique({ where: { id } });
    return !!found;
  }
}


