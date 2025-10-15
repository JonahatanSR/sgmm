import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../config/database';
import { PrismaDependentRepository, PrismaRelationshipTypeRepository } from './adapters/prismaDependentRepository';
import { DependentsService } from './service';
import { getPrismaAuditLogger } from '../audit/logger';

export async function dependentRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient() as any;
  const repo = new PrismaDependentRepository(prisma);
  const relRepo = new PrismaRelationshipTypeRepository(prisma);
  const rules = {
    getMaxDependentsPerEmployee: async () => {
      const cfg = await prisma.systemConfig.findUnique({ where: { key: 'max_dependents' } });
      const val = cfg?.value ? parseInt(cfg.value, 10) : 10;
      return Number.isFinite(val) && val > 0 ? val : 10;
    },
  };
  const audit = getPrismaAuditLogger(prisma);
  const service = new DependentsService(repo, relRepo, rules, audit);

  const listActiveHandler = async (req: any) => {
    const { employeeId } = req.params as any;
    
    // Buscar el empleado primero por ID interno, luego por employee_number
    let employee = await prisma.employee.findUnique({ 
      where: { id: employeeId }, 
      select: { id: true, employee_number: true } 
    });
    
    if (!employee) {
      // Si no se encuentra por ID, buscar por employee_number
      employee = await prisma.employee.findUnique({ 
        where: { employee_number: employeeId }, 
        select: { id: true, employee_number: true } 
      });
    }
    
    if (!employee) throw new Error('Employee not found');
    const active = await service.listActive(employee.id);
    return active;
  };

  const listInactiveHandler = async (req: any) => {
    const { employeeId } = req.params as any;
    
    // Buscar el empleado primero por ID interno, luego por employee_number
    let employee = await prisma.employee.findUnique({ 
      where: { id: employeeId }, 
      select: { id: true, employee_number: true } 
    });
    
    if (!employee) {
      // Si no se encuentra por ID, buscar por employee_number
      employee = await prisma.employee.findUnique({ 
        where: { employee_number: employeeId }, 
        select: { id: true, employee_number: true } 
      });
    }
    
    if (!employee) throw new Error('Employee not found');
    const inactive = await service.listInactive(employee.id);
    return inactive;
  };

  const createHandler = async (req: any) => {
    const { employeeId } = req.params as any;
    const body = req.body as any;
    
    // Buscar el empleado primero por ID interno, luego por employee_number
    let employee = await prisma.employee.findUnique({ 
      where: { id: employeeId }, 
      select: { id: true, employee_number: true } 
    });
    
    if (!employee) {
      // Si no se encuentra por ID, buscar por employee_number
      employee = await prisma.employee.findUnique({ 
        where: { employee_number: employeeId }, 
        select: { id: true, employee_number: true } 
      });
    }
    
    if (!employee) throw new Error('Employee not found');
    console.log('🔍 [DEBUG] HTTP createHandler - employeeId:', employeeId, 'employee.id:', employee.id, 'employee.employee_number:', employee.employee_number);
    return service.create({ ...body, employee_id: employee.id }, employee.employee_number);
  };

  const updateHandler = async (req: any) => {
    const { id } = req.params as any;
    const body = req.body as any;
    const dep = await repo.findById(id);
    const actor = dep?.employee_id || 'system';
    const context = {
      userRole: (req.headers['x-actor-role'] as any) || undefined,
      actorEmail: (req.headers['x-actor-email'] as any) || undefined,
      companyId: (req.headers['x-actor-company'] as any) || undefined,
    };
    const updated = await service.update(id, body, actor);
    // service.update ya audita; en una refactorización futura pasaríamos context a service
    // Para mantener compatibilidad, no cambiamos la firma ahora.
    return updated;
  };

  const deleteHandler = async (req: any) => {
    const { id } = req.params as any;
    const dep = await repo.findById(id);
    const actor = dep?.employee_id || 'system';
    return service.softDelete(id, actor);
  };

  const restoreHandler = async (req: any) => {
    const { id } = req.params as any;
    const dep = await repo.findById(id);
    const actor = dep?.employee_id || 'system';
    return service.restore(id, actor);
  };

  const getOneHandler = async (req: any, reply: any) => {
    const { id } = req.params as any;
    const found = await repo.findById(id);
    if (!found) return reply.code(404).send({ message: 'Not found' });
    return found;
  };

  // API-prefixed routes
  app.get('/api/employees/:employeeId/dependents', listActiveHandler);
  app.get('/api/employees/:employeeId/dependents/inactive', listInactiveHandler);
  app.post('/api/employees/:employeeId/dependents', createHandler);
  app.put('/api/dependents/:id', updateHandler);
  app.delete('/api/dependents/:id', deleteHandler);
  app.post('/api/dependents/:id/restore', restoreHandler);
  app.get('/api/dependents/:id', getOneHandler);

  // Mirror routes without /api (para compatibilidad con proxy simple)
  app.get('/employees/:employeeId/dependents', listActiveHandler);
  app.get('/employees/:employeeId/dependents/inactive', listInactiveHandler);
  app.post('/employees/:employeeId/dependents', createHandler);
  app.put('/dependents/:id', updateHandler);
  app.delete('/dependents/:id', deleteHandler);
  app.post('/dependents/:id/restore', restoreHandler);
  app.get('/dependents/:id', getOneHandler);
}


