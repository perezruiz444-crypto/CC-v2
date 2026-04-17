# Calendario Compliance - Arquitectura del Proyecto

## Descripción General

**Calendario Compliance** es una plataforma SaaS de cumplimiento regulatorio diseñada específicamente para empresas de comercio exterior (ComEx) en México. La aplicación ayuda a las organizaciones a gestionar, rastrear y cumplir con obligaciones regulatorias complejas relacionadas con regímenes aduanales como IMMEX, PROSEC, y otros.

## Stack Tecnológico

### Frontend
- **React 19.2.4** - Framework UI de componentes funcionales
- **TypeScript 6.0.2** - Tipado estático para mayor seguridad y documentación del código
- **React Router 7.14.1** - Enrutamiento y navegación entre páginas
- **Tailwind CSS 4.2.2** - Framework de utility-first CSS con plugin Vite integrado
- **Lucide React 1.8.0** - Librería de iconos SVG modernos y ligeros

### Herramientas de Desarrollo
- **Vite 8.0.4** - Build tool y dev server ultra-rápido
- **ESLint 9.39.4** - Linting y análisis estático de código
- **TypeScript ESLint** - Reglas ESLint optimizadas para TypeScript

### Backend / Base de Datos
- **Supabase 2.103.0** - Backend as a Service con PostgreSQL, autenticación y realtime
- **Supabase Auth** - Gestión de usuarios y sesiones
- **Supabase RLS (Row Level Security)** - Control de acceso a nivel de fila

### Tipografías
- **@fontsource/inter 5.2.8** - Tipografía Inter optimizada
- **@fontsource/syne 5.2.7** - Tipografía Syne para headings

## Estructura de Directorios

```
/web
├── src/
│   ├── App.tsx                 # Componente raíz - Landing page pública
│   ├── main.tsx                # Entry point - Setup de Router y Providers
│   ├── index.css               # Estilos globales con variables CSS
│   ├── App.css                 # Estilos específicos del landing
│   │
│   ├── components/             # Componentes reutilizables
│   │   ├── Navbar.tsx          # Barra de navegación
│   │   ├── Hero.tsx            # Sección hero del landing
│   │   ├── Demo.tsx            # Sección de demostración
│   │   ├── PainPoints.tsx       # Problemas que resuelve
│   │   ├── Features.tsx         # Características principales
│   │   ├── HowItWorks.tsx       # Guía de cómo funciona
│   │   ├── Pricing.tsx          # Tabla de precios
│   │   ├── Testimonios.tsx      # Testimonios de clientes
│   │   ├── FAQ.tsx              # Preguntas frecuentes
│   │   ├── CTA.tsx              # Call-to-action final
│   │   ├── Footer.tsx           # Pie de página
│   │   └── ProtectedRoute.tsx   # HOC para rutas protegidas
│   │
│   ├── pages/                  # Páginas de la aplicación
│   │   ├── Login.tsx            # Página de inicio de sesión
│   │   ├── Register.tsx         # Página de registro
│   │   ├── Onboarding.tsx       # Flujo de onboarding
│   │   ├── Dashboard.tsx        # (En desarrollo)
│   │   │
│   │   └── app/                 # Páginas internas (protegidas)
│   │       ├── AppLayout.tsx    # Layout contenedor con sidebar
│   │       ├── Resumen.tsx      # Dashboard principal
│   │       ├── Calendario.tsx   # Vista de calendario de obligaciones
│   │       ├── Obligaciones.tsx # Gestión de obligaciones
│   │       ├── Empresa.tsx      # Configuración de empresa
│   │       └── Equipo.tsx       # Gestión de equipo / usuarios
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Gestión de autenticación
│   │   ├── useRol.ts           # Acceso al contexto de roles
│   │   ├── useEmpresa.ts       # Datos de empresa
│   │   ├── useObligaciones.ts  # Gestión de obligaciones
│   │   ├── useVencimientos.ts  # Cálculo de vencimientos
│   │   └── useReveal.ts        # Animaciones de reveal
│   │
│   ├── context/                # Context API providers
│   │   └── RolContext.tsx      # Contexto de roles y permisos
│   │
│   ├── lib/                    # Utilidades y configuración
│   │   ├── supabase.ts         # Cliente de Supabase
│   │   └── constants.ts        # Constantes globales (estados, categorías)
│   │
│   └── assets/                 # Imágenes y archivos estáticos
│
├── supabase/                   # Configuración de Supabase
│   ├── migrations/             # Migraciones de BD
│   └── seed.ts                 # Script de seed (datos iniciales)
│
├── public/                     # Archivos estáticos
├── dist/                       # Build output (generado)
├── vite.config.ts              # Configuración de Vite
├── tsconfig.json               # Configuración de TypeScript
├── tsconfig.app.json           # Config de TypeScript para app
├── tsconfig.node.json          # Config de TypeScript para node
├── index.html                  # HTML raíz
├── package.json                # Dependencias y scripts
└── .env.example                # Variables de entorno (template)
```

## Rutas de la Aplicación

### Rutas Públicas
- `/` - Landing page con información del producto

### Rutas de Autenticación
- `/register` - Formulario de registro
- `/login` - Formulario de inicio de sesión

### Rutas Protegidas
Todas las rutas bajo `/app` están protegidas por `<ProtectedRoute>` y requieren sesión activa.

- `/app` - Dashboard principal (Resumen)
  - `/app/calendario` - Vista de calendario de obligaciones
  - `/app/obligaciones` - Gestión y lista de obligaciones
  - `/app/empresa` - Configuración y datos de la empresa
  - `/app/equipo` - Gestión de usuarios y roles de equipo
- `/app/onboarding` - Flujo de onboarding para nuevos usuarios

## Autenticación y Autorización

### Flujo de Autenticación

1. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Obtiene la sesión inicial de Supabase
   - Escucha cambios en el estado de autenticación
   - Retorna: `user`, `session`, `loading`, `signOut()`

2. **RolContext** (`src/context/RolContext.tsx`)
   - Proporciona contexto de roles a nivel global
   - Tipos de rol: `'owner'`, `'manager'`, `'viewer'`
   - Computed properties:
     - `puedeEditar` - true si owner o manager
     - `esOwner` - true si es propietario
   - Fetch de rol desde tabla `usuarios_organizacion` en Supabase

3. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - HOC que verifica si hay sesión activa
   - Redirige a `/login` si no está autenticado
   - Muestra spinner mientras carga

### Modelo de Acceso

```typescript
type Rol = 'owner' | 'manager' | 'viewer'

Permisos:
- owner:   Acceso total, puede editar y gestionar equipo
- manager: Puede editar obligaciones pero no usuarios
- viewer:  Solo lectura
```

## Configuración de Supabase

### Cliente Supabase (`src/lib/supabase.ts`)

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Variables de entorno requeridas** (en `.env.local`):
- `VITE_SUPABASE_URL` - URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anónima pública

### Tablas Principales

Basadas en el contexto de RolContext y hooks:

- **usuarios_organizacion** - Relación usuario-organización con roles
  - `user_id` - ID de usuario Supabase Auth
  - `rol` - Rol del usuario (owner, manager, viewer)
  - `organizacion_id` - ID de la organización

- **obligaciones** - Obligaciones regulatorias
- **empresas** - Datos de empresas/organizaciones
- **usuarios** - Usuarios del sistema
- **vencimientos** - Fechas de vencimiento de obligaciones

### Seguridad

- Row Level Security (RLS) habilitado
- Políticas de acceso basadas en roles
- Autenticación con JWT tokens

## Estado y Context

### RolContext

**Interfaz RolState:**
```typescript
interface RolState {
  rol: Rol | null              // Rol del usuario
  loading: boolean             // Cargando datos del rol
  isLoaded: boolean            // Se completó al menos una carga
  puedeEditar: boolean         // owner || manager
  esOwner: boolean             // rol === 'owner'
}
```

**Usar el contexto:**
```typescript
const { rol, puedeEditar, esOwner } = useRol()
```

## Hooks Personalizados

### useAuth()
Gestiona autenticación del usuario.

**Retorna:**
```typescript
{
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}
```

### useRol()
Accede al contexto de roles globales.

### useEmpresa()
Fetch y caché de datos de la empresa actual.

### useObligaciones()
Gestión de obligaciones - fetch, creación, actualización.

### useVencimientos()
Cálculos de fechas de vencimiento y alertas.

### useReveal()
Animaciones de reveal para elementos (usado en landing).

## Componentes de Landing

El landing page (`App.tsx`) es una composición de componentes reutilizables:

- **Navbar** - Navegación superior
- **Hero** - Sección de hero con propuesta de valor
- **Demo** - Demostración visual del producto
- **PainPoints** - Problemas que resuelve
- **Features** - Características principales
- **HowItWorks** - Guía paso a paso
- **Pricing** - Tabla de planes y precios
- **Testimonios** - Comentarios de clientes
- **FAQ** - Preguntas frecuentes
- **CTA** - Llamada a la acción final
- **Footer** - Información de contacto y links

## Componentes de Aplicación

### AppLayout
Layout contenedor de la aplicación interna con:
- Sidebar navegación
- Área de contenido principal
- Outlet para rutas anidadas (Resumen, Calendario, etc.)

### Resumen
Dashboard principal con overview de:
- Obligaciones pendientes
- Vencimientos próximos
- Estado general de cumplimiento

### Calendario
Vista de calendario interactivo mostrando:
- Obligaciones por fecha
- Estados de cumplimiento
- Navegación por período

### Obligaciones
Panel de gestión de obligaciones:
- Lista de obligaciones
- Filtros por categoría (IMMEX, PROSEC, IVA/IEPS, etc.)
- Edición de estados y fechas
- Historial de cambios

### Empresa
Configuración de datos de la empresa:
- Información general
- Datos fiscales
- Ubicaciones

### Equipo
Gestión de usuarios y permisos:
- Invitar usuarios
- Asignar roles
- Gestionar acceso

## Estilos y Temas

### Sistema de Diseño

**Archivo principal:** `src/index.css`

Variables CSS globales:
- Colores de marca
- Espaciado
- Tipografía
- Transiciones y animaciones

**Estados de Cumplimiento** (`src/lib/constants.ts`):
```typescript
ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',  className: 'chip chip-warn',    color: 'var(--warn)' },
  completado: { label: 'Completado', className: 'chip chip-success', color: 'var(--em)' },
  vencido:    { label: 'Vencido',    className: 'chip chip-danger',  color: 'var(--danger)' },
  omitido:    { label: 'Omitido',    className: 'chip' },
  prorrogado: { label: 'Prorrogado', className: 'chip chip-info',    color: 'var(--info)' },
}
```

**Categorías de Obligaciones**:
- IMMEX - Régimen de IMMEX
- PROSEC - Programa de PROSEC
- IVA/IEPS - Impuestos
- Padrón - Padrón de importadores
- General - Otras obligaciones

## Scripts y Comandos

### Desarrollo
```bash
npm run dev      # Inicia dev server en http://localhost:5173
```

### Producción
```bash
npm run build    # Compila TypeScript y genera bundle
npm run preview  # Vista previa del build en local
```

### Calidad de Código
```bash
npm run lint     # Ejecuta ESLint
```

## Flujos Principales

### 1. Autenticación (Registro/Login)
```
Usuario -> /register o /login 
  -> Supabase Auth (JWT) 
    -> Sesión almacenada 
      -> Redirige a /app
```

### 2. Carga de Rol y Permisos
```
App monta -> useAuth obtiene sesión 
  -> RolProvider fetchea rol de usuarios_organizacion 
    -> Context actualiza estado de rol 
      -> Componentes pueden usar useRol()
```

### 3. Acceso a Ruta Protegida
```
Usuario intenta acceder /app 
  -> ProtectedRoute verifica sesión 
    -> Si no hay sesión: redirige a /login 
    -> Si hay sesión: renderiza componente
```

### 4. Gestión de Obligaciones
```
Usuario abre Obligaciones 
  -> useObligaciones() fetchea de tabla obligaciones 
    -> Renderiza lista con estados 
      -> Usuario edita estado/fecha 
        -> Hook actualiza en Supabase 
          -> RLS valida permisos 
            -> Base de datos actualiza
```

## Consideraciones de Arquitectura

### Performance
- **Lazy Loading**: Rutas protegidas cargan bajo demanda
- **Code Splitting**: Vite automáticamente divide código por ruta
- **Caching**: Hooks cachean datos de usuario y rol
- **Tipado**: TypeScript previene bugs en compilación

### Seguridad
- **RLS**: Row Level Security en Supabase previene acceso no autorizado
- **JWT**: Tokens de sesión manejados por Supabase
- **Validación**: Roles checkeados tanto en frontend como en RLS
- **HTTPS Only**: Solo VITE_SUPABASE_URL de producción

### Mantenibilidad
- **Componentes**: Divididos en responsabilidades claras
- **Hooks**: Lógica reutilizable separada de componentes
- **Context**: Estado global para autenticación y roles
- **Constants**: Configuraciones centralizadas
- **TypeScript**: Tipado fuerte desde frontend hasta BD

### Escalabilidad
- **Supabase**: Infraestructura escalable
- **Modular**: Fácil agregar nuevas páginas/componentes
- **Hooks**: Fácil agregar nuevas fuentes de datos
- **Context**: Patrón probado para estado global

## Próximos Pasos / En Desarrollo

- [ ] Implementar drag-and-drop en calendario
- [ ] Notificaciones en tiempo real (Supabase Realtime)
- [ ] Exportar reportes (PDF/Excel)
- [ ] Integraciones con calendarios externos
- [ ] Sistema de alertas y recordatorios
- [ ] Auditoría y historial completo

## Recursos y Referencias

- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)

---

**Última actualización:** 2026-04-15  
**Mantenedor:** Equipo de Desarrollo  
**Estado:** En desarrollo activo
