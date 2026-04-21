import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import Onboarding from './pages/Onboarding.tsx'
import AppLayout from './pages/app/AppLayout.tsx'
import Resumen from './pages/app/Resumen.tsx'
import Calendario from './pages/app/Calendario.tsx'
import Empresa from './pages/app/Empresa.tsx'
import Obligaciones from './pages/app/Obligaciones.tsx'
import Equipo from './pages/app/Equipo.tsx'
import Ajustes from './pages/app/Ajustes.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { RolProvider } from './context/RolContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <RolProvider>
          <Routes>
            {/* Landing page pública */}
            <Route path="/" element={<App />} />

            {/* Auth */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

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

            {/* Catch-all 404 */}
            <Route path="*" element={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                background: 'var(--ink)',
              }}>
                <div style={{ textAlign: 'center', maxWidth: 500 }}>
                  <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--snow)', marginBottom: 16 }}>
                    404
                  </h1>
                  <p style={{ fontSize: 14, color: 'rgb(255 255 255 / 0.6)', marginBottom: 24 }}>
                    Página no encontrada
                  </p>
                  <a href="/" style={{
                    display: 'inline-block',
                    padding: '12px 28px',
                    background: 'var(--em)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--r-lg)',
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                    Volver al inicio
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </RolProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
