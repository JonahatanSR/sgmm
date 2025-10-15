import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../config/database';

export async function pdfRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient();
  
  // Endpoint para obtener datos completos para generación de PDF
  app.get('/api/pdf/collaborator-data/:employeeId', async (req, reply) => {
    try {
      const { employeeId } = req.params as { employeeId: string };
      
      if (!employeeId) {
        return reply.status(400).send({ error: 'Employee ID is required' });
      }

      // Obtener datos del empleado
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
          company: true
        }
      });

      if (!employee) {
        return reply.status(404).send({ error: 'Employee not found' });
      }

      // Obtener dependientes activos e inactivos
      const dependents = await prisma.dependent.findMany({
        where: { 
          employee_id: employeeId,
          deleted_at: null
        },
        include: {
          relationship_type: true
        },
        orderBy: { created_at: 'asc' }
      });

      // Obtener tipos de relación
      const relationshipTypes = await prisma.relationshipType.findMany({
        where: { active: true },
        orderBy: { name: 'asc' }
      });

      // Preparar datos para el PDF
      const pdfData = {
        employee: {
          id: employee.id,
          google_id: employee.google_id,
          email: employee.email,
          full_name: employee.full_name,
          first_name: employee.first_name,
          paternal_last_name: employee.paternal_last_name,
          maternal_last_name: employee.maternal_last_name,
          birth_date: employee.birth_date,
          gender: employee.gender,
          hire_date: employee.hire_date,
          company_id: employee.company_id,
          department: employee.department,
          position: employee.position,
          policy_number: employee.policy_number,
          status: employee.status,
          last_login: employee.last_login,
          login_count: employee.login_count,
          last_ip_address: employee.last_ip_address,
          last_user_agent: employee.last_user_agent,
          created_at: employee.created_at,
          updated_at: employee.updated_at
        },
        dependents: dependents.map((dep: any) => ({
          id: dep.id,
          dependent_id: dep.dependent_id,
          employee_id: dep.employee_id,
          first_name: dep.first_name,
          paternal_last_name: dep.paternal_last_name,
          maternal_last_name: dep.maternal_last_name,
          birth_date: dep.birth_date,
          gender: dep.gender,
          relationship_type_id: dep.relationship_type_id,
          relationship_type_name: dep.relationship_type?.name || 'Desconocido',
          policy_start_date: dep.policy_start_date,
          policy_end_date: dep.policy_end_date,
          status: dep.status,
          created_by: dep.created_by,
          created_at: dep.created_at,
          updated_at: dep.updated_at,
          deleted_at: dep.deleted_at
        })),
        relationshipTypes: relationshipTypes.map((rt: any) => ({
          id: rt.id,
          name: rt.name,
          description: rt.description,
          is_active: rt.active,
          created_at: rt.created_at,
          updated_at: rt.updated_at
        })),
        company: employee.company ? {
          id: employee.company.id,
          name: employee.company.name,
          code: employee.company.code,
          logo_url: employee.company.logo_url,
          primary_color: employee.company.primary_color,
          secondary_color: employee.company.secondary_color,
          contact_email: null,
          contact_phone: null,
          address: null,
          is_active: employee.company.active,
          created_at: employee.company.created_at,
          updated_at: employee.company.created_at
        } : null,
        generatedAt: new Date().toISOString(),
        generatedBy: employeeId
      };

      return reply.send(pdfData);

    } catch (error) {
      console.error('Error getting PDF data:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Endpoint legacy DESHABILITADO - usar nuevo sistema de PDFs
  // app.get('/api/pdf/renewal-form', async (req, reply) => {
  //   const { employeeId } = (req.query || {}) as any;
  //   const content = `PDF placeholder for employee ${employeeId ?? ''}\n`;
  //   reply.header('Content-Type', 'application/pdf');
  //   reply.header('Content-Disposition', 'attachment; filename="renewal_form_placeholder.pdf"');
  //   return reply.send(Buffer.from(content));
  // });
}





