import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDataCliente from '../hooks/useDataCliente';

// Importar componentes UI
import SweetAlert from '../Components/UIEmpleados/SweetAlert';
import ConfirmDeleteAlert from '../Components/UIEmpleados/ConfirmDeleteAlert';
import SuccessAlert from '../Components/UIEmpleados/SuccessAlert';
import Pagination from '../Components/UIEmpleados/Pagination';
import LoadingSpinner, { EmptyState } from '../Components/UIEmpleados/LoadingSpinner';
import SavingIndicator from '../Components/SavingIndicator';

// Importar componentes específicos de clientes
import ClienteHeader from '../Components/ClienteHeader';
import ClienteTableHeader from '../Components/ClienteTableHeader';
import ClienteRow from '../Components/ClienteRow';
import ClienteDetailPanel from '../Components/ClienteDetailPanel';
import EditClienteModal from '../Components/EditClienteModal';

const Cliente = () => {
  const {
    empleados: clientes,
    selectedEmpleados: selectedCliente,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    uploading,
    setSearchTerm,
    setSortBy,
    showAlert,
    showConfirmDelete,
    showSuccessAlert,
    showEditAlert,
    successType,
    filterEmpleados: filterClientes,
    handleContinue,
    handleOptionsClick,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleSaveEdit,
    closeAlert,
    closeSuccessAlert,
    closeEditAlert,
    selectEmpleado: selectCliente,
    closeDetailView
  } = useDataCliente();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [lastUpdated, setLastUpdated] = useState(null);

  // Función para ordenar clientes
  const getSortedClientes = () => {
    let sorted = [...filterClientes];
    
    if (sortBy === 'Newest') {
      sorted.sort((a, b) => new Date(b.fechaPedido || b.createdAt) - new Date(a.fechaPedido || a.createdAt));
    } else if (sortBy === 'Oldest') {
      sorted.sort((a, b) => new Date(a.fechaPedido || a.createdAt) - new Date(b.fechaPedido || b.createdAt));
    }
    
    return sorted;
  };

  // Obtener clientes para la página actual
  const getCurrentPageClientes = () => {
    const sortedClientes = getSortedClientes();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedClientes.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(filterClientes.length / itemsPerPage);

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

  // Monitorear actualizaciones en tiempo real
  useEffect(() => {
    if (selectedCliente && !uploading) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [selectedCliente, uploading]);

  // Función wrapper para handleSaveEdit con feedback inmediato
  const handleSaveWithFeedback = async (dataToUpdate) => {
    await handleSaveEdit(dataToUpdate);
  };

  // Renderizar contenido de la tabla
  const renderTableContent = () => {
    if (loading) {
      return <LoadingSpinner message="Cargando clientes..." />;
    }

    if (error) {
      return (
        <div className="text-center py-6 sm:py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <p className="text-red-600 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      );
    }

    if (filterClientes.length === 0) {
      return (
        <EmptyState 
          title="No se encontraron clientes"
          description="Intenta ajustar los filtros de búsqueda o agrega tu primer cliente."
        />
      );
    }

    return (
      <div className="space-y-2 pt-2 sm:pt-4">
        {getCurrentPageClientes().map((cliente, index) => (
          <ClienteRow
            key={`${cliente._id}-${lastUpdated || index}`}
            empleado={cliente}
            showDetailView={showDetailView}
            selectedEmpleados={selectedCliente}
            selectEmpleado={selectCliente}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 cliente-container" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      {/* Indicador de guardado en tiempo real */}
      <SavingIndicator 
        uploading={uploading}
        successType={successType}
        showSuccessAlert={showSuccessAlert}
      />

      <div className="h-full w-full flex flex-col lg:flex-row">
        
        {/* Panel Principal */}
        <div className={`${showDetailView ? 'lg:flex-1' : 'w-full'} bg-white lg:rounded-l-2xl xl:rounded-l-3xl shadow-2xl flex flex-col overflow-hidden cliente-main-panel h-full`}>
          
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-100">
            <ClienteHeader
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterClientes={filterClientes}
              handleContinue={handleContinue}
            />
          </div>

          {/* Table Header */}
          <div className="flex-shrink-0 border-b border-gray-50">
            <ClienteTableHeader showDetailView={showDetailView} />
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto cliente-scroll">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-0">
              {renderTableContent()}
            </div>
          </div>

          {/* Footer con Paginación */}
          {filterClientes.length > 0 && !loading && (
            <div className="flex-shrink-0 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                getPageNumbers={getPageNumbers}
                itemsPerPage={itemsPerPage}
                totalItems={filterClientes.length}
              />
            </div>
          )}
        </div>

        {/* Panel de Detalles - Desktop */}
        {showDetailView && selectedCliente && (
          <div className="hidden lg:block lg:w-96 xl:w-[400px] 2xl:w-[450px] h-full">
            <ClienteDetailPanel
              selectedEmpleados={selectedCliente}
              closeDetailView={closeDetailView}
              handleOptionsClick={handleOptionsClick}
            />
          </div>
        )}

        {/* Panel de Detalles - Mobile/Tablet (Modal overlay) */}
        {showDetailView && selectedCliente && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm cliente-modal-overlay">
            <div className="h-full flex items-end sm:items-center justify-center p-2 sm:p-4">
              <div className="w-full sm:w-96 sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <ClienteDetailPanel
                  selectedEmpleados={selectedCliente}
                  closeDetailView={closeDetailView}
                  handleOptionsClick={handleOptionsClick}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <SweetAlert
        isOpen={showAlert}
        onClose={closeAlert}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmDeleteAlert
        isOpen={showConfirmDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        employeeName={selectedCliente ? selectedCliente.nombre : ''}
      />

      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={closeSuccessAlert}
        type={successType}
      />

      <EditClienteModal
        isOpen={showEditAlert}
        onClose={closeEditAlert}
        onSave={handleSaveWithFeedback}
        employee={selectedCliente}
        uploading={uploading}
      />

      {/* Estilos optimizados para móviles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Reset completo para pantalla completa */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          
          #root {
            height: 100vh !important;
            width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Contenedor principal en pantalla completa */
          .cliente-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          /* Panel principal optimizado */
          .cliente-main-panel {
            contain: layout style;
            border-radius: 0 !important;
          }

          /* MÓVILES: Optimizaciones específicas */
          @media (max-width: 640px) {
            .cliente-container {
              padding: 0 !important;
            }
            
            .cliente-main-panel {
              border-radius: 0 !important;
              margin: 0 !important;
            }

            /* Header más compacto en móvil */
            .cliente-main-panel > div:first-child {
              padding: 1rem 0.75rem !important;
            }

            /* Tabla más compacta en móvil */
            .cliente-scroll > div {
              padding: 0.75rem !important;
            }

            /* Filas de cliente más compactas */
            .cliente-row {
              padding: 0.75rem !important;
              font-size: 0.875rem !important;
            }

            /* Ocultar columnas menos importantes en móvil */
            .hidden-mobile {
              display: none !important;
            }

            /* Stack layout en móvil para detalles */
            .mobile-stack {
              flex-direction: column !important;
              gap: 0.25rem !important;
            }

            /* Botones más grandes en móvil */
            .mobile-button {
              min-height: 44px !important;
              font-size: 16px !important;
            }

            /* Paginación más compacta en móvil */
            .pagination-mobile {
              gap: 0.25rem !important;
            }

            .pagination-mobile button {
              padding: 0.5rem !important;
              min-width: 40px !important;
              min-height: 40px !important;
            }
          }

          /* TABLETS: Optimizaciones */
          @media (min-width: 641px) and (max-width: 1023px) {
            .cliente-modal-overlay .bg-white {
              margin: 0.5rem;
              height: calc(100vh - 1rem);
              border-radius: 1rem !important;
            }

            /* Ajustes de padding para tablets */
            .cliente-main-panel > div {
              padding: 1.25rem !important;
            }
          }

          /* DESKTOP: Solo redondear esquinas */
          @media (min-width: 1024px) {
            .cliente-main-panel {
              border-top-left-radius: 1rem !important;
              border-bottom-left-radius: 1rem !important;
            }
          }

          @media (min-width: 1280px) {
            .cliente-main-panel {
              border-top-left-radius: 1.5rem !important;
              border-bottom-left-radius: 1.5rem !important;
            }
          }

          /* Scroll personalizado para la tabla */
          .cliente-scroll {
            scrollbar-width: thin;
            scrollbar-color: #CBD5E1 #F1F5F9;
            -webkit-overflow-scrolling: touch;
          }
          
          .cliente-scroll::-webkit-scrollbar {
            width: 8px;
          }
          
          @media (max-width: 640px) {
            .cliente-scroll::-webkit-scrollbar {
              width: 4px;
            }
          }
          
          .cliente-scroll::-webkit-scrollbar-track {
            background: #F1F5F9;
            border-radius: 4px;
          }
          
          .cliente-scroll::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
            transition: background 0.2s ease;
          }
          
          .cliente-scroll::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
          }

          /* Animaciones para el modal móvil */
          .cliente-modal-overlay {
            animation: fadeIn 0.2s ease-out;
          }
          
          .cliente-modal-overlay .bg-white {
            animation: slideUp 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              transform: translateY(100%);
              opacity: 0;
            }
            to { 
              transform: translateY(0);
              opacity: 1;
            }
          }

          /* Optimizaciones de rendimiento */
          .cliente-container {
            contain: layout style paint;
            overscroll-behavior: contain;
            will-change: transform;
          }

          /* Mejoras para pantallas táctiles */
          @media (hover: none) and (pointer: coarse) {
            .cliente-row:hover {
              transform: none !important;
            }
            
            .cliente-row:active {
              transform: scale(0.98) !important;
              transition: transform 0.1s ease !important;
            }

            /* Botones más grandes en pantallas táctiles */
            button {
              min-height: 44px !important;
            }
          }

          /* Accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .cliente-modal-overlay,
            .cliente-modal-overlay .bg-white,
            .cliente-row {
              animation: none !important;
              transition: none !important;
            }
            
            .cliente-scroll::-webkit-scrollbar-thumb {
              transition: none !important;
            }
          }

          /* Fix para pantallas muy anchas */
          @media (min-width: 1920px) {
            .cliente-container {
              max-width: none !important;
            }
          }

          /* Evitar zoom no deseado en móviles */
          @media (max-width: 640px) {
            input, select, textarea {
              font-size: 16px !important;
            }
          }

          /* Mejoras de contraste para accesibilidad */
          @media (prefers-contrast: high) {
            .cliente-row {
              border: 2px solid #000 !important;
            }
              
            .bg-gray-50 {
              background-color: #f8f9fa !important;
            }
          }

          /* Tema oscuro si es preferido */
          @media (prefers-color-scheme: dark) {
            .cliente-container {
              background: linear-gradient(135deg, #1a1b1e 0%, #25262a 100%) !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default Cliente;