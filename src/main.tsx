import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import Onboarding from './pages/Onboarding.tsx'
import AppLayout from './pages/app/AppLayout.tsx'
import Resumen from './pages/app/Resumen.tsx'
import Calendario from './pages/app/Calendario.tsx'
import Empresa from './pages/app/Empresa.tsx'
import Obligaciones from './pages/app/Obligaciones.tsx'
import Equipo from './pages/app/Equipo.tsx'
import Ajustes from './pages/app/Ajustes.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { RolProvider } from './context/RolContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <RolProvider>
      <Routes>
        {/* Landing page pública */}
        <Route path="/" element={<App />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        {/* Onboarding protegido */}
        <Route path="/app/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />

        {/* App protegida — layout con sidebar */}
        <Route path="/app" element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route index               element={<Resumen />} />
          <Route path="calendario"   element={<Calendario />} />
          <Route path="obligaciones" element={<Obligaciones />} />
          <Route path="empresa"      element={<Empresa />} />
          <Route path="equipo"       element={<Equipo />} />
          <Route path="ajustes"      element={<Ajustes />} />
        </Route>
      </Routes>
    </RolProvider>
    </BrowserRouter>
  </StrictMode>,
)
