import React, { useState } from 'react';
import { User, Phone, MapPin, ShoppingCart, Calendar, UserPlus } from 'lucide-react';
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

const AgregarCliente = () => {
  // Estados del formulario adaptados al backend
  const [formData, setFormData] = useState({
    nombre: '',
    producto: '',
    fechaPedido: '',
    telefono: '',
    dirrecion: '',
    estado: 'pendiente' // Estado automático
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validación básica
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.producto.trim()) {
      newErrors.producto = 'El producto es requerido';
    }
    
    if (!formData.fechaPedido) {
      newErrors.fechaPedido = 'La fecha del pedido es requerida';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    
    if (!formData.dirrecion.trim()) {
      newErrors.dirrecion = 'La dirección es requerida';
    }

    return newErrors;
  };

  // Manejo de cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Formatear teléfono
    let formattedValue = value;
    if (name === 'telefono') {
      // Remover caracteres no numéricos
      const numbers = value.replace(/\D/g, '');
      // Formatear como 0000-0000
      if (numbers.length >= 4) {
        formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
      } else {
        formattedValue = numbers;
      }
    }

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
    const formErrors = validateForm();
    console.log('Errores de validación:', formErrors);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      console.log('Formulario tiene errores, no se envía');
      
      const camposFaltantes = Object.keys(formErrors).map(field => {
        const fieldNames = {
          nombre: 'Nombre',
          producto: 'Producto',
          fechaPedido: 'Fecha del pedido',
          telefono: 'Teléfono',
          dirrecion: 'Dirección'
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

      // Preparar datos para enviar (NO FormData, JSON normal)
      const dataToSend = {
        nombre: formData.nombre.trim(),
        producto: formData.producto.trim(),
        fechaPedido: formData.fechaPedido,
        telefono: formData.telefono.trim(),
        dirrecion: formData.dirrecion.trim(),
        estado: 'pendiente' // Estado automático al crear
      };

      console.log('=== DATOS A ENVIAR ===', dataToSend);
      console.log('URL:', 'https://sistemaderegistro2.onrender.com/api/clientes');

      // Enviar petición
      const response = await axios.post('https://sistemaderegistro2.onrender.com/api/clientes', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('=== RESPUESTA RECIBIDA ===');
      console.log('Status:', response.status);
      console.log('Respuesta del servidor:', response.data);

      if (response.status === 200 || response.status === 201) {
        console.log('¡Cliente creado exitosamente!');

        // Cerrar loading y mostrar éxito
        showSuccessAlert(handleBackToMenu);

        // Limpiar formulario
        setFormData({
          nombre: '',
          producto: '',
          fechaPedido: '',
          telefono: '',
          dirrecion: '',
          estado: 'pendiente' // Mantener estado por defecto
        });
        setErrors({});
      }

    } catch (error) {
      console.error('=== ERROR CAPTURADO ===');
      console.error('Error completo:', error);

      let errorMsg = 'Error desconocido';

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Error del servidor';

        console.log('Status Code:', statusCode);
        console.log('Error Message:', errorMessage);

        switch (statusCode) {
          case 400:
            errorMsg = errorMessage;
            break;
          case 401:
            errorMsg = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMsg = 'El servicio no está disponible.';
            break;
          case 500:
            errorMsg = 'Error interno del servidor. Inténtalo más tarde.';
            break;
          default:
            errorMsg = `Error del servidor (${statusCode}): ${errorMessage}`;
        }
      } else if (error.request) {
        errorMsg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMsg = 'Error al configurar la petición.';
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
      <div className="flex-1 overflow-y-auto agregar-cliente-scroll">
        <div className="min-h-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <HeroSection 
              icon={UserPlus}
              title="Registrar Nuevo Pedido"
              subtitle="Complete la información del cliente y su pedido para registrarlo en el sistema"
            />

            {/* Form Container */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 xl:p-12 mb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Nombre del Cliente */}
                  <FormInput
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre del cliente"
                    icon={User}
                    label="Nombre del Cliente"
                    required
                    error={errors.nombre}
                  />

                  {/* Producto */}
                  <FormInput
                    id="producto"
                    name="producto"
                    value={formData.producto}
                    onChange={handleInputChange}
                    placeholder="Ingrese el producto solicitado"
                    icon={ShoppingCart}
                    label="Producto"
                    required
                    error={errors.producto}
                  />

                  {/* Fecha del Pedido */}
                  <DatePicker
                    id="fechaPedido"
                    name="fechaPedido"
                    value={formData.fechaPedido}
                    onChange={handleInputChange}
                    label="Fecha del Pedido"
                    required
                    error={errors.fechaPedido}
                  />

                  {/* Teléfono */}
                  <FormInput
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="0000-0000"
                    maxLength={9}
                    icon={Phone}
                    label="Teléfono de Contacto"
                    required
                    error={errors.telefono}
                  />

                  {/* Dirección - Ocupa las columnas restantes */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <FormTextarea
                      id="dirrecion"
                      name="dirrecion"
                      value={formData.dirrecion}
                      onChange={handleInputChange}
                      placeholder="Ingrese la dirección completa de entrega"
                      icon={MapPin}
                      label="Dirección de Entrega"
                      required
                      error={errors.dirrecion}
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
                    text="Registrar Pedido"
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
          .agregar-cliente-scroll {
            scrollbar-width: thin;
            scrollbar-color: #64748b #e2e8f0;
          }
          
          .agregar-cliente-scroll::-webkit-scrollbar {
            width: 12px;
          }
          
          .agregar-cliente-scroll::-webkit-scrollbar-track {
            background: #e2e8f0;
            border-radius: 6px;
          }
          
          .agregar-cliente-scroll::-webkit-scrollbar-thumb {
            background: #64748b;
            border-radius: 6px;
            border: 2px solid #e2e8f0;
            transition: background 0.2s ease;
          }
          
          .agregar-cliente-scroll::-webkit-scrollbar-thumb:hover {
            background: #475569;
          }

          /* Optimizaciones para móviles */
          @media (max-width: 640px) {
            .agregar-cliente-scroll {
              -webkit-overflow-scrolling: touch;
            }
            
            .agregar-cliente-scroll::-webkit-scrollbar {
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
          .agregar-cliente-scroll {
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
            .agregar-cliente-scroll {
              scroll-behavior: auto;
            }
            
            .agregar-cliente-scroll::-webkit-scrollbar-thumb {
              transition: none;
            }
          }

          /* Focus mejorado para navegación por teclado */
          .agregar-cliente-scroll:focus-within {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
        `
      }} />
    </div>
  );
};

export default AgregarCliente;