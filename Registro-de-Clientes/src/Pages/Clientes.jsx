import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useClients from '../hooks/useDataCliente';
import Swal from 'sweetalert2';

// Importar componentes de clientes (usando las rutas correctas de tu proyecto)
import EditEmployeeModal from '../hooks/Empleados/EditEmployeeModal';
import ClienteDetailPanel from '../hooks/Empleados/EmployeDetailsPanel';
import EmployeeHeader from '../hooks/Empleados/EmployeeHeader';
import ClienteRow from '../hooks/Empleados/EmployeeRow';
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

  // Estados para el menú de acciones en el panel
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef(null);
  
  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    console.log('📝 Abriendo modal de edición para:', client);
    setEditingClient(client);
    setShowEditModal(true);
    setShowActionsMenu(false);
  };
  
  // Función para guardar cambios
  const handleSaveEdit = async (dataToSend) => {
    console.log('💾 Guardando cambios del cliente:', dataToSend);
    
    setUploading(true);
    
    Swal.fire({
      title: 'Guardando cambios...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const result = await updateClient(editingClient._id, dataToSend);
    
    setUploading(false);
    
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
    console.log('🗑️ Intentando eliminar cliente:', client);
    setShowActionsMenu(false);
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Deseas eliminar a <strong>${client.nombre}</strong>?<br/>Esta acción no se puede deshacer.`,
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

  // Manejar click en opciones del panel de detalles
  const handleOptionsClick = () => {
    console.log('⚙️ Toggle menú de opciones');
    setShowActionsMenu(!showActionsMenu);
  };

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
    <div className="min-h-screen p-6" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 h-[calc(100vh-3rem)]">
          {/* Panel Principal */}
          <div className={`${showDetailView ? 'flex-1' : 'w-full'} rounded-2xl shadow-2xl flex flex-col overflow-hidden`} style={{backgroundColor: 'transparent'}}>
            
            {/* Header usando componente EmployeeHeader */}
            <EmployeeHeader 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterEmpleados={clients}
              handleContinue={handleAddClient}
            />

            {/* Table Header usando componente EmployeeTableHeader */}
            <EmployeeTableHeader showDetailView={showDetailView} />

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 pb-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-gray-500 mt-4">Cargando clientes...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <p className="text-red-600 mb-4">{error}</p>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                ) : !stats.hasResults ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                      <p className="text-gray-500 text-lg mb-2">
                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay clientes registrados.'}
                      </p>
                      {searchTerm ? (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                        >
                          Limpiar búsqueda
                        </button>
                      ) : (
                        <button 
                          onClick={handleAddClient}
                          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg"
                        >
                          Agregar primer cliente
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    {/* Usando componente ClienteRow para cada fila */}
                    {getCurrentPageClients().map((client, index) => (
                      <ClienteRow
                        key={client._id || index}
                        empleado={client}
                        showDetailView={showDetailView}
                        selectedEmpleados={selectedClient}
                        selectEmpleado={selectClient}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer con paginación */}
            {stats.hasResults && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, clients.length)} de {clients.length} clientes
                    {searchTerm && ` (filtrado de ${stats.total} total)`}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex space-x-1">
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={index} className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
                        ) : (
                          <button 
                            key={index}
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 hover:bg-white'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel de Detalles usando componente ClienteDetailPanel */}
          {showDetailView && selectedClient && (
            <div className="relative">
              <ClienteDetailPanel
                selectedEmpleados={selectedClient}
                closeDetailView={closeDetailView}
                handleOptionsClick={handleOptionsClick}
              />
              
              {/* Menú de acciones flotante sobre el panel */}
              {showActionsMenu && (
                <div 
                  ref={actionsMenuRef}
                  className="absolute right-8 top-20 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                >
                  <button
                    onClick={() => handleEdit(selectedClient)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
                  >
                    <span>✏️</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedClient)}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600 transition-colors"
                  >
                    <span>🗑️</span>
                    <span>Eliminar</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Edición usando componente EditEmployeeModal - CON ESTADO */}
      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => {
          console.log('❌ Cerrando modal de edición');
          setShowEditModal(false);
          setEditingClient(null);
        }}
        onSave={handleSaveEdit}
        employee={editingClient}
        uploading={uploading}
        includeEstado={true}
      />
    </div>
  );
};

export default Clientes;