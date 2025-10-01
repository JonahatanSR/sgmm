import { FastifyInstance } from 'fastify'
import { getPrismaClient } from '../../config/database'

export async function adminCompanyRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient()

  const handler = async () => {
    const rows = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    })
    return rows
  }

  app.get('/api/companies', handler)
  app.get('/companies', handler)
}


