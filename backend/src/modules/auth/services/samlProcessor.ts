import * as xml2js from 'xml2js';
import { env } from '../../../config/environment';

/**
 * Interfaz para los datos del usuario extraídos de la respuesta SAML
 */
export interface SamlUserData {
  email: string;
  firstName: string;
  lastName: string;
  paternalLastName: string;
  maternalLastName: string;
  fullName: string;
  domain: string;
  nameId: string;
  sessionIndex: string;
  issuer: string;
  audience: string;
  notBefore: string;
  notOnOrAfter: string;
}

/**
 * Interfaz para la respuesta SAML decodificada
 */
export interface SamlResponse {
  assertion: {
    subject: {
      nameId: string;
      subjectConfirmation: {
        subjectConfirmationData: {
          notOnOrAfter: string;
          recipient: string;
        };
      };
    };
    conditions: {
      notBefore: string;
      notOnOrAfter: string;
      audienceRestriction: {
        audience: string;
      };
    };
    attributeStatement: {
      attribute: Array<{
        name: string;
        attributeValue: string;
      }>;
    };
    authnStatement: {
      sessionIndex: string;
      authnInstant: string;
    };
    issuer: string;
  };
  issuer: string;
  status: {
    statusCode: {
      value: string;
    };
  };
}

/**
 * Servicio para procesar respuestas SAML de Google Workspace
 * 
 * Este servicio se encarga de:
 * - Decodificar la respuesta SAML base64
 * - Parsear el XML de la respuesta
 * - Extraer los atributos del usuario
 * - Validar la estructura de la respuesta
 * 
 * Sigue los principios SOLID:
 * - Single Responsibility: Solo procesa respuestas SAML
 * - Open/Closed: Extensible para otros proveedores SAML
 * - Liskov Substitution: Implementa interfaz clara
 * - Interface Segregation: Interfaces específicas
 * - Dependency Inversion: Depende de abstracciones
 */
export class SamlProcessor {
  private readonly parser: xml2js.Parser;

  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
      normalize: true,
      normalizeTags: true,
      explicitCharkey: false,
      charkey: 'value'
    });
  }

  /**
   * Procesa una respuesta SAML y extrae los datos del usuario
   * 
   * @param samlResponse - La respuesta SAML codificada en base64
   * @returns Datos del usuario extraídos de la respuesta SAML
   * @throws Error si la respuesta SAML es inválida o no se puede procesar
   */
  async processSamlResponse(samlResponse: string): Promise<SamlUserData> {
    try {
      console.log('🔍 [SAML] Iniciando procesamiento de respuesta SAML');
      
      // 1. Decodificar la respuesta base64
      const decodedXml = this.decodeBase64Response(samlResponse);
      console.log('✅ [SAML] Respuesta decodificada correctamente');
      
      // 2. Parsear el XML
      const parsedResponse = await this.parseXmlResponse(decodedXml);
      console.log('✅ [SAML] XML parseado correctamente');
      
      // 3. Validar la estructura de la respuesta
      this.validateSamlResponse(parsedResponse);
      console.log('✅ [SAML] Estructura de respuesta validada');
      
      // 4. Extraer datos del usuario
      const userData = this.extractUserData(parsedResponse);
      console.log('✅ [SAML] Datos del usuario extraídos:', {
        email: userData.email,
        fullName: userData.fullName,
        domain: userData.domain
      });
      
      return userData;
    } catch (error: any) {
      console.error('❌ [SAML] Error procesando respuesta SAML:', error);
      throw new Error(`Error procesando respuesta SAML: ${error.message}`);
    }
  }

  /**
   * Decodifica la respuesta SAML de base64 a XML
   */
  private decodeBase64Response(samlResponse: string): string {
    try {
      return Buffer.from(samlResponse, 'base64').toString('utf-8');
    } catch (error: any) {
      throw new Error(`Error decodificando respuesta SAML: ${error.message}`);
    }
  }

  /**
   * Parsea el XML de la respuesta SAML
   */
  private async parseXmlResponse(xml: string): Promise<any> {
    try {
      const result = await this.parser.parseStringPromise(xml);
      console.log('🔍 [SAML DEBUG] Estructura parseada:', JSON.stringify(result, null, 2));
      
      // Buscar la respuesta SAML en diferentes ubicaciones posibles
      const response = result['saml2p:response'] || result.response || result['samlp:response'];
      console.log('🔍 [SAML DEBUG] Respuesta encontrada:', JSON.stringify(response, null, 2));
      
      return response;
    } catch (error: any) {
      throw new Error(`Error parseando XML SAML: ${error.message}`);
    }
  }

  /**
   * Valida la estructura básica de la respuesta SAML
   */
  private validateSamlResponse(response: any): void {
    console.log('🔍 [SAML DEBUG] Validando respuesta:', JSON.stringify(response, null, 2));
    
    if (!response) {
      throw new Error('Respuesta SAML vacía o inválida');
    }

    // Buscar assertion en diferentes ubicaciones posibles
    const assertion = response.assertion || response['saml2:assertion'] || response['saml:assertion'];
    if (!assertion) {
      console.log('❌ [SAML DEBUG] No se encontró assertion en:', Object.keys(response));
      throw new Error('La respuesta SAML no contiene una assertion válida');
    }

    // Verificar status si está disponible
    const status = response.status || response['saml2p:status'];
    if (status && status.statusCode && !status.statusCode.value?.includes('Success')) {
      throw new Error('La respuesta SAML indica un error de autenticación');
    }
    
    console.log('✅ [SAML DEBUG] Validación exitosa');
  }

  /**
   * Extrae los datos del usuario de la respuesta SAML parseada
   */
  private extractUserData(response: any): SamlUserData {
    // Buscar assertion en diferentes ubicaciones
    const assertion = response.assertion || response['saml2:assertion'] || response['saml:assertion'];
    console.log('🔍 [SAML DEBUG] Assertion encontrada:', JSON.stringify(assertion, null, 2));
    
    // Extraer atributos del usuario
    const attributeStatement = assertion?.attributeStatement || assertion?.['saml2:attributeStatement'] || assertion?.['saml2:attributestatement'];
    console.log('🔍 [SAML DEBUG] AttributeStatement encontrado:', JSON.stringify(attributeStatement, null, 2));
    
    const attributes = this.extractAttributes(attributeStatement?.attribute || attributeStatement?.['saml2:attribute'] || []);
    
    // Construir nombre completo usando los campos separados
    const fullName = `${attributes.firstName || ''} ${attributes.paternalLastName || ''} ${attributes.maternalLastName || ''}`.trim();
    
    return {
      email: attributes.email || '',
      firstName: attributes.firstName || '',
      lastName: `${attributes.paternalLastName || ''} ${attributes.maternalLastName || ''}`.trim(), // Mantener compatibilidad
      paternalLastName: attributes.paternalLastName || '',
      maternalLastName: attributes.maternalLastName || '',
      fullName: fullName || attributes.email || '',
      domain: this.extractDomain(attributes.email || ''),
      nameId: assertion?.subject?.nameId || assertion?.subject?.['saml2:nameId'] || '',
      sessionIndex: assertion?.authnStatement?.sessionIndex || assertion?.authnStatement?.['saml2:sessionIndex'] || '',
      issuer: assertion?.issuer || assertion?.['saml2:issuer'] || '',
      audience: assertion?.conditions?.audienceRestriction?.audience || assertion?.conditions?.['saml2:audienceRestriction']?.['saml2:audience'] || '',
      notBefore: assertion?.conditions?.notBefore || assertion?.conditions?.['saml2:notBefore'] || '',
      notOnOrAfter: assertion?.conditions?.notOnOrAfter || assertion?.conditions?.['saml2:notOnOrAfter'] || ''
    };
  }

  /**
   * Extrae los atributos del usuario de la respuesta SAML
   */
  private extractAttributes(attributes: any[]): Record<string, string> {
    const extractedAttributes: Record<string, string> = {};
    
    console.log('🔍 [SAML DEBUG] Procesando atributos:', JSON.stringify(attributes, null, 2));
    
    for (const attr of attributes) {
      const name = attr.Name || attr.name;
      const attributeValue = attr['saml2:attributevalue'] || attr.attributeValue;
      
      // Extraer el valor del atributo
      let value = '';
      if (typeof attributeValue === 'string') {
        value = attributeValue;
      } else if (attributeValue && attributeValue.value) {
        value = attributeValue.value;
      }
      
      console.log('🔍 [SAML DEBUG] Atributo:', { name, value });
      
      // Mapear atributos estándar de Google
      if (name && name.includes('emailaddress')) {
        extractedAttributes.email = value;
      } else if (name && name.includes('givenname')) {
        extractedAttributes.firstName = value;
      } else if (name && name.includes('surname')) {
        // Separar apellidos si vienen juntos
        const surnames = this.separateSurnames(value);
        extractedAttributes.paternalLastName = surnames.paternal;
        extractedAttributes.maternalLastName = surnames.maternal;
      } else if (name && name.includes('name')) {
        extractedAttributes.fullName = value;
      }
    }
    
    console.log('🔍 [SAML DEBUG] Atributos extraídos:', extractedAttributes);
    return extractedAttributes;
  }

  /**
   * Separa apellidos cuando vienen juntos (ej: "Angeles Rosas" → paternal: "Angeles", maternal: "Rosas")
   */
  private separateSurnames(surnames: string): { paternal: string; maternal: string } {
    if (!surnames || surnames.trim() === '') {
      return { paternal: '', maternal: '' };
    }
    
    const parts = surnames.trim().split(/\s+/);
    
    if (parts.length === 1) {
      // Solo un apellido - asumir que es paterno
      return { paternal: parts[0], maternal: '' };
    } else if (parts.length >= 2) {
      // Dos o más apellidos - el primero es paterno, el resto materno
      return { 
        paternal: parts[0], 
        maternal: parts.slice(1).join(' ') 
      };
    }
    
    return { paternal: '', maternal: '' };
  }

  /**
   * Extrae el dominio del email del usuario
   */
  private extractDomain(email: string): string {
    const domain = email.split('@')[1];
    return domain || '';
  }
}

/**
 * Instancia singleton del procesador SAML
 */
export const samlProcessor = new SamlProcessor();
