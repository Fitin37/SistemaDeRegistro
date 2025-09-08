import express from "express"
import clienteCon from "../controller/clienteController.js"

const router=express.Router();

// En tu archivo de rutas
router.post('/clientes', clienteCon.agregarCliente);
router.get('/clientes', clienteCon.get);
router.get('/clientes/:id', clienteCon.getClienteById);
router.put('/clientes/:id', clienteCon.PutClientes);
router.delete('/clientes/:id', clienteCon.deleteClientes);


export default router;