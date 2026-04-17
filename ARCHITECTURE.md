# ARCHITECTURE.md — Sistema de Ley del Calendario Compliance SaaS

**Versión**: 2.0  
**Fecha**: 2026-04-17  
**Estatus**: 🔒 Documento de Referencia Obligatoria para Todos los Desarrolladores

> Este documento define la **arquitectura inmutable** del proyecto Calendario Compliance. Cualquier cambio que contradiga estas reglas debe ser **rechazado inmediatamente** antes de ser integrado al repositorio. Este es el System Prompt para cualquier desarrollador o IA que trabaje en el código.

---

## 🎯 1. Misión y Límites Estrictos

### ¿Qué es Calendario Compliance?

Un **SaaS B2B Multi-Tenant** que automatiza el cumplimiento de obligaciones regulatorias en Comercio Exterior (México). 

**Propósito único**: Proyectar vencimientos de obligaciones legales automáticamente, notificar antes de las fechas límite, y permitir a equipos colaborar en el marcaje de tareas.

### ❌ ANTI-PATRONES ESTRICTAMENTE PROHIBIDOS

```
⛔ PROHIBIDO SUGERIR O PROGRAMAR:
   1. Carga de documentos (upload de PDFs, archivos)
   2. Sistema de mensajería o chat interno
   3. Control de horas (time-tracking, timesheets)
   4. Asignación de consultores/usuarios a clientes específicos
   5. Módulos de facturación o pagos internos (Stripe webhooks solamente)
   6. CRM de gestión de contactos
   7. Portal de conocimiento o base de datos wiki
   8. Generación de reportes en PDF exportables
```

**Justificación**: Cada uno de estos módulos diluye el enfoque del software y añade complejidad sin valor para el core business. Nuestro cliente paga por UNA COSA: un calendario automático que no le permite olvidar sus obligaciones.

---

## 🗂️ 2. Modelo de Datos Core (La Jerarquía Multi-Tenant)

### Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                   ORGANIZACIONES (1 por cliente)                │
│  id, nombre_cuenta, plan_actual, stripe_customer_id             │
└─────────────────────────────────────────────────────────────────┘
           ↓                      ↓                    ↓
┌──────────────────┐   ┌──────────────────┐   ┌────────────────┐
│USUARIOS_ORGA (N) │   │EMPRESAS (N)      │   │OBLIGACIONES_   │
│id, user_id, rol  │   │id, rfc,          │   │CATALOGO (Global)
│'owner'/'manager' │   │programas_activos │   │nombre, categoria
│'viewer'          │   │                  │   │tipo_calculo    │
└──────────────────┘   └────────┬─────────┘   └────────────────┘
                                 ↓
                   ┌─────────────────────────┐
                   │OBLIGACIONES_EMPRESA (N) │
                   │id, estado               │
                   │fecha_autorizacion⭐     │
                   │[vinculada a catálogo]   │
                   └────────────┬────────────┘
                                ↓
                   ┌─────────────────────────┐
                   │VENCIMIENTOS_CALENDARIO  │
                   │(AUTO-GENERADOS)         │
                   │id, fecha_limite         │
                   │estado_cumplimiento      │
                   │periodo_key (UNIQUE)     │
                   └─────────────────────────┘
```

### Invariantes de la Relación

1. **Una organización = un cliente del SaaS**
   - Facturación única
   - Suscripción única
   - Datos completamente aislados de otras orgs

2. **Empresas (RFCs) pertenecen SOLO a su organización**
   - Plan 'gratis': 1 empresa máximo
   - Plan 'equipo': 1 empresa
   - Plan 'agencia': N empresas

3. **Obligaciones_empresa vincula empresa → catálogo maestro**
   - Es el "switch" que activa una obligación para esa empresa
   - Contiene la `fecha_autorizacion` (fecha ancla para cálculos dinámicos)

4. **Vencimientos_calendario son instancias INMUTABLES generadas por el motor**
   - Nunca se crean manualmente (excepción: edición de fecha, notas)
   - Se generan via `proyectar_vencimientos()` stored procedure
   - Usang `UNIQUE(obligacion_origen_id, periodo_key)` para idempotencia

### Row-Level Security (RLS) — La Muralla Anti-Fuga de Datos

**Regla de Oro**: `organizacion_id` es la columna que determina qué ve cada usuario.

```sql
-- Ejemplo de política RLS
CREATE POLICY "empresas_select_org" ON empresas FOR SELECT
  USING (organizacion_id IN (
    SELECT organizacion_id FROM usuarios_organizacion WHERE user_id = auth.uid()
  ));
```

**Garantía**: Un usuario de Org A **NUNCA** verá datos de Org B, aunque acceda directamente a la DB.

---

## 👥 3. Roles y Seguridad UI

### Definición Estricta de Roles

| Rol | Permisos | UI |
|-----|----------|-----|
| **Owner** | CRUD todo, cambiar plan, invitar usuarios, eliminar org | Ver todos los botones |
| **Manager** | CRUD empresas, obligaciones, marcar vencimientos | Ver botones excepto "plan" y "eliminar" |
| **Viewer** | READ-ONLY calendario + obligaciones | Solo lectura, cero botones de escritura |

### Hook `useRol()` — Uso Obligatorio

**REGLA**: Todo botón de escritura DEBE estar envuelto en una condición `useRol()`.

✅ **CORRECTO**:
```typescript
export function ObligacionRow({ obligacion }) {
  const { puedeEditar } = useRol()
  
  return (
    <>
      <span>{obligacion.nombre}</span>
      {puedeEditar && <EditButton />}  {/* ← Condición obligatoria */}
    </>
  )
}
```

❌ **INCORRECTO**:
```typescript
export function ObligacionRow({ obligacion }) {
  return (
    <>
      <span>{obligacion.nombre}</span>
      <EditButton />  {/* ← Sin verificar rol — PROHIBIDO */}
    </>
  )
}
```

### Contexto Global: RolContext

- `useRol()` retorna `{ rol, loading, isLoaded, puedeEditar, esOwner }`
- Se inicializa en `RolProvider` (en `main.tsx`)
- Fetcha de `usuarios_organizacion.rol` para el usuario actual
- Es la ÚNICA fuente de verdad para permisos en el frontend

---

## ⚙️ 4. El Motor del Calendario (LA REGLA DE ORO)

### Principio Fundamental

**Las fechas de vencimientos NUNCA se crean manualmente en la tabla `vencimientos_calendario`.**

Toda fecha es **generada automáticamente** por el Stored Procedure `proyectar_vencimientos()` interpretando reglas del catálogo.

### Stored Procedure: `proyectar_vencimientos(p_empresa_id, p_anio)`

**Firma**:
```sql
CREATE OR REPLACE FUNCTION proyectar_vencimientos(
  p_empresa_id UUID,
  p_anio       INT DEFAULT NULL
) RETURNS INT
```

**Entrada**:
- `p_empresa_id`: Empresa a proyectar
- `p_anio`: Año objetivo (NULL = año actual)

**Salida**: Número de registros insertados

### Dos Escenarios de Cálculo

#### 🔵 ESCENARIO A: Estático (Fecha Fija)

**Usado cuando**: `tipo_calculo = 'estatico'`

**Datos necesarios**: `dia_vencimiento` + `mes_vencimiento` (del catálogo)

**Lógica**:
```
periodicidad = 'anual'
  → Genera 1 vencimiento en el año objetivo
  → Ej: IMMEX Reporte Anual
  → dia=31, mes=5 → 2024-05-31, 2025-05-31, etc.

periodicidad = 'mensual'
  → Genera 12 vencimientos (uno por mes)
  → Ej: Opinión Positiva SAT día 21
  → 2024-01-21, 2024-02-21, ..., 2024-12-21

periodicidad = 'bimestral'
  → Genera 6 vencimientos (meses pares)
  → 2024-02-XX, 2024-04-XX, 2024-06-XX, ..., 2024-12-XX

periodicidad = 'trimestral'
  → Genera 4 vencimientos (meses 3, 6, 9, 12)
  → 2024-03-XX, 2024-06-XX, 2024-09-XX, 2024-12-XX
```

**Garantía de Idempotencia**:
```sql
INSERT INTO vencimientos_calendario (...)
  VALUES (...)
ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING
```
→ Si ya existe ese `periodo_key` para esa obligación, no hace nada.

#### 🟠 ESCENARIO B: Dinámico (Basado en Fecha Ancla)

**Usado cuando**: `tipo_calculo = 'dinamico_ancla'`

**Datos necesarios**: 
- `fecha_autorizacion` (en tabla `obligaciones_empresa`) 
- `meses_sumar_al_ancla` (en tabla `obligaciones_catalogo`)
- `dias_restar_aviso` (opcional, para notificaciones anticipadas)

**Lógica**:
```
fecha_autorizacion = 2024-01-15 (Ej: fecha de autorización IMMEX)
meses_sumar_al_ancla = 12 (Renovación anual)
dias_restar_aviso = 60 (Notificar 60 días antes)

Cálculos:
  Renovación 1: 2024-01-15 + 12 meses = 2025-01-15
  Notificación: 2025-01-15 - 60 días = 2024-11-16
  
  Renovación 2: 2025-01-15 + 12 meses = 2026-01-15
  Notificación: 2026-01-15 - 60 días = 2025-11-16
```

**Caso de Uso**: Renovaciones de certificaciones (IMMEX, IVA/IEPS, etc.)

### Cuándo se Llama `proyectar_vencimientos()`

1. **Onboarding** (`crear_organizacion_inicial()`)
   - Usuario crea su primera org + empresa
   - Se proyecta año actual automáticamente

2. **Activar Programa** (`activar_programa_empresa()`)
   - Usuario marca checkbox "Tengo IMMEX"
   - Se proyecta año actual + siguiente
   - Se establece `fecha_autorizacion` si es dinámico

3. **Desactivar Programa** (`activar_programa_empresa(..., p_activar=FALSE)`)
   - Se llama `limpiar_vencimientos_futuros()` para quitar vencimientos
   - Las obligaciones_empresa se marcan como `estado=false`

4. **Cron Job Anual** (RECOMENDADO pero no implementado aún)
   - 1 de enero de cada año
   - Proyecta el nuevo año para todas las empresas

### Cambios Posibles (Permitidos) Después de Proyección

✅ **Permitido** (no rompe el modelo):
- Editar `fecha_limite` de un vencimiento (user lo movió una semana)
- Agregar `notas` (user documentó el comprobante)
- Cambiar `estado_cumplimiento` (user marcó como completado)
- Registrar una excepción (omitido, prorrogado) en `vencimientos_excepciones`

❌ **Prohibido** (rompe la idempotencia):
- Crear manualmente un vencimiento sin que `proyectar_vencimientos()` lo haya generado
- Modificar `periodo_key` directamente
- Insertar sin garantizar UNIQUE constraint

---

## 💰 5. Estrategia de Monetización (Paywalls)

### Límites por Plan

```sql
INSERT INTO organizaciones (..., plan_actual)
VALUES ('gratis', 'equipo', 'agencia')

-- plan_actual determina:
plan = 'gratis':
  ├─ max_empresas: 1
  ├─ max_usuarios: 1 (solo el owner)
  └─ features: Calendario, obligaciones (read-only equipo)

plan = 'equipo':
  ├─ max_empresas: 1
  ├─ max_usuarios: 5
  └─ features: Calendario, obligaciones, TEAM MANAGEMENT

plan = 'agencia':
  ├─ max_empresas: UNLIMITED
  ├─ max_usuarios: UNLIMITED
  └─ features: Dashboard global, aislamiento de datos por empresa
```

### Paywalls en la UI

**Ubicación 1: "Mi Equipo" (Team Management)**
```typescript
if (plan === 'gratis') {
  return <UpgradePrompt 
    title="Invita a tu equipo"
    cta="Upgradea al Plan Equipo"
    stripe_price_id="price_equipo"
  />
}
// Si plan === 'equipo' | 'agencia' → mostrar InviteForm
```

**Ubicación 2: Asignación de Tareas**
```typescript
if (plan === 'gratis') {
  return <div>
    <select disabled>
      <option>{user.name} (solo owner)</option>
      <option disabled>... (upgradea para asignar)</option>
    </select>
    <UpgradePrompt />
  </div>
}
```

**Ubicación 3: Múltiples Empresas**
```typescript
if (empresas.length >= plan_limits[plan].max_empresas) {
  return <UpgradePrompt 
    feature="multiple-companies"
    current={empresas.length}
    limit={plan_limits[plan].max_empresas}
  />
}
```

### Validación Backend

Toda acción que intente sobrepasear un límite debe ser rechazada en la API:

```typescript
async function crearEmpresa(organizacion_id, rfc, razon_social) {
  const org = await db.from('organizaciones').select('plan_actual').single()
  const count = await db.from('empresas')
    .select('count', { count: 'exact' })
    .eq('organizacion_id', organizacion_id)
  
  if (count >= PLAN_LIMITS[org.plan_actual].max_empresas) {
    throw new Error('Plan limit reached. Upgrade to add more.')
  }
  // proceder...
}
```

### Flujo de Upgrade

1. User hace clic en `<UpgradePrompt>`
2. Se abre modal con planes y precios
3. Click en "Upgrade" → redirige a Stripe checkout
4. Stripe webhook actualiza `organizaciones.plan_actual`
5. Frontend refetcha `useEmpresa().organizacion.plan_actual`
6. Paywalls desaparecen automáticamente

---

## 🔄 Flujo Completo: Del Onboarding al Calendario

```
USER REGISTERS
  ↓
Redirige a /app/onboarding
  ↓
Onboarding.tsx:
  Input: Nombre Org, RFC, Razón Social, Programas (checkboxes)
  ↓
  Click "Crear Organización"
    ↓
    RPC crear_organizacion_inicial():
      1. INSERT organizaciones
      2. INSERT usuarios_organizacion (owner)
      3. INSERT empresas
      4. Para cada programa:
         - INSERT obligaciones_empresa (estado=true, fecha_autorizacion=NULL o user-input)
      5. CALL proyectar_vencimientos(empresa_id, año_actual)
         → Genera ~18-24 vencimientos según catálogo
      ↓
      RETURN { org_id, empresa_id, vencimientos_proyectados }
  ↓
Frontend actualiza useEmpresa()
  ↓
Redirige a /app (Dashboard)
  ↓
useVencimientos(empresa_id, mes_actual) fetcha y renderiza
  ↓
USER VE: Calendario con todos los vencimientos listados
```

---

## 📋 Checklist para Code Reviews

Antes de mergear cualquier PR, verifica:

- [ ] ¿Se modificaron tablas? → Creé migration en `supabase/migrations/`
- [ ] ¿Agregué una columna? → ¿Tiene un DEFAULT o está nullable?
- [ ] ¿Modificé RLS? → ¿Testé con 2+ usuarios de orgs diferentes?
- [ ] ¿Hay un botón nuevo? → ¿Está envuelto en `{puedeEditar && <Button>}`?
- [ ] ¿Escribo a la DB? → ¿Implementé validación del plan?
- [ ] ¿Genero vencimientos? → ¿Lo hago via `proyectar_vencimientos()` únicamente?
- [ ] ¿Hay un nuevo hook? → ¿Sigue el patrón `useXxx()`?
- [ ] ¿Cargué código viejo? → ¿Revisé `/pages/app/Dashboard.tsx` (deprecated)?
- [ ] ¿Toqué Stripe? → ¿Testé con key en modo test?
- [ ] ¿Cambio de rutas? → ¿Actualicé la documentación de routing?

---

## 🚀 Guía Rápida por Feature

### Quiero agregar una nueva obligación al catálogo

1. Agrega fila en `obligaciones_catalogo`
   - Decide: `tipo_calculo` ('estatico' | 'dinamico_ancla')
   - Si estático: setea `dia_vencimiento` + `mes_vencimiento`
   - Si dinámico: setea `meses_sumar_al_ancla` + `dias_restar_aviso`

2. Empresas que tengan el programa correspondiente verán la nueva obligación en su próximo `proyectar_vencimientos()`

### Quiero cambiar la lógica de cálculo de una obligación

❌ No edites directamente `vencimientos_calendario`

✅ Haz:
1. Edita el catálogo (`obligaciones_catalogo`)
2. Limpia vencimientos futuros: `SELECT limpiar_vencimientos_futuros(oe.id) FROM obligaciones_empresa WHERE catalogo_id = ...`
3. Re-proyecta: `SELECT proyectar_vencimientos(empresa_id, año)`

### Quiero limitar una funcionalidad a ciertos planes

1. Agrega condición `if (plan !== 'agencia') return <UpgradePrompt />`
2. Valida también en backend: `if (plan_limit exceeded) throw Error()`

### Quiero agregar un nuevo rol

❌ No lo hagas. Solo tenemos owner/manager/viewer.

Si necesitas diferentes permisos dentro de un rol:
✅ Usa campos adicionales en `usuarios_organizacion` (ej: `puede_crear_empresas: boolean`)

---

## 📚 Referencias Obligatorias

- **Reporte Técnico**: `/Desktop/CC/REPORTE_TECNICO_ARQUITECTURA_v2.md`
- **Resumen Visual**: `/Desktop/CC/ARQUITECTURA_RESUMEN_VISUAL.md`
- **Migraciones**: `/web/supabase/migrations/`
- **Hooks**: `/web/src/hooks/`
- **Rutas**: `/web/src/main.tsx`

---

## ⚖️ Principios Rector

> **"Simple, Single-Purpose, Secure"**

1. **Simple**: No agregamos features que no sean parte del core business (no chat, no docs, no time-tracking)
2. **Single-Purpose**: Un calendario automatizado. Punto. No es un CRM, no es una suite de colaboración.
3. **Secure**: RLS, SECURITY DEFINER, validaciones en backend, verificación de roles en frontend.

---

**Última Actualización**: 2026-04-17  
**Versión**: 2.0  
**Estatus**: 🔒 INMUTABLE — Cualquier cambio requiere discusión del team completo.
