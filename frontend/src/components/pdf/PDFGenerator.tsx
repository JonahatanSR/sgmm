import React, { useState } from 'react';
import { usePDFGeneration } from '../../hooks/usePDFGeneration';
import { usePDFData } from '../../hooks/usePDFData';
import PDFTemplate from './PDFTemplate';
import type { PDFGenerationOptions } from '../../types/pdf.types';

interface PDFGeneratorProps {
  employeeId: string;
  onGenerate?: (result: any) => void;
  onError?: (error: any) => void;
  className?: string;
  showPreview?: boolean;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  employeeId,
  onGenerate,
  onError,
  className = '',
  showPreview = false
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<Partial<PDFGenerationOptions>>({
    includeSignature: true,
    includeCompanyLogo: false,
    includeAuditInfo: true
  });

  // Hooks
  const { data: pdfData, isLoading: isLoadingData, error: dataError } = usePDFData(employeeId);
  const { generatePDF, isGenerating, lastResult, error, clearError } = usePDFGeneration();

  const handleGenerate = async () => {
    if (!pdfData) return;

    try {
      clearError();
      const result = await generatePDF(pdfData, generationOptions);
      
      if (result.success) {
        onGenerate?.(result);
      } else {
        onError?.(result);
      }
    } catch (err) {
      onError?.(err);
    }
  };

  const handlePreview = () => {
    if (pdfData) {
      setIsPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  if (dataError) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800">Error cargando datos para el PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles de generación */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || isLoadingData || !pdfData}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoadingData ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando datos...
            </>
          ) : isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar PDF
            </>
          )}
        </button>

        {showPreview && pdfData && (
          <button
            onClick={handlePreview}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Vista Previa
          </button>
        )}
      </div>

      {/* Opciones de generación */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Opciones de generación</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={generationOptions.includeSignature}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, includeSignature: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Incluir sección de firma</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={generationOptions.includeCompanyLogo}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, includeCompanyLogo: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Incluir logo de la compañía</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={generationOptions.includeAuditInfo}
              onChange={(e) => setGenerationOptions(prev => ({ ...prev, includeAuditInfo: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Incluir información de auditoría</span>
          </label>
        </div>
      </div>

      {/* Estado de la última generación */}
      {lastResult && (
        <div className={`p-3 rounded-md ${
          lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {lastResult.success ? (
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={lastResult.success ? 'text-green-800' : 'text-red-800'}>
              {lastResult.success 
                ? `PDF generado exitosamente: ${lastResult.filename}` 
                : `Error: ${lastResult.error}`
              }
            </span>
          </div>
        </div>
      )}

      {/* Error de generación */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">Error: {error.message}</span>
          </div>
        </div>
      )}

      {/* Modal de vista previa */}
      {isPreviewOpen && pdfData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Vista Previa del PDF</h3>
              <button
                onClick={handleClosePreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <PDFTemplate data={pdfData} className="preview" />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleClosePreview();
                  handleGenerate();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFGenerator;
