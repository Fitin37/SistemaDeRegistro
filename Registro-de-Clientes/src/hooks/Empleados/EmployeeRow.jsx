import React from 'react';
import { User, Package, Phone, MapPin, Calendar } from 'lucide-react';

const ClienteRow = ({
  empleado: cliente,
  showDetailView,
  selectedEmpleados: selectedCliente,
  selectEmpleado: selectCliente
}) => {
  return (
    <div
      className={`grid ${showDetailView ? 'grid-cols-5' : 'grid-cols-6'} gap-4 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        selectedCliente && selectedCliente._id === cliente._id
          ? 'shadow-lg transform scale-[1.02]'
          : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
      }`}
      style={{
        backgroundColor: selectedCliente && selectedCliente._id === cliente._id ? '#5D9646' : '#ffffff',
        color: selectedCliente && selectedCliente._id === cliente._id ? '#ffffff' : '#374151',
        borderColor: selectedCliente && selectedCliente._id === cliente._id ? '#5D9646' : 'transparent'
      }}
      onClick={() => selectCliente(cliente)}
    >
      {/* Nombre del Cliente */}
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden"
          style={{
            backgroundColor: selectedCliente && selectedCliente._id === cliente._id 
              ? 'rgba(255,255,255,0.2)' 
              : '#5F8EAD'
          }}
        >
          <User className="w-5 h-5 text-white" />
        </div>
        <span className="truncate font-semibold">{cliente.nombre || 'Sin nombre'}</span>
      </div>

      {/* Producto */}
      <div className="flex items-center">
        <Package 
          className={`w-4 h-4 mr-2 flex-shrink-0 ${
            selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'
          }`} 
        />
        <span className="truncate">{cliente.producto || 'Sin producto'}</span>
      </div>

      {/* Fecha de Pedido */}
      <div className="flex items-center">
        <Calendar 
          className={`w-4 h-4 mr-2 flex-shrink-0 ${
            selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'
          }`} 
        />
        <span className="truncate">
          {cliente.fechaPedido ? new Date(cliente.fechaPedido).toLocaleDateString('es-ES') : 'Sin fecha'}
        </span>
      </div>

      {/* Teléfono */}
      <div className="flex items-center">
        <Phone 
          className={`w-4 h-4 mr-2 flex-shrink-0 ${
            selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'
          }`} 
        />
        <span className="truncate">{cliente.telefono || 'No disponible'}</span>
      </div>

      {/* Dirección */}
      <div className="flex items-center">
        <MapPin 
          className={`w-4 h-4 mr-2 flex-shrink-0 ${
            selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'
          }`} 
        />
        <span className="truncate">{cliente.dirrecion || 'Sin dirección'}</span>
      </div>

      {/* Estado (solo si no está en vista detalle) */}
      {!showDetailView && (
        <div className="flex items-center">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium truncate ${
              selectedCliente && selectedCliente._id === cliente._id
                ? 'bg-white bg-opacity-20 text-white'
                : cliente.estado === 'vendido' 
                  ? 'bg-green-100 text-green-700' 
                  : cliente.estado === 'devolucion'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {cliente.estado === 'vendido' ? 'Vendido' : cliente.estado === 'devolucion' ? 'Devolución' : 'Pendiente'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ClienteRow;