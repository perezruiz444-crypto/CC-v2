# Obligaciones UX Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Arreglar 5 problemas críticos de UX en el flujo de obligaciones: refetch al activar programas, captura de fecha_autorizacion, distinción visual de obligaciones continuas, rediseño del onboarding, y UI de revisión para obligaciones continuas.

**Architecture:** Cambios en 4 archivos frontend existentes + 1 migración SQL para agregar columna `ultima_revision` a `obligaciones_empresa`. Sin nuevas dependencias. Sin nuevas tablas salvo la columna.

**Tech Stack:** React 19, TypeScript, Supabase JS client, PostgreSQL RLS

---

## Contexto del sistema

- `useObligaciones(empresaId)` — hook que carga `obligaciones_empresa` + join a `obligaciones_catalogo` + `vencimientos_calendario`. Tiene `refetch()` que incrementa `tick`.
- `useEmpresa()` — hook que carga empresa/org y expone `activarPrograma(programa, fecha)` / `desactivarPrograma(programa)`. **No tiene refetch público.**
- `Obligaciones.tsx` — página que usa ambos hooks de forma **independiente**, sin comunicación entre ellos.
- `Empresa.tsx` — página que usa `useEmpresa()` y llama `activarPrograma`. Al terminar, NO notifica a `useObligaciones`.
- `obligaciones_catalogo.periodicidad` puede ser: `mensual`, `bimestral`, `trimestral`, `anual`, `continua`, `unica`. Las de tipo `continua` y `unica` **nunca generan vencimientos** en el motor SQL.

---

## Task 1: Refetch en Obligaciones al activar programa desde Empresa

**Problema:** Cuando el usuario activa PROSEC en `/app/empresa`, `useObligaciones` no sabe que hay datos nuevos. La lista de obligaciones solo se actualiza si el usuario recarga la página.

**Solución:** Exponer un evento global vía `window.dispatchEvent` desde `useEmpresa` cuando `activarPrograma` termina con éxito. `useObligaciones` escucha ese evento y llama `refetch()`.

**Files:**
- Modify: `src/hooks/useEmpresa.ts`
- Modify: `src/hooks/useObligaciones.ts`

- [ ] **Step 1: Agregar dispatch en useEmpresa.ts**

En `src/hooks/useEmpresa.ts`, dentro de `activarPrograma`, después de que el RPC retorna sin error (línea ~113, después de `return { proyectados, limpiados }`), agregar el dispatch:

```typescript
// En activarPrograma, justo antes del return exitoso:
const result = {
  proyectados: (data as any)?.proyectados ?? 0,
  limpiados:   (data as any)?.limpiados   ?? 0,
}
window.dispatchEvent(new CustomEvent('programas-updated'))
return result
```

El bloque completo de `activarPrograma` queda así al final:

```typescript
const activarPrograma = useCallback(async (
  programa: string,
  fechaAutorizacion: string,
): Promise<ActivarProgramaResult | null> => {
  if (!empresa) return null

  setEmpresa(prev => {
    if (!prev) return prev
    const ya = (prev.programas_activos ?? []).includes(programa)
    return ya ? prev : { ...prev, programas_activos: [...prev.programas_activos, programa] }
  })

  const { data, error: err } = await supabase.rpc('activar_programa_empresa', {
    p_empresa_id:         empresa.id,
    p_programa:           programa,
    p_fecha_autorizacion: fechaAutorizacion,
    p_activar:            true,
  })

  if (err) {
    setEmpresa(prev => prev ? { ...prev, programas_activos: prev.programas_activos.filter(p => p !== programa) } : prev)
    console.error(err.message)
    return null
  }

  const result = {
    proyectados: (data as any)?.proyectados ?? 0,
    limpiados:   (data as any)?.limpiados   ?? 0,
  }
  window.dispatchEvent(new CustomEvent('programas-updated'))
  return result
}, [empresa])
```

- [ ] **Step 2: Escuchar evento en useObligaciones.ts**

En `src/hooks/useObligaciones.ts`, dentro del `useEffect` principal (donde ya existe `}, [empresaId, tick])`), agregar un segundo `useEffect` que escuche el evento. Añadirlo después del `useEffect` de carga:

```typescript
// Después del useEffect que carga las obligaciones, agregar:
useEffect(() => {
  const handler = () => setTick(t => t + 1)
  window.addEventListener('programas-updated', handler)
  return () => window.removeEventListener('programas-updated', handler)
}, [])
```

- [ ] **Step 3: Verificar manualmente**
  1. Ir a `/app/empresa`
  2. Activar un programa que no tenías
  3. Ir a `/app/obligaciones` — las obligaciones nuevas deben aparecer sin recargar
  4. Si tienes la pestaña de obligaciones abierta en paralelo, debe actualizarse también

- [ ] **Step 4: Commit**

```bash
git checkout -b fix/obligaciones-refetch-y-mejoras
git add src/hooks/useEmpresa.ts src/hooks/useObligaciones.ts
git commit -m "fix: refetch de obligaciones al activar programa desde Empresa"
```

---

## Task 2: Distinción visual de obligaciones `continua` en el listado

**Problema:** Las obligaciones de periodicidad `continua` aparecen en la lista igual que las que tienen calendario. El usuario no sabe qué hacer con ellas — no tienen fechas ni checkboxes.

**Solución:** En `ObligacionRow`, detectar si `o.catalogo.periodicidad === 'continua' || o.catalogo.periodicidad === 'unica'` y mostrar un chip diferente + sección de "Cumplimiento permanente" en lugar del historial de vencimientos vacío.

**Files:**
- Modify: `src/pages/app/Obligaciones.tsx`

- [ ] **Step 1: Agregar chip visual para continuas**

En `ObligacionRow` (línea ~220 en `Obligaciones.tsx`), después del chip de categoría y antes del nombre, agregar chip de periodicidad que sea distinto para continuas:

```typescript
// Dentro del header de ObligacionRow, después del chip de categoría:
{(o.catalogo.periodicidad === 'continua' || o.catalogo.periodicidad === 'unica') ? (
  <span style={{
    fontSize: 10, fontWeight: 700, padding: '3px 9px',
    borderRadius: 'var(--r-full)', flexShrink: 0,
    background: 'rgb(99 102 241 / 0.1)',
    border: '1px solid rgb(99 102 241 / 0.25)',
    color: '#6366f1',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  }}>
    Permanente
  </span>
) : o.catalogo.periodicidad ? (
  <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>
    {o.catalogo.periodicidad}
  </span>
) : null}
```

Esto reemplaza la línea existente:
```typescript
{o.catalogo.periodicidad && (
  <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>
    {o.catalogo.periodicidad}
  </span>
)}
```

- [ ] **Step 2: Reemplazar historial vacío por sección de cumplimiento permanente**

En el contenido expandido de `ObligacionRow`, en la sección "Historial de vencimientos", envolver con condicional:

```typescript
{/* Historial de vencimientos — solo para obligaciones con calendario */}
{o.catalogo.periodicidad !== 'continua' && o.catalogo.periodicidad !== 'unica' ? (
  <div>
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 10 }}>
      Historial de vencimientos
    </p>
    {o.vencimientos.length === 0 ? (
      <p style={{ fontSize: 12, color: '#CBD5E1', fontStyle: 'italic' }}>
        Sin vencimientos generados todavía.
      </p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {o.vencimientos.map(v => (
          <VencimientoHistorialRow
            key={v.id}
            v={v}
            onEditarFecha={onEditarFecha}
            onAgregarNota={onAgregarNota}
            puedeEditar={puedeEditar}
          />
        ))}
      </div>
    )}
  </div>
) : (
  <div style={{
    background: 'rgb(99 102 241 / 0.05)',
    border: '1px solid rgb(99 102 241 / 0.15)',
    borderRadius: 'var(--r-lg)',
    padding: '14px 16px',
    display: 'flex', gap: 10, alignItems: 'flex-start',
  }}>
    <span style={{ fontSize: 16 }} aria-hidden="true">🔄</span>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>
        Obligación de cumplimiento permanente
      </p>
      <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
        Esta obligación no tiene fechas de vencimiento periódicas — debe cumplirse en todo momento. Se verifica durante auditorías del SAT o la SE.
      </p>
      {o.catalogo.notas_importantes && (
        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, fontStyle: 'italic' }}>
          {o.catalogo.notas_importantes}
        </p>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 3: Verificar visualmente**
  - Las obligaciones `continua` deben mostrar chip morado "Permanente"
  - Al expandir, muestran el bloque informativo en lugar de lista vacía
  - Las obligaciones con vencimientos siguen mostrando el historial normal

- [ ] **Step 4: Commit**

```bash
git add src/pages/app/Obligaciones.tsx
git commit -m "feat: distinción visual de obligaciones permanentes en listado"
```

---

## Task 3: Rediseño del onboarding — flujo por tipo de empresa

**Problema:** El onboarding actual pregunta directamente qué programas tiene la empresa. Muchos usuarios no saben si tienen PROSEC o no. El paso 3 carece de contexto para tomar la decisión correcta.

**Solución:** Agregar un paso 0 de clasificación por tipo de empresa que filtra y recomienda programas relevantes. Cambiar el paso 3 para mostrar solo programas recomendados según el tipo, con mejor descripción y opción de "No sé" con enlace de ayuda.

**Files:**
- Modify: `src/pages/Onboarding.tsx`

- [ ] **Step 1: Agregar tipo de empresa al estado**

Al inicio del componente `Onboarding`, agregar:

```typescript
type TipoEmpresa = 'maquiladora' | 'importadora' | 'agencia' | null
type Step = 0 | 1 | 2 | 3

// En el estado:
const [tipoEmpresa, setTipoEmpresa] = useState<TipoEmpresa>(null)
```

Cambiar `type Step = 1 | 2 | 3` a `type Step = 0 | 1 | 2 | 3` y el estado inicial a `useState<Step>(0)`.

- [ ] **Step 2: Mapa de programas recomendados por tipo**

Después de la constante `PROGRAMAS`, agregar:

```typescript
const PROGRAMAS_POR_TIPO: Record<string, string[]> = {
  maquiladora: ['immex', 'prosec', 'iva_ieps', 'padron'],
  importadora: ['padron', 'iva_ieps'],
  agencia:     ['immex', 'prosec', 'iva_ieps', 'padron'],
}

const TIPO_LABELS: Array<{
  id: TipoEmpresa
  icon: string
  label: string
  desc: string
}> = [
  {
    id: 'maquiladora',
    icon: '🏭',
    label: 'Maquiladora / Manufactura',
    desc: 'Fabricamos productos para exportar bajo programas IMMEX o PROSEC',
  },
  {
    id: 'importadora',
    icon: '📦',
    label: 'Importadora / Comercializadora',
    desc: 'Importamos mercancía para distribución o consumo nacional',
  },
  {
    id: 'agencia',
    icon: '🏢',
    label: 'Agencia Aduanal / Despacho',
    desc: 'Gestionamos el cumplimiento de comercio exterior de otras empresas',
  },
]
```

- [ ] **Step 3: Renderizar paso 0 — Tipo de empresa**

Antes del bloque `{step === 1 && ...}`, agregar:

```typescript
{step === 0 && (
  <div>
    <div style={stepIconWrap}>
      <Building2 size={22} color="var(--em)" />
    </div>
    <h2 style={stepHeading}>¿Cómo describes tu empresa?</h2>
    <p style={{ ...mutedStyle, marginBottom: 24 }}>
      Esto nos ayuda a recomendarte los programas correctos.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
      {TIPO_LABELS.map(({ id, icon, label, desc }) => (
        <button
          key={id}
          type="button"
          onClick={() => { setTipoEmpresa(id); setStep(1) }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '16px 18px',
            background: 'var(--ink)',
            border: '1.5px solid var(--ink-4)',
            borderRadius: 'var(--r-lg)',
            cursor: 'pointer', textAlign: 'left',
            transition: 'border-color 150ms, background 150ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--em)'
            e.currentTarget.style.background = 'rgb(16 185 129 / 0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--ink-4)'
            e.currentTarget.style.background = 'var(--ink)'
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{icon}</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--snow)', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.4)', lineHeight: 1.5 }}>{desc}</p>
          </div>
        </button>
      ))}
    </div>
    <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.3)', textAlign: 'center' }}>
      No te preocupes — podrás cambiar esto después
    </p>
  </div>
)}
```

- [ ] **Step 4: Actualizar paso 3 para mostrar programas filtrados + badge recomendado**

En el bloque `{step === 3 && ...}`, reemplazar el map de `PROGRAMAS` por:

```typescript
// Obtener programas a mostrar según tipo
const programasFiltrados = tipoEmpresa
  ? PROGRAMAS.filter(p => (PROGRAMAS_POR_TIPO[tipoEmpresa] ?? []).includes(p.id))
  : PROGRAMAS

// En el render del paso 3, cambiar el .map:
{(tipoEmpresa ? programasFiltrados : PROGRAMAS).map(({ id, label, desc }) => {
  const selected = programasSeleccionados.includes(id)
  const esRecomendado = tipoEmpresa && (PROGRAMAS_POR_TIPO[tipoEmpresa] ?? []).includes(id)
  return (
    <button
      key={id}
      type="button"
      onClick={() => togglePrograma(id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 16px',
        background: selected ? 'rgb(16 185 129 / 0.1)' : 'var(--ink)',
        border: `1.5px solid ${selected ? 'var(--em)' : 'var(--ink-4)'}`,
        borderRadius: 'var(--r-lg)',
        cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 150ms, background 150ms',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 6,
        border: `2px solid ${selected ? 'var(--em)' : 'var(--ink-4)'}`,
        background: selected ? 'var(--em)' : 'transparent',
        flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms',
      }}>
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--snow)' }}>{label}</p>
          {esRecomendado && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px',
              borderRadius: 'var(--r-full)',
              background: 'rgb(16 185 129 / 0.15)',
              color: 'var(--em)', letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Recomendado
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.4)', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </button>
  )
})}
```

- [ ] **Step 5: Actualizar el indicador de pasos a 4**

Cambiar el indicador de pasos de 3 a 4:

```typescript
// Cambiar el Steps indicator:
{([0, 1, 2, 3] as Step[]).map(n => (
  <div key={n} style={{
    flex: 1, height: 4, borderRadius: 9999,
    background: n <= step ? 'var(--em)' : 'var(--ink-4)',
    transition: 'background 300ms',
  }} />
))}
```

- [ ] **Step 6: Actualizar el botón "Atrás" del paso 1 para ir al paso 0**

En el paso 2 (datos empresa), el botón "Atrás" debe ir a paso 1. En el paso 1 (nombre org), agregar botón "Atrás" que vaya a paso 0:

```typescript
// En paso 1, agregar botón atrás:
<div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
  <button
    className="btn btn-ghost-dark"
    onClick={() => setStep(0)}
    style={{ flex: 1, justifyContent: 'center' }}
  >
    Atrás
  </button>
  <button
    className="btn btn-primary"
    disabled={!nombreOrg.trim()}
    onClick={() => setStep(2)}
    style={{ flex: 2, justifyContent: 'center' }}
  >
    Continuar <ChevronRight size={16} />
  </button>
</div>
```

- [ ] **Step 7: Verificar flujo completo**
  1. Ir a `/app/onboarding` con cuenta nueva (o borrar la org existente en supabase)
  2. Paso 0: aparecen 3 tipos de empresa
  3. Seleccionar "Maquiladora" → ir a paso 1
  4. Paso 3: aparecen los 4 programas con badge "Recomendado"
  5. Completar y verificar que se crea org + empresa + obligaciones

- [ ] **Step 8: Commit**

```bash
git add src/pages/Onboarding.tsx
git commit -m "feat: onboarding rediseñado con selección de tipo de empresa"
```

---

## Task 4: Migración SQL — columna `ultima_revision` en obligaciones_empresa

**Problema:** Las obligaciones continuas necesitan registrar cuándo fue la última revisión y su estado de cumplimiento.

**Files:**
- Create: `supabase/migrations/20260424150000_obligaciones_continuas_revision.sql`

- [ ] **Step 1: Crear migración**

Crear archivo `supabase/migrations/20260424150000_obligaciones_continuas_revision.sql`:

```sql
-- Agregar campos para tracking de cumplimiento en obligaciones continuas
ALTER TABLE obligaciones_empresa
  ADD COLUMN IF NOT EXISTS ultima_revision    DATE,
  ADD COLUMN IF NOT EXISTS estado_revision    VARCHAR(20)
    DEFAULT 'sin_revisar'
    CHECK (estado_revision IN ('vigente', 'en_riesgo', 'incumplimiento', 'sin_revisar')),
  ADD COLUMN IF NOT EXISTS notas_revision     TEXT;

-- Índice para consultas de estado
CREATE INDEX IF NOT EXISTS idx_oe_estado_revision
  ON obligaciones_empresa(empresa_id, estado_revision)
  WHERE estado_revision IS NOT NULL;
```

- [ ] **Step 2: Aplicar en Supabase**

Ejecutar el contenido del archivo en el SQL Editor de Supabase (Dashboard → SQL Editor → pegar y ejecutar).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260424150000_obligaciones_continuas_revision.sql
git commit -m "feat: columna ultima_revision y estado_revision en obligaciones_empresa"
```

---

## Task 5: UI de revisión para obligaciones continuas

**Problema:** Las obligaciones continuas no tienen UI para registrar su estado de cumplimiento ni cuándo se revisaron.

**Solución:** En el bloque expandido de `ObligacionRow` para obligaciones continuas (creado en Task 2), agregar controles de revisión: estado (vigente/en riesgo/incumplimiento) + fecha de última revisión + nota. Conectar con Supabase.

**Files:**
- Modify: `src/hooks/useObligaciones.ts`
- Modify: `src/pages/app/Obligaciones.tsx`

- [ ] **Step 1: Actualizar tipos en useObligaciones.ts**

En la interfaz `ObligacionEmpresa`, agregar los campos nuevos:

```typescript
export interface ObligacionEmpresa {
  id: string
  empresa_id: string
  estado: boolean
  activa_desde: string
  activa_hasta: string | null
  motivo_inactiva: string | null
  created_at: string
  // Nuevos campos para cumplimiento continuo:
  ultima_revision: string | null
  estado_revision: 'vigente' | 'en_riesgo' | 'incumplimiento' | 'sin_revisar' | null
  notas_revision: string | null
  catalogo: { ... }  // sin cambios
  vencimientos: VencimientoResumen[]
}
```

- [ ] **Step 2: Agregar columnas al SELECT en useObligaciones.ts**

En la query de Supabase (línea ~62), agregar los campos nuevos al select:

```typescript
const { data, error: err } = await supabase
  .from('obligaciones_empresa')
  .select(`
    id, empresa_id, estado, activa_desde, activa_hasta, motivo_inactiva, created_at,
    ultima_revision, estado_revision, notas_revision,
    catalogo_id (
      id, nombre, descripcion, categoria, periodicidad,
      fundamento_legal, notas_importantes,
      multa_minima_mxn, multa_maxima_mxn
    )
  `)
  .eq('empresa_id', empresaId)
  .order('estado', { ascending: false })
```

- [ ] **Step 3: Agregar función registrarRevision en useObligaciones.ts**

Después de `agregarNota`, agregar:

```typescript
const registrarRevision = useCallback(async (
  obligacionId: string,
  estadoRevision: 'vigente' | 'en_riesgo' | 'incumplimiento',
  notasRevision?: string
) => {
  const hoy = new Date().toISOString().split('T')[0]
  
  setObligaciones(prev => prev.map(o =>
    o.id === obligacionId
      ? { ...o, ultima_revision: hoy, estado_revision: estadoRevision, notas_revision: notasRevision ?? o.notas_revision }
      : o
  ))

  const { error: err } = await supabase
    .from('obligaciones_empresa')
    .update({
      ultima_revision: hoy,
      estado_revision: estadoRevision,
      notas_revision: notasRevision ?? null,
    })
    .eq('id', obligacionId)

  if (err) { console.error(err.message); refetch() }
}, [refetch])
```

Y agregarlo al return del hook y a la interfaz `UseObligacionesResult`.

- [ ] **Step 4: Agregar controles de revisión en Obligaciones.tsx**

En el bloque de "cumplimiento permanente" (creado en Task 2), reemplazar el bloque estático por controles interactivos. El componente `ObligacionRow` necesita recibir `onRegistrarRevision`:

```typescript
// Agregar prop al tipo de ObligacionRow:
onRegistrarRevision: (id: string, estado: 'vigente' | 'en_riesgo' | 'incumplimiento', notas?: string) => Promise<void>
```

En el JSX del bloque permanente, después del texto informativo, agregar:

```typescript
{/* Controles de revisión — solo para puedeEditar */}
<div style={{ marginTop: 14 }}>
  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: 8 }}>
    Estado de cumplimiento
  </p>
  
  {/* Última revisión */}
  {o.ultima_revision && (
    <p style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>
      Última revisión: {formatFecha(o.ultima_revision)} —{' '}
      <span style={{
        fontWeight: 600,
        color: o.estado_revision === 'vigente' ? 'var(--em)'
             : o.estado_revision === 'en_riesgo' ? 'var(--warn)'
             : 'var(--danger)'
      }}>
        {o.estado_revision === 'vigente' ? 'Vigente'
         : o.estado_revision === 'en_riesgo' ? 'En riesgo'
         : o.estado_revision === 'incumplimiento' ? 'Incumplimiento'
         : 'Sin revisar'}
      </span>
    </p>
  )}

  {/* Botones de estado */}
  {puedeEditar && (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {([
        { id: 'vigente',        label: '✅ Vigente',       color: 'var(--em)' },
        { id: 'en_riesgo',      label: '⚠️ En riesgo',     color: 'var(--warn)' },
        { id: 'incumplimiento', label: '🔴 Incumplimiento', color: 'var(--danger)' },
      ] as const).map(opt => (
        <button
          key={opt.id}
          onClick={() => onRegistrarRevision(o.id, opt.id)}
          style={{
            fontSize: 11, fontWeight: 600,
            padding: '5px 12px', borderRadius: 'var(--r-full)',
            border: `1px solid ${o.estado_revision === opt.id
              ? `color-mix(in srgb, ${opt.color} 50%, transparent)`
              : '#E2E8F0'}`,
            background: o.estado_revision === opt.id
              ? `color-mix(in srgb, ${opt.color} 10%, transparent)`
              : '#F8FAFC',
            color: o.estado_revision === opt.id ? opt.color : '#64748B',
            cursor: 'pointer',
            transition: 'all var(--dur-fast)',
            minHeight: 32,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 5: Conectar en el render de Obligaciones.tsx**

En el `lista.map(...)` dentro de `Obligaciones`, pasar la nueva prop:

```typescript
<ObligacionRow
  obligacion={o}
  expanded={expandida === o.id}
  onToggleExpand={() => setExpandida(expandida === o.id ? null : o.id)}
  onToggleEstado={toggleEstado}
  onEditarFecha={editarFechaVencimiento}
  onAgregarNota={agregarNota}
  onRegistrarRevision={registrarRevision}
  puedeEditar={puedeEditar}
/>
```

Y desestructurar `registrarRevision` del hook:

```typescript
const { obligaciones, loading, toggleEstado, editarFechaVencimiento, agregarNota, registrarRevision, refetch } = useObligaciones(empresa?.id ?? null)
```

- [ ] **Step 6: Verificar**
  1. Ir a `/app/obligaciones`
  2. Expandir una obligación con chip "Permanente"
  3. Ver bloque informativo con botones de estado
  4. Clic en "✅ Vigente" → botón se activa, fecha de última revisión aparece
  5. Clic en "⚠️ En riesgo" → cambia estado
  6. Recargar página → estado persiste

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useObligaciones.ts src/pages/app/Obligaciones.tsx
git commit -m "feat: UI de revisión para obligaciones de cumplimiento permanente"
```

---

## Task 6: Push y PR

- [ ] **Step 1: Push del branch**

```bash
git push origin fix/obligaciones-refetch-y-mejoras
```

- [ ] **Step 2: Crear PR en GitHub**

Ir a: `https://github.com/perezruiz444-crypto/CC-v2/pull/new/fix/obligaciones-refetch-y-mejoras`

Título: `feat: mejoras UX obligaciones — refetch, continuas, onboarding`

Body:
```
## Cambios
- fix: refetch automático en Obligaciones al activar programa desde Mi Empresa
- feat: chip "Permanente" y bloque informativo para obligaciones continuas
- feat: onboarding rediseñado con paso de tipo de empresa y programas recomendados  
- feat: UI de estado de cumplimiento (vigente/en riesgo/incumplimiento) para obligaciones permanentes
- feat: migración SQL con columnas ultima_revision, estado_revision, notas_revision

## Testing
- [ ] Activar programa en Mi Empresa → ir a Obligaciones → lista actualiza sin recargar
- [ ] Obligaciones continuas muestran chip "Permanente" y bloque de cumplimiento
- [ ] Onboarding nuevo usuario: paso 0 pide tipo empresa, paso 3 muestra recomendados
- [ ] Marcar obligación permanente como "Vigente" → persiste al recargar
```

---

## Notas de implementación

- **No tocar** el motor SQL `proyectar_vencimientos()` — funciona correctamente
- **No tocar** la RLS de `obligaciones_empresa` — ya está correcta
- El evento `programas-updated` es intencional con `window` — es la forma más simple sin introducir Context o Zustand
- La migración SQL de Task 4 DEBE aplicarse en Supabase antes de ejecutar Task 5
