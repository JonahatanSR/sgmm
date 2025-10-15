import { FastifyInstance } from 'fastify';
import { auditService } from './services/auditService';

export async function auditRoutes(app: FastifyInstance) {
  // Endpoint para obtener historial de auditoría de un empleado
  app.get('/api/audit/employee/:employeeId', async (req, reply) => {
    try {
      const { employeeId } = req.params as { employeeId: string };
      const { limit = 50 } = req.query as { limit?: number };

      if (!employeeId) {
        return reply.status(400).send({ error: 'Employee ID is required' });
      }

      const auditHistory = await auditService.getEmployeeAuditHistory(employeeId, limit);

      return reply.send({
        success: true,
        data: auditHistory,
        count: auditHistory.length
      });

    } catch (error) {
      console.error('Error getting audit history:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Endpoint para obtener historial de PDFs de un empleado
  app.get('/api/audit/employee/:employeeId/pdfs', async (req, reply) => {
    try {
      const { employeeId } = req.params as { employeeId: string };
      const { limit = 20 } = req.query as { limit?: number };

      if (!employeeId) {
        return reply.status(400).send({ error: 'Employee ID is required' });
      }

      const pdfHistory = await auditService.getPDFAuditHistory(employeeId, limit);

      return reply.send({
        success: true,
        data: pdfHistory,
        count: pdfHistory.length
      });

    } catch (error) {
      console.error('Error getting PDF audit history:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Endpoint para registrar generación de PDF
  app.post('/api/audit/pdf/generation', async (req, reply) => {
    try {
      const {
        employeeId,
        actorId,
        actorRole,
        actorEmail,
        ipAddress,
        userAgent,
        filename,
        options
      } = req.body as any;

      if (!employeeId || !actorId || !filename) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      const success = await auditService.logPDFGeneration(
        employeeId,
        actorId,
        actorRole || 'EMPLOYEE',
        actorEmail,
        ipAddress || req.ip,
        userAgent || req.headers['user-agent'],
        filename,
        options || {}
      );

      if (success) {
        return reply.send({ success: true, message: 'PDF generation logged' });
      } else {
        return reply.status(500).send({ error: 'Failed to log PDF generation' });
      }

    } catch (error) {
      console.error('Error logging PDF generation:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Endpoint para registrar descarga de PDF
  app.post('/api/audit/pdf/download', async (req, reply) => {
    try {
      const {
        employeeId,
        actorId,
        actorRole,
        actorEmail,
        ipAddress,
        userAgent,
        filename
      } = req.body as any;

      if (!employeeId || !actorId || !filename) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      const success = await auditService.logPDFDownload(
        employeeId,
        actorId,
        actorRole || 'EMPLOYEE',
        actorEmail,
        ipAddress || req.ip,
        userAgent || req.headers['user-agent'],
        filename
      );

      if (success) {
        return reply.send({ success: true, message: 'PDF download logged' });
      } else {
        return reply.status(500).send({ error: 'Failed to log PDF download' });
      }

    } catch (error) {
      console.error('Error logging PDF download:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Endpoint para registrar visualización de PDF
  app.post('/api/audit/pdf/view', async (req, reply) => {
    try {
      const {
        employeeId,
        actorId,
        actorRole,
        actorEmail,
        ipAddress,
        userAgent,
        filename
      } = req.body as any;

      if (!employeeId || !actorId || !filename) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      const success = await auditService.logPDFView(
        employeeId,
        actorId,
        actorRole || 'EMPLOYEE',
        actorEmail,
        ipAddress || req.ip,
        userAgent || req.headers['user-agent'],
        filename
      );

      if (success) {
        return reply.send({ success: true, message: 'PDF view logged' });
      } else {
        return reply.status(500).send({ error: 'Failed to log PDF view' });
      }

    } catch (error) {
      console.error('Error logging PDF view:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
