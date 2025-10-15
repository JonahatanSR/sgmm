import { FastifyInstance } from 'fastify';
import { employeeMappingService } from '../services/employeeMappingService';

export async function employeeMappingRoutes(app: FastifyInstance) {
  // Obtener mapeo por email
  app.get('/api/employee-mappings/:email', async (req, reply) => {
    try {
      const { email } = req.params as { email: string };
      
      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      const mapping = await employeeMappingService.findByEmail(email);
      
      if (!mapping) {
        return reply.status(404).send({ error: 'Employee mapping not found' });
      }

      return reply.send(mapping);
    } catch (error: any) {
      console.error('Error getting employee mapping:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Crear nuevo mapeo
  app.post('/api/employee-mappings', async (req, reply) => {
    try {
      const data = req.body as {
        email: string;
        employee_number: string;
        full_name?: string;
        department?: string;
        position?: string;
      };

      if (!data.email || !data.employee_number) {
        return reply.status(400).send({ 
          error: 'Email and employee_number are required' 
        });
      }

      const mapping = await employeeMappingService.createMapping(data);
      
      if (!mapping) {
        return reply.status(500).send({ error: 'Failed to create mapping' });
      }

      return reply.status(201).send(mapping);
    } catch (error: any) {
      console.error('Error creating employee mapping:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Actualizar mapeo
  app.put('/api/employee-mappings/:email', async (req, reply) => {
    try {
      const { email } = req.params as { email: string };
      const data = req.body as {
        employee_number?: string;
        full_name?: string;
        department?: string;
        position?: string;
        is_active?: boolean;
      };

      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      const mapping = await employeeMappingService.updateMapping(email, data);
      
      if (!mapping) {
        return reply.status(404).send({ error: 'Employee mapping not found' });
      }

      return reply.send(mapping);
    } catch (error: any) {
      console.error('Error updating employee mapping:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Cargar múltiples mapeos
  app.post('/api/employee-mappings/bulk', async (req, reply) => {
    try {
      const mappings = req.body as Array<{
        email: string;
        employee_number: string;
        full_name?: string;
        department?: string;
        position?: string;
      }>;

      if (!Array.isArray(mappings) || mappings.length === 0) {
        return reply.status(400).send({ 
          error: 'Mappings array is required' 
        });
      }

      const result = await employeeMappingService.bulkCreateMappings(mappings);
      
      return reply.send({
        message: `Processed ${mappings.length} mappings`,
        success: result.success,
        errors: result.errors
      });
    } catch (error: any) {
      console.error('Error bulk creating mappings:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Obtener todos los mapeos
  app.get('/api/employee-mappings', async (req, reply) => {
    try {
      const mappings = await employeeMappingService.getAllMappings();
      return reply.send(mappings);
    } catch (error: any) {
      console.error('Error getting all mappings:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Desactivar mapeo
  app.delete('/api/employee-mappings/:email', async (req, reply) => {
    try {
      const { email } = req.params as { email: string };
      
      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      const success = await employeeMappingService.deactivateMapping(email);
      
      if (!success) {
        return reply.status(500).send({ error: 'Failed to deactivate mapping' });
      }

      return reply.send({ message: 'Mapping deactivated successfully' });
    } catch (error: any) {
      console.error('Error deactivating mapping:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
