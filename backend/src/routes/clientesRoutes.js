import express from "express"
import clienteCon from "../controller/clienteController.js"

const router = express.Router();

// Cambiar todas las rutas para quitar '/clientes'
router.post('/', clienteCon.agregarCliente);       
router.get('/', clienteCon.get);                    
router.get('/:id', clienteCon.getClienteById);     
router.put('/:id', clienteCon.PutClientes);         
router.delete('/:id', clienteCon.deleteClientes);  

export default router;