/**
 * Utilidades de optimización para el sistema de PDFs
 * Mejoras de performance y optimizaciones
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ===== OPTIMIZACIONES DE PERFORMANCE =====

/**
 * Configuración optimizada para html2canvas
 */
export const OPTIMIZED_CANVAS_CONFIG = {
  scale: 1.5, // Reducido de 2 a 1.5 para mejor performance
  useCORS: true,
  allowTaint: true,
  backgroundColor: '#ffffff',
  logging: false,
  width: 816, // 8.5" * 96 DPI
  height: 1056, // 11" * 96 DPI
  removeContainer: true, // Limpiar contenedor después de usar
  foreignObjectRendering: false, // Deshabilitar para mejor compatibilidad
  imageTimeout: 5000, // Timeout para imágenes
  onclone: (clonedDoc: Document) => {
    // Optimizar el documento clonado
    const style = clonedDoc.createElement('style');
    style.textContent = `
      * { 
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .pdf-template {
        transform: none !important;
        position: static !important;
      }
    `;
    clonedDoc.head.appendChild(style);
  }
};

/**
 * Configuración optimizada para jsPDF
 */
export const OPTIMIZED_PDF_CONFIG = {
  format: 'letter' as const,
  orientation: 'portrait' as const,
  unit: 'mm' as const,
  compress: true,
  precision: 1, // Reducido de 2 a 1 para mejor performance
  putOnlyUsedFonts: true, // Solo incluir fuentes usadas
  compressPdf: true // Comprimir PDF
};

// ===== CACHE DE RECURSOS =====

/**
 * Cache para imágenes y recursos
 */
class ResourceCache {
  private static instance: ResourceCache;
  private cache = new Map<string, string>();

  public static getInstance(): ResourceCache {
    if (!ResourceCache.instance) {
      ResourceCache.instance = new ResourceCache();
    }
    return ResourceCache.instance;
  }

  public async getImage(url: string): Promise<string> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const dataUrl = await this.blobToDataUrl(blob);
      this.cache.set(url, dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Error loading image:', error);
      return url;
    }
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const resourceCache = ResourceCache.getInstance();

// ===== OPTIMIZACIONES DE MEMORIA =====

/**
 * Limpia recursos después de generar PDF
 */
export const cleanupAfterPDF = (): void => {
  // Limpiar cache de recursos
  resourceCache.clear();
  
  // Forzar garbage collection si está disponible
  if (window.gc) {
    window.gc();
  }
  
  // Limpiar elementos temporales del DOM
  const tempElements = document.querySelectorAll('.pdf-temp-element');
  tempElements.forEach(el => el.remove());
};

/**
 * Optimiza el DOM antes de generar PDF
 */
export const optimizeDOMForPDF = (element: HTMLElement): void => {
  // Remover elementos que no se necesitan para el PDF
  const elementsToRemove = element.querySelectorAll('.no-print, .pdf-hidden');
  elementsToRemove.forEach(el => el.remove());
  
  // Optimizar imágenes
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    // Reducir calidad de imágenes si es necesario
    if (img.width > 800 || img.height > 800) {
      img.style.maxWidth = '800px';
      img.style.maxHeight = '800px';
      img.style.objectFit = 'contain';
    }
  });
  
  // Optimizar fuentes
  const textElements = element.querySelectorAll('*');
  textElements.forEach(el => {
    const element = el as HTMLElement;
    if (element.style.fontFamily) {
      // Usar fuentes web-safe para mejor compatibilidad
      element.style.fontFamily = element.style.fontFamily.replace(/['"]/g, '');
    }
  });
};

// ===== OPTIMIZACIONES DE RENDERING =====

/**
 * Genera PDF con optimizaciones de performance
 */
export const generateOptimizedPDF = async (
  element: HTMLElement,
  filename: string,
  options: any = {}
): Promise<boolean> => {
  try {
    console.log('🔄 Iniciando generación optimizada de PDF...');
    
    // Optimizar DOM
    optimizeDOMForPDF(element);
    
    // Configuración optimizada
    const canvasConfig = { ...OPTIMIZED_CANVAS_CONFIG, ...options.canvas };
    const pdfConfig = { ...OPTIMIZED_PDF_CONFIG, ...options.pdf };
    
    // Generar canvas
    console.log('📸 Generando canvas optimizado...');
    const canvas = await html2canvas(element, canvasConfig);
    
    // Crear PDF
    console.log('📄 Creando PDF optimizado...');
    const pdf = new jsPDF(pdfConfig);
    
    // Calcular dimensiones optimizadas
    const imgWidth = pdfConfig.format === 'letter' ? 216 : 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Agregar imagen con compresión
    const imgData = canvas.toDataURL('image/jpeg', 0.85); // Calidad reducida para mejor performance
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    // Descargar
    console.log('💾 Descargando PDF optimizado...');
    pdf.save(filename);
    
    // Limpiar recursos
    cleanupAfterPDF();
    
    console.log('✅ PDF optimizado generado:', filename);
    return true;
    
  } catch (error) {
    console.error('❌ Error generando PDF optimizado:', error);
    cleanupAfterPDF();
    return false;
  }
};

// ===== MÉTRICAS DE PERFORMANCE =====

/**
 * Mide el tiempo de generación de PDF
 */
export const measurePDFGeneration = async (
  generator: () => Promise<boolean>
): Promise<{ success: boolean; duration: number }> => {
  const startTime = performance.now();
  
  try {
    const success = await generator();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ PDF generado en ${duration.toFixed(2)}ms`);
    
    return { success, duration };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`❌ Error después de ${duration.toFixed(2)}ms:`, error);
    
    return { success: false, duration };
  }
};

// ===== OPTIMIZACIONES DE RED =====

/**
 * Pre-carga recursos necesarios para el PDF
 */
export const preloadPDFResources = async (data: any): Promise<void> => {
  const resources: string[] = [];
  
  // Agregar logo de la compañía si existe
  if (data.company?.logo_url) {
    resources.push(data.company.logo_url);
  }
  
  // Pre-cargar recursos
  const loadPromises = resources.map(url => resourceCache.getImage(url));
  await Promise.all(loadPromises);
  
  console.log(`✅ ${resources.length} recursos pre-cargados`);
};

// ===== CONFIGURACIÓN DE DESARROLLO =====

/**
 * Configuración para desarrollo (más logging, menos optimización)
 */
export const DEV_CONFIG = {
  canvas: {
    ...OPTIMIZED_CANVAS_CONFIG,
    logging: true,
    scale: 1 // Escala más baja para desarrollo
  },
  pdf: {
    ...OPTIMIZED_PDF_CONFIG,
    precision: 2 // Mayor precisión para desarrollo
  }
};

/**
 * Configuración para producción (máxima optimización)
 */
export const PROD_CONFIG = {
  canvas: OPTIMIZED_CANVAS_CONFIG,
  pdf: OPTIMIZED_PDF_CONFIG
};

// ===== UTILIDADES DE DEBUGGING =====

/**
 * Debug de performance del PDF
 */
export const debugPDFPerformance = (element: HTMLElement): void => {
  console.log('🔍 Debug de performance del PDF:');
  console.log('- Elementos en el DOM:', element.querySelectorAll('*').length);
  console.log('- Imágenes:', element.querySelectorAll('img').length);
  console.log('- Elementos con estilos inline:', element.querySelectorAll('[style]').length);
  console.log('- Tamaño del elemento:', element.offsetWidth, 'x', element.offsetHeight);
};

// Extender window para garbage collection (si está disponible)
declare global {
  interface Window {
    gc?: () => void;
  }
}
