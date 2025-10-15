-- Migración para crear vistas SQL optimizadas para reportes
-- Fecha: 2025-01-15
-- Descripción: Crear vistas SQL para reportes de aseguradora y deducciones de nómina

-- Vista consolidada de empleados con información completa
CREATE OR REPLACE VIEW "v_employees_consolidated" AS
SELECT 
    e.id,
    e.employee_number,
    e.email,
    e.full_name,
    e.first_name,
    e.paternal_last_name,
    e.maternal_last_name,
    e.birth_date,
    e.gender,
    EXTRACT(YEAR FROM AGE(e.birth_date)) AS calculated_age,
    e.hire_date,
    e.company_id,
    c.name AS company_name,
    c.code AS company_code,
    e.department,
    e.position,
    e.policy_number,
    e.status,
    e.last_login,
    e.login_count,
    e.created_at,
    e.updated_at,
    COUNT(d.id) FILTER (WHERE d.status = 'ACTIVE') AS active_dependents_count,
    COUNT(d.id) FILTER (WHERE d.status = 'INACTIVE') AS inactive_dependents_count,
    COUNT(d.id) AS total_dependents_count
FROM employees e
LEFT JOIN companies c ON e.company_id = c.id
LEFT JOIN dependents d ON e.id = d.employee_id
WHERE e.status = 'ACTIVE'
GROUP BY e.id, c.name, c.code;

-- Vista para reporte de aseguradora
CREATE OR REPLACE VIEW "v_insurer_report" AS
SELECT 
    e.employee_number AS collaborator_id,
    e.paternal_last_name,
    e.maternal_last_name,
    e.first_name,
    e.birth_date,
    e.gender,
    EXTRACT(YEAR FROM AGE(e.birth_date)) AS calculated_age,
    'TITULAR' AS relationship_type,
    e.employee_number || '-' || 'TITULAR' AS compound_id
FROM employees e
WHERE e.status = 'ACTIVE'

UNION ALL

SELECT 
    e.employee_number AS collaborator_id,
    d.paternal_last_name,
    d.maternal_last_name,
    d.first_name,
    d.birth_date,
    d.gender,
    EXTRACT(YEAR FROM AGE(d.birth_date)) AS calculated_age,
    rt.name AS relationship_type,
    e.employee_number || '-' || d.dependent_id AS compound_id
FROM employees e
JOIN dependents d ON e.id = d.employee_id
JOIN relationship_types rt ON d.relationship_type_id = rt.id
WHERE e.status = 'ACTIVE' 
  AND d.status = 'ACTIVE';

-- Vista para reporte de deducciones de nómina (solo empleados con 2+ dependientes)
CREATE OR REPLACE VIEW "v_payroll_deductions" AS
SELECT 
    e.employee_number AS collaborator_id,
    e.paternal_last_name,
    e.maternal_last_name,
    e.first_name,
    e.email,
    COUNT(d.id) AS total_dependents,
    (COUNT(d.id) - 1) AS extra_dependents, -- El primer dependiente es gratis
    CASE 
        WHEN COUNT(d.id) >= 2 THEN (COUNT(d.id) - 1) * 400.00 -- $400 por dependiente extra
        ELSE 0.00
    END AS monthly_deduction
FROM employees e
JOIN dependents d ON e.id = d.employee_id
WHERE e.status = 'ACTIVE' 
  AND d.status = 'ACTIVE'
GROUP BY e.id, e.employee_number, e.paternal_last_name, e.maternal_last_name, e.first_name, e.email
HAVING COUNT(d.id) >= 2; -- Solo empleados con 2 o más dependientes

-- Agregar comentarios para documentación
COMMENT ON VIEW "v_employees_consolidated" IS 'Vista consolidada con información completa de empleados y conteo de dependientes';
COMMENT ON VIEW "v_insurer_report" IS 'Vista optimizada para reportes de aseguradora con IDs compuestos';
COMMENT ON VIEW "v_payroll_deductions" IS 'Vista para reportes de deducciones de nómina (solo empleados con 2+ dependientes)';