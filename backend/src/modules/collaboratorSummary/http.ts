import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../config/database';
import { PrismaEmployeeRepository } from '../employees/adapters/prismaEmployeeRepository';
import { PrismaDependentRepository } from '../dependents/adapters/prismaDependentRepository';
import { CollaboratorSummaryService } from './service';

export async function collaboratorSummaryRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient() as any;
  const emp = new PrismaEmployeeRepository(prisma);
  const dep = new PrismaDependentRepository(prisma);
  const svc = new CollaboratorSummaryService(emp, dep);

  const handler = async (req: any, reply: any) => {
    const { id } = req.params as any;
    console.log('🔍 [HTTP Handler] Recibido ID:', id);
    try {
      const result = await svc.getSummary(id);
      console.log('✅ [HTTP Handler] Resultado obtenido:', result ? 'exitoso' : 'fallido');
      return result;
    } catch (e: any) {
      console.log('❌ [HTTP Handler] Error:', e.message);
      return reply.code(404).send({ message: e.message });
    }
  };

  app.get('/api/collaborator/:id/summary', handler);
  app.get('/collaborator/:id/summary', handler);
}


