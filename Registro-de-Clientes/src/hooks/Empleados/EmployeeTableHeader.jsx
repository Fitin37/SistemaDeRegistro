import React from 'react';
import { User, Package, Calendar, Phone, MapPin, Shield } from 'lucide-react';

const EmployeeTableHeader = ({ showDetailView }) => {
  return (
    <div className="px-8 py-4 border-b-2" style={{borderColor: '#5F8EAD', backgroundColor: '#f8fafc'}}>
      <div className={`grid ${showDetailView ? 'grid-cols-5' : 'grid-cols-6'} gap-4 text-sm font-semibold`} style={{color: '#5F8EAD'}}>
        {/* Nombres */}
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2" />
          Nombres
        </div>
        
        {/* Producto */}
        <div className="flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Producto
        </div>
        
        {/* Fecha Pedido */}
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Fecha Pedido
        </div>
        
        {/* Teléfono */}
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          Teléfono
        </div>
        
        {/* Dirección */}
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Dirección
        </div>
        
        {/* Estado - solo se oculta cuando showDetailView es true */}
        {!showDetailView && (
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Estado
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTableHeader;