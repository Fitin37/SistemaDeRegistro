import { useState, useEffect } from 'react';
import axios from 'axios';

// URL de la API - usa proxy en desarrollo, URL completa en producción
const API_URL = import.meta.env.DEV 
  ? '/api'  // En desarrollo usa el proxy de Vite
  : 'https://sistemaderegistro2.onrender.com/api'; // En producción usa la URL directa

const useDataCliente = () => {
  // Estados principales
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, []);

  // Función para obtener clientes
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Iniciando petición a la API de clientes...');
      console.log('📍 URL:', `${API_URL}/clientes`);
      
      const response = await axios.get(`${API_URL}/clientes`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status de la respuesta:', response.status);
      console.log('📋 Datos recibidos completos:', response.data);
      
      const clientsData = response.data;
      
      // Manejar diferentes estructuras de respuesta
      let clientsArray = [];
      
      if (Array.isArray(clientsData)) {
        clientsArray = clientsData;
      } else if (clientsData && clientsData.data && Array.isArray(clientsData.data.clientes)) {
        clientsArray = clientsData.data.clientes;
      } else if (clientsData && Array.isArray(clientsData.clientes)) {
        clientsArray = clientsData.clientes;
      } else if (clientsData && Array.isArray(clientsData.data)) {
        clientsArray = clientsData.data;
      } else {
        console.warn('⚠️ Formato de datos no esperado:', clientsData);
        throw new Error('Formato de datos no válido');
      }

      console.log(`📊 Cantidad de clientes encontrados: ${clientsArray.length}`);

      // Normalizar los datos de clientes
      const normalizedClients = clientsArray.map((client, index) => {
        return {
          ...client,
          firstName: client.nombre || client.firstName || client.firtsName || '',
          lastName: client.lastName || '',
          email: client.email || '',
          idNumber: client.idNumber || '',
          birthDate: client.fechaPedido || client.birthDate || null,
          phone: client.telefono || client.phone || '',
          address: client.dirrecion || client.address || '',
          producto: client.producto || '',
          estado: client.estado || 'pendiente',
          _id: client._id || client.id || `temp-${index}`
        };
      });

      console.log("✅ Clientes normalizados:", normalizedClients);
      setClients(normalizedClients);
      setError(null);
      
    } catch (error) {
      console.error('❌ Error detallado:', error);
      
      if (error.message.includes('Network') || error.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose en https://sistemaderegistro2.onrender.com');
      } else if (error.response) {
        setError(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
      } else {
        setError(`Error al cargar clientes: ${error.message}`);
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar un cliente - CORREGIDA
  const updateClient = async (clientId, updateData) => {
    try {
      console.log(`📝 Actualizando cliente ${clientId}:`, updateData);
      
      // Mapear datos del frontend al formato del backend
      const dataToSend = {};
      
      if (updateData.nombre) dataToSend.nombre = updateData.nombre;
      if (updateData.producto) dataToSend.producto = updateData.producto;
      if (updateData.fechaPedido) dataToSend.fechaPedido = updateData.fechaPedido;
      if (updateData.telefono) dataToSend.telefono = updateData.telefono;
      if (updateData.dirrecion) dataToSend.dirrecion = updateData.dirrecion;
      if (updateData.estado) dataToSend.estado = updateData.estado; // ← AGREGAR ESTADO
      
      console.log('📤 Datos a enviar al servidor:', dataToSend);
      
      const response = await axios.put(`${API_URL}/clientes/${clientId}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      // Obtener los datos actualizados del servidor
      const updatedClientData = response.data.cliente || response.data.data || response.data;
      
      // Normalizar el cliente actualizado
      const updatedClient = {
        ...updatedClientData,
        firstName: updatedClientData.nombre || updatedClientData.firstName || '',
        lastName: updatedClientData.lastName || '',
        email: updatedClientData.email || '',
        idNumber: updatedClientData.idNumber || '',
        birthDate: updatedClientData.fechaPedido || updatedClientData.birthDate || null,
        phone: updatedClientData.telefono || updatedClientData.phone || '',
        address: updatedClientData.dirrecion || updatedClientData.address || '',
        producto: updatedClientData.producto || '',
        estado: updatedClientData.estado || 'pendiente', // ← INCLUIR ESTADO
        _id: updatedClientData._id || clientId
      };
      
      console.log('🔄 Cliente normalizado:', updatedClient);
      
      // Actualizar el array de clientes
      setClients(prev => 
        Array.isArray(prev) 
          ? prev.map(client => client._id === clientId ? updatedClient : client)
          : [updatedClient]
      );
      
      // IMPORTANTE: Actualizar el cliente seleccionado inmediatamente
      if (selectedClient && selectedClient._id === clientId) {
        console.log('🔄 Actualizando cliente seleccionado en el panel de detalles');
        setSelectedClient(updatedClient);
      }
      
      console.log('✅ Cliente actualizado exitosamente en el estado');
      return { success: true, data: updatedClient };
    } catch (error) {
      console.error('❌ Error al actualizar cliente:', error);
      console.error('❌ Respuesta de error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar cliente' 
      };
    }
  };

  // Función para agregar un nuevo cliente
  const addClient = async (clientData) => {
    try {
      console.log('➕ Agregando nuevo cliente:', clientData);
      
      const dataToSend = {
        nombre: clientData.nombre || clientData.firstName || '',
        producto: clientData.producto || '',
        fechaPedido: clientData.fechaPedido || clientData.birthDate || '',
        telefono: clientData.telefono || clientData.phone || '',
        dirrecion: clientData.dirrecion || clientData.address || '',
        estado: clientData.estado || 'pendiente'
      };
      
      const response = await axios.post(`${API_URL}/clientes`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const newClient = response.data.data || response.data;
      const normalizedClient = {
        ...newClient,
        firstName: newClient.nombre || newClient.firstName || '',
        lastName: newClient.lastName || '',
        email: newClient.email || '',
        idNumber: newClient.idNumber || '',
        birthDate: newClient.fechaPedido || newClient.birthDate || null,
        phone: newClient.telefono || newClient.phone || '',
        address: newClient.dirrecion || newClient.address || '',
        producto: newClient.producto || '',
        estado: newClient.estado || 'pendiente'
      };
      
      setClients(prev => Array.isArray(prev) ? [...prev, normalizedClient] : [normalizedClient]);
      console.log('✅ Cliente agregado exitosamente');
      return { success: true, data: normalizedClient };
    } catch (error) {
      console.error('❌ Error al agregar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al agregar cliente' 
      };
    }
  };

  // Función para eliminar un cliente
  const deleteClient = async (clientId) => {
    try {
      console.log(`🗑️ Eliminando cliente ${clientId}`);
      await axios.delete(`${API_URL}/clientes/${clientId}`, {
        timeout: 10000
      });
      setClients(prev => Array.isArray(prev) ? prev.filter(client => client._id !== clientId) : []);
      
      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(null);
        setShowDetailView(false);
      }
      
      console.log('✅ Cliente eliminado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al eliminar cliente' 
      };
    }
  };

  // Función para filtrar clientes
  const filteredClients = Array.isArray(clients) ? clients.filter((client) =>
    [client.firstName, client.lastName, client.idNumber, client.email, client.phone, client.producto, client.nombre]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) : [];

  // Función para ordenar clientes
  const sortedClients = Array.isArray(filteredClients) ? [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
      case 'Oldest':
        return new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id);
      case 'Name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'Email':
        return a.email.localeCompare(b.email);
      default:
        return 0;
    }
  }) : [];

  // Función para seleccionar cliente y mostrar detalles
  const selectClient = (client) => {
    console.log('👤 Cliente seleccionado:', client);
    setSelectedClient(client);
    setShowDetailView(true);
  };

  // Función para cerrar vista de detalles
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedClient(null);
  };

  // Función para refrescar datos
  const refreshClients = () => {
    console.log('🔄 Refrescando lista de clientes...');
    fetchClients();
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Función para obtener estadísticas
  const getStats = () => {
    const clientsArray = Array.isArray(clients) ? clients : [];
    const filteredArray = Array.isArray(filteredClients) ? filteredClients : [];
    
    return {
      total: clientsArray.length,
      filtered: filteredArray.length,
      hasResults: filteredArray.length > 0
    };
  };

  return {
    // Estados
    clients: sortedClients,
    selectedClient,
    showDetailView,
    loading,
    error,
    searchTerm,
    sortBy,
    
    // Acciones CRUD
    addClient,
    updateClient,
    deleteClient,
    refreshClients,
    
    // Acciones de UI
    selectClient,
    closeDetailView,
    clearSearch,
    
    // Setters para filtros
    setSearchTerm,
    setSortBy,
    
    // Utilidades
    filteredClients,
    stats: getStats()
  };
};

export default useDataCliente;