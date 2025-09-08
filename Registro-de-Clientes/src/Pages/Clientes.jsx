import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmployeeManagement from '../hooks/Empleados/hooks/useDataEmpleado';

// Importar componentes UI
import SweetAlert from '../Components/UIEmpleados/SweetAlert';
import ConfirmDeleteAlert from '../Components/UIEmpleados/ConfirmDeleteAlert';
import SuccessAlert from '../Components/UIEmpleados/SuccessAlert';
import Pagination from '../Components/UIEmpleados/Pagination';
import LoadingSpinner, { EmptyState } from '../Components/UIEmpleados/LoadingSpinner';

// Importar componentes específicos de empleados
import EmployeeHeader from '../hooks/Empleados/EmployeeHeader';
import EmployeeTableHeader from '../hooks/Empleados/EmployeeTableHeader';
import EmployeeRow from '../hooks/Empleados/EmployeeRow';
import EmployeeDetailPanel from '../hooks/Empleados/EmployeDetailsPanel';
import EditEmployeeModal from '../hooks/Empleados/EditEmployeeModal';

const Employee = () => {
  const {
    empleados,
    selectedEmpleados,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    setSearchTerm,
    setSortBy,
    showAlert,
    showConfirmDelete,
    showSuccessAlert,
    showEditAlert,
    successType,
    filterEmpleados,
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
    selectEmpleado,
    closeDetailView
  } = useEmployeeManagement();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Función para ordenar empleados
  const getSortedEmployees = () => {
    let sorted = [...filterEmpleados];
    
    if (sortBy === 'Newest') {
      sorted.sort((a, b) => new Date(b.createdAt || b.birthDate) - new Date(a.createdAt || a.birthDate));
    } else if (sortBy === 'Oldest') {
      sorted.sort((a, b) => new Date(a.createdAt || a.birthDate) - new Date(b.createdAt || b.birthDate));
    }
    
    return sorted;
  };

  // Obtener empleados para la página actual
  const getCurrentPageEmployees = () => {
    const sortedEmployees = getSortedEmployees();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedEmployees.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(filterEmpleados.length / itemsPerPage);

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

  // Renderizar contenido de la tabla
  const renderTableContent = () => {
    if (loading) {
      return <LoadingSpinner message="Cargando empleados..." />;
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

    if (filterEmpleados.length === 0) {
      return (
        <EmptyState 
          title="No se encontraron empleados"
          description="Intenta ajustar los filtros de búsqueda."
        />
      );
    }

    return (
      <div className="space-y-2 pt-2 sm:pt-4">
        {getCurrentPageEmployees().map((empleado, index) => (
          <EmployeeRow
            key={empleado._id || index}
            empleado={empleado}
            showDetailView={showDetailView}
            selectedEmpleados={selectedEmpleados}
            selectEmpleado={selectEmpleado}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 employee-container" style={{background: 'linear-gradient(135deg, #34353A 0%, #2a2b30 100%)'}}>
      <div className="h-full w-full flex flex-col lg:flex-row">
        
        {/* Panel Principal */}
        <div className={`${showDetailView ? 'lg:flex-1' : 'w-full'} bg-white lg:rounded-l-2xl xl:rounded-l-3xl shadow-2xl flex flex-col overflow-hidden employee-main-panel h-full`}>
          
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-100">
            <EmployeeHeader
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterEmpleados={filterEmpleados}
              handleContinue={handleContinue}
            />
          </div>

          {/* Table Header */}
          <div className="flex-shrink-0 border-b border-gray-50">
            <EmployeeTableHeader showDetailView={showDetailView} />
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto employee-scroll">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-0">
              {renderTableContent()}
            </div>
          </div>

          {/* Footer con Paginación */}
          {filterEmpleados.length > 0 && !loading && (
            <div className="flex-shrink-0 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                getPageNumbers={getPageNumbers}
                itemsPerPage={itemsPerPage}
                totalItems={filterEmpleados.length}
              />
            </div>
          )}
        </div>

        {/* Panel de Detalles - Desktop */}
        {showDetailView && selectedEmpleados && (
          <div className="hidden lg:block lg:w-96 xl:w-[400px] 2xl:w-[450px] h-full">
            <EmployeeDetailPanel
              selectedEmpleados={selectedEmpleados}
              closeDetailView={closeDetailView}
              handleOptionsClick={handleOptionsClick}
            />
          </div>
        )}

        {/* Panel de Detalles - Mobile/Tablet (Modal overlay) */}
        {showDetailView && selectedEmpleados && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm employee-modal-overlay">
            <div className="h-full flex items-end sm:items-center justify-center p-2 sm:p-4">
              <div className="w-full sm:w-96 sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <EmployeeDetailPanel
                  selectedEmpleados={selectedEmpleados}
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
        employeeName={selectedEmpleados ? `${selectedEmpleados.name} ${selectedEmpleados.lastName}` : ''}
      />

      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={closeSuccessAlert}
        type={successType}
      />

      <EditEmployeeModal
        isOpen={showEditAlert}
        onClose={closeEditAlert}
        onSave={handleSaveEdit}
        employee={selectedEmpleados}
      />

      {/* Estilos para pantalla completa */}
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
          .employee-container {
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
          .employee-main-panel {
            contain: layout style;
            border-radius: 0 !important;
          }

          /* Solo redondear esquinas en desktop */
          @media (min-width: 1024px) {
            .employee-main-panel {
              border-top-left-radius: 1rem !important;
              border-bottom-left-radius: 1rem !important;
            }
          }

          @media (min-width: 1280px) {
            .employee-main-panel {
              border-top-left-radius: 1.5rem !important;
              border-bottom-left-radius: 1.5rem !important;
            }
          }

          /* Scroll personalizado para la tabla */
          .employee-scroll {
            scrollbar-width: thin;
            scrollbar-color: #CBD5E1 #F1F5F9;
            -webkit-overflow-scrolling: touch;
          }
          
          .employee-scroll::-webkit-scrollbar {
            width: 8px;
          }
          
          .employee-scroll::-webkit-scrollbar-track {
            background: #F1F5F9;
            border-radius: 4px;
          }
          
          .employee-scroll::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
            transition: background 0.2s ease;
          }
          
          .employee-scroll::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
          }

          /* Animaciones para el modal móvil */
          .employee-modal-overlay {
            animation: fadeIn 0.2s ease-out;
          }
          
          .employee-modal-overlay .bg-white {
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

          /* Optimizaciones de rendimiento para pantalla completa */
          .employee-container {
            contain: layout style paint;
            overscroll-behavior: contain;
            will-change: transform;
          }

          /* Móviles - ocupar toda la pantalla */
          @media (max-width: 640px) {
            .employee-container {
              padding: 0 !important;
            }
            
            .employee-main-panel {
              border-radius: 0 !important;
              margin: 0 !important;
            }
          }

          /* Tablets */
          @media (min-width: 641px) and (max-width: 1023px) {
            .employee-modal-overlay .bg-white {
              margin: 0.5rem;
              height: calc(100vh - 1rem);
              border-radius: 1rem !important;
            }
          }

          /* Accesibilidad */
          @media (prefers-reduced-motion: reduce) {
            .employee-modal-overlay,
            .employee-modal-overlay .bg-white {
              animation: none !important;
            }
            
            .employee-scroll::-webkit-scrollbar-thumb {
              transition: none !important;
            }
          }

          /* Fix para pantallas muy anchas */
          @media (min-width: 1920px) {
            .employee-container {
              max-width: none !important;
            }
          }

          /* Evitar zoom no deseado en móviles */
          @media (max-width: 640px) {
            input, select, textarea {
              font-size: 16px !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default Employee;