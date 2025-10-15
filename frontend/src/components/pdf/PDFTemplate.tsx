import React from 'react';
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
import './PDFTemplate.css';

interface PDFTemplateProps {
  data: PDFCollaboratorData;
  className?: string;
}

export const PDFTemplate: React.FC<PDFTemplateProps> = ({ data, className = '' }) => {

  return (
    <div 
      className={`pdf-template ${className}`}
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '11px',
        lineHeight: '1.4',
        color: '#2c3e50',
        background: '#fff',
        width: '816px',
        minHeight: '1056px',
        margin: '0 auto',
        padding: '25px',
        position: 'relative',
        border: '1px solid #e0e0e0',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}
    >
      {/* Encabezado */}
      <div 
        className="header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          padding: '18px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '2px solid #3498db',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(52, 152, 219, 0.15)'
        }}
      >
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
      <div 
        className="employee-section"
        style={{
          marginBottom: '25px',
          padding: '20px',
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <h2 
          className="section-title"
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#e74c3c',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '3px solid #e74c3c',
            textAlign: 'center',
            background: '#f8f9fa',
            padding: '10px',
            borderRadius: '5px'
          }}
        >
          🚀 INFORMACIÓN DEL COLABORADOR - HOT RELOAD FUNCIONANDO 🚀
        </h2>
        
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

      {/* Información de Dependientes - DISEÑO PROFESIONAL */}
      <div className="dependents-section">
        <h2 className="section-title">DEPENDIENTES REGISTRADOS</h2>
        
        <div style={{ 
          background: '#ffffff', 
          padding: '15px', 
          border: '1px solid #bdc3c7', 
          borderRadius: '4px',
          marginBottom: '15px',
          fontSize: '12px',
          color: '#2c3e50'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#2c3e50' }}>
                Total de dependientes registrados: <span style={{ color: '#3498db', fontSize: '14px' }}>{data.dependents.length}</span>
              </strong>
            </div>
            <div style={{ fontSize: '10px', color: '#7f8c8d' }}>
              Generado el: {formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>

        {data.dependents.length > 0 ? (
          <table 
            className="dependents-table" 
            id="dependents-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '15px',
              fontSize: '10px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderRadius: '6px',
              overflow: 'hidden'
            }}
          >
            <thead>
              <tr>
                <th style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  color: 'white',
                  padding: '12px 10px',
                  textAlign: 'center',
                  border: '1px solid #2c3e50',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>ID Dependiente</th>
                <th style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  color: 'white',
                  padding: '12px 10px',
                  textAlign: 'center',
                  border: '1px solid #2c3e50',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>Nombre Completo</th>
                <th style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  color: 'white',
                  padding: '12px 10px',
                  textAlign: 'center',
                  border: '1px solid #2c3e50',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>Fecha de Nacimiento</th>
                <th style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  color: 'white',
                  padding: '12px 10px',
                  textAlign: 'center',
                  border: '1px solid #2c3e50',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>Edad</th>
                <th style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  color: 'white',
                  padding: '12px 10px',
                  textAlign: 'center',
                  border: '1px solid #2c3e50',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>Género</th>
                <th style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  color: 'white',
                  padding: '12px 10px',
                  textAlign: 'center',
                  border: '1px solid #2c3e50',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>Parentesco</th>
                <th style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  color: 'white',
                  padding: '12px 10px',
                  textAlign: 'center',
                  border: '1px solid #2c3e50',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>Estado</th>
              </tr>
            </thead>
            <tbody id="dependents-tbody">
              {data.dependents.map((dependent) => {
                const relationshipType = data.relationshipTypes.find(rt => rt.id === dependent.relationship_type_id);
                const relationshipName = relationshipType?.name || 'Desconocido';
                
                return (
                  <tr 
                    key={dependent.id}
                    style={{
                      background: '#ffffff',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    <td style={{ 
                      fontWeight: 'bold', 
                      color: '#2c3e50',
                      padding: '12px 10px',
                      border: '1px solid #bdc3c7',
                      textAlign: 'center'
                    }}>
                      {formatDependentId(dependent.dependent_id || dependent.id)}
                    </td>
                    <td style={{ 
                      textAlign: 'left', 
                      paddingLeft: '15px',
                      padding: '12px 10px',
                      border: '1px solid #bdc3c7'
                    }}>
                      {formatFullName(dependent.first_name, dependent.paternal_last_name, dependent.maternal_last_name)}
                    </td>
                    <td style={{
                      padding: '12px 10px',
                      border: '1px solid #bdc3c7',
                      textAlign: 'center'
                    }}>{formatDate(dependent.birth_date)}</td>
                    <td style={{ 
                      fontWeight: 'bold', 
                      color: '#3498db',
                      padding: '12px 10px',
                      border: '1px solid #bdc3c7',
                      textAlign: 'center'
                    }}>
                      {calculateAge(dependent.birth_date)} años
                    </td>
                    <td style={{
                      padding: '12px 10px',
                      border: '1px solid #bdc3c7',
                      textAlign: 'center'
                    }}>{formatGender(dependent.gender)}</td>
                    <td style={{ 
                      fontWeight: '500',
                      padding: '12px 10px',
                      border: '1px solid #bdc3c7',
                      textAlign: 'center'
                    }}>{relationshipName}</td>
                    <td style={{
                      padding: '12px 10px',
                      border: '1px solid #bdc3c7',
                      textAlign: 'center'
                    }}>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: dependent.status === 'ACTIVE' ? '#27ae60' : '#e74c3c',
                        background: dependent.status === 'ACTIVE' ? '#d5f4e6' : '#fadbd8'
                      }}>
                        {formatStatus(dependent.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            background: '#f8f9fa', 
            border: '2px dashed #bdc3c7',
            borderRadius: '6px',
            color: '#7f8c8d',
            fontSize: '12px'
          }}>
            <strong>No hay dependientes registrados</strong>
            <br />
            <span style={{ fontSize: '10px' }}>El colaborador no tiene dependientes en el sistema</span>
          </div>
        )}
      </div>

      {/* Sección de Firma - DISEÑO PROFESIONAL */}
      <div 
        className="signature-section"
        style={{
          marginTop: '30px',
          padding: '25px',
          background: '#f8f9fa',
          border: '2px solid #3498db',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <h2 
          className="section-title"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solid #3498db'
          }}
        >
          ACEPTACIÓN Y FIRMA
        </h2>
        
        <div style={{ 
          background: '#ffffff', 
          padding: '15px', 
          border: '1px solid #bdc3c7', 
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '11px',
          lineHeight: '1.5',
          color: '#2c3e50'
        }}>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            DECLARACIÓN DE VERACIDAD:
          </p>
          <p style={{ marginBottom: '8px' }}>
            Por medio de la presente, confirmo bajo protesta de decir verdad que la información 
            aquí contenida es veraz, completa y actualizada.
          </p>
          <p style={{ marginBottom: '8px' }}>
            Autorizo el uso de estos datos para los fines del sistema de gestión de seguros médicos 
            y acepto las condiciones establecidas en el aviso de privacidad.
          </p>
          <p style={{ fontWeight: 'bold', color: '#e74c3c' }}>
            La falsedad en la información proporcionada será motivo de responsabilidad legal.
          </p>
        </div>

        <div 
          className="signature-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px'
          }}
        >
          <div 
            className="signature-field"
            style={{
              textAlign: 'center',
              padding: '15px',
              background: '#ffffff',
              border: '1px solid #bdc3c7',
              borderRadius: '4px'
            }}
          >
            <div 
              className="signature-line"
              style={{
                height: '40px',
                borderBottom: '2px solid #2c3e50',
                marginBottom: '8px'
              }}
            ></div>
            <div 
              className="signature-label"
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}
            >
              Firma del Colaborador
            </div>
          </div>
          <div 
            className="signature-field"
            style={{
              textAlign: 'center',
              padding: '15px',
              background: '#ffffff',
              border: '1px solid #bdc3c7',
              borderRadius: '4px'
            }}
          >
            <div 
              className="signature-line"
              style={{
                height: '40px',
                borderBottom: '2px solid #2c3e50',
                marginBottom: '8px'
              }}
            ></div>
            <div 
              className="signature-label"
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}
            >
              Fecha de Firma
            </div>
          </div>
        </div>

        <div 
          className="signature-grid" 
          style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px'
          }}
        >
          <div 
            className="signature-field"
            style={{
              textAlign: 'center',
              padding: '15px',
              background: '#ffffff',
              border: '1px solid #bdc3c7',
              borderRadius: '4px'
            }}
          >
            <div 
              className="signature-line"
              style={{
                height: '40px',
                borderBottom: '2px solid #2c3e50',
                marginBottom: '8px'
              }}
            ></div>
            <div 
              className="signature-label"
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}
            >
              Nombre Completo
            </div>
          </div>
          <div 
            className="signature-field"
            style={{
              textAlign: 'center',
              padding: '15px',
              background: '#ffffff',
              border: '1px solid #bdc3c7',
              borderRadius: '4px'
            }}
          >
            <div 
              className="signature-line"
              style={{
                height: '40px',
                borderBottom: '2px solid #2c3e50',
                marginBottom: '8px'
              }}
            ></div>
            <div 
              className="signature-label"
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}
            >
              Número de Empleado
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '25px', 
          padding: '10px', 
          background: '#e8f4f8', 
          border: '1px solid #3498db',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#2c3e50',
          textAlign: 'center'
        }}>
          <strong>IMPORTANTE:</strong> Este documento debe ser firmado y entregado al departamento de Recursos Humanos 
          dentro de los 5 días hábiles siguientes a su generación.
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
