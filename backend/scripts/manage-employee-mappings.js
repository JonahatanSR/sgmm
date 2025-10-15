#!/usr/bin/env node

/**
 * Script para gestionar mapeos de empleados
 * 
 * Uso:
 * node scripts/manage-employee-mappings.js [comando]
 * 
 * Comandos disponibles:
 * - list: Listar todos los mapeos
 * - search <email>: Buscar mapeo por email
 * - deactivate <email>: Desactivar mapeo
 * - activate <email>: Activar mapeo
 */

const { getPrismaClient } = require('../dist/config/database');

async function listMappings() {
  const prisma = getPrismaClient();
  
  try {
    const mappings = await prisma.$queryRaw`
      SELECT email, employee_number, full_name, department, position, is_active, created_at
      FROM employee_mappings 
      ORDER BY employee_number
    `;
    
    console.log('📋 Mapeos de empleados:');
    console.log('='.repeat(80));
    
    mappings.forEach(mapping => {
      const status = mapping.is_active ? '✅ Activo' : '❌ Inactivo';
      console.log(`${mapping.employee_number}: ${mapping.full_name}`);
      console.log(`  Email: ${mapping.email}`);
      console.log(`  Departamento: ${mapping.department || 'No especificado'}`);
      console.log(`  Posición: ${mapping.position || 'No especificada'}`);
      console.log(`  Estado: ${status}`);
      console.log(`  Creado: ${new Date(mapping.created_at).toLocaleString()}`);
      console.log('-'.repeat(80));
    });
    
    console.log(`\n📊 Total: ${mappings.length} mapeos`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function searchMapping(email) {
  const prisma = getPrismaClient();
  
  try {
    const mapping = await prisma.$queryRaw`
      SELECT * FROM employee_mappings 
      WHERE email = ${email}
    `;
    
    if (mapping.length === 0) {
      console.log(`❌ No se encontró mapeo para ${email}`);
      return;
    }
    
    const m = mapping[0];
    console.log('🔍 Mapeo encontrado:');
    console.log(`  Email: ${m.email}`);
    console.log(`  Número: ${m.employee_number}`);
    console.log(`  Nombre: ${m.full_name}`);
    console.log(`  Departamento: ${m.department || 'No especificado'}`);
    console.log(`  Posición: ${m.position || 'No especificada'}`);
    console.log(`  Estado: ${m.is_active ? '✅ Activo' : '❌ Inactivo'}`);
    console.log(`  Creado: ${new Date(m.created_at).toLocaleString()}`);
    console.log(`  Actualizado: ${new Date(m.updated_at).toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function toggleMappingStatus(email, activate = true) {
  const prisma = getPrismaClient();
  
  try {
    const action = activate ? 'activar' : 'desactivar';
    const status = activate ? true : false;
    
    const result = await prisma.$queryRaw`
      UPDATE employee_mappings 
      SET is_active = ${status}, updated_at = NOW()
      WHERE email = ${email}
      RETURNING email, is_active
    `;
    
    if (result.length === 0) {
      console.log(`❌ No se encontró mapeo para ${email}`);
      return;
    }
    
    console.log(`✅ Mapeo ${action}do exitosamente para ${email}`);
    console.log(`  Estado actual: ${result[0].is_active ? '✅ Activo' : '❌ Inactivo'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function showHelp() {
  console.log('📖 Uso del script de gestión de mapeos:');
  console.log('');
  console.log('Comandos disponibles:');
  console.log('  list                    - Listar todos los mapeos');
  console.log('  search <email>          - Buscar mapeo por email');
  console.log('  activate <email>        - Activar mapeo');
  console.log('  deactivate <email>      - Desactivar mapeo');
  console.log('  help                    - Mostrar esta ayuda');
  console.log('');
  console.log('Ejemplos:');
  console.log('  node scripts/manage-employee-mappings.js list');
  console.log('  node scripts/manage-employee-mappings.js search jonahatan.angeles@siegfried.com.mx');
  console.log('  node scripts/manage-employee-mappings.js deactivate alondra.osornio@siegfried.com.mx');
}

async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  
  switch (command) {
    case 'list':
      await listMappings();
      break;
      
    case 'search':
      if (!arg1) {
        console.log('❌ Email requerido para búsqueda');
        return;
      }
      await searchMapping(arg1);
      break;
      
    case 'activate':
      if (!arg1) {
        console.log('❌ Email requerido para activación');
        return;
      }
      await toggleMappingStatus(arg1, true);
      break;
      
    case 'deactivate':
      if (!arg1) {
        console.log('❌ Email requerido para desactivación');
        return;
      }
      await toggleMappingStatus(arg1, false);
      break;
      
    case 'help':
    case '--help':
    case '-h':
      await showHelp();
      break;
      
    default:
      console.log('❌ Comando no reconocido');
      await showHelp();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { listMappings, searchMapping, toggleMappingStatus };
