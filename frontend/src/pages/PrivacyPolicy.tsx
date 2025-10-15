import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PrivacyPolicy = () => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Obtener employeeId de los parámetros de URL
  const employeeId = searchParams.get('employeeId');
  
  if (!employeeId) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">No se encontró el ID del empleado en la URL.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Regresar
          </button>
        </div>
      </div>
    );
  }

  const handleContinueToForm = async () => {
    if (!isAccepted) return;
    
    setIsLoading(true);
    
    try {
      // Registrar la aceptación de privacidad
      const response = await fetch('/api/privacy/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          acceptance_type: 'EMPLOYEE',
          privacy_version: 'v1.0'
        })
      });

      if (response.ok) {
        console.log('✅ Aceptación de privacidad registrada');
        // Redirigir al formulario de dependientes con parámetro de privacidad aceptada
        navigate(`/dependents/new/${employeeId}?privacyAccepted=true`);
      } else {
        console.error('Error registrando aceptación de privacidad');
        // Continuar de todas formas para no bloquear al usuario
        navigate(`/dependents/new/${employeeId}?privacyAccepted=true`);
      }
    } catch (error) {
      console.error('Error en aceptación de privacidad:', error);
      // Continuar de todas formas para no bloquear al usuario
      navigate(`/dependents/new/${employeeId}?privacyAccepted=true`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Aviso de Privacidad - Siegfried Rhein
      </h1>
      
      <div className="space-y-6 text-gray-700">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            AVISO DE PRIVACIDAD CORTO
          </h2>
          
          <div className="text-sm leading-relaxed space-y-3">
            <p>
              <strong>Siegfried Rhein, S.A. de C.V.</strong>, conocido comercialmente como 
              Siegfried Rhein, con domicilio en calle Antonio Dovalí Jaime 70, Torre D, 
              Piso 12, Colonia Santa Fe, Alcaldía Álvaro Obregón, C.P. 01210, Ciudad de 
              México, México, y con portal de Internet{' '}
              <a 
                href="http://www.siegfried.com.mx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                http://www.siegfried.com.mx
              </a>, utilizará sus datos personales aquí recabados únicamente con la 
              finalidad de gestionar la inscripción, actualización, altas y bajas en el 
              seguro de gastos médicos mayores contratado por Siegfried Rhein, S.A. de C.V., 
              así como para dar seguimiento a trámites administrativos relacionados.
            </p>
            
            <p>
              Sus datos serán tratados de forma confidencial y únicamente serán compartidos 
              con la aseguradora y terceros estrictamente necesarios para cumplir con los 
              fines señalados.
            </p>
            
            <p>
              Usted podrá manifestar su negativa para el tratamiento de datos personales y 
              podrá ejercer en cualquier momento sus derechos ARCO (acceso, rectificación, 
              cancelación y oposición), contactando al Departamento de Datos Personales a 
              través del correo electrónico{' '}
              <a 
                href="mailto:privacidad@siegfried.com.mx"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                privacidad@siegfried.com.mx
              </a>.
            </p>
            
            <p>
              Para mayor información acerca del tratamiento de sus datos personales, de los 
              derechos que puede hacer valer y/o las modificaciones o actualizaciones que 
              pueda sufrir el presente aviso de privacidad, usted puede consultar el aviso 
              de privacidad integral, puesto a su disposición en la página de internet{' '}
              <a 
                href="http://www.siegfried.com.mx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                http://www.siegfried.com.mx
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Checkbox de aceptación */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAccepted}
            onChange={(e) => setIsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            He leído y acepto el <strong>Aviso de Privacidad</strong> de Siegfried Rhein, S.A. de C.V. 
            para el tratamiento de mis datos personales con la finalidad de gestionar la inscripción, 
            actualización, altas y bajas en el seguro de gastos médicos mayores.
          </span>
        </label>
        
        {isAccepted && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Aviso de privacidad aceptado. Puedes continuar con el registro.
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Regresar
        </button>
        
        <button
          disabled={!isAccepted || isLoading}
          onClick={handleContinueToForm}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isAccepted && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Procesando...' : 'Continuar al Formulario'}
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
