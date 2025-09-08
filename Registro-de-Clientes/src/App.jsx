import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import AgregarCliente from "./Pages/RegistroClientes";
import Clientes from "./Pages/Clientes";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Clientes/>}/>
        <Route path="empleados/agregarEmployee" element={<AgregarCliente/>}/>
      </Routes>
    </>
  )
}

export default App
