import React, { useState } from 'react';
import { PDFTemplate } from '../components/pdf/PDFTemplate';
import type { PDFCollaboratorData } from '../types/pdf.types';

// Datos de ejemplo para mostrar el nuevo diseño
const sampleData: PDFCollaboratorData = {
  employee: {
    id: '3619',
    google_id: undefined,
    email: 'jonahatan.angeles@siegfried.com.mx',
    full_name: 'Jonahatan Angeles Rosas',
    first_name: 'Jonahatan',
    paternal_last_name: 'Angeles',
    maternal_last_name: 'Rosas',
    birth_date: '1983-06-24T00:00:00.000Z',
    gender: 'M',
    hire_date: '2020-01-14T00:00:00.000Z',
    company_id: 'company-sr-001',
    department: 'Tecnología',
    position: 'Desarrollador Senior',
    policy_number: 'POL-3619-2024',
    status: 'ACTIVE',
    last_login: '2025-10-15T16:30:00.000Z',
    login_count: 15,
    last_ip_address: '192.168.1.100',
    last_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: '2020-01-14T00:00:00.000Z',
    updated_at: '2025-10-15T16:30:00.000Z'
  },
  dependents: [
    {
      id: 'dep-001',
      dependent_id: '3619-a01',
      employee_id: '3619',
      first_name: 'María',
      paternal_last_name: 'Angeles',
      maternal_last_name: 'González',
      birth_date: '1990-05-15T00:00:00.000Z',
      gender: 'F',
      relationship_type_id: '1',
      policy_start_date: '2020-01-14T00:00:00.000Z',
      policy_end_date: undefined,
      status: 'ACTIVE',
      created_by: '3619',
      created_at: '2020-01-14T00:00:00.000Z',
      updated_at: '2025-10-15T16:30:00.000Z',
      deleted_at: undefined
    },
    {
      id: 'dep-002',
      dependent_id: '3619-a02',
      employee_id: '3619',
      first_name: 'Carlos',
      paternal_last_name: 'Angeles',
      maternal_last_name: 'González',
      birth_date: '2015-08-20T00:00:00.000Z',
      gender: 'M',
      relationship_type_id: '2',
      policy_start_date: '2020-01-14T00:00:00.000Z',
      policy_end_date: undefined,
      status: 'ACTIVE',
      created_by: '3619',
      created_at: '2020-01-14T00:00:00.000Z',
      updated_at: '2025-10-15T16:30:00.000Z',
      deleted_at: undefined
    }
  ],
  relationshipTypes: [
    {
      id: '1',
      name: 'Cónyuge',
      description: 'Esposo o esposa',
      is_active: true,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Hijo',
      description: 'Hijo o hija',
      is_active: true,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z'
    }
  ],
  company: {
    id: 'company-sr-001',
    name: 'Siegfried Rhein',
    code: 'SR-001',
    logo_url: undefined,
    primary_color: '#3498db',
    secondary_color: '#2c3e50',
    contact_email: 'contacto@siegfried.com.mx',
    contact_phone: '+52 55 1234 5678',
    address: 'Av. Insurgentes Sur 1234, Ciudad de México',
    is_active: true,
    created_at: '2020-01-01T00:00:00.000Z',
    updated_at: '2020-01-01T00:00:00.000Z'
  },
  generatedAt: new Date().toISOString(),
  generatedBy: '3619'
};

export const PDFPreview: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real de generación de PDF
      console.log('PDF generado con nuevo diseño:', sampleData);
      
      alert('¡PDF generado exitosamente con el nuevo diseño profesional!');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error generando PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎨 Vista Previa del Nuevo Diseño PDF
          </h1>
          <p className="text-gray-600 mb-6">
            Esta es una vista previa del nuevo diseño profesional del PDF que se implementará en el sistema.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isGenerating ? 'Generando PDF...' : 'Generar PDF de Prueba'}
            </button>
            
            <a
              href="/collaborator/3619"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Volver al Sistema
            </a>
          </div>
        </div>

        {/* Vista previa del PDF */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              📄 Vista Previa del PDF - Nuevo Diseño Profesional
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Scroll para ver todo el contenido del PDF
            </p>
          </div>
          
          <div className="p-4 bg-gray-50">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <PDFTemplate data={sampleData} className="preview" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
