import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
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
import BlogLayout from './pages/BlogLayout.tsx'
import BlogIndex from './pages/blog/BlogIndex.tsx'
import BlogPost from './pages/blog/BlogPost.tsx'
import Raoce2026 from './pages/Raoce2026.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
    <BrowserRouter>
    <RolProvider>
      <Routes>
        {/* Landing page pública */}
        <Route path="/" element={<App />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        {/* Blog público */}
        <Route path="/blog" element={<BlogLayout />}>
          <Route index element={<BlogIndex />} />
          <Route path=":slug" element={<BlogPost />} />
        </Route>

        {/* Página urgencia RAOCE */}
        <Route path="/raoce-2026" element={<Raoce2026 />} />

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
    </HelmetProvider>
  </StrictMode>,
)
