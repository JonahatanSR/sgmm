# 🔧 ESPECIFICACIONES TÉCNICAS - GENERACIÓN DE PDFs

## 🎯 OBJETIVO
Definir las especificaciones técnicas detalladas para la implementación del sistema de generación de PDFs usando jsPDF + html2canvas.

---

## 🛠️ STACK TECNOLÓGICO

### **Frontend (React + TypeScript)**
- **jsPDF**: `^2.5.1` - Generación de PDFs
- **html2canvas**: `^1.4.1` - Captura de componentes HTML
- **@types/jspdf**: `^2.3.0` - Tipos TypeScript para jsPDF
- **React**: `^19.1.1` - Framework principal
- **TypeScript**: `~5.8.3` - Tipado fuerte
- **TailwindCSS**: `^4.1.12` - Estilos (convertidos a CSS inline)

### **Backend (Node.js + Fastify)**
- **Fastify**: `^4.28.1` - Framework web
- **Prisma**: `^5.22.0` - ORM para base de datos
- **TypeScript**: `^5.6.2` - Tipado fuerte

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
proyecto_sgmm/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── pdf/
│   │   │       ├── PDFGenerator.tsx          # Componente principal
│   │   │       ├── PDFTemplate.tsx           # Plantilla HTML
│   │   │       ├── PDFPreview.tsx            # Vista previa
│   │   │       └── PDFDownloadButton.tsx     # Botón de descarga
│   │   ├── services/
│   │   │   └── PDFService.ts                 # Servicio de generación
│   │   ├── types/
│   │   │   └── pdf.types.ts                  # Tipos TypeScript
│   │   └── utils/
│   │       └── pdf.utils.ts                  # Utilidades para PDF
│   └── package.json                          # Dependencias actualizadas
└── backend/
    └── src/
        └── modules/
            └── pdf/
                ├── http.ts                   # Endpoints HTTP
                ├── service.ts                # Lógica de negocio
                └── repository.ts             # Acceso a datos
```

---

## 🎨 ESPECIFICACIONES DEL PDF

### **Dimensiones y Formato**
- **Tamaño**: Carta (8.5" x 11")
- **Orientación**: Vertical (Portrait)
- **Márgenes**: 1" en todos los lados
- **Área útil**: 6.5" x 9"
- **Resolución**: 300 DPI para impresión

### **Tipografía**
- **Fuente principal**: Arial, 12pt
- **Títulos**: Arial Bold, 14pt
- **Subtítulos**: Arial Bold, 12pt
- **Texto pequeño**: Arial, 10pt
- **Interlineado**: 1.2

### **Colores**
- **Texto principal**: #000000 (Negro)
- **Títulos**: #1f2937 (Gris oscuro)
- **Acentos**: #3b82f6 (Azul corporativo)
- **Bordes**: #d1d5db (Gris claro)
- **Fondo**: #ffffff (Blanco)

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **1. Instalación de Dependencias**

```bash
# Frontend
cd frontend
npm install jspdf html2canvas
npm install --save-dev @types/jspdf

# Verificar instalación
npm list jspdf html2canvas
```

### **2. Configuración de TypeScript**

```typescript
// frontend/src/types/pdf.types.ts
import { jsPDF } from 'jspdf';

export interface CollaboratorPDFData {
  employee: EmployeeData;
  company: CompanyData;
  dependents: DependentData[];
  calculated: CalculatedData;
}

export interface PDFGenerationOptions {
  format: 'letter' | 'a4';
  orientation: 'portrait' | 'landscape';
  quality: 'low' | 'medium' | 'high';
  includeSignature: boolean;
}

export interface PDFService {
  generateCollaboratorPDF(employeeNumber: string): Promise<Blob>;
  downloadPDF(employeeNumber: string): Promise<void>;
  previewPDF(employeeNumber: string): Promise<string>;
}
```

### **3. Servicio Principal de PDF**

```typescript
// frontend/src/services/PDFService.ts
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CollaboratorPDFData, PDFGenerationOptions } from '../types/pdf.types';

export class PDFService {
  private defaultOptions: PDFGenerationOptions = {
    format: 'letter',
    orientation: 'portrait',
    quality: 'high',
    includeSignature: true
  };

  async generateCollaboratorPDF(
    employeeNumber: string, 
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<Blob> {
    try {
      // Obtener datos del colaborador
      const data = await this.getCollaboratorData(employeeNumber);
      
      // Renderizar plantilla HTML
      const htmlElement = await this.renderTemplate(data);
      
      // Capturar con html2canvas
      const canvas = await html2canvas(htmlElement, {
        scale: 2, // Mayor resolución
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Crear PDF con jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });
      
      // Agregar imagen al PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 6.5; // Ancho del área útil
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0.5, 0.5, imgWidth, imgHeight);
      
      // Convertir a Blob
      return pdf.output('blob');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar PDF');
    }
  }

  async downloadPDF(employeeNumber: string): Promise<void> {
    try {
      const pdfBlob = await this.generateCollaboratorPDF(employeeNumber);
      
      // Crear URL de descarga
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `colaborador-${employeeNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw new Error('Error al descargar PDF');
    }
  }

  private async getCollaboratorData(employeeNumber: string): Promise<CollaboratorPDFData> {
    // Implementar obtención de datos desde API
    const response = await fetch(`/api/collaborator/${employeeNumber}/pdf-data`);
    if (!response.ok) {
      throw new Error('Error obteniendo datos del colaborador');
    }
    return response.json();
  }

  private async renderTemplate(data: CollaboratorPDFData): Promise<HTMLElement> {
    // Crear elemento temporal para renderizar plantilla
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.getTemplateHTML(data);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '8.5in';
    tempDiv.style.height = '11in';
    
    document.body.appendChild(tempDiv);
    
    // Esperar a que se renderice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return tempDiv;
  }

  private getTemplateHTML(data: CollaboratorPDFData): string {
    return `
      <div class="pdf-template">
        ${this.getHeaderHTML(data.company)}
        ${this.getEmployeeSectionHTML(data.employee)}
        ${this.getDependentsSectionHTML(data.dependents)}
        ${this.getSignatureSectionHTML()}
        ${this.getFooterHTML()}
      </div>
    `;
  }
}
```

### **4. Componente React Principal**

```typescript
// frontend/src/components/pdf/PDFGenerator.tsx
import React, { useState } from 'react';
import { PDFService } from '../../services/PDFService';
import { PDFDownloadButton } from './PDFDownloadButton';
import { PDFPreview } from './PDFPreview';

interface PDFGeneratorProps {
  employeeNumber: string;
  onError?: (error: string) => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  employeeNumber, 
  onError 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pdfService = new PDFService();

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const pdfBlob = await pdfService.generateCollaboratorPDF(employeeNumber);
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await pdfService.downloadPDF(employeeNumber);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pdf-generator">
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generando...' : 'Generar PDF'}
        </button>
        
        {previewUrl && (
          <PDFDownloadButton
            onDownload={handleDownload}
            disabled={isGenerating}
          />
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {previewUrl && (
        <PDFPreview url={previewUrl} />
      )}
    </div>
  );
};
```

### **5. Plantilla HTML**

```typescript
// frontend/src/components/pdf/PDFTemplate.tsx
import React from 'react';
import { CollaboratorPDFData } from '../../types/pdf.types';

interface PDFTemplateProps {
  data: CollaboratorPDFData;
}

export const PDFTemplate: React.FC<PDFTemplateProps> = ({ data }) => {
  return (
    <div className="pdf-template" style={templateStyles}>
      {/* Encabezado */}
      <div className="header" style={headerStyles}>
        <div className="logo">
          {data.company.logoUrl && (
            <img 
              src={data.company.logoUrl} 
              alt="Logo" 
              style={{ height: '60px' }}
            />
          )}
        </div>
        <div className="company-info">
          <h1 style={companyNameStyles}>{data.company.companyName}</h1>
          <p style={companyCodeStyles}>Código: {data.company.companyCode}</p>
        </div>
        <div className="generation-date">
          <p style={dateStyles}>
            Generado: {new Date(data.calculated.generationDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Información del Colaborador */}
      <div className="employee-section" style={sectionStyles}>
        <h2 style={sectionTitleStyles}>INFORMACIÓN DEL COLABORADOR</h2>
        <div className="employee-data" style={dataGridStyles}>
          <div className="data-row">
            <span className="label">Número de Empleado:</span>
            <span className="value">{data.employee.employeeNumber}</span>
          </div>
          <div className="data-row">
            <span className="label">Nombre Completo:</span>
            <span className="value">{data.employee.fullName}</span>
          </div>
          <div className="data-row">
            <span className="label">Email:</span>
            <span className="value">{data.employee.email}</span>
          </div>
          <div className="data-row">
            <span className="label">Fecha de Nacimiento:</span>
            <span className="value">{data.employee.birthDate} ({data.employee.age} años)</span>
          </div>
          <div className="data-row">
            <span className="label">Departamento:</span>
            <span className="value">{data.employee.department}</span>
          </div>
          <div className="data-row">
            <span className="label">Posición:</span>
            <span className="value">{data.employee.position}</span>
          </div>
          <div className="data-row">
            <span className="label">Fecha de Ingreso:</span>
            <span className="value">{data.employee.hireDate}</span>
          </div>
          <div className="data-row">
            <span className="label">Número de Póliza:</span>
            <span className="value">{data.employee.policyNumber}</span>
          </div>
        </div>
      </div>

      {/* Dependientes */}
      <div className="dependents-section" style={sectionStyles}>
        <h2 style={sectionTitleStyles}>DEPENDIENTES REGISTRADOS</h2>
        <div className="dependents-summary" style={summaryStyles}>
          <p>Total de dependientes: {data.calculated.totalDependents}</p>
          <p>Dependientes activos: {data.calculated.activeDependents}</p>
          <p>Dependientes extra: {data.calculated.extraDependents}</p>
        </div>
        
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>#</th>
              <th style={thStyles}>Nombre Completo</th>
              <th style={thStyles}>Fecha de Nacimiento</th>
              <th style={thStyles}>Edad</th>
              <th style={thStyles}>Parentesco</th>
              <th style={thStyles}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.dependents.map((dependent, index) => (
              <tr key={dependent.dependentId}>
                <td style={tdStyles}>{dependent.dependentSeq}</td>
                <td style={tdStyles}>{dependent.fullName}</td>
                <td style={tdStyles}>{dependent.birthDate}</td>
                <td style={tdStyles}>{dependent.age} años</td>
                <td style={tdStyles}>{dependent.relationshipType}</td>
                <td style={tdStyles}>{dependent.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección de Firma */}
      <div className="signature-section" style={signatureStyles}>
        <h2 style={sectionTitleStyles}>ACEPTACIÓN Y FIRMA</h2>
        <div className="signature-text" style={signatureTextStyles}>
          <p>
            Por medio de la presente, confirmo que la información proporcionada 
            es veraz y completa, y acepto los términos y condiciones del plan de 
            gastos médicos mayores de {data.company.companyName}.
          </p>
        </div>
        <div className="signature-fields" style={signatureFieldsStyles}>
          <div className="signature-line">
            <p>Firma del Colaborador:</p>
            <div style={signatureLineStyles}></div>
          </div>
          <div className="signature-line">
            <p>Nombre Completo:</p>
            <div style={signatureLineStyles}></div>
          </div>
          <div className="signature-line">
            <p>Fecha:</p>
            <div style={signatureLineStyles}></div>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="footer" style={footerStyles}>
        <p>Documento generado automáticamente por el Sistema SGMM</p>
        <p>Para consultas, contactar a Recursos Humanos</p>
      </div>
    </div>
  );
};

// Estilos CSS inline para el PDF
const templateStyles: React.CSSProperties = {
  width: '8.5in',
  height: '11in',
  padding: '1in',
  fontFamily: 'Arial, sans-serif',
  fontSize: '12pt',
  lineHeight: '1.2',
  color: '#000000',
  backgroundColor: '#ffffff'
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '2px solid #1f2937',
  paddingBottom: '20px',
  marginBottom: '30px'
};

const companyNameStyles: React.CSSProperties = {
  fontSize: '18pt',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: 0
};

const companyCodeStyles: React.CSSProperties = {
  fontSize: '10pt',
  color: '#6b7280',
  margin: 0
};

const dateStyles: React.CSSProperties = {
  fontSize: '10pt',
  color: '#6b7280',
  margin: 0
};

const sectionStyles: React.CSSProperties = {
  marginBottom: '30px'
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: '14pt',
  fontWeight: 'bold',
  color: '#1f2937',
  borderBottom: '1px solid #d1d5db',
  paddingBottom: '10px',
  marginBottom: '20px'
};

const dataGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px'
};

const summaryStyles: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  padding: '15px',
  borderRadius: '5px',
  marginBottom: '20px'
};

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #d1d5db'
};

const thStyles: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  padding: '10px',
  textAlign: 'left',
  border: '1px solid #d1d5db',
  fontWeight: 'bold'
};

const tdStyles: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #d1d5db'
};

const signatureStyles: React.CSSProperties = {
  marginTop: '40px',
  padding: '20px',
  border: '2px solid #d1d5db',
  borderRadius: '5px'
};

const signatureTextStyles: React.CSSProperties = {
  marginBottom: '30px',
  textAlign: 'justify'
};

const signatureFieldsStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const signatureLineStyles: React.CSSProperties = {
  borderBottom: '1px solid #000000',
  height: '20px',
  width: '200px',
  marginTop: '5px'
};

const footerStyles: React.CSSProperties = {
  position: 'absolute',
  bottom: '0.5in',
  left: '1in',
  right: '1in',
  textAlign: 'center',
  fontSize: '10pt',
  color: '#6b7280',
  borderTop: '1px solid #d1d5db',
  paddingTop: '10px'
};
```

---

## 🔧 CONFIGURACIÓN DEL BACKEND

### **Endpoint para Datos del PDF**

```typescript
// backend/src/modules/pdf/http.ts
import { FastifyInstance } from 'fastify';
import { PDFService } from './service';

export async function pdfRoutes(fastify: FastifyInstance) {
  // Endpoint para obtener datos del PDF
  fastify.get('/api/collaborator/:employeeNumber/pdf-data', async (request, reply) => {
    try {
      const { employeeNumber } = request.params as { employeeNumber: string };
      
      const pdfService = new PDFService();
      const data = await pdfService.getCollaboratorPDFData(employeeNumber);
      
      return reply.send(data);
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Error obteniendo datos para PDF',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
}
```

### **Servicio de Backend**

```typescript
// backend/src/modules/pdf/service.ts
import { PrismaClient } from '@prisma/client';

export class PDFService {
  constructor(private prisma: PrismaClient) {}

  async getCollaboratorPDFData(employeeNumber: string) {
    const employee = await this.prisma.employees.findFirst({
      where: { 
        employee_number: employeeNumber,
        deleted_at: null,
        status: 'ACTIVE'
      },
      include: {
        company: {
          select: {
            name: true,
            code: true,
            logo_url: true,
            primary_color: true,
            secondary_color: true
          }
        },
        dependents: {
          where: {
            deleted_at: null,
            status: 'ACTIVE'
          },
          include: {
            relationship_type: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            dependent_seq: 'asc'
          }
        }
      }
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    // Mapear datos según PDF_DATA_MAPPING.md
    return this.mapToPDFData(employee);
  }

  private mapToPDFData(employee: any) {
    // Implementar mapeo según PDF_DATA_MAPPING.md
    return {
      employee: {
        employeeNumber: employee.employee_number,
        fullName: employee.full_name,
        // ... resto de campos
      },
      company: {
        companyName: employee.company.name,
        companyCode: employee.company.code,
        // ... resto de campos
      },
      dependents: employee.dependents.map((dep: any) => ({
        dependentId: dep.id,
        dependentSeq: dep.dependent_seq,
        // ... resto de campos
      })),
      calculated: {
        totalDependents: employee.dependents.length,
        activeDependents: employee.dependents.length,
        extraDependents: Math.max(0, employee.dependents.length - 1),
        generationDate: new Date().toISOString()
      }
    };
  }
}
```

---

## 📊 MÉTRICAS DE RENDIMIENTO

### **Objetivos de Rendimiento**
- **Tiempo de generación**: < 5 segundos
- **Tamaño de PDF**: < 2MB
- **Calidad de imagen**: 300 DPI
- **Compatibilidad**: 95% navegadores modernos

### **Optimizaciones**
- **Lazy loading**: Cargar datos solo cuando se necesite
- **Caché**: Cachear datos de compañía
- **Compresión**: Comprimir imágenes en el PDF
- **Async/await**: Operaciones asíncronas para no bloquear UI

---

## 🧪 TESTING

### **Tests Unitarios**
```typescript
// frontend/src/services/__tests__/PDFService.test.ts
import { PDFService } from '../PDFService';

describe('PDFService', () => {
  let pdfService: PDFService;

  beforeEach(() => {
    pdfService = new PDFService();
  });

  it('should generate PDF successfully', async () => {
    const employeeNumber = '3619';
    const pdfBlob = await pdfService.generateCollaboratorPDF(employeeNumber);
    
    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.size).toBeGreaterThan(0);
  });

  it('should handle errors gracefully', async () => {
    const employeeNumber = 'invalid';
    
    await expect(
      pdfService.generateCollaboratorPDF(employeeNumber)
    ).rejects.toThrow('Error al generar PDF');
  });
});
```

### **Tests de Integración**
```typescript
// frontend/src/components/__tests__/PDFGenerator.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PDFGenerator } from '../PDFGenerator';

describe('PDFGenerator', () => {
  it('should render generate button', () => {
    render(<PDFGenerator employeeNumber="3619" />);
    expect(screen.getByText('Generar PDF')).toBeInTheDocument();
  });

  it('should show loading state when generating', async () => {
    render(<PDFGenerator employeeNumber="3619" />);
    
    fireEvent.click(screen.getByText('Generar PDF'));
    
    await waitFor(() => {
      expect(screen.getByText('Generando...')).toBeInTheDocument();
    });
  });
});
```

---

*Especificaciones técnicas realizadas el: 15 de Enero 2025*
*Basado en stack tecnológico del proyecto SGMM*
*Próxima actualización: Al completar implementación*
