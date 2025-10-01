import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Relationship Types
  console.log('📋 Seeding relationship types...');
  const relationshipTypes = [
    { id: 1, name: 'Cónyuge', display_order: 1 },
    { id: 2, name: 'Hijo', display_order: 2 },
    { id: 3, name: 'Hija', display_order: 3 },
    { id: 4, name: 'Padre', display_order: 4 },
    { id: 5, name: 'Madre', display_order: 5 },
  ];

  for (const type of relationshipTypes) {
    await prisma.relationshipType.upsert({
      where: { id: type.id },
      update: {},
      create: type,
    });
  }

  // Seed Companies
  console.log('🏢 Seeding companies...');
  const companies = [
    {
      id: 'company-sr-001',
      name: 'Siegfried Rhein',
      code: 'SR',
      primary_color: '#1f2937',
      secondary_color: '#374151',
      accent_color: '#3b82f6',
      neutral_color: '#6b7280',
      font_primary: 'Arial',
      font_secondary: 'Arial',
    },
    {
      id: 'company-wp-001',
      name: 'Weser Pharma',
      code: 'WP',
      primary_color: '#059669',
      secondary_color: '#047857',
      accent_color: '#10b981',
      neutral_color: '#6b7280',
      font_primary: 'Arial',
      font_secondary: 'Arial',
    },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {},
      create: company,
    });
  }

  // Seed System Configuration
  console.log('⚙️ Seeding system configuration...');
  const systemConfigs = [
    {
      key: 'renewal_deadline',
      value: '2024-11-30',
      description: 'Fecha límite para renovación SGMM',
      value_type: 'DATE' as const,
      updatable_by_role: 'SUPER_ADMIN' as const,
      updated_by: 'system',
    },
    {
      key: 'max_file_size',
      value: '5242880',
      description: 'Tamaño máximo de archivo en bytes (5MB)',
      value_type: 'NUMBER' as const,
      updatable_by_role: 'SUPER_ADMIN' as const,
      updated_by: 'system',
    },
    {
      key: 'max_dependents',
      value: '10',
      description: 'Número máximo de dependientes por empleado',
      value_type: 'NUMBER' as const,
      updatable_by_role: 'HR_ADMIN' as const,
      updated_by: 'system',
    },
    {
      key: 'email_notifications_enabled',
      value: 'true',
      description: 'Habilitar notificaciones por email',
      value_type: 'BOOLEAN' as const,
      updatable_by_role: 'HR_ADMIN' as const,
      updated_by: 'system',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  // Seed Sample Admin User (Super Admin)
  console.log('👤 Seeding admin users...');
  await prisma.adminUser.upsert({
    where: { email: 'admin@segfried.com.mx' },
    update: {},
    create: {
      email: 'admin@segfried.com.mx',
      role: 'SUPER_ADMIN',
      company_id: null, // Super admin no está asociado a una compañía específica
      active: true,
      created_by: 'system',
    },
  });

  // Seed HR Admins for each company
  await prisma.adminUser.upsert({
    where: { email: 'hr@siegfried.com.mx' },
    update: {},
    create: {
      email: 'hr@siegfried.com.mx',
      role: 'HR_ADMIN',
      company_id: 'company-sr-001',
      active: true,
      created_by: 'system',
    },
  });

  await prisma.adminUser.upsert({
    where: { email: 'hr@weser.com.mx' },
    update: {},
    create: {
      email: 'hr@weser.com.mx',
      role: 'HR_ADMIN',
      company_id: 'company-wp-001',
      active: true,
      created_by: 'system',
    },
  });

  // Seed Sample Employee (for testing)
  console.log('👥 Seeding sample employee...');
  const employee = await prisma.employee.upsert({
    where: { email: 'test.employee@siegfried.com.mx' },
    update: {},
    create: {
      employee_number: 'SR-001',
      email: 'test.employee@siegfried.com.mx',
      full_name: 'Juan Pérez García',
      first_name: 'Juan',
      paternal_last_name: 'Pérez',
      maternal_last_name: 'García',
      birth_date: new Date('1985-06-15'),
      gender: 'M',
      hire_date: new Date('2020-01-15'),
      company_id: 'company-sr-001',
      department: 'IT',
      position: 'Desarrollador Senior',
      org_unit_path: '/IT/Development',
      policy_number: 'POL-SR-001',
      status: 'ACTIVE',
    },
  });

  // Seed sample dependents (one ACTIVE, one INACTIVE)
  console.log('👨‍👩‍👧 Seeding sample dependents...');
  const depActive = await prisma.dependent.upsert({
    where: { id: 'seed-dep-active' },
    update: {},
    create: {
      id: 'seed-dep-active',
      employee_id: employee.id,
      first_name: 'Ana',
      paternal_last_name: 'Pérez',
      maternal_last_name: 'Lopez',
      birth_date: new Date('2015-01-01'),
      gender: 'F',
      relationship_type_id: 2,
      policy_start_date: new Date('2022-01-01'),
      status: 'ACTIVE',
    },
  });

  const depInactive = await prisma.dependent.upsert({
    where: { id: 'seed-dep-inactive' },
    update: {},
    create: {
      id: 'seed-dep-inactive',
      employee_id: employee.id,
      first_name: 'Luis',
      paternal_last_name: 'Pérez',
      maternal_last_name: 'Lopez',
      birth_date: new Date('2012-01-01'),
      gender: 'M',
      relationship_type_id: 2,
      policy_start_date: new Date('2021-01-01'),
      policy_end_date: new Date('2023-01-01'),
      status: 'INACTIVE',
    },
  });

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



