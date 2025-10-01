import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../config/database';

export async function relationshipTypeRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient();
  const handler = async () => {
    const list = await prisma.relationshipType.findMany({
      where: { active: true },
      orderBy: [{ display_order: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, display_order: true, active: true },
    });
    return list;
  };

  app.get('/api/relationship-types', handler);
  app.get('/relationship-types', handler);
}


