import React from 'react';
import type { PDFGenerationOptions } from '../../types/pdf.types';

interface PDFOptionsProps {
  options: Partial<PDFGenerationOptions>;
  onChange: (options: Partial<PDFGenerationOptions>) => void;
  className?: string;
}

export const PDFOptions: React.FC<PDFOptionsProps> = ({
  options,
  onChange,
  className = ''
}) => {
  const handleOptionChange = (key: keyof PDFGenerationOptions, value: boolean) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-md ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Opciones de generación</h4>
      
      <div className="space-y-3">
        {/* Incluir firma */}
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={options.includeSignature ?? true}
            onChange={(e) => handleOptionChange('includeSignature', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">Incluir sección de firma</span>
            <p className="text-xs text-gray-500">Agrega una sección para firma del colaborador</p>
          </div>
        </label>

        {/* Incluir logo */}
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={options.includeCompanyLogo ?? false}
            onChange={(e) => handleOptionChange('includeCompanyLogo', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">Incluir logo de la compañía</span>
            <p className="text-xs text-gray-500">Agrega el logo corporativo en el encabezado</p>
          </div>
        </label>

        {/* Incluir auditoría */}
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={options.includeAuditInfo ?? true}
            onChange={(e) => handleOptionChange('includeAuditInfo', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">Incluir información de auditoría</span>
            <p className="text-xs text-gray-500">Agrega metadatos de generación y auditoría</p>
          </div>
        </label>
      </div>

      {/* Formato del archivo */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formato del archivo
        </label>
        <select
          value={options.format ?? 'letter'}
          onChange={(e) => onChange({ ...options, format: e.target.value as 'letter' | 'a4' })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="letter">Carta (8.5" x 11")</option>
          <option value="a4">A4 (210mm x 297mm)</option>
        </select>
      </div>

      {/* Orientación */}
      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Orientación
        </label>
        <select
          value={options.orientation ?? 'portrait'}
          onChange={(e) => onChange({ ...options, orientation: e.target.value as 'portrait' | 'landscape' })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="portrait">Vertical</option>
          <option value="landscape">Horizontal</option>
        </select>
      </div>
    </div>
  );
};

export default PDFOptions;
