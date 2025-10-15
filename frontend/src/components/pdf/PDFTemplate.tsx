import React, { useEffect, useRef } from 'react';
import type { PDFCollaboratorData } from '../../types/pdf.types';
import { 
  formatDate, 
  calculateAge, 
  formatGender, 
  formatStatus, 
  formatFullName,
  formatEmployeeId,
  formatDependentId
} from '../../utils/pdf.utils';

interface PDFTemplateProps {
  data: PDFCollaboratorData;
  className?: string;
}

export const PDFTemplate: React.FC<PDFTemplateProps> = ({ data, className = '' }) => {
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (templateRef.current && data) {
      populateTemplate(data);
    }
  }, [data]);

  const populateTemplate = (data: PDFCollaboratorData) => {
    if (!templateRef.current) return;

    // Datos del empleado
    const employee = data.employee;
    const company = data.company;
    const dependents = data.dependents || [];
    const relationshipTypes = data.relationshipTypes || [];

    // Actualizar datos del empleado
    updateElement('employee-number', formatEmployeeId(employee.id));
    updateElement('employee-full-name', employee.full_name);
    updateElement('employee-email', employee.email);
    updateElement('employee-birth-date', formatDate(employee.birth_date || ''));
    updateElement('employee-age', `${calculateAge(employee.birth_date || '')} años`);
    updateElement('employee-gender', formatGender(employee.gender || 'M'));
    updateElement('employee-hire-date', formatDate(employee.hire_date));
    updateElement('employee-department', employee.department || '');
    updateElement('employee-position', employee.position || '');
    updateElement('employee-policy-number', employee.policy_number || '');

    // Actualizar datos de la compañía
    updateElement('company-name', company.name);
    updateElement('company-code', `Código: ${company.code}`);

    // Actualizar fecha de generación
    const now = new Date();
    const dateStr = formatDate(now.toISOString());
    updateElement('generation-date', dateStr);
    updateElement('footer-date', dateStr);

    // Actualizar dependientes
    updateElement('dependents-total', dependents.length.toString());
    updateDependentsTable(dependents, relationshipTypes);
  };

  const updateElement = (id: string, value: string) => {
    const element = templateRef.current?.querySelector(`#${id}`);
    if (element) {
      element.textContent = value;
    }
  };

  const updateDependentsTable = (dependents: any[], relationshipTypes: any[]) => {
    const tbody = templateRef.current?.querySelector('#dependents-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    dependents.forEach(dependent => {
      const row = document.createElement('tr');
      
      const relationshipType = relationshipTypes.find(rt => rt.id === dependent.relationship_type_id);
      const relationshipName = relationshipType?.name || 'Desconocido';
      
      row.innerHTML = `
        <td>${formatDependentId(dependent.dependent_id || dependent.id)}</td>
        <td>${formatFullName(dependent.first_name, dependent.paternal_last_name, dependent.maternal_last_name)}</td>
        <td>${formatDate(dependent.birth_date)}</td>
        <td>${calculateAge(dependent.birth_date)} años</td>
        <td>${formatGender(dependent.gender)}</td>
        <td>${relationshipName}</td>
        <td>${formatStatus(dependent.status)}</td>
      `;
      tbody.appendChild(row);
    });
  };

  return (
    <div className={`pdf-template ${className}`} ref={templateRef}>
      {/* Encabezado */}
      <div className="header">
        <div className="logo-section">
          <div className="logo">
            {data.company.logo_url ? (
              <img 
                src={data.company.logo_url} 
                alt="Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              'LOGO'
            )}
          </div>
          <div className="company-info">
            <h1 id="company-name">{data.company.name}</h1>
            <p id="company-code">Código: {data.company.code}</p>
          </div>
        </div>
        <div className="generation-info">
          <p>Generado el: <span id="generation-date">{formatDate(new Date().toISOString())}</span></p>
          <p>Por: <span id="generated-by">Sistema SGMM</span></p>
        </div>
      </div>

      {/* Información del Colaborador */}
      <div className="employee-section">
        <h2 className="section-title">INFORMACIÓN DEL COLABORADOR</h2>
        
        <div className="employee-grid">
          <div className="field-group">
            <span className="field-label">Número de Empleado</span>
            <div className="field-value" id="employee-number">
              {formatEmployeeId(data.employee.id)}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Nombre Completo</span>
            <div className="field-value" id="employee-full-name">
              {data.employee.full_name}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Email Corporativo</span>
            <div className="field-value" id="employee-email">
              {data.employee.email}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Fecha de Nacimiento</span>
            <div className="field-value" id="employee-birth-date">
              {formatDate(data.employee.birth_date || '')}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Edad</span>
            <div className="field-value" id="employee-age">
              {calculateAge(data.employee.birth_date || '')} años
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Género</span>
            <div className="field-value" id="employee-gender">
              {formatGender(data.employee.gender || 'M')}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Fecha de Ingreso</span>
            <div className="field-value" id="employee-hire-date">
              {formatDate(data.employee.hire_date)}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Departamento</span>
            <div className="field-value" id="employee-department">
              {data.employee.department || ''}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Posición</span>
            <div className="field-value" id="employee-position">
              {data.employee.position || ''}
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">Número de Póliza</span>
            <div className="field-value" id="employee-policy-number">
              {data.employee.policy_number || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Información de Dependientes */}
      <div className="dependents-section">
        <h2 className="section-title">DEPENDIENTES REGISTRADOS</h2>
        
        <div className="mb-2">
          <strong>Total de dependientes: <span id="dependents-total">{data.dependents.length}</span></strong>
        </div>

        <table className="dependents-table" id="dependents-table">
          <thead>
            <tr>
              <th>ID Dependiente</th>
              <th>Nombre Completo</th>
              <th>Fecha de Nacimiento</th>
              <th>Edad</th>
              <th>Género</th>
              <th>Parentesco</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="dependents-tbody">
            {data.dependents.map((dependent) => {
              const relationshipType = data.relationshipTypes.find(rt => rt.id === dependent.relationship_type_id);
              const relationshipName = relationshipType?.name || 'Desconocido';
              
              return (
                <tr key={dependent.id}>
                  <td>{formatDependentId(dependent.dependent_id || dependent.id)}</td>
                  <td>{formatFullName(dependent.first_name, dependent.paternal_last_name, dependent.maternal_last_name)}</td>
                  <td>{formatDate(dependent.birth_date)}</td>
                  <td>{calculateAge(dependent.birth_date)} años</td>
                  <td>{formatGender(dependent.gender)}</td>
                  <td>{relationshipName}</td>
                  <td>{formatStatus(dependent.status)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sección de Firma */}
      <div className="signature-section">
        <h2 className="section-title">ACEPTACIÓN Y FIRMA</h2>
        
        <p className="text-sm mb-2">
          Por medio de la presente, confirmo que la información aquí contenida es veraz y completa, 
          y autorizo el uso de estos datos para los fines del sistema de gestión de seguros médicos.
        </p>

        <div className="signature-grid">
          <div className="signature-field">
            <div className="signature-line"></div>
            <div className="signature-label">Firma del Colaborador</div>
          </div>
          <div className="signature-field">
            <div className="signature-line"></div>
            <div className="signature-label">Fecha</div>
          </div>
        </div>

        <div className="signature-grid mt-2">
          <div className="signature-field">
            <div className="signature-line"></div>
            <div className="signature-label">Nombre Completo</div>
          </div>
          <div className="signature-field">
            <div className="signature-line"></div>
            <div className="signature-label">Número de Empleado</div>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="footer">
        <p>
          Sistema de Gestión de Seguros Médicos (SGMM) - 
          Generado automáticamente el <span id="footer-date">{formatDate(new Date().toISOString())}</span> - 
          Página 1 de 1
        </p>
      </div>
    </div>
  );
};

export default PDFTemplate;
