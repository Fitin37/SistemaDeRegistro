import React, { useState, useEffect } from 'react';
import { Package, Calendar } from 'lucide-react';

const EditClienteModal = ({ isOpen, onClose, onSave, employee: cliente, uploading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    producto: '',
    telefono: '',
    dirrecion: '',
    fechaPedido: ''
  });

  // USEEFFECT PRINCIPAL - Cargar datos del cliente
  useEffect(() => {
    if (cliente && isOpen) {
      console.log('🔄 Cargando datos del cliente en el modal:', cliente);
      
      // Formatear fecha para input date
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formateando fecha:', error);
          return '';
        }
      };
      
      setFormData({
        nombre: cliente.nombre || '',
        producto: cliente.producto || '',
        telefono: cliente.telefono || '',
        dirrecion: cliente.dirrecion || '',
        fechaPedido: formatDateForInput(cliente.fechaPedido)
      });
      
      console.log('✅ Datos cargados en el formulario:', {
        nombre: cliente.nombre || '',
        producto: cliente.producto || '',
        telefono: cliente.telefono || '',
        dirrecion: cliente.dirrecion || '',
        fechaPedido: formatDateForInput(cliente.fechaPedido)
      });
    }
  }, [cliente, isOpen]);

  // USEEFFECT ADICIONAL - Sincronizar con actualizaciones externas
  useEffect(() => {
    if (cliente && isOpen && !uploading) {
      console.log('🔄 Sincronizando modal con datos actualizados del cliente:', cliente);
      
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (error) {
          return '';
        }
      };
      
      setFormData({
        nombre: cliente.nombre || '',
        producto: cliente.producto || '',
        telefono: cliente.telefono || '',
        dirrecion: cliente.dirrecion || '',
        fechaPedido: formatDateForInput(cliente.fechaPedido)
      });
    }
  }, [cliente, isOpen, uploading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // FUNCIÓN HANDLESAVE OPTIMIZADA PARA CLIENTES
  const handleSave = () => {
    console.log('💾 Preparando datos de cliente para guardar...');
    console.log('📋 FormData actual:', formData);
    console.log('👤 Cliente original:', cliente);
    
    // Crear objeto JSON (no FormData ya que no hay imágenes)
    const dataToSend = {};
    
    // Solo agregar campos que han cambiado o que tienen valor
    if (formData.nombre && formData.nombre.trim()) {
      dataToSend.nombre = formData.nombre.trim();
      console.log('✅ Agregando nombre:', formData.nombre.trim());
    }
    if (formData.producto && formData.producto.trim()) {
      dataToSend.producto = formData.producto.trim();
      console.log('✅ Agregando producto:', formData.producto.trim());
    }
    if (formData.telefono && formData.telefono.trim()) {
      dataToSend.telefono = formData.telefono.trim();
      console.log('✅ Agregando teléfono:', formData.telefono.trim());
    }
    if (formData.dirrecion && formData.dirrecion.trim()) {
      dataToSend.dirrecion = formData.dirrecion.trim();
      console.log('✅ Agregando dirección:', formData.dirrecion.trim());
    }
    if (formData.fechaPedido) {
      // Convertir fecha a formato ISO
      const fechaISO = new Date(formData.fechaPedido).toISOString();
      dataToSend.fechaPedido = fechaISO;
      console.log('✅ Agregando fecha de pedido:', fechaISO);
    }
    
    // Debug: mostrar todos los campos que se van a enviar
    console.log('📤 Datos a enviar:', dataToSend);
    
    // Verificar que se está enviando algo
    if (Object.keys(dataToSend).length === 0) {
      console.warn('⚠️ No hay campos para actualizar');
      alert('No hay cambios para guardar');
      return;
    }
    
    // Llamar la función de guardado
    onSave(dataToSend);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-xl relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          style={{
            animation: isOpen ? 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200 hover:scale-110 transform"
          >
            ×
          </button>
          
          <div className="text-center mb-8">
            <h3 
              className="text-2xl font-semibold text-gray-900 transition-all duration-300"
              style={{
                animation: isOpen ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none'
              }}
            >
              Editar Cliente
            </h3>
            {cliente && (
              <p className="text-gray-600 mt-2">
                Editando: {cliente.nombre}
              </p>
            )}
          </div>

          <div 
            className="space-y-6"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none'
            }}
          >
            {/* Información del Cliente */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" style={{color: '#5F8EAD'}} />
                Información del Cliente
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                    placeholder={cliente?.nombre || "Nombre del cliente"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                    placeholder={cliente?.telefono || "7533-4567"}
                  />
                </div>
              </div>
            </div>

            {/* Información del Pedido */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" style={{color: '#5D9646'}} />
                Información del Pedido
              </h4>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto
                  </label>
                  <input
                    type="text"
                    name="producto"
                    value={formData.producto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                    placeholder={cliente?.producto || "Nombre del producto"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Pedido
                  </label>
                  <input
                    type="date"
                    name="fechaPedido"
                    value={formData.fechaPedido}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Información de Ubicación */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Información de Ubicación
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  name="dirrecion"
                  value={formData.dirrecion}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base text-gray-900 bg-white resize-none"
                  placeholder={cliente?.dirrecion || "Dirección completa del cliente"}
                />
              </div>
            </div>

            {/* ID del Cliente (Solo lectura) */}
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Información del Sistema
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Cliente
                </label>
                <input
                  type="text"
                  value={cliente?._id || ''}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este campo no se puede modificar
                </p>
              </div>
            </div>
          </div>

          <div 
            className="mt-8 flex justify-center space-x-4"
            style={{
              animation: isOpen ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none'
            }}
          >
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
              ) : (
                'Actualizar Cliente'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditClienteModal;