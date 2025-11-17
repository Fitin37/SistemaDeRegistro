import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Mail, User, ArrowLeft, ChevronLeft, ChevronRight, Users, MapPin, Calendar, CreditCard, Plus, Package, CheckCircle, XCircle, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import sandyLoadingAnimation from '../assets/Sandy Loading.json';
import useClients from '../hooks/useDataCliente';
import Swal from 'sweetalert2';

const Clientes = () => {
  const navigate = useNavigate();
  
  const {
    clients,
    selectedClient,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    setSearchTerm,
    setSortBy,
    selectClient,
    closeDetailView,
    updateClient,
    deleteClient,
    stats
  } = useClients();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Estado para la animación de carga del panel de detalles
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Estados para el menú de acciones en el panel
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef(null);
  
  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    producto: '',
    fechaPedido: '',
    telefono: '',
    dirrecion: '',
    estado: 'pendiente'
  });

  // Función para obtener configuración de estado
  const getEstadoConfig = (estado) => {
    const estadoLower = (estado || '').toLowerCase();
    
    const configs = {
      'vendido': {
        label: 'Vendido',
        bgColor: '#10b981',
        textColor: '#ffffff',
        icon: CheckCircle,
        lightBg: '#d1fae5',
        lightText: '#065f46'
      },
      'devolucion': {
        label: 'Devolución',
        bgColor: '#ef4444',
        textColor: '#ffffff',
        icon: XCircle,
        lightBg: '#fee2e2',
        lightText: '#991b1b'
      },
      'pendiente': {
        label: 'Pendiente',
        bgColor: '#f59e0b',
        textColor: '#ffffff',
        icon: Package,
        lightBg: '#fef3c7',
        lightText: '#92400e'
      }
    };
    
    return configs[estadoLower] || configs['pendiente'];
  };
  
  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Función para abrir modal de edición
  const handleEdit = (client) => {
    setEditingClient(client);
    setEditFormData({
      nombre: client.firstName || client.nombre || '',
      producto: client.producto || '',
      fechaPedido: client.fechaPedido ? new Date(client.fechaPedido).toISOString().split('T')[0] : '',
      telefono: client.phone || client.telefono || '',
      dirrecion: client.address || client.dirrecion || '',
      estado: client.estado || 'pendiente'
    });
    setShowEditModal(true);
    setShowActionsMenu(false);
  };
  
  // Función para manejar cambios en el formulario de edición
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'telefono') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length >= 4) {
        formattedValue = numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
      } else {
        formattedValue = numbers;
      }
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };
  
  // Función para guardar cambios
  const handleSaveEdit = async () => {
    // Validar campos requeridos
    if (!editFormData.nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre es obligatorio',
        confirmButtonColor: '#5F8EAD'
      });
      return;
    }
    
    Swal.fire({
      title: 'Guardando cambios...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const result = await updateClient(editingClient._id, editFormData);
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'El cliente ha sido actualizado exitosamente',
        confirmButtonColor: '#5F8EAD',
        timer: 2000
      });
      setShowEditModal(false);
      setEditingClient(null);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.error || 'No se pudo actualizar el cliente',
        confirmButtonColor: '#ef4444'
      });
    }
  };
  
  // Función para eliminar cliente
  const handleDelete = async (client) => {
    setShowActionsMenu(false);
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Deseas eliminar a <strong>${client.firstName || client.nombre}</strong>?<br/>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Eliminando...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const deleteResult = await deleteClient(client._id);
      
      if (deleteResult.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El cliente ha sido eliminado exitosamente',
          confirmButtonColor: '#5F8EAD',
          timer: 2000
        });
        closeDetailView();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: deleteResult.error || 'No se pudo eliminar el cliente',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // Efecto para activar loading cuando cambie el cliente seleccionado
  useEffect(() => {
    if (selectedClient && showDetailView) {
      setIsDetailLoading(true);
      const timer = setTimeout(() => {
        setIsDetailLoading(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [selectedClient, showDetailView]);

  // Obtener clientes para la página actual
  const getCurrentPageClients = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clients.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  // Función para cambiar página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  // Función para navegar a agregar cliente
  const handleAddClient = () => {
    navigate('/empleados/agregarEmployee');
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Panel Principal */}
          <div className={`${showDetailView ? 'flex-1' : 'w-full'} bg-white rounded-2xl shadow-2xl ${showDetailView ? 'mr-6' : ''} flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-6" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Gestión de Clientes</h1>
                  <p className="text-blue-100 text-lg">Administra tu cartera de clientes</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Directorio de Clientes</h2>
                    <div className="text-blue-100 flex items-center">
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                        {stats.total > 0 ? `${stats.total} Registrados` : 'Clientes registrados'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Botón Agregar Cliente */}
                  <button 
                    onClick={handleAddClient}
                    className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Cliente</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar clientes..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-700 placeholder-gray-400 shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Header - Sin columna de Acciones */}
            <div className="px-8 py-4 border-b-2" style={{borderColor: '#5F8EAD', backgroundColor: '#f8fafc'}}>
              <div className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 text-sm font-semibold`} style={{color: '#5F8EAD'}}>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nombre
                </div>
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Producto
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha Pedido
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Estado
                </div>
                {!showDetailView && (
                  <>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Teléfono
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Dirección
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Table Content - Sin columna de Acciones */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 pt-0">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#5F8EAD'}}></div>
                    <p className="text-gray-500 mt-4">Cargando clientes...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <p className="text-red-600 mb-4">{error}</p>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-2 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                        style={{backgroundColor: '#ef4444'}}
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                ) : !stats.hasResults ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">
                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay clientes registrados.'}
                      </p>
                      {searchTerm ? (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-2 px-4 py-2 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                          style={{backgroundColor: '#5F8EAD'}}
                        >
                          Limpiar búsqueda
                        </button>
                      ) : (
                        <button 
                          onClick={handleAddClient}
                          className="mt-4 flex items-center space-x-2 px-6 py-3 mx-auto text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          style={{backgroundColor: '#5F8EAD'}}
                        >
                          <Plus className="w-5 h-5" />
                          <span>Agregar primer cliente</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-4">
                    {getCurrentPageClients().map((client, index) => {
                      const estadoConfig = getEstadoConfig(client.estado);
                      const EstadoIcon = estadoConfig.icon;
                      
                      return (
                        <div
                          key={client._id || index}
                          className={`grid ${showDetailView ? 'grid-cols-4' : 'grid-cols-6'} gap-6 py-4 px-6 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                            selectedClient && selectedClient._id === client._id 
                              ? 'shadow-lg transform scale-[1.02]' 
                              : 'hover:shadow-md hover:transform hover:scale-[1.01] border-transparent'
                          }`}
                          style={{
                            backgroundColor: selectedClient && selectedClient._id === client._id ? '#5D9646' : '#ffffff',
                            color: selectedClient && selectedClient._id === client._id ? '#ffffff' : '#374151',
                            borderColor: selectedClient && selectedClient._id === client._id ? '#5D9646' : 'transparent'
                          }}
                          onClick={() => selectClient(client)}
                        >
                          <div className="font-semibold flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                              selectedClient && selectedClient._id === client._id ? 'bg-white bg-opacity-20' : ''
                            }`} style={{backgroundColor: selectedClient && selectedClient._id === client._id ? 'rgba(255,255,255,0.2)' : '#5F8EAD'}}>
                              <User className={`w-5 h-5 text-white`} />
                            </div>
                            <span className="truncate">{client.firstName || client.nombre || 'Sin nombre'}</span>
                          </div>
                          <div className="flex items-center truncate">
                            <CreditCard className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                            <span className="truncate">{client.producto || 'Sin producto'}</span>
                          </div>
                          <div className="flex items-center truncate">
                            <Calendar className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                            <span className="truncate">
                              {client.birthDate || client.fechaPedido ? 
                                new Date(client.birthDate || client.fechaPedido).toLocaleDateString('es-ES') : 
                                'No disponible'
                              }
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                              style={{
                                backgroundColor: selectedClient && selectedClient._id === client._id ? 'rgba(255,255,255,0.2)' : estadoConfig.lightBg,
                                color: selectedClient && selectedClient._id === client._id ? '#ffffff' : estadoConfig.lightText
                              }}
                            >
                              <EstadoIcon className="w-3 h-3 mr-1" />
                              {estadoConfig.label}
                            </span>
                          </div>
                          {!showDetailView && (
                            <>
                              <div className="flex items-center truncate">
                                <Phone className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                                <span className="truncate">
                                  {client.phone || client.telefono || 'No disponible'}
                                </span>
                              </div>
                              <div className="flex items-center truncate">
                                <MapPin className={`w-4 h-4 mr-2 ${selectedClient && selectedClient._id === client._id ? 'text-white' : 'text-gray-400'}`} />
                                <span className="truncate">
                                  {client.address || client.dirrecion || 'No disponible'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 border-t border-gray-100" style={{backgroundColor: '#f8fafc'}}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, clients.length)} de {clients.length} clientes
                  {searchTerm && ` (filtrado de ${stats.total} total)`}
                </div>
                
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <div className="flex space-x-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                      ) : (
                        <button 
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'text-white shadow-sm'
                              : 'text-gray-700 border border-gray-200 hover:bg-white'
                          }`}
                          style={currentPage === page ? {backgroundColor: '#5F8EAD'} : {}}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Detalles */}
          {showDetailView && selectedClient && (
            <div className="w-96 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full">
              {isDetailLoading ? (
                <div className="flex-1 flex items-center justify-center relative" 
                     style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b2f 100%)'}}>
                  
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-10 animate-pulse"
                         style={{backgroundColor: '#5F8EAD', animation: 'float 3s ease-in-out infinite'}}>
                    </div>
                    <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full opacity-10 animate-pulse"
                         style={{backgroundColor: '#5D9646', animation: 'float 3s ease-in-out infinite reverse'}}>
                    </div>
                  </div>

                  <div className="text-center z-10">
                    <div className="relative mb-8">
                      <div className="w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                        <Lottie 
                          animationData={sandyLoadingAnimation}
                          className="w-full h-full"
                          loop={true}
                          autoplay={true}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <h2 className="text-2xl font-bold text-white animate-pulse">
                        Cargando Cliente
                      </h2>
                      <p className="text-gray-300 text-lg">
                        Preparando información del cliente
                      </p>
                    </div>
                    
                    <div className="w-80 mx-auto">
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                        <div className="h-2 rounded-full relative overflow-hidden"
                             style={{
                               background: 'linear-gradient(90deg, #5F8EAD 0%, #5D9646 50%, #5F8EAD 100%)',
                               width: '100%',
                               animation: 'loading-wave 2.5s ease-in-out infinite'
                             }}>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <style jsx>{`
                    @keyframes loading-wave {
                      0% { transform: translateX(-100%); opacity: 0.5; }
                      50% { transform: translateX(0%); opacity: 1; }
                      100% { transform: translateX(100%); opacity: 0.5; }
                    }
                    @keyframes float {
                      0%, 100% { transform: translateY(0px) scale(1); }
                      50% { transform: translateY(-10px) scale(1.1); }
                    }
                  `}</style>
                </div>
              ) : (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{backgroundColor: '#5F8EAD', borderRadius: '0 0 0 100%'}}></div>
                  
                  {/* Header con botón de acciones */}
                  <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
                    <div className="flex items-center">
                      <button
                        className="p-3 hover:bg-gray-100 rounded-xl mr-3 transition-colors"
                        onClick={closeDetailView}
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <h2 className="text-xl font-semibold text-gray-900">Detalles del Cliente</h2>
                    </div>
                    
                    {/* Botón de menú de acciones */}
                    <div className="relative" ref={actionsMenuRef}>
                      <button
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {showActionsMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                          <button
                            onClick={() => handleEdit(selectedClient)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(selectedClient)}
                            className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="text-center mb-10">
                      <div className="relative inline-block">
                        <div className="w-28 h-28 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #5F8EAD 0%, #4a7ba7 100%)'}}>
                          <User className="w-14 h-14 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-gray-900">
                        {selectedClient.firstName || selectedClient.nombre || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {selectedClient.producto || 'Sin producto'}
                      </p>
                      
                      {(() => {
                        const estadoConfig = getEstadoConfig(selectedClient.estado);
                        const EstadoIcon = estadoConfig.icon;
                        return (
                          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-md mb-4"
                               style={{
                                 backgroundColor: estadoConfig.bgColor,
                                 color: estadoConfig.textColor
                               }}>
                            <EstadoIcon className="w-4 h-4 mr-2" />
                            {estadoConfig.label}
                          </div>
                        );
                      })()}
                      
                      <div className="flex justify-center space-x-3">
                        <button className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md" style={{backgroundColor: '#5D9646'}}>
                          <Phone className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-md" style={{backgroundColor: '#5F8EAD'}}>
                          <Mail className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg" style={{backgroundColor: '#5F8EAD'}}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">Información del Pedido</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Producto</div>
                            <div className="text-sm text-gray-600 break-words bg-white p-3 rounded-lg border">
                              {selectedClient.producto || 'No especificado'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Fecha del Pedido</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                              <Calendar className="w-4 h-4 mr-2" style={{color: '#5F8EAD'}} />
                              {selectedClient.birthDate || selectedClient.fechaPedido ? 
                                new Date(selectedClient.birthDate || selectedClient.fechaPedido).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric'
                                }) : 
                                'No disponible'
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg" style={{backgroundColor: '#5D9646'}}>
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">Contacto y Ubicación</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Teléfono</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                              <Phone className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                              {selectedClient.phone || selectedClient.telefono || 'No disponible'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</div>
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border flex items-center">
                              <MapPin className="w-4 h-4 mr-2" style={{color: '#5D9646'}} />
                              {selectedClient.address || selectedClient.dirrecion || 'No disponible'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Editar Cliente</h2>
                  <p className="text-blue-100 text-sm">Actualiza la información del cliente</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Cliente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleEditFormChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Ingrese el nombre"
                  />
                </div>
              </div>
              
              {/* Producto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Producto
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="producto"
                    value={editFormData.producto}
                    onChange={handleEditFormChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Ingrese el producto"
                  />
                </div>
              </div>
              
              {/* Fecha Pedido y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha del Pedido
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="fechaPedido"
                      value={editFormData.fechaPedido}
                      onChange={handleEditFormChange}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="estado"
                      value={editFormData.estado}
                      onChange={handleEditFormChange}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="vendido">Vendido</option>
                      <option value="devolucion">Devolución</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="telefono"
                    value={editFormData.telefono}
                    onChange={handleEditFormChange}
                    maxLength={9}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="0000-0000"
                  />
                </div>
              </div>
              
              {/* Dirección */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección de Entrega
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="dirrecion"
                    value={editFormData.dirrecion}
                    onChange={handleEditFormChange}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    placeholder="Ingrese la dirección completa"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;