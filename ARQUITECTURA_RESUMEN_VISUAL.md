# Arquitectura Calendario Compliance — Resumen Visual

## 1️⃣ Tablas Principales (Jerarquía Multi-Tenant)

```
ORGANIZACIONES (1 por cliente)
  │
  ├─ USUARIOS_ORGANIZACION (Roles: owner, manager, viewer)
  │
  ├─ EMPRESAS (RFCs, programas_activos: ['immex', 'prosec', ...])
  │  │
  │  └─ OBLIGACIONES_EMPRESA (Suscripción a categorías del catálogo)
  │     │ ✓ fecha_autorizacion (FECHA ANCLA para dinámicos)
  │     │
  │     └─ VENCIMIENTOS_CALENDARIO (Instancias generadas)
  │
  └─ OBLIGACIONES_CATALOGO (Catálogo maestro - solo Super Admin)
     │ ✓ tipo_calculo: 'estatico' | 'dinamico_ancla'
     │ ✓ dia_vencimiento + mes_vencimiento (para estáticos)
     │ ✓ meses_sumar_al_ancla (para dinámicos)
     │ ✓ dias_restar_aviso (para notificaciones)
     └─ (Compartida con todas las empresas)
```

---

## 2️⃣ Cálculo de Vencimientos (Motor)

### Escenario A: Estático (Fecha Fija)
```
Obligación: "IMMEX — Reporte Anual"
├─ tipo_calculo: 'estatico'
├─ dia_vencimiento: 31
├─ mes_vencimiento: 5
└─ Resultado: 31 de mayo cada año (2024, 2025, 2026, ...)

Obligación: "Opinión Positiva SAT"
├─ tipo_calculo: 'estatico'
├─ periodicidad: 'mensual'
├─ dia_vencimiento: 21
└─ Resultado: Día 21 cada mes
```

### Escenario B: Dinámico (Basado en Fecha Ancla)
```
Obligación: "Renovación Certificación IVA/IEPS"
├─ tipo_calculo: 'dinamico_ancla'
├─ meses_sumar_al_ancla: 12
├─ dias_restar_aviso: 60
├─ fecha_autorizacion (user input): 2023-06-15
└─ Cálculo:
   ├─ 2023-06-15 + 12 meses = 2024-06-15 (renovación)
   ├─ 2024-06-15 - 60 días = 2024-04-16 (notificar aquí)
   └─ Resultado: Vencimiento el 2024-04-16, renovación el 2024-06-15
```

---

## 3️⃣ Frontend: Rutas y Flujo

```
PÚBLICO
├─ /                  (Landing)
├─ /register          (Auth)
└─ /login             (Auth)

🔒 PRIVADO (ProtectedRoute)
├─ /app               (Dashboard - Resumen)
├─ /app/calendario    (Vencimientos mensual)
├─ /app/obligaciones  (Listado obligaciones)
├─ /app/empresa       (Perfil empresa + toggle programas)
├─ /app/equipo        (Gestión usuarios - gated por plan)
└─ /app/onboarding    (Setup inicial)
```

---

## 4️⃣ Hooks (State Management)

```
useAuth()
├─ user: User | null
├─ session: Session | null
├─ loading: boolean
└─ signOut(): Promise<void>

useRol()
├─ rol: 'owner' | 'manager' | 'viewer' | null
├─ loading: boolean
├─ puedeEditar: boolean  (owner || manager)
└─ esOwner: boolean

useEmpresa()
├─ empresa: Empresa
├─ organizacion: Organizacion
├─ activarPrograma(programa, fechaAutorizacion): Promise
└─ desactivarPrograma(programa): Promise

useObligaciones(empresaId)
├─ obligaciones[]
├─ toggleEstado(id, estado)
├─ editarFechaVencimiento(vencimientoId, fecha)
└─ agregarNota(vencimientoId, nota)

useVencimientos(empresaId, mes)
├─ vencimientos[]
├─ marcarCompletado(id): Promise
└─ refetch()
```

---

## 5️⃣ Roles y Permisos (RLS + UI)

| Acción | Owner | Manager | Viewer |
|--------|-------|---------|--------|
| Ver vencimientos | ✅ | ✅ | ✅ |
| Marcar completado | ✅ | ✅ | ❌ |
| Editar fechas | ✅ | ✅ | ❌ |
| Activar programas | ✅ | ✅ | ❌ |
| Invitar usuarios | ✅ | ❌ | ❌ |
| Cambiar plan | ✅ | ❌ | ❌ |
| Eliminar org | ✅ | ❌ | ❌ |

**Blindaje**:
- Base de Datos: RLS policies en `SELECT`, `UPDATE`
- Frontend: Condiciones `{puedeEditar && <Button>}`, muro de pago (`<UpgradePrompt>`)

---

## 6️⃣ Stored Procedures (Backend)

| Función | Propósito | Retorna |
|---------|-----------|---------|
| `proyectar_vencimientos(empresa_id, anio)` | Genera vencimientos para el año | INT (count) |
| `activar_programa_empresa(empresa_id, programa, fecha_ancla, activar)` | Activa/desactiva programa | JSONB |
| `limpiar_vencimientos_futuros(obligacion_id)` | Borra futuros pendientes | INT (count) |
| `crear_organizacion_inicial(nombre, rfc, razon, programas)` | Onboarding | JSONB |

---

## 7️⃣ Stack Tecnológico

**Frontend**:
- React 19 + React Router v7
- Tailwind CSS 4.2
- Supabase JS Client
- TypeScript 6.0

**Backend**:
- PostgreSQL (Supabase)
- Stored Procedures (PL/pgSQL)
- Row-Level Security (RLS)
- No Edge Functions (lógica en DB)

**Auth**:
- Supabase Auth (email/password, OAuth)
- JWT (session tokens)

**Deployment**:
- Frontend: Vercel / Netlify (Vite SPA)
- Backend: Supabase (managed Postgres)

---

## 8️⃣ Índices de Base de Datos

| Tabla | Índices |
|-------|---------|
| `organizaciones` | `id` |
| `usuarios_organizacion` | `user_id`, `organizacion_id` |
| `empresas` | `organizacion_id` |
| `obligaciones_catalogo` | `categoria`, `activa` |
| `obligaciones_empresa` | `empresa_id`, `catalogo_id`, `estado` |
| `vencimientos_calendario` | `empresa_id`, `fecha_limite`, `estado_cumplimiento`, `periodo_key` |

---

## 9️⃣ Flujo de Onboarding

```
1. User registra email + password
   ↓
2. Redirige a /app/onboarding
   ↓
3. Onboarding.tsx:
   ├─ Input: Nombre Organización
   ├─ Input: RFC Empresa
   ├─ Input: Razón Social
   ├─ Checkbox: Programas (IMMEX, PROSEC, PADRON, IVA/IEPS)
   ↓
4. Click "Crear Organización"
   ↓
5. Backend (RPC crear_organizacion_inicial):
   ├─ INSERT organizaciones
   ├─ INSERT usuarios_organizacion (owner)
   ├─ INSERT empresas
   ├─ INSERT obligaciones_empresa (para cada programa)
   ├─ CALL proyectar_vencimientos (año actual)
   └─ RETURN { org_id, empresa_id, vencimientos_proyectados }
   ↓
6. Frontend:
   ├─ Actualiza useEmpresa() context
   ├─ Redirige a /app (Dashboard)
   └─ Muestra: "¡Configuración lista! 18 vencimientos proyectados"
```

---

## 🔟 Ejemplo: Activar IMMEX con Fecha Ancla

```
USER: "Quiero activar IMMEX, autorizado el 2024-01-15"
↓
FRONTEND (Empresa.tsx):
  await useEmpresa().activarPrograma('immex', '2024-01-15')
↓
BACKEND (RPC activar_programa_empresa):
  1. SELECT obligaciones_catalogo WHERE categoria IN ('immex', 'general')
  2. INSERT obligaciones_empresa (empresa_id, catalogo_id, fecha_autorizacion='2024-01-15')
  3. CALL proyectar_vencimientos(empresa_id, 2024)
  4. CALL proyectar_vencimientos(empresa_id, 2025)
↓
PROJECTIONS:
  "IMMEX — Reporte Anual 2024" → 2024-05-31 (fecha_limite)
  "IMMEX — Reporte Anual 2025" → 2025-05-31
  "IMMEX — Información INEGI 2024" → 2024-01-20, 2024-02-20, ... (mensual)
  "Renovación Certificación" → 2025-01-15 (basada en 2024-01-15 + 12 meses)
↓
FRONTEND (Calendario.tsx):
  Vencimientos renderizados inmediatamente en el calendario
```

---

## 🔐 Seguridad: RLS en Acción

```
USER A (Org X) trata de hacer:
  SELECT * FROM empresas

POSTGRES RLS:
  1. ¿Es miembro de la org? 
     → SELECT FROM usuarios_organizacion WHERE user_id=A AND org=X
     → SÍ
  2. Retorna solo empresas de la org X
  
USER B (Org Y) trata de hacer:
  SELECT * FROM empresas

POSTGRES RLS:
  1. ¿Es miembro de la org?
     → SELECT FROM usuarios_organizacion WHERE user_id=B AND org=?
     → NO (no está en Y con user B)
  2. Retorna 0 registros (silenciosamente)
```

---

## 📊 Métrica Final

```
Tablas:                    7 (+ vencimientos_excepciones)
Funciones:                 4 stored procedures
Migraciones:               8 archivos SQL
Hooks Frontend:            6 custom hooks
Páginas Privadas:          5 rutas protegidas
Roles de Usuario:          3 (owner, manager, viewer)
Campos de Fecha Ancla:     1 (fecha_autorizacion)
Tipos de Cálculo:          2 (estatico, dinamico_ancla)
RLS Policies:              ~12 políticas multi-tenant
```

---

**Documento generado**: 2026-04-17  
**Versión**: 2.0  
**Estado**: Listo para referencia rápida
