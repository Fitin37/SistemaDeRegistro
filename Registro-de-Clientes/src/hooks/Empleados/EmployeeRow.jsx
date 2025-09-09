import React from 'react';
import { User, Package, Phone, MapPin, Calendar } from 'lucide-react';

const ClienteRow = ({
  empleado: cliente, // Mantenemos el nombre empleado para compatibilidad
  showDetailView,
  selectedEmpleados: selectedCliente,
  selectEmpleado: selectCliente
}) => {
  return (
    <div
      className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-5'} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
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
      <div className="font-semibold flex items-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden ${
          selectedCliente && selectedCliente._id === cliente._id ? 'bg-white bg-opacity-20' : ''
        }`} style={{backgroundColor: selectedCliente && selectedCliente._id === cliente._id ? 'rgba(255,255,255,0.2)' : '#5F8EAD'}}>
          <User className={`w-5 h-5 ${selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-white'}`} />
        </div>
        <span className="truncate">{cliente.nombre || 'Sin nombre'}</span>
      </div>

      {/* Producto */}
      <div className="flex items-center truncate">
        <Package className={`w-4 h-4 mr-2 ${selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{cliente.producto || 'Sin producto'}</span>
      </div>

      {/* Teléfono */}
      <div className="flex items-center truncate">
        <Phone className={`w-4 h-4 mr-2 ${selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">{cliente.telefono || 'No disponible'}</span>
      </div>

      {/* Fecha de Pedido */}
      <div className="flex items-center truncate">
        <Calendar className={`w-4 h-4 mr-2 ${selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'}`} />
        <span className="truncate">
          {cliente.fechaPedido ? new Date(cliente.fechaPedido).toLocaleDateString() : 'Sin fecha'}
        </span>
      </div>

      {/* Dirección (solo si no está en vista detalle) */}
      {!showDetailView && (
        <div className="flex items-center truncate">
          <MapPin className={`w-4 h-4 mr-2 ${selectedCliente && selectedCliente._id === cliente._id ? 'text-white' : 'text-gray-400'}`} />
          <span className="truncate">{cliente.dirrecion || 'Sin dirección'}</span>
        </div>
      )}
    </div>
  );
};

export default ClienteRow;