import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Mail, User, ArrowLeft, ChevronLeft, ChevronRight, Users, MapPin, Calendar, CreditCard, Plus, Package, CheckCircle, XCircle, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import sandyLoadingAnimation from '../assets/Sandy Loading.json';
import useClients from '../hooks/useDataCliente';
import Swal from 'sweetalert2';

// Importar componentes de empleados
import EditEmployeeModal from '../hooks/Empleados/EditEmployeeModal';
import EmployeeDetailsPanel from '../hooks/Empleados/EmployeDetailsPanel';
import EmployeeHeader from '../hooks/Empleados/EmployeeHeader';
import EmployeeRow from '../hooks/Empleados/EmployeeRow';
import EmployeeTableHeader from '../hooks/Empleados/EmployeeTableHeader';

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
            <EmployeeHeader 
              stats={stats}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddClient={handleAddClient}
            />

            {/* Table Header - Sin columna de Acciones */}
            <EmployeeTableHeader showDetailView={showDetailView} />

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
                    {getCurrentPageClients().map((client, index) => (
                      <EmployeeRow
                        key={client._id || index}
                        client={client}
                        selectedClient={selectedClient}
                        showDetailView={showDetailView}
                        onSelectClient={selectClient}
                        getEstadoConfig={getEstadoConfig}
                      />
                    ))}
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
            <EmployeeDetailsPanel
              selectedClient={selectedClient}
              isDetailLoading={isDetailLoading}
              sandyLoadingAnimation={sandyLoadingAnimation}
              showActionsMenu={showActionsMenu}
              actionsMenuRef={actionsMenuRef}
              onCloseDetail={closeDetailView}
              onToggleActionsMenu={() => setShowActionsMenu(!showActionsMenu)}
              onEdit={() => handleEdit(selectedClient)}
              onDelete={() => handleDelete(selectedClient)}
              getEstadoConfig={getEstadoConfig}
            />
          )}
        </div>
      </div>
      
      {/* Modal de Edición */}
      {showEditModal && (
        <EditEmployeeModal
          editFormData={editFormData}
          onFormChange={handleEditFormChange}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Clientes;