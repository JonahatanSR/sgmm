import { FastifyInstance } from 'fastify';
import { PrismaEmployeeRepository } from './adapters/prismaEmployeeRepository';
import { EmployeeService } from './service';
import { getPrismaClient } from '../../config/database';
import { getPrismaAuditLogger } from '../audit/logger';

export async function employeeRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient() as any;
  const repo = new PrismaEmployeeRepository(prisma);
  const audit = getPrismaAuditLogger(prisma);
  const service = new EmployeeService(repo, audit);

  const getHandler = async (req: any, reply: any) => {
    const { id } = req.params as { id: string };
    const found = await service.getById(id);
    if (!found) return reply.code(404).send({ message: 'Not found' });
    return found;
  };

  const putHandler = async (req: any, reply: any) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;
    
    console.log('🔍 [DEBUG] PUT /api/employees/:id - Received id:', id, 'body:', body);
    
    // Primero intentar encontrar el empleado por employee_number o por id interno
    let employee = await repo.findByEmployeeNumber(id);
    if (!employee) {
      employee = await repo.findById(id);
    }
    
    if (!employee) {
      console.log('❌ [DEBUG] Employee not found for id:', id);
      return reply.code(404).send({ message: 'Employee not found' });
    }
    
    console.log('✅ [DEBUG] Found employee:', employee.id, 'employee_number:', employee.employee_number);
    
    // Usar el ID interno para el UPDATE
    const updated = await service.update(employee.id, body, employee.id);
    return updated;
  };

  const searchHandler = async (req: any, reply: any) => {
    const query = req.query?.q || req.query?.query;
    const companyId = req.query?.companyId;
    if (!query || query.trim().length < 3) {
      return reply.code(400).send({ message: 'query>=3 es requerido' });
    }
    if (!repo.search) {
      return reply.code(501).send({ message: 'search no implementado' });
    }
    const rows = await repo.search(query, companyId || '');
    return rows.map(r => ({ id: r.id, employee_number: r.employee_number, email: r.email, full_name: r.full_name }));
  };

  app.get('/api/employees/:id', getHandler);
  app.get('/employees/:id', getHandler);

  app.put('/api/employees/:id', putHandler);
  app.put('/employees/:id', putHandler);

  app.get('/api/employees/search', searchHandler);
  app.get('/employees/search', searchHandler);
}


