#!/usr/bin/env node

/**
 * Script interactivo para agregar mapeos de empleados
 * 
 * Uso:
 * node scripts/add-employee-mapping.js
 * 
 * Este script permite agregar usuarios de manera interactiva
 * sin hardcodear datos
 */

const readline = require('readline');
const { getPrismaClient } = require('../dist/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function addEmployeeMapping() {
  const prisma = getPrismaClient();
  
  try {
    console.log('👤 Agregar nuevo mapeo de empleado\n');
    
    // Solicitar datos del empleado
    const email = await askQuestion('📧 Email del empleado: ');
    if (!email || !email.includes('@')) {
      console.log('❌ Email inválido');
      return;
    }
    
    const employeeNumber = await askQuestion('🔢 Número de empleado: ');
    if (!employeeNumber) {
      console.log('❌ Número de empleado requerido');
      return;
    }
    
    const fullName = await askQuestion('👤 Nombre completo: ');
    const department = await askQuestion('🏢 Departamento (opcional): ');
    const position = await askQuestion('💼 Posición (opcional): ');
    
    // Confirmar datos
    console.log('\n📋 Datos a agregar:');
    console.log(`  Email: ${email}`);
    console.log(`  Número: ${employeeNumber}`);
    console.log(`  Nombre: ${fullName}`);
    console.log(`  Departamento: ${department || 'No especificado'}`);
    console.log(`  Posición: ${position || 'No especificada'}`);
    
    const confirm = await askQuestion('\n¿Confirmar? (s/n): ');
    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si') {
      console.log('❌ Operación cancelada');
      return;
    }
    
    // Verificar si ya existe
    const existing = await prisma.$queryRaw`
      SELECT id FROM employee_mappings 
      WHERE email = ${email}
    `;
    
    if (existing.length > 0) {
      console.log('⚠️  Mapeo ya existe, actualizando...');
      
      await prisma.$queryRaw`
        UPDATE employee_mappings 
        SET 
          employee_number = ${employeeNumber},
          full_name = ${fullName},
          department = ${department || ''},
          position = ${position || ''},
          is_active = true,
          updated_at = NOW()
        WHERE email = ${email}
      `;
      
      console.log('✅ Mapeo actualizado exitosamente');
    } else {
      await prisma.$queryRaw`
        INSERT INTO employee_mappings (email, employee_number, full_name, department, position, is_active)
        VALUES (${email}, ${employeeNumber}, ${fullName}, ${department || ''}, ${position || ''}, true)
      `;
      
      console.log('✅ Mapeo creado exitosamente');
    }
    
    // Mostrar mapeos actuales
    console.log('\n📋 Mapeos actuales:');
    const mappings = await prisma.$queryRaw`
      SELECT email, employee_number, full_name, department, position 
      FROM employee_mappings 
      WHERE is_active = true 
      ORDER BY employee_number
    `;
    
    mappings.forEach(mapping => {
      console.log(`  ${mapping.employee_number}: ${mapping.full_name} (${mapping.email}) - ${mapping.department}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addEmployeeMapping()
    .then(() => {
      console.log('\n🎉 Operación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { addEmployeeMapping };
