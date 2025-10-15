import { useState, useCallback } from 'react';
import { pdfService } from '../services/PDFService';
import type { 
  PDFCollaboratorData, 
  PDFGenerationOptions, 
  PDFGenerationResult, 
  PDFError 
} from '../types/pdf.types';
import { generatePDFFilename, validateCollaboratorData } from '../utils/pdf.utils';

/**
 * Hook personalizado para la generación de PDFs
 * Proporciona estado y funciones para generar PDFs de colaboradores
 */
export const usePDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<PDFGenerationResult | null>(null);
  const [error, setError] = useState<PDFError | null>(null);

  /**
   * Genera un PDF a partir de datos del colaborador
   * @param data Datos del colaborador y dependientes
   * @param options Opciones de generación
   * @returns Promise<PDFGenerationResult>
   */
  const generatePDF = useCallback(async (
    data: PDFCollaboratorData,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<PDFGenerationResult> => {
    try {
      setIsGenerating(true);
      setError(null);

      // Validar datos
      if (!validateCollaboratorData(data)) {
        const validationError: PDFError = {
          code: 'DATA_VALIDATION_FAILED',
          message: 'Los datos del colaborador no son válidos o están incompletos',
          timestamp: new Date().toISOString()
        };
        setError(validationError);
        return {
          success: false,
          error: validationError.message,
          generatedAt: new Date().toISOString()
        };
      }

      // Generar nombre de archivo
      const filename = options.filename || generatePDFFilename(
        data.employee.id,
        data.employee.full_name
      );

      // Generar PDF
      const success = await pdfService.generateCollaboratorPDF(data, filename);

      const result: PDFGenerationResult = {
        success,
        filename: success ? filename : undefined,
        error: success ? undefined : 'Error desconocido durante la generación',
        generatedAt: new Date().toISOString()
      };

      setLastResult(result);
      return result;

    } catch (err) {
      const pdfError: PDFError = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'Error desconocido',
        details: err,
        timestamp: new Date().toISOString()
      };
      
      setError(pdfError);
      
      const result: PDFGenerationResult = {
        success: false,
        error: pdfError.message,
        generatedAt: new Date().toISOString()
      };
      
      setLastResult(result);
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Genera un PDF a partir de un elemento HTML
   * @param elementId ID del elemento HTML
   * @param filename Nombre del archivo
   * @returns Promise<PDFGenerationResult>
   */
  const generatePDFFromHTML = useCallback(async (
    elementId: string,
    filename: string
  ): Promise<PDFGenerationResult> => {
    try {
      setIsGenerating(true);
      setError(null);

      const success = await pdfService.generatePDFFromHTML(elementId, filename);

      const result: PDFGenerationResult = {
        success,
        filename: success ? filename : undefined,
        error: success ? undefined : 'Error durante la conversión HTML a PDF',
        generatedAt: new Date().toISOString()
      };

      setLastResult(result);
      return result;

    } catch (err) {
      const pdfError: PDFError = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'Error desconocido',
        details: err,
        timestamp: new Date().toISOString()
      };
      
      setError(pdfError);
      
      const result: PDFGenerationResult = {
        success: false,
        error: pdfError.message,
        generatedAt: new Date().toISOString()
      };
      
      setLastResult(result);
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpia el resultado anterior
   */
  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  /**
   * Limpia todo el estado
   */
  const clearAll = useCallback(() => {
    setError(null);
    setLastResult(null);
    setIsGenerating(false);
  }, []);

  return {
    // Estado
    isGenerating,
    lastResult,
    error,
    
    // Funciones
    generatePDF,
    generatePDFFromHTML,
    clearError,
    clearResult,
    clearAll
  };
};

export default usePDFGeneration;
