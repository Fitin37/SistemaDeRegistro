import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MoreHorizontal, User, Phone, Package, Calendar, MapPin, ShoppingBag, Shield } from 'lucide-react';
import Lottie from 'lottie-react';

const ClienteDetailPanel = ({ 
  selectedEmpleados: selectedCliente,
  closeDetailView, 
  handleOptionsClick,
  lottieAnimationData // Pasa tu JSON de Lottie como prop
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Reducido a 2 segundos

    return () => clearTimeout(timer);
  }, [selectedCliente]);

  if (isLoading) {
    return (
      <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center relative" 
             style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b2f 100%)'}}>
          
          <div className="text-center z-10">
            {/* Lottie Animation */}
            <div className="w-64 h-64 mx-auto mb-6">
              {lottieAnimationData ? (
                <Lottie 
                  animationData={lottieAnimationData}
                  loop={true}
                  autoplay={true}
                />
              ) : (
                // Fallback si no hay Lottie
                <div className="w-28 h-28 rounded-2xl mx-auto flex items-center justify-center shadow-2xl" 
                     style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #5D9646 100%)'}}>
                  <User className="w-14 h-14 text-white animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Loading Text */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">
                Cargando Perfil
              </h2>
              <p className="text-gray-300 text-sm">
                Preparando información del cliente...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{backgroundColor: '#5F8EAD', borderRadius: '0 0 0 100%'}}></div>
      
      {/* Header - Fijo */}
      <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
        <div className="flex items-center">
          <button
            className="p-3 hover:bg-gray-100 rounded-xl mr-3 transition-colors"
            onClick={closeDetailView}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Detalles del cliente</h2>
        </div>
        
        <div className="relative">
          <button
            onClick={handleOptionsClick}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* Profile Section */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
              <User className="w-14 h-14 text-white" />
            </div>
          </div>
          <h3 className="font-bold text-xl mb-2 text-gray-900">
            {selectedCliente?.nombre || 'Cliente'}
          </h3>
          
          <div className="flex justify-center space-x-3">
            <button className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md" style={{backgroundColor: '#5D9646'}}>
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md" style={{backgroundColor: '#5F8EAD'}}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Information Cards */}
        <div className="space-y-6">
          {/* Información del Producto/Pedido */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{backgroundColor: '#5F8EAD'}}>
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Información del Pedido</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Producto</div>
                <div className="text-sm text-gray-600 break-words bg-white p-3 rounded-lg border">
                  {selectedCliente?.producto || 'No especificado'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Fecha del Pedido</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <Calendar className="w-4 h-4 mr-2" style={{color: '#5F8EAD'}} />
                  {selectedCliente?.fechaPedido 
                    ? new Date(selectedCliente.fechaPedido).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })
                    : 'No especificada'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{backgroundColor: '#5D9646'}}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Contacto y Ubicación</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Cliente</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <User className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                  {selectedCliente?.nombre || 'No especificado'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <Phone className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                  {selectedCliente?.telefono || 'No disponible'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Dirección</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                  <MapPin className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                  {selectedCliente?.dirrecion || 'No especificada'}
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional con Estado */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg" style={{backgroundColor: '#8B5FBF'}}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Información del Sistema</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">ID del Cliente</div>
                <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border font-mono">
                  {selectedCliente?._id || 'No disponible'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Estado</div>
                <div className="flex items-center">
                  <span 
                    className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold ${
                      selectedCliente?.estado === 'Activo' || selectedCliente?.estado === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : selectedCliente?.estado === 'Inactivo' || selectedCliente?.estado === 'inactivo'
                          ? 'bg-gray-100 text-gray-800'
                          : selectedCliente?.estado === 'Pendiente' || selectedCliente?.estado === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full mr-2 ${
                        selectedCliente?.estado === 'Activo' || selectedCliente?.estado === 'activo'
                          ? 'bg-green-400'
                          : selectedCliente?.estado === 'Inactivo' || selectedCliente?.estado === 'inactivo'
                            ? 'bg-gray-400'
                            : selectedCliente?.estado === 'Pendiente' || selectedCliente?.estado === 'pendiente'
                              ? 'bg-yellow-400'
                              : 'bg-blue-400'
                      }`}
                    ></div>
                    {selectedCliente?.estado || 'Sin estado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDetailPanel;