import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, CreditCard, UserPlus } from 'lucide-react';
import axios from 'axios';

// Importar componentes UI
import PageHeader from '../Components/UIEmpleados/PageHeader';
import HeroSection from '../Components/UIEmpleados/HeroSecction';
import SubmitButton from '../Components/UIEmpleados/SubmitButton';

// Importar componentes de formulario
import FormInput from '../Components/FormsEmpleados/FormInput';
import FormTextarea from '../Components/FormsEmpleados/FormTextarea';
import DatePicker from '../Components/FormsEmpleados/DatePicker';

// Importar utilidades
import { showSuccessAlert, showErrorAlert, showLoadingAlert, showValidationAlert } from '../Components/UIEmpleados/SweetAlertUtils';
import { validateEmployeeForm, formatInput } from '../Components/UIEmpleados/FormValidation';
import { generateEmail } from '../Components/UIEmpleados/EmailGenerator';

const AgregarEmpleado = () => {
  // Estados del formulario (sin imagen)
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    dui: '',
    birthDate: '',
    password: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Generar email automáticamente cuando cambien nombre o apellido
  useEffect(() => {
    const email = generateEmail(formData.name, formData.lastName);
    setFormData(prev => ({
      ...prev,
      email: email
    }));
  }, [formData.name, formData.lastName]);

  // Manejo de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // No permitir editar email
    if (name === 'email') {
      return;
    }

    // Formatear inputs específicos
    const formattedValue = formatInput(name, value);

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validación y envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== INICIO DEL SUBMIT ===');

    // Validar formulario
    const formErrors = validateEmployeeForm(formData);
    console.log('Errores de validación:', formErrors);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      console.log('Formulario tiene errores, no se envía');

      const camposFaltantes = Object.keys(formErrors).map(field => {
        const fieldNames = {
          name: 'Nombre',
          lastName: 'Apellido',
          dui: 'DUI',
          birthDate: 'Fecha de nacimiento',
          password: 'Contraseña',
          phone: 'Teléfono',
          address: 'Dirección'
        };
        return fieldNames[field] || field;
      });

      showValidationAlert(camposFaltantes);
      return;
    }

    try {
      showLoadingAlert();
      setLoading(true);
      console.log('Estado de loading activado');

      // Preparar FormData (sin imagen)
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('dui', formData.dui.trim());
      formDataToSend.append('birthDate', formData.birthDate);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('address', formData.address.trim());

      console.log('=== DATOS A ENVIAR ===');
      console.log('=== ENVIANDO PETICIÓN ===');
      console.log('URL:', 'https://riveraproject-5.onrender.com/api/empleados');

      // Enviar petición
      const response = await axios.post('https://riveraproject-5.onrender.com/api/empleados', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);
      console.log('Respuesta del servidor:', response.data);

      if (response.status === 200 || response.status === 201) {
        console.log('¡Empleado creado exitosamente!');

        // Cerrar loading y mostrar éxito
        showSuccessAlert(handleBackToMenu);

        // Limpiar formulario
        setFormData({
          name: '',
          lastName: '',
          email: '',
          dui: '',
          birthDate: '',
          password: '',
          phone: '',
          address: ''
        });
        setErrors({});
      }

    } catch (error) {
      console.error('=== ERROR CAPTURADO ===');
      console.error('Error completo:', error);
      console.log('Error response:', error.response);

      let errorMsg = 'Error desconocido';
      let errorTitle = 'Error al agregar empleado';

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Error del servidor';

        console.log('Status Code:', statusCode);
        console.log('Error Message:', errorMessage);
        console.log('Full Response Data:', error.response.data);

        switch (statusCode) {
          case 400:
            errorTitle = 'Error de validación';
            errorMsg = errorMessage;
            break;
          case 401:
            errorTitle = 'No autorizado';
            errorMsg = 'No tienes permisos para realizar esta acción. Verifica tus credenciales.';
            break;
          case 403:
            errorTitle = 'Acceso denegado';
            errorMsg = 'No tienes permisos suficientes para agregar empleados.';
            break;
          case 404:
            errorTitle = 'Servicio no encontrado';
            errorMsg = 'El servicio no está disponible. Contacta al administrador.';
            break;
          case 409:
            errorTitle = 'Conflicto de datos';
            errorMsg = `Ya existe un empleado con estos datos: ${errorMessage}`;
            break;
          case 500:
            errorTitle = 'Error del servidor';
            errorMsg = 'Error interno del servidor. Inténtalo más tarde.';
            break;
          default:
            errorTitle = 'Error inesperado';
            errorMsg = `Error del servidor (${statusCode}): ${errorMessage}`;
        }
      } else if (error.request) {
        console.error('No hubo respuesta del servidor');
        errorTitle = 'Sin conexión';
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        console.error('Error en la configuración:', error.message);
        errorTitle = 'Error de configuración';
        errorMsg = 'Error al configurar la petición. Contacta al administrador.';
      }

      showErrorAlert(errorMsg);

    } finally {
      console.log('=== FINALIZANDO ===');
      setLoading(false);
    }
  };

  // Navegación
  const handleBackToMenu = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      console.log('Navegar a la página anterior');
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: '#34353A' }}>
      {/* Header fijo */}
      <div className="flex-shrink-0 z-10">
        <PageHeader 
          onBack={handleBackToMenu}
          title="Volver al menú principal"
        />
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto agregar-empleado-scroll">
        <div className="min-h-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <HeroSection 
              icon={UserPlus}
              title="Agregar Nuevo cliente"
              subtitle="Complete la información del cliente para agregarlo al sistema"
            />

            {/* Form Container */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 xl:p-12 mb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Nombre */}
                  <FormInput
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre"
                    icon={User}
                    label="Nombre"
                    required
                    error={errors.name}
                  />

                  {/* Apellido */}
                  <FormInput
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Ingrese el apellido"
                    icon={User}
                    label="Apellido"
                    required
                    error={errors.lastName}
                  />

                  {/* DUI */}
                  

                  {/* Fecha de Nacimiento */}
                  <DatePicker
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    label="Fecha del pedido"
                    required
                    error={errors.birthDate}
                  />

                  {/* Contraseña */}
                  <FormInput
                    id="password"
                    name="password"
                    type="text"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Ingrese la descripcion del producto"
                    icon={Lock}
                    label="Descripcion del producto"
                    required
                    error={errors.password}
                  />

                  {/* Teléfono */}
                  <FormInput
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0000-0000"
                    maxLength={9}
                    icon={Phone}
                    label="Teléfono"
                    required
                    error={errors.phone}
                  />

                  {/* Dirección - Ocupa 3 columnas completas */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <FormTextarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Ingrese la dirección completa"
                      icon={MapPin}
                      label="Dirección"
                      required
                      error={errors.address}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <SubmitButton
                    loading={loading}
                    onClick={handleSubmit}
                    icon={UserPlus}
                    text="Agregar cliente"
                    loadingText="Procesando..."
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para pantalla completa y scroll personalizado */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Scroll personalizado para el contenido */
          .agregar-empleado-scroll {
            scrollbar-width: thin;
            scrollbar-color: #64748b #e2e8f0;
          }
          
          .agregar-empleado-scroll::-webkit-scrollbar {
            width: 12px;
          }
          
          .agregar-empleado-scroll::-webkit-scrollbar-track {
            background: #e2e8f0;
            border-radius: 6px;
          }
          
          .agregar-empleado-scroll::-webkit-scrollbar-thumb {
            background: #64748b;
            border-radius: 6px;
            border: 2px solid #e2e8f0;
            transition: background 0.2s ease;
          }
          
          .agregar-empleado-scroll::-webkit-scrollbar-thumb:hover {
            background: #475569;
          }

          /* Optimizaciones para móviles */
          @media (max-width: 640px) {
            .agregar-empleado-scroll {
              -webkit-overflow-scrolling: touch;
            }
            
            .agregar-empleado-scroll::-webkit-scrollbar {
              width: 8px;
            }
          }

          /* Evitar zoom en inputs móviles */
          @media (max-width: 640px) {
            input, select, textarea {
              font-size: 16px !important;
            }
          }

          /* Animación suave para el scroll */
          .agregar-empleado-scroll {
            scroll-behavior: smooth;
          }

          /* Contenedor responsive mejorado */
          @media (min-width: 1024px) {
            .max-w-7xl {
              max-width: 1200px;
            }
          }

          @media (min-width: 1280px) {
            .max-w-7xl {
              max-width: 1400px;
            }
          }

          /* Mejoras de accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .agregar-empleado-scroll {
              scroll-behavior: auto;
            }
            
            .agregar-empleado-scroll::-webkit-scrollbar-thumb {
              transition: none;
            }
          }

          /* Focus mejorado para navegación por teclado */
          .agregar-empleado-scroll:focus-within {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
        `
      }} />
    </div>
  );
};

export default AgregarEmpleado;