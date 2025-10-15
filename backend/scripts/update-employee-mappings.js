const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEmployeeMappings() {
  console.log('🚀 Actualizando mapeos de empleados...');

  // Lista de empleados de la imagen
  const employeesToUpdate = [
    { employee_number: '3533', email: 'geovanni.cervantes@siegfried.com.mx', full_name: 'Geovanni Cervantes' },
    { employee_number: '3426', email: 'hector.gonzalez@siegfried.com.mx', full_name: 'Hector González' },
    { employee_number: '2537', email: 'daniel.campuzano@siegfried.com.mx', full_name: 'Daniel Campuzano' },
    { employee_number: '2934', email: 'leticia.gonzalez@siegfried.com.mx', full_name: 'Leticia González' },
    { employee_number: '3509', email: 'andres.galvan@siegfried.com.mx', full_name: 'Andrés Galván' },
    { employee_number: '3710', email: 'jorge.escalera@siegfried.com.mx', full_name: 'Jorge Escalera' },
    { employee_number: '3619', email: 'jonahatan.angeles@siegfried.com.mx', full_name: 'Jonahatan Angeles' },
    { employee_number: '3067', email: 'alejandro.giron@siegfried.com.mx', full_name: 'Alejandro Girón' },
    { employee_number: '2821', email: 'elizabeth.orozco@siegfried.com.mx', full_name: 'Elizabeth Orozco' },
    { employee_number: '1703', email: 'lorena.azcoitia@siegfried.com.mx', full_name: 'Lorena Azcoitia' }
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const results = [];

  for (const empData of employeesToUpdate) {
    try {
      // Verificar si ya existe en employee_mappings
      const existingMapping = await prisma.employeeMapping.findUnique({
        where: { email: empData.email }
      });

      if (existingMapping) {
        // Verificar si necesita actualización
        const needsUpdate = 
          existingMapping.employee_number !== empData.employee_number ||
          existingMapping.full_name !== empData.full_name;

        if (needsUpdate) {
          await prisma.employeeMapping.update({
            where: { email: empData.email },
            data: {
              employee_number: empData.employee_number,
              full_name: empData.full_name,
              is_active: true
            }
          });
          updated++;
          results.push(`✅ Actualizado: ${empData.employee_number} - ${empData.full_name}`);
        } else {
          skipped++;
          results.push(`⏭️ Sin cambios: ${empData.employee_number} - ${empData.full_name}`);
        }
      } else {
        // Crear nuevo mapeo
        await prisma.employeeMapping.create({
          data: {
            email: empData.email,
            employee_number: empData.employee_number,
            full_name: empData.full_name,
            department: 'General', // Valor por defecto
            position: 'Empleado', // Valor por defecto
            is_active: true
          }
        });
        created++;
        results.push(`🆕 Creado: ${empData.employee_number} - ${empData.full_name}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando ${empData.email}:`, error.message);
      results.push(`❌ Error: ${empData.employee_number} - ${empData.full_name}`);
    }
  }

  console.log('\n📊 Resumen de actualización:');
  console.log(`🆕 Nuevos mapeos creados: ${created}`);
  console.log(`✅ Mapeos actualizados: ${updated}`);
  console.log(`⏭️ Mapeos sin cambios: ${skipped}`);
  console.log(`📝 Total procesados: ${employeesToUpdate.length}`);

  console.log('\n📋 Detalles por empleado:');
  results.forEach(result => console.log(`  ${result}`));

  // Mostrar todos los mapeos activos
  console.log('\n👥 Mapeos activos en el sistema:');
  const allMappings = await prisma.employeeMapping.findMany({
    where: { is_active: true },
    orderBy: { employee_number: 'asc' }
  });

  allMappings.forEach(mapping => {
    console.log(`  ${mapping.employee_number}: ${mapping.full_name} (${mapping.email})`);
  });

  console.log('\n🎉 Actualización completada exitosamente');
}

updateEmployeeMappings()
  .catch(e => {
    console.error('❌ Error general:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
