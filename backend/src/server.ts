import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { env } from './config/environment';
import { getPrismaClient } from './config/database';
import { registerSession } from './middleware/session';
import { employeeRoutes } from './modules/employees/http';
import { dependentRoutes } from './modules/dependents/http';
import { collaboratorSummaryRoutes } from './modules/collaboratorSummary/http';
import { relationshipTypeRoutes } from './modules/relationshipTypes/http';
import { pdfRoutes } from './modules/pdf/http';
import { adminAuditRoutes } from './modules/admin/audit';
import { adminCompanyRoutes } from './modules/admin/companies';
import { authRoutes } from './modules/auth/http';

// Create Fastify instance
const fastify = Fastify({
  logger: env.isDevelopment() 
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: 'warn',
      },
});

// Register CORS
fastify.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
});

// Register form body parser (required for SAML callback)
fastify.register(formbody);

// Health check route
fastify.get('/health', async (request, reply) => {
  const prisma = getPrismaClient();
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: 'connected',
      uptime: process.uptime(),
    };
  } catch (error) {
    reply.code(503);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: 'disconnected',
      error: env.isDevelopment() ? error : 'Database connection failed',
    };
  }
});

// API Info route
fastify.get('/', async () => {
  return {
    name: 'SGMM Backend API',
    version: '1.0.0',
    description: 'Sistema de Gestión de Gastos Médicos Mayores',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      docs: '/docs (coming soon)',
    },
  };
});

// Register routes
fastify.register(authRoutes);
fastify.register(employeeRoutes);
fastify.register(dependentRoutes);
fastify.register(collaboratorSummaryRoutes);
fastify.register(relationshipTypeRoutes);
fastify.register(pdfRoutes);
fastify.register(adminAuditRoutes);
fastify.register(adminCompanyRoutes);

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  
  fastify.log.error(error);
  
  reply.code(statusCode).send({
    success: false,
    error: env.isDevelopment() ? error.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    path: request.url,
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
    await fastify.close();
    process.exit(0);
  } catch (error: any) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    // Register Session middleware
    await registerSession(fastify);
    
    // Test database connection
    const prisma = getPrismaClient();
    await prisma.$connect();
    fastify.log.info('Database connected successfully');
    
    // Start the server
    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });
    
    fastify.log.info(`🚀 Server is running on http://${env.HOST}:${env.PORT}`);
    fastify.log.info(`📚 Environment: ${env.NODE_ENV}`);
    fastify.log.info(`🏥 SGMM Backend API v1.0.0 is ready!`);
    
  } catch (error: any) {
    fastify.log.error('Error starting server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

export default fastify;
