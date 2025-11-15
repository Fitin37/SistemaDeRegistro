import clienteModel from "../model/clientes.js";
import mongoose from "mongoose";

const clienteCon = {};

/**
 * Función para validar si un ID de MongoDB es válido
 * @param {string} id - ID a validar
 * @returns {boolean} - true si es válido, false si no
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Crear nuevo cliente
 * POST /clientes
 */
clienteCon.agregarCliente = async (req, res) => {
  try {
    const { nombre, producto, fechaPedido, telefono, dirrecion,estado } = req.body;

    // Validación básica de campos requeridos
    if (!nombre || !producto || !fechaPedido || !telefono || !dirrecion ||!estado) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        error: "Todos los campos son obligatorios: nombre, producto, fechaPedido, telefono, dirrecion"
      });
    }

    // Crear nuevo cliente
    const nuevoCliente = new clienteModel({
      nombre: nombre.trim(),
      producto: producto.trim(),
      fechaPedido: new Date(fechaPedido),
      telefono: telefono.trim(),
      dirrecion: dirrecion.trim(),
      estado:estado.trim()
    });

    // Guardar en base de datos
    const clienteGuardado = await nuevoCliente.save();

    res.status(201).json({
      success: true,
      message: "Cliente agregado exitosamente",
      data: {
        cliente: clienteGuardado
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al agregar cliente",
      error: error.message
    });
  }
};

/**
 * Obtener todos los clientes
 * GET /clientes
 */
clienteCon.get = async (req, res) => {
  try {
    // Obtener todos los clientes con paginación opcional
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Validar parámetros de paginación
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Parámetros de paginación inválidos",
        error: "La página debe ser >= 1 y el límite entre 1-100"
      });
    }

    // Obtener clientes con conteo total
    const [clientes, totalClientes] = await Promise.all([
      clienteModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      clienteModel.countDocuments()
    ]);

    if (!clientes || clientes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No se encontraron clientes",
        data: {
          clientes: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalClientes: 0,
            clientesPerPage: limit
          }
        }
      });
    }

    // Calcular información de paginación
    const totalPages = Math.ceil(totalClientes / limit);

    res.status(200).json({
      success: true,
      message: "Clientes obtenidos exitosamente",
      data: {
        clientes,
        pagination: {
          currentPage: page,
          totalPages,
          totalClientes,
          clientesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener clientes",
      error: error.message
    });
  }
};

/**
 * Obtener cliente por ID
 * GET /clientes/:id
 */
clienteCon.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido de MongoDB"
      });
    }

    // Buscar el cliente por ID
    const cliente = await clienteModel.findById(id);
    
    // Verificar si el cliente existe
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: "Cliente obtenido exitosamente",
      data: {
        cliente
      }
    });

  } catch (error) {
    // Manejo específico de errores de MongoDB
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cliente con formato inválido",
        error: "El ID proporcionado no tiene el formato correcto de MongoDB"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor al obtener cliente",
      error: error.message
    });
  }
};

/**
 * Actualizar cliente existente
 * PUT /clientes/:id
 */
clienteCon.PutClientes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Verificar que el cliente existe
    const clienteActual = await clienteModel.findById(id);
    if (!clienteActual) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    const { nombre, producto, fechaPedido, telefono, dirrecion,estado } = req.body;

    // Preparar datos para actualización (solo campos proporcionados)
    const datosActualizados = {};
    
    if (nombre) datosActualizados.nombre = nombre.trim();
    if (producto) datosActualizados.producto = producto.trim();
    if (fechaPedido) datosActualizados.fechaPedido = new Date(fechaPedido);
    if (telefono) datosActualizados.telefono = telefono.trim();
    if (dirrecion !== undefined) datosActualizados.dirrecion = dirrecion.trim();
    if (estado !== undefined) datosActualizados.estado = estado.trim();

    // Realizar la actualización
    const clienteActualizado = await clienteModel.findByIdAndUpdate(
      id,
      datosActualizados,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Cliente actualizado correctamente",
      data: {
        cliente: clienteActualizado
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al actualizar cliente",
      error: error.message
    });
  }
};

/**
 * Eliminar cliente
 * DELETE /clientes/:id
 */
clienteCon.deleteClientes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido",
        error: "El ID proporcionado no tiene un formato válido"
      });
    }

    // Intentar eliminar el cliente
    const deletedCliente = await clienteModel.findByIdAndDelete(id);
    
    if (!deletedCliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: `No existe un cliente con el ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: "Cliente eliminado correctamente",
      data: {
        clienteEliminado: {
          id: deletedCliente._id,
          nombre: deletedCliente.nombre,
          producto: deletedCliente.producto
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar cliente",
      error: error.message
    });
  }
};

export default clienteCon;