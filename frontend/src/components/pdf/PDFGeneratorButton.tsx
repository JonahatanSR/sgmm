import React from 'react';
import { usePDFGeneration } from '../../hooks/usePDFGeneration';
import type { PDFCollaboratorData, PDFGenerationOptions } from '../../types/pdf.types';

interface PDFGeneratorButtonProps {
  data: PDFCollaboratorData;
  options?: Partial<PDFGenerationOptions>;
  onGenerate?: (result: any) => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const PDFGeneratorButton: React.FC<PDFGeneratorButtonProps> = ({
  data,
  options = {},
  onGenerate,
  onError,
  className = '',
  children,
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  const { generatePDF, isGenerating } = usePDFGeneration();

  const handleGenerate = async () => {
    try {
      const result = await generatePDF(data, options);
      
      if (result.success) {
        onGenerate?.(result);
      } else {
        onError?.(result);
      }
    } catch (err) {
      onError?.(err);
    }
  };

  // Estilos base
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variantes
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };
  
  // Tamaños
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className={buttonStyles}
      type="button"
    >
      {isGenerating ? (
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
          {children || 'Generar PDF'}
        </>
      )}
    </button>
  );
};

export default PDFGeneratorButton;
