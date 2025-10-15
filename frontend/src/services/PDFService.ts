import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { apiPost } from './api';

/**
 * Servicio para generación de PDFs
 * Basado en jsPDF + html2canvas para conversión HTML → PDF
 */
export class PDFService {
  private static instance: PDFService;
  
  // Configuración del PDF
  private readonly PDF_CONFIG = {
    format: 'letter' as const, // 8.5" x 11" (216mm x 279mm)
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    compress: true,
    precision: 2
  };

  // Configuración de html2canvas optimizada
  private readonly CANVAS_CONFIG = {
    scale: 3, // Mayor resolución para mejor calidad
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 816, // 8.5" * 96 DPI
    height: 1056, // 11" * 96 DPI
    scrollX: 0,
    scrollY: 0,
    windowWidth: 816,
    windowHeight: 1056,
    ignoreElements: (element: Element) => {
      // Ignorar elementos que no deben aparecer en el PDF
      return element.classList.contains('no-print') || 
             (element as HTMLElement).style.display === 'none' ||
             (element as HTMLElement).style.visibility === 'hidden';
    }
  };

  private constructor() {}

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Genera un PDF a partir de un elemento HTML (OPTIMIZADO)
   * @param elementId ID del elemento HTML a convertir
   * @param filename Nombre del archivo PDF
   * @returns Promise<boolean> - true si se generó exitosamente
   */
  public async generatePDFFromHTML(elementId: string, filename: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      console.log('🔄 Iniciando generación de PDF optimizada...');
      
      // 1. Obtener el elemento HTML
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento con ID '${elementId}' no encontrado`);
      }

      // 2. Preload de recursos para mejor rendimiento
      console.log('📸 Pre-cargando recursos...');
      await this.preloadResources(element);

      // 3. Convertir HTML a canvas con configuración optimizada
      console.log('📸 Convirtiendo HTML a canvas...');
      const canvas = await html2canvas(element, this.CANVAS_CONFIG);
      
      // 4. Crear PDF con metadatos
      console.log('📄 Creando PDF...');
      const pdf = new jsPDF(this.PDF_CONFIG);
      
      // 5. Agregar metadatos al PDF
      pdf.setProperties({
        title: `Formulario SGMM - ${filename}`,
        subject: 'Sistema de Gestión de Gastos Médicos Mayores',
        author: 'Sistema SGMM',
        creator: 'SGMM v1.0'
      });
      
      // 6. Calcular dimensiones optimizadas
      const imgWidth = 216; // mm (8.5")
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 7. Agregar imagen al PDF con mejor calidad
      const imgData = canvas.toDataURL('image/png', 1.0); // Máxima calidad
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // 8. Descargar PDF
      console.log('💾 Descargando PDF...');
      pdf.save(filename);
      
      const endTime = performance.now();
      const generationTime = Math.round(endTime - startTime);
      
      console.log(`✅ PDF generado exitosamente en ${generationTime}ms:`, filename);
      return true;
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      return false;
    }
  }

  /**
   * Pre-carga recursos para mejorar el rendimiento
   * @param element Elemento HTML
   */
  private async preloadResources(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continuar aunque falle
        }
      });
    });
    
    await Promise.all(promises);
  }

  /**
   * Genera un PDF con datos específicos del colaborador
   * @param data Datos del colaborador y dependientes
   * @param filename Nombre del archivo PDF
   * @returns Promise<boolean>
   */
  public async generateCollaboratorPDF(data: any, filename: string): Promise<boolean> {
    try {
      console.log('🔄 Generando PDF de colaborador...');
      
      // Crear PDF directamente con jsPDF
      const pdf = new jsPDF(this.PDF_CONFIG);
      
      // Configurar fuente
      pdf.setFont('helvetica');
      
      // Agregar contenido
      this.addHeader(pdf, data.company);
      this.addEmployeeInfo(pdf, data.employee);
      this.addDependentsInfo(pdf, data.dependents);
      this.addSignatureSection(pdf);
      this.addFooter(pdf);
      
      // Descargar
      pdf.save(filename);
      
      // Registrar en audit trail
      await this.logPDFGeneration(data, filename);
      
      console.log('✅ PDF de colaborador generado:', filename);
      return true;
      
    } catch (error) {
      console.error('❌ Error generando PDF de colaborador:', error);
      return false;
    }
  }

  private addHeader(pdf: jsPDF, company?: any): void {
    // Título principal
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACIÓN DEL COLABORADOR', 20, 25);
    
    // Información de la compañía
    if (company) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(company.name || 'Sistema SGMM', 20, 35);
      pdf.text(`Código: ${company.code || 'N/A'}`, 20, 40);
    }
    
    // Fecha de generación
    pdf.setFontSize(10);
    pdf.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, 150, 25);
    pdf.text('Sistema SGMM', 150, 30);
    
    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 45, 190, 45);
  }

  private addEmployeeInfo(pdf: jsPDF, employee: any): void {
    let yPosition = 55;
    
    // Título de sección
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS DEL COLABORADOR', 20, yPosition);
    yPosition += 10;
    
    // Información básica
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const employeeData = [
      { label: 'Número de Empleado:', value: employee.id || 'N/A' },
      { label: 'Nombre Completo:', value: employee.full_name || 'N/A' },
      { label: 'Email:', value: employee.email || 'N/A' },
      { label: 'Fecha de Nacimiento:', value: employee.birth_date ? new Date(employee.birth_date).toLocaleDateString('es-MX') : 'N/A' },
      { label: 'Género:', value: employee.gender === 'M' ? 'Masculino' : 'Femenino' },
      { label: 'Fecha de Ingreso:', value: employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('es-MX') : 'N/A' }
    ];
    
    // Agregar datos en dos columnas
    employeeData.forEach((item, index) => {
      const x = index % 2 === 0 ? 20 : 110;
      const y = yPosition + (Math.floor(index / 2) * 8);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.label, x, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.value, x + 60, y);
    });
  }

  private addDependentsInfo(pdf: jsPDF, dependents: any[]): void {
    let yPosition = 120;
    
    // Título de sección
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DEPENDIENTES REGISTRADOS', 20, yPosition);
    yPosition += 10;
    
    if (dependents.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No hay dependientes registrados', 20, yPosition);
      return;
    }
    
    // Encabezados de tabla
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ID', 20, yPosition);
    pdf.text('Nombre', 40, yPosition);
    pdf.text('Nacimiento', 100, yPosition);
    pdf.text('Edad', 130, yPosition);
    pdf.text('Género', 150, yPosition);
    pdf.text('Parentesco', 170, yPosition);
    yPosition += 5;
    
    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 5;
    
    // Datos de dependientes
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    dependents.forEach((dependent) => {
      if (yPosition > 250) {
        // Nueva página si es necesario
        pdf.addPage();
        yPosition = 20;
      }
      
      const age = this.calculateAge(dependent.birth_date);
      
      pdf.text(dependent.dependent_id || dependent.id, 20, yPosition);
      pdf.text(`${dependent.first_name} ${dependent.paternal_last_name}`, 40, yPosition);
      pdf.text(new Date(dependent.birth_date).toLocaleDateString('es-MX'), 100, yPosition);
      pdf.text(`${age} años`, 130, yPosition);
      pdf.text(dependent.gender === 'M' ? 'M' : 'F', 150, yPosition);
      pdf.text('Dependiente', 170, yPosition);
      
      yPosition += 6;
    });
  }

  private addSignatureSection(pdf: jsPDF): void {
    let yPosition = 280;
    
    // Título de sección
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACEPTACIÓN Y FIRMA', 20, yPosition);
    yPosition += 10;
    
    // Texto de aceptación
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const acceptanceText = 'Por medio de la presente, confirmo que la información aquí contenida es veraz y completa, y autorizo el uso de estos datos para los fines del sistema de gestión de seguros médicos.';
    pdf.text(acceptanceText, 20, yPosition, { maxWidth: 170 });
    yPosition += 20;
    
    // Campos de firma
    pdf.setFontSize(10);
    pdf.text('Firma del Colaborador:', 20, yPosition);
    pdf.text('Fecha:', 120, yPosition);
    yPosition += 15;
    
    // Líneas para firma
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, yPosition, 100, yPosition);
    pdf.line(120, yPosition, 180, yPosition);
    yPosition += 10;
    
    pdf.text('Nombre Completo:', 20, yPosition);
    pdf.text('Número de Empleado:', 120, yPosition);
    yPosition += 10;
    
    pdf.line(20, yPosition, 100, yPosition);
    pdf.line(120, yPosition, 180, yPosition);
  }

  private addFooter(pdf: jsPDF): void {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const footerY = pageHeight - 20;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sistema de Gestión de Seguros Médicos (SGMM)', 20, footerY);
    pdf.text(`Página 1 de 1 - Generado el ${new Date().toLocaleDateString('es-MX')}`, 150, footerY);
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Registra la generación de PDF en el audit trail
   * @param data Datos del colaborador
   * @param filename Nombre del archivo
   */
  private async logPDFGeneration(data: any, filename: string): Promise<void> {
    try {
      await apiPost('/api/audit/pdf/generation', {
        employeeId: data.employee.id,
        actorId: data.employee.id,
        actorRole: 'EMPLOYEE',
        actorEmail: data.employee.email,
        ipAddress: '', // Se obtiene del servidor
        userAgent: navigator.userAgent,
        filename,
        options: {
          includeSignature: true,
          includeCompanyLogo: false,
          includeAuditInfo: true
        }
      });
    } catch (error) {
      console.error('❌ Error logging PDF generation:', error);
      // No lanzar error para no interrumpir la generación del PDF
    }
  }
}

// Exportar instancia singleton
export const pdfService = PDFService.getInstance();
