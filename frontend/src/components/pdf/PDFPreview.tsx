import React from 'react';
import PDFTemplate from './PDFTemplate';
import type { PDFCollaboratorData } from '../../types/pdf.types';

interface PDFPreviewProps {
  data: PDFCollaboratorData;
  onClose?: () => void;
  onGenerate?: () => void;
  className?: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  data,
  onClose,
  onGenerate,
  className = ''
}) => {
  return (
    <div className={`pdf-preview ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Vista Previa del PDF</h3>
        <div className="flex gap-2">
          {onGenerate && (
            <button
              onClick={onGenerate}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar PDF
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
        <PDFTemplate data={data} className="preview" />
      </div>
    </div>
  );
};

export default PDFPreview;
