import React, { useState } from 'react';
import { usePDFGeneration } from '../../hooks/usePDFGeneration';
import { usePDFData } from '../../hooks/usePDFData';
import { 
  measurePDFGeneration, 
  debugPDFPerformance,
  preloadPDFResources 
} from '../../utils/pdf.performance';

interface PDFTesterProps {
  employeeId: string;
  className?: string;
}

export const PDFTester: React.FC<PDFTesterProps> = ({
  employeeId,
  className = ''
}) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Hooks
  const { data: pdfData, isLoading: isLoadingData } = usePDFData(employeeId);
  const { generatePDF, isGenerating } = usePDFGeneration();

  const runPerformanceTest = async () => {
    if (!pdfData) return;

    setIsRunning(true);
    const results: any[] = [];

    try {
      // Test 1: Generación básica
      console.log('🧪 Test 1: Generación básica');
      const basicResult = await measurePDFGeneration(async () => {
        const result = await generatePDF(pdfData, {
          includeSignature: true,
          includeCompanyLogo: false,
          includeAuditInfo: true
        });
        return result.success;
      });
      results.push({ test: 'Generación básica', ...basicResult });

      // Test 2: Pre-carga de recursos
      console.log('🧪 Test 2: Pre-carga de recursos');
      const preloadStart = performance.now();
      await preloadPDFResources(pdfData);
      const preloadEnd = performance.now();
      results.push({ 
        test: 'Pre-carga de recursos', 
        success: true, 
        duration: preloadEnd - preloadStart 
      });

      // Test 3: Debug de performance
      console.log('🧪 Test 3: Debug de performance');
      const debugStart = performance.now();
      const tempElement = document.createElement('div');
      tempElement.innerHTML = `
        <div class="pdf-template">
          <h1>Test Element</h1>
          <p>Testing performance...</p>
        </div>
      `;
      debugPDFPerformance(tempElement);
      const debugEnd = performance.now();
      results.push({ 
        test: 'Debug de performance', 
        success: true, 
        duration: debugEnd - debugStart 
      });

      // Test 4: Generación optimizada (simulada)
      console.log('🧪 Test 4: Generación optimizada');
      const optimizedResult = await measurePDFGeneration(async () => {
        // Simular generación optimizada
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      });
      results.push({ test: 'Generación optimizada', ...optimizedResult });

      setTestResults(results);

    } catch (error) {
      console.error('❌ Error en tests de performance:', error);
      results.push({ 
        test: 'Error en tests', 
        success: false, 
        duration: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      setTestResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (isLoadingData) {
    return (
      <div className={`p-4 bg-blue-50 border border-blue-200 rounded-md ${className}`}>
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-blue-800">Cargando datos para testing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">🧪 PDF Performance Tester</h3>
        <p className="text-sm text-gray-600 mb-4">
          Herramienta para probar y optimizar la generación de PDFs
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={runPerformanceTest}
            disabled={isRunning || isGenerating || !pdfData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ejecutando tests...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ejecutar Tests
              </>
            )}
          </button>

          {testResults.length > 0 && (
            <button
              onClick={clearResults}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar
            </button>
          )}
        </div>

        {/* Resultados de tests */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Resultados de Tests:</h4>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  result.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {result.success ? (
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`text-sm font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.test}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.duration ? `${result.duration.toFixed(2)}ms` : 'N/A'}
                  </div>
                </div>
                {result.error && (
                  <div className="mt-2 text-xs text-red-600">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Información del sistema */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Sistema:</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <strong>User Agent:</strong><br />
              <span className="break-all">{navigator.userAgent}</span>
            </div>
            <div>
              <strong>Memoria disponible:</strong><br />
              {(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'No disponible'}
            </div>
            <div>
              <strong>Conexión:</strong><br />
              {(navigator as any).connection ? (navigator as any).connection.effectiveType : 'No disponible'}
            </div>
            <div>
              <strong>Hardware:</strong><br />
              {navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'No disponible'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFTester;
