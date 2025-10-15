#!/usr/bin/env node

/**
 * Script para cargar mapeos de empleados
 * 
 * Uso:
 * node scripts/load-employee-mappings.js
 * 
 * Este script permite cargar usuarios reales de manera no hardcodeada
 * en la tabla employee_mappings para pruebas de SAML
 */

const { getPrismaClient } = require('../dist/config/database');

// Datos de usuarios reales para pruebas
const EMPLOYEE_MAPPINGS = [
  {
    email: "jonahatan.angeles@siegfried.com.mx",
    employee_number: "3619",
    full_name: "Jonahatan Angeles Rosas",
    department: "IT",
    position: "Desarrollador Senior"
  },
  {
    email: "alondra.osornio@siegfried.com.mx",
    employee_number: "1234",
    full_name: "Alondra Yocelin Osornio Vega",
    department: "RH",
    position: "Analista de Recursos Humanos"
  },
  {
    email: "maria.gonzalez@siegfried.com.mx",
    employee_number: "5678",
    full_name: "María González López",
    department: "Contabilidad",
    position: "Contadora Senior"
  },
  {
    email: "carlos.martinez@siegfried.com.mx",
    employee_number: "9012",
    full_name: "Carlos Martínez Rodríguez",
    department: "Ventas",
    position: "Gerente de Ventas"
  },
  {
    email: "ana.hernandez@siegfried.com.mx",
    employee_number: "3456",
    full_name: "Ana Hernández García",
    department: "Producción",
    position: "Supervisora de Producción"
  }
];

async function loadEmployeeMappings() {
  const prisma = getPrismaClient();
  
  try {
    console.log('🚀 Iniciando carga de mapeos de empleados...');
    
    let success = 0;
    let errors = 0;
    
    for (const mapping of EMPLOYEE_MAPPINGS) {
      try {
        // Verificar si ya existe
        const existing = await prisma.$queryRaw`
          SELECT id FROM employee_mappings 
          WHERE email = ${mapping.email}
        `;
        
        if (existing.length > 0) {
          console.log(`⚠️  Mapeo ya existe para ${mapping.email}, actualizando...`);
          
          // Actualizar mapeo existente
          await prisma.$queryRaw`
            UPDATE employee_mappings 
            SET 
              employee_number = ${mapping.employee_number},
              full_name = ${mapping.full_name},
              department = ${mapping.department},
              position = ${mapping.position},
              is_active = true,
              updated_at = NOW()
            WHERE email = ${mapping.email}
          `;
          
          console.log(`✅ Mapeo actualizado: ${mapping.email} -> ${mapping.employee_number}`);
        } else {
          // Crear nuevo mapeo
          await prisma.$queryRaw`
            INSERT INTO employee_mappings (email, employee_number, full_name, department, position, is_active)
            VALUES (${mapping.email}, ${mapping.employee_number}, ${mapping.full_name}, ${mapping.department}, ${mapping.position}, true)
          `;
          
          console.log(`✅ Mapeo creado: ${mapping.email} -> ${mapping.employee_number}`);
        }
        
        success++;
        
      } catch (error) {
        console.error(`❌ Error procesando ${mapping.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Resumen de carga:');
    console.log(`✅ Exitosos: ${success}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📝 Total procesados: ${EMPLOYEE_MAPPINGS.length}`);
    
    // Mostrar mapeos cargados
    console.log('\n📋 Mapeos cargados:');
    const loadedMappings = await prisma.$queryRaw`
      SELECT email, employee_number, full_name, department, position 
      FROM employee_mappings 
      WHERE is_active = true 
      ORDER BY employee_number
    `;
    
    loadedMappings.forEach(mapping => {
      console.log(`  ${mapping.employee_number}: ${mapping.full_name} (${mapping.email}) - ${mapping.department}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  loadEmployeeMappings()
    .then(() => {
      console.log('\n🎉 Carga completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { loadEmployeeMappings, EMPLOYEE_MAPPINGS };
