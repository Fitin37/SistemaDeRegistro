import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const useDataCliente = () => {
  // Estados principales
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  
  // Estados de modales
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [successType, setSuccessType] = useState('delete');
  
  // Estado para el botón de actualizar
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();

  // Función para cargar clientes (CORREGIDA PARA EL FORMATO CORRECTO)
  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando petición a la API de clientes...');
      
      const response = await axios.get('https://sistemaderegistro2.onrender.com/api/clientes');
      
      console.log('📡 Status de la respuesta:', response.status);
      console.log('📋 Datos recibidos completos:', response.data);
      console.log('📋 Tipo de datos recibidos:', typeof response.data);
      
      const responseData = response.data;
      
      // Manejar el formato específico de tu backend
      let clientesArray = [];
      
      if (Array.isArray(responseData)) {
        // Si la respuesta es directamente un array
        clientesArray = responseData;
        console.log('✅ Datos son un array directo');
      } else if (responseData && responseData.data && Array.isArray(responseData.data.clientes)) {
        // Tu API devuelve: { success: true, data: { clientes: [...] } }
        clientesArray = responseData.data.clientes;
        console.log('✅ Datos encontrados en data.clientes');
      } else if (responseData && Array.isArray(responseData.clientes)) {
        // Si está directamente en clientes
        clientesArray = responseData.clientes;
        console.log('✅ Datos encontrados en clientes');
      } else if (responseData && Array.isArray(responseData.data)) {
        // Si está en data como array
        clientesArray = responseData.data;
        console.log('✅ Datos encontrados en data');
      } else {
        console.warn('⚠️ Formato de datos no esperado:', responseData);
        console.warn('⚠️ Estructura recibida:', Object.keys(responseData || {}));
        throw new Error('Formato de datos no válido');
      }

      console.log(`📊 Cantidad de clientes encontrados: ${clientesArray.length}`);
      
      if (clientesArray.length === 0) {
        console.log('⚠️ No se encontraron clientes en la respuesta');
      } else {
        console.log('📋 Primeros clientes:', clientesArray.slice(0, 2));
      }

      // Normalizar los datos de clientes (adaptado a tu schema)
      const normalizedClientes = clientesArray.map((cliente, index) => {
        console.log(`🔄 Normalizando cliente ${index + 1}:`, cliente);
        
        return {
          ...cliente,
          // Asegurar que todos los campos existan según tu schema
          nombre: cliente.nombre || '',
          producto: cliente.producto || '',
          telefono: cliente.telefono || '',
          dirrecion: cliente.dirrecion || '',
          fechaPedido: cliente.fechaPedido || null,
          _id: cliente._id || cliente.id || `temp-${index}`
        };
      });

      console.log("✅ Clientes normalizados:", normalizedClientes);
      setClientes(normalizedClientes);
      setError(null);
      
    } catch (error) {
      console.error('❌ Error detallado:', error);
      console.error('❌ Tipo de error:', error.name);
      console.error('❌ Mensaje de error:', error.message);
      
      // Verificar si es un error de red
      if (error.message.includes('Network') || error.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose en https://sistemaderegistro2.onrender.com');
      } else if (error.response) {
        setError(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
      } else {
        setError(`Error al cargar clientes: ${error.message}`);
      }
      setClientes([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
      console.log('🏁 Carga de clientes finalizada');
    }
  };

  // Cargar clientes al iniciar
  useEffect(() => {
    fetchClientes();
  }, []);

  // Filtrar clientes - adaptado a los campos correctos
  const filterClientes = Array.isArray(clientes) ? clientes.filter((cliente) => 
    [cliente.nombre, cliente.producto, cliente.telefono, cliente.dirrecion]
    .join(' ')
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) : [];

  // Navegación
  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/empleados/agregarEmployee');
  };

  // Manejo de opciones
  const handleOptionsClick = (e) => {
    e.stopPropagation();
    setShowAlert(true);
  };

  const handleEdit = () => {
    setShowAlert(false);
    setShowEditAlert(true);
  };

  const handleDelete = () => {
    setShowAlert(false);
    setShowConfirmDelete(true);
  };

  // Eliminar cliente
  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      console.log(`🗑️ Eliminando cliente ${selectedCliente._id}`);
      await axios.delete(`https://sistemaderegistro2.onrender.com/api/clientes/${selectedCliente._id}`);
      
      // Asegurar que clientes es un array antes de filtrar
      setClientes(prevClientes => 
        Array.isArray(prevClientes) 
          ? prevClientes.filter(cliente => cliente._id !== selectedCliente._id)
          : []
      );
      
      console.log("✅ Cliente eliminado:", selectedCliente);
      setShowDetailView(false);
      setSelectedCliente(null);
      setSuccessType('delete');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("❌ Error al eliminar cliente:", error);
      setError("Error al eliminar el cliente");
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // FUNCIÓN HANDLESAVEEDIT ADAPTADA PARA CLIENTES
  const handleSaveEdit = async (formData) => {
    // VALIDACIÓN CRÍTICA - Verificar cliente seleccionado
    if (!selectedCliente) {
      console.error('❌ No hay cliente seleccionado');
      setError('No hay cliente seleccionado para actualizar');
      return;
    }
    
    if (!selectedCliente._id) {
      console.error('❌ El cliente seleccionado no tiene ID:', selectedCliente);
      setError('El cliente seleccionado no tiene un ID válido');
      return;
    }
    
    console.log('🎯 Cliente ANTES de actualizar:', selectedCliente);
    
    // Activar estado de carga
    setUploading(true);
    
    try {
      // Log detallado de lo que se está enviando
      console.log('📤 Enviando actualización a:', `https://sistemaderegistro2.onrender.com/api/clientes/${selectedCliente._id}`);

      // Realizar la actualización
      const response = await axios.put(
        `https://sistemaderegistro2.onrender.com/api/clientes/${selectedCliente._id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("✅ Respuesta COMPLETA del servidor:", response.data);
      
      // Extraer datos del servidor
      const updatedClienteFromServer = response.data.cliente || response.data.data || response.data;
      
      // 🎯 CRÍTICO: Combinar datos del servidor con datos existentes para preservar campos
      const fullyUpdatedCliente = {
        // Empezar con los datos originales para preservar TODO
        ...selectedCliente,
        // Sobrescribir SOLO con los datos que vienen del servidor
        ...updatedClienteFromServer,
        // Asegurar que estos campos críticos NO se pierdan
        _id: selectedCliente._id,
        nombre: updatedClienteFromServer.nombre || selectedCliente.nombre,
        producto: updatedClienteFromServer.producto || selectedCliente.producto,
        telefono: updatedClienteFromServer.telefono || selectedCliente.telefono,
        dirrecion: updatedClienteFromServer.dirrecion || selectedCliente.dirrecion,
        fechaPedido: updatedClienteFromServer.fechaPedido || selectedCliente.fechaPedido
      };
      
      console.log("✅ Cliente COMBINADO final:", fullyUpdatedCliente);
      
      // 🚀 ACTUALIZACIÓN INMEDIATA - Primero actualizar selectedCliente
      setSelectedCliente(fullyUpdatedCliente);
      
      // Después actualizar la lista de clientes
      setClientes(prevClientes => 
        Array.isArray(prevClientes)
          ? prevClientes.map(cliente => 
              cliente._id === selectedCliente._id 
                ? fullyUpdatedCliente
                : cliente
            )
          : [fullyUpdatedCliente]
      );
      
      console.log("✅ ACTUALIZACIÓN INSTANTÁNEA COMPLETADA");
      
      // Cerrar el modal y mostrar éxito
      setShowEditAlert(false);
      setSuccessType('edit');
      setShowSuccessAlert(true);
      
    } catch (error) {
      console.error("❌ Error completo al actualizar cliente:", error);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Response status:", error.response?.status);
      
      let errorMessage = 'Error al actualizar el cliente';
      
      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      // IMPORTANTE: Siempre desactivar el estado de carga
      setUploading(false);
    }
  };

  // Cerrar modales
  const closeAlert = () => {
    setShowAlert(false);
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const closeEditAlert = () => {
    setShowEditAlert(false);
  };

  // Seleccionar cliente - CON VALIDACIÓN
  const selectCliente = (cliente) => {
    console.log('👤 Cliente seleccionado:', cliente);
    console.log('👤 ID del cliente:', cliente?._id);
    
    if (!cliente || !cliente._id) {
      console.error('❌ Cliente inválido seleccionado');
      setError('Cliente inválido seleccionado');
      return;
    }
    
    setSelectedCliente(cliente);
    setShowDetailView(true);
  };

  // Cerrar vista detalle
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedCliente(null);
  };

  // Refrescar datos (usa la función fetchClientes)
  const refreshClientes = async () => {
    console.log('🔄 Refrescando lista de clientes...');
    await fetchClientes();
  };

  // Función para obtener estadísticas
  const getStats = () => {
    const clientesArray = Array.isArray(clientes) ? clientes : [];
    const filteredArray = Array.isArray(filterClientes) ? filterClientes : [];
    
    return {
      total: clientesArray.length,
      filtered: filteredArray.length,
      hasResults: filteredArray.length > 0
    };
  };

  // Efecto para debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Estado actual de clientes:', {
        count: clientes.length,
        loading,
        error,
        hasData: clientes.length > 0,
        clientes: clientes.slice(0, 2) // Solo mostrar los primeros 2
      });
    }
  }, [clientes, loading, error]);

  // Efecto para monitorear selectedCliente
  useEffect(() => {
    console.log('🔍 Estado de selectedCliente cambió:', {
      cliente: selectedCliente,
      tieneId: selectedCliente?._id,
      id: selectedCliente?._id
    });
  }, [selectedCliente]);

  return {
    // Estados (adaptados para clientes)
    empleados: clientes,          // Mantengo este nombre para compatibilidad
    selectedEmpleados: selectedCliente,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    showAlert,
    showConfirmDelete,
    showSuccessAlert,
    showEditAlert,
    successType,
    filterEmpleados: filterClientes,  // Mantengo este nombre para compatibilidad
    uploading,

    // Setters
    setSearchTerm,
    setSortBy,
    setError,
    setUploading,

    // Funciones (mantengo nombres para compatibilidad)
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
    closeDetailView,
    refreshEmpleados: refreshClientes,
    fetchEmpleados: fetchClientes,
    
    // Utilidades
    stats: getStats()
  };
};

export default useDataCliente;