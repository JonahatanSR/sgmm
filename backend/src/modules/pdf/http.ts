import { FastifyInstance } from 'fastify';

export async function pdfRoutes(app: FastifyInstance) {
  app.get('/api/pdf/renewal-form', async (req, reply) => {
    const { employeeId } = (req.query || {}) as any;
    const content = `PDF placeholder for employee ${employeeId ?? ''}\n`;
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', 'attachment; filename="renewal_form_placeholder.pdf"');
    // simple PDF-like content (placeholder). In real impl we will stream a real PDF
    return reply.send(Buffer.from(content));
  });
}





