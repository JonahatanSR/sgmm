import { FastifyInstance } from 'fastify';
import { PrivacyService } from './privacyService';

export async function privacyRoutes(app: FastifyInstance) {
  const privacyService = new PrivacyService();

  app.log.info('Registering privacy routes...');

  /**
   * POST /api/privacy/accept
   * Registra la aceptación del aviso de privacidad
   */
  app.post('/api/privacy/accept', async (req: any, reply: any) => {
    try {
      const { employee_id, dependent_id, acceptance_type, privacy_version = 'v1.0' } = req.body;

      // Validaciones
      if (!employee_id || !acceptance_type) {
        return reply.code(400).send({
          error: 'employee_id y acceptance_type son requeridos'
        });
      }

      if (!['EMPLOYEE', 'DEPENDENT'].includes(acceptance_type)) {
        return reply.code(400).send({
          error: 'acceptance_type debe ser EMPLOYEE o DEPENDENT'
        });
      }

      if (acceptance_type === 'DEPENDENT' && !dependent_id) {
        return reply.code(400).send({
          error: 'dependent_id es requerido para acceptance_type DEPENDENT'
        });
      }

      // Obtener información de la petición
      const ip_address = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const user_agent = req.headers['user-agent'] || 'unknown';

      const acceptanceData = {
        employee_id,
        dependent_id,
        acceptance_type,
        privacy_version,
        ip_address,
        user_agent,
      };

      const result = await privacyService.recordAcceptance(acceptanceData);

      app.log.info(`Privacy acceptance recorded: ${result.id} for ${acceptance_type}`);

      return reply.send({
        success: true,
        data: result,
        message: 'Aceptación del aviso de privacidad registrada correctamente'
      });

    } catch (error: any) {
      app.log.error('Error recording privacy acceptance:', error);
      return reply.code(500).send({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });

  /**
   * GET /api/privacy/check/:employee_id
   * Verifica si un empleado ha aceptado el aviso de privacidad
   */
  app.get('/api/privacy/check/:employee_id', async (req: any, reply: any) => {
    try {
      const { employee_id } = req.params;
      const { version = 'v1.0' } = req.query;

      const hasAccepted = await privacyService.hasEmployeeAccepted(employee_id, version);

      return reply.send({
        employee_id,
        has_accepted: hasAccepted,
        privacy_version: version
      });

    } catch (error: any) {
      app.log.error('Error checking privacy acceptance:', error);
      return reply.code(500).send({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });

  /**
   * GET /api/privacy/check-dependent/:dependent_id
   * Verifica si un dependiente tiene aceptación del aviso de privacidad
   */
  app.get('/api/privacy/check-dependent/:dependent_id', async (req: any, reply: any) => {
    try {
      const { dependent_id } = req.params;
      const { version = 'v1.0' } = req.query;

      const hasAccepted = await privacyService.hasDependentAccepted(dependent_id, version);

      return reply.send({
        dependent_id,
        has_accepted: hasAccepted,
        privacy_version: version
      });

    } catch (error: any) {
      app.log.error('Error checking dependent privacy acceptance:', error);
      return reply.code(500).send({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });

  /**
   * GET /api/privacy/history/:employee_id
   * Obtiene el historial de aceptaciones de un empleado
   */
  app.get('/api/privacy/history/:employee_id', async (req: any, reply: any) => {
    try {
      const { employee_id } = req.params;

      const history = await privacyService.getEmployeeAcceptanceHistory(employee_id);

      return reply.send({
        employee_id,
        history,
        total: history.length
      });

    } catch (error: any) {
      app.log.error('Error getting privacy acceptance history:', error);
      return reply.code(500).send({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });

  /**
   * GET /api/privacy/stats
   * Obtiene estadísticas de aceptaciones (solo para administradores)
   */
  app.get('/api/privacy/stats', async (req: any, reply: any) => {
    try {
      const stats = await privacyService.getAcceptanceStats();

      return reply.send({
        stats,
        generated_at: new Date().toISOString()
      });

    } catch (error: any) {
      app.log.error('Error getting privacy acceptance stats:', error);
      return reply.code(500).send({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });

  app.log.info('Privacy routes registered successfully');
}


