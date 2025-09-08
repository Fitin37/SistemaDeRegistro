import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // ← AGREGAR ESTA LÍNEA
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>  {/* ← AGREGAR ESTE WRAPPER */}
      <App />
    </BrowserRouter>   {/* ← CERRAR EL WRAPPER */}
  </StrictMode>,
)