import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../config/database';

export async function adminAuditRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient();
  const handler = async (req: any) => {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        table_name: true,
        record_id: true,
        timestamp: true,
        user_id: true,
        old_values: true,
        new_values: true,
      },
    });
    return logs;
  };

  app.get('/api/admin/audit', handler);
  app.get('/admin/audit', handler);
}



