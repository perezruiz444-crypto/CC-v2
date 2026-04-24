# Landing Light Mode & Demo Calendar Coherence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir todos los fondos oscuros en la landing (PainPoints cards, Features cards) y rediseñar el calendario Demo para que sea light mode y visualmente coherente con el calendario real de la app autenticada.

**Architecture:** Hay un bug semántico en `index.css`: la clase `.card` usa `background: var(--snow)` pero `--snow` está definido como `#0F172A` (color de texto primario, no de fondo). El fix correcto es cambiar esa línea a `var(--surface)` (`#FFFFFF`). Adicionalmente, el Demo del calendario usa un browser mockup oscuro con colores `rgb(255 255 255 / 0.xx)` —esos colores deben voltearse a equivalentes light usando los mismos tokens que usa `Calendario.tsx` en la app autenticada.

**Tech Stack:** React 18 + TypeScript, CSS custom properties (`index.css`), sin dependencias nuevas.

---

## Mapa de archivos

| Archivo | Cambio |
|---------|--------|
| `src/index.css:195` | `.card { background: var(--snow) }` → `var(--surface)` |
| `src/components/PainPoints.tsx:34` | Cards: `background: 'var(--snow)'` → `'var(--surface)'` |
| `src/components/Demo.tsx` | Browser mockup: oscuro → claro; calendario: tokens idénticos a `Calendario.tsx` |

**Referencia de coherencia visual** (NO modificar): `src/pages/app/Calendario.tsx`

---

## Task 1: Fix raíz — `.card` en index.css

**El problema:** `.card { background: var(--snow) }` usa `--snow: #0F172A` (texto oscuro) como fondo de tarjeta. Todas las tarjetas con clase `card` (Features, etc.) son oscuras por esto.

**Files:**
- Modify: `src/index.css:195`

- [ ] **Step 1: Editar `src/index.css` línea 195**

```css
/* ANTES (línea 194-207): */
.card {
  background: var(--snow);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 28px;
  box-shadow: var(--sh-sm);
  transition: box-shadow var(--dur-base) var(--ease-out),
              transform var(--dur-base) var(--ease-out);
  will-change: transform;
}
.card:hover {
  box-shadow: var(--sh-lg);
  transform: translateY(-3px);
}

/* DESPUÉS: */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 28px;
  box-shadow: var(--sh-sm);
  transition: box-shadow var(--dur-base) var(--ease-out),
              transform var(--dur-base) var(--ease-out);
  will-change: transform;
}
.card:hover {
  box-shadow: var(--sh-lg);
  transform: translateY(-3px);
}
```

- [ ] **Step 2: Verificar visualmente con dev server**

```bash
npm run dev
```

Abrir http://localhost:5173 — sección "Funciones" debe mostrar tarjetas blancas con texto oscuro visible.

- [ ] **Step 3: Verificar que no hay regresiones en la app autenticada**

Navegar a `/dashboard` (si hay sesión activa) o revisar que ningún componente en `src/pages/app/` dependa de `.card` con fondo oscuro.

```bash
grep -r 'className.*card' src/pages/app/ --include="*.tsx" | head -20
```

Confirmar que los resultados son pocos y que los componentes de la app usan estilos inline o Tailwind en lugar de la clase `.card`.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "fix: corregir .card background de --snow (#0F172A) a --surface (#FFFFFF)"
```

---

## Task 2: Fix PainPoints.tsx — cards con `var(--snow)` inline

**El problema:** Las cards de "¿Te suena familiar?" tienen `background: 'var(--snow)'` en el `style` inline (línea 34), lo que sobreescribe cualquier clase y las pone oscuras. Además el texto `color: '#3f3f3f'` tiene contraste insuficiente sobre fondo oscuro.

**Files:**
- Modify: `src/components/PainPoints.tsx:34-45`

- [ ] **Step 1: Editar `src/components/PainPoints.tsx`**

Reemplazar el bloque `style` de las cards de pain (el `div` dentro del `.map`):

```tsx
// ANTES (línea ~30-50):
<div key={pain}
  className="reveal-left"
  style={{
    display: 'flex', alignItems: 'flex-start', gap: 14,
    background: 'var(--snow)',
    borderRadius: 'var(--r-lg)',
    padding: '16px 22px',
    border: '1px solid var(--border)',
    textAlign: 'left',
    boxShadow: 'var(--sh-sm)',
    transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
  }}
  onMouseEnter={e => {
    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'
    ;(e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'
  }}
  onMouseLeave={e => {
    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'
    ;(e.currentTarget as HTMLElement).style.transform = ''
  }}
>
  ...
  <p style={{ fontSize: 15, color: '#3f3f3f', lineHeight: 1.6 }}>{pain}</p>
</div>

// DESPUÉS:
<div key={pain}
  className="reveal-left"
  style={{
    display: 'flex', alignItems: 'flex-start', gap: 14,
    background: 'var(--surface)',
    borderRadius: 'var(--r-lg)',
    padding: '16px 22px',
    border: '1px solid var(--border)',
    textAlign: 'left',
    boxShadow: 'var(--sh-sm)',
    transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
  }}
  onMouseEnter={e => {
    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'
    ;(e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'
  }}
  onMouseLeave={e => {
    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'
    ;(e.currentTarget as HTMLElement).style.transform = ''
  }}
>
  ...
  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pain}</p>
</div>
```

Dos cambios exactos:
1. `background: 'var(--snow)'` → `background: 'var(--surface)'`
2. `color: '#3f3f3f'` → `color: 'var(--text-secondary)'` (= `#334155`, mejor contraste)

- [ ] **Step 2: Verificar visualmente**

```bash
npm run dev
```

Sección "¿Te suena familiar?" debe mostrar tarjetas blancas con ícono X rojo y texto gris oscuro legible.

- [ ] **Step 3: Commit**

```bash
git add src/components/PainPoints.tsx
git commit -m "fix: PainPoints cards - fondo var(--snow) → var(--surface), mejorar contraste texto"
```

---

## Task 3: Demo.tsx — calendario light mode coherente con la app

**El problema:** El Demo muestra el calendario con estilos de modo oscuro (`rgb(255 255 255 / 0.65)`, `rgba(3,105,161,0.5)`, fondo negro del browser mockup). El usuario dice que el calendario le gustó pero debe estar en tonos claros y ser visualmente coherente con `Calendario.tsx` (la app real).

**Decisión de diseño:** Cambiar el browser mockup de oscuro a claro. El fondo del mockup pasa de `linear-gradient(135deg, #1a2a3a, #0f1a28)` a `#FFFFFF`. El chrome del browser pasa de `#0f172a` a `#F1F5F9`. Los colores del calendario usan los mismos tokens que `Calendario.tsx`.

**Coherencia con Calendario.tsx real:**
- Celda día normal: `background: transparent`, `color: #0F172A`
- Celda hoy: `background: #F1F5F9`, `fontWeight: 600`  
- Celda seleccionada: `background: rgba(3,105,161,0.08)`, `border: 1px solid rgba(3,105,161,0.3)`
- Dots: `--danger` (#DC2626), `--warn` (#D97706), `--em` (#0369A1)
- Nav buttons hover: `background: #F1F5F9`
- Panel de detalle: fondo `#FFFFFF`, border `#E2E8F0`

**Files:**
- Modify: `src/components/Demo.tsx` — reemplazar completo

- [ ] **Step 1: Reemplazar `src/components/Demo.tsx` con versión light**

El archivo completo nuevo:

```tsx
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useState, useMemo } from 'react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const WEEKDAYS = ['Lu','Ma','Mi','Ju','Vi','Sa','Do']

// Obligaciones relativas a hoy (diaOffset = días desde hoy)
// Mismos estados y colores que usa Calendario.tsx en la app autenticada
const DEMO_ITEMS = [
  { id: 1, titulo: 'Reporte mensual IMMEX',   programa: 'IMMEX',             diaOffset: -2,  status: 'vencido'   },
  { id: 2, titulo: 'Pago derechos aduanales', programa: 'Padrón Importador', diaOffset: 4,   status: 'proximo'   },
  { id: 3, titulo: 'Presentación Anexo 30',   programa: 'PROSEC',            diaOffset: 8,   status: 'proximo'   },
  { id: 4, titulo: 'Encuesta económica anual',programa: 'IMMEX',             diaOffset: 14,  status: 'pendiente' },
  { id: 5, titulo: 'Actualización de socios', programa: 'IMMEX',             diaOffset: 21,  status: 'pendiente' },
] as const

type StatusKey = 'vencido' | 'proximo' | 'pendiente' | 'completado'

// Mismos colores semánticos que Calendario.tsx usa con --danger, --warn, --em
const STATUS_COLOR: Record<StatusKey, string> = {
  vencido:    '#DC2626',   // var(--danger)
  proximo:    '#D97706',   // var(--warn)
  pendiente:  '#0369A1',   // var(--em)
  completado: '#16A34A',   // var(--success)
}

const STATUS_LABEL: Record<StatusKey, string> = {
  vencido:    'Vencida',
  proximo:    'Por vencer',
  pendiente:  'Pendiente',
  completado: 'Completada',
}

export default function Demo() {
  const ref = useReveal()
  const [showModal, setShowModal] = useState(false)
  const [visMes, setVisMes]       = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const obligsByDay = useMemo(() => {
    const hoy = new Date()
    const map = new Map<number, typeof DEMO_ITEMS[number][]>()
    DEMO_ITEMS.forEach(item => {
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() + item.diaOffset)
      if (
        fecha.getFullYear() === visMes.getFullYear() &&
        fecha.getMonth()    === visMes.getMonth()
      ) {
        const dia = fecha.getDate()
        if (!map.has(dia)) map.set(dia, [])
        map.get(dia)!.push(item)
      }
    })
    return map
  }, [visMes])

  const firstDay    = (new Date(visMes.getFullYear(), visMes.getMonth(), 1).getDay() + 6) % 7
  const daysInMonth = new Date(visMes.getFullYear(), visMes.getMonth() + 1, 0).getDate()

  const esHoy = (d: number) => {
    const now = new Date()
    return (
      visMes.getFullYear() === now.getFullYear() &&
      visMes.getMonth()    === now.getMonth()    &&
      d === now.getDate()
    )
  }

  const navMes = (delta: number) => {
    setVisMes(p => new Date(p.getFullYear(), p.getMonth() + delta, 1))
    setSelectedDay(null)
  }

  return (
    <>
      <section
        ref={ref as React.RefObject<HTMLElement>}
        className="section"
        id="demo"
        style={{
          background: 'var(--ink)',   /* #F8FAFC — fondo de la landing */
          position: 'relative', overflow: 'hidden',
          paddingTop: 80, paddingBottom: 80,
        }}
      >
        {/* Glow decorativo sutil */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(3,105,161,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', maxWidth: '72rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="badge reveal" style={{ marginBottom: 16 }}>
              VER EN ACCIÓN
            </span>
            <h2 className="reveal delay-1" style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              color: 'var(--snow)',   /* #0F172A */
              marginBottom: 16, fontWeight: 600,
            }}>
              El compliance que siempre quisiste tener
            </h2>
            <p className="reveal delay-2" style={{
              fontSize: 16,
              color: 'var(--text-muted)',  /* #64748B */
              lineHeight: 1.7, maxWidth: 500, marginInline: 'auto',
            }}>
              Así se ve tu operación de ComEx cuando todo está organizado.
            </p>
          </div>

          {/* Browser Mockup — light mode */}
          <div className="reveal-scale float-anim" style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',     /* #E2E8F0 */
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            boxShadow: 'var(--sh-xl)',
            marginBottom: 40,
          }}>

            {/* Browser chrome — light */}
            <div style={{
              background: '#F8FAFC',
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{
                flex: 1, marginInline: 12,
                background: '#FFFFFF', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', padding: '4px 12px',
                fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
              }}>
                app.calendariocompliance.mx/calendario
              </div>
            </div>

            {/* ── Calendario interactivo — light mode ── */}
            <div style={{ padding: '24px 28px 28px' }}>

              {/* Nav de mes — igual que Calendario.tsx */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--snow)' }}>
                    {MESES[visMes.getMonth()]} {visMes.getFullYear()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {obligsByDay.size} obligación{obligsByDay.size !== 1 ? 'es' : ''} este mes
                  </div>
                </div>
                <div style={{
                  display: 'flex', gap: 4,
                  background: '#FFFFFF', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-full)', padding: '4px 6px',
                }}>
                  <button
                    onClick={() => navMes(-1)}
                    aria-label="Mes anterior"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background var(--dur-fast)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#0F172A' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => navMes(1)}
                    aria-label="Mes siguiente"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background var(--dur-fast)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#0F172A' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Grid: cabecera días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                {WEEKDAYS.map(d => (
                  <div key={d} style={{
                    textAlign: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '6px 0',
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid: días del mes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dia => {
                  const items  = obligsByDay.get(dia)
                  const isHoy  = esHoy(dia)
                  const isSel  = selectedDay === dia
                  return (
                    <div
                      key={dia}
                      onClick={() => items && setSelectedDay(isSel ? null : dia)}
                      style={{
                        minHeight: 40,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        borderRadius: 'var(--r-md)',
                        fontSize: 13, fontWeight: isHoy ? 700 : 600,
                        color: 'var(--snow)',
                        background: isSel
                          ? 'rgba(3,105,161,0.08)'    /* var(--em-subtle) */
                          : isHoy
                            ? '#F1F5F9'
                            : 'transparent',
                        border: isSel
                          ? '1px solid rgba(3,105,161,0.3)'
                          : isHoy
                            ? '1px solid var(--border)'
                            : '1px solid transparent',
                        cursor: items ? 'pointer' : 'default',
                        transition: 'background var(--dur-fast)',
                      }}
                      onMouseEnter={e => {
                        if (!isSel && items) {
                          (e.currentTarget as HTMLElement).style.background = '#F8FAFC'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSel) {
                          (e.currentTarget as HTMLElement).style.background = isSel
                            ? 'rgba(3,105,161,0.08)'
                            : isHoy ? '#F1F5F9' : 'transparent'
                        }
                      }}
                    >
                      <span>{dia}</span>
                      {items && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                          {items.slice(0, 3).map(it => (
                            <div key={it.id} style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: STATUS_COLOR[it.status as StatusKey],
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Panel detalle — igual estética que Calendario.tsx */}
              {selectedDay !== null && obligsByDay.get(selectedDay) && (
                <div style={{
                  marginTop: 16,
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {MESES[visMes.getMonth()]} {selectedDay}
                    </span>
                    <button
                      onClick={() => setSelectedDay(null)}
                      style={{
                        background: '#FFFFFF', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-full)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                  {obligsByDay.get(selectedDay)!.map((it, idx, arr) => (
                    <div key={it.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: STATUS_COLOR[it.status as StatusKey],
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: 'var(--snow)',
                        }}>
                          {it.titulo}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {it.programa}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: STATUS_COLOR[it.status as StatusKey],
                        background: `${STATUS_COLOR[it.status as StatusKey]}14`,
                        padding: '3px 8px', borderRadius: 'var(--r-full)',
                      }}>
                        {STATUS_LABEL[it.status as StatusKey]}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leyenda — mismos colores que Calendario.tsx */}
              <div style={{
                display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap',
              }}>
                {([
                  ['#DC2626', 'Vencida'],
                  ['#D97706', 'Por vencer'],
                  ['#0369A1', 'Pendiente'],
                ] as [string, string][]).map(([c, l]) => (
                  <div key={l} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: 'var(--text-muted)',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowModal(true)}
              className="reveal btn btn-primary"
              style={{ fontSize: 15, padding: '14px 32px' }}
            >
              <PlayCircle size={18} />
              Ver demo de 3 minutos
            </button>
          </div>
        </div>
      </section>

      {/* Modal Demo */}
      {showModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgb(0 0 0 / 0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#0f172a', borderRadius: 'var(--r-xl)',
              overflow: 'hidden', maxWidth: 900, width: '100%',
              aspectRatio: '16 / 9',
            }}
            onClick={e => e.stopPropagation()}
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Demo Calendario Compliance"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'block' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Verificar build TypeScript**

```bash
npm run build 2>&1 | tail -10
```

Esperado: `✓ built in Xms` sin errores TypeScript.

- [ ] **Step 3: Verificar visualmente en dev server**

```bash
npm run dev
```

Checklist visual:
- Browser mockup es blanco con chrome gris claro (`#F8FAFC`)
- Grid de días con texto oscuro legible
- Día de hoy: fondo `#F1F5F9` con borde sutil
- Dots de color visibles sobre fondo blanco
- Click en día → panel de detalle con fondo `#F8FAFC`, chips de color
- Navegación ← → cambia el mes correctamente
- Leyenda con los 3 estados en la parte inferior

- [ ] **Step 4: Commit**

```bash
git add src/components/Demo.tsx
git commit -m "feat: Demo calendario light mode — coherente con app autenticada"
```

---

## Task 4: Verificación final + commit integrador

- [ ] **Step 1: Ejecutar build completo**

```bash
npm run build
```

Esperado: 0 errores TypeScript, `✓ built`.

- [ ] **Step 2: Recorrido visual de la landing completo**

Con `npm run dev` abierto, verificar cada sección en orden:
- Hero: fondo gradiente azul claro ✓ (no cambia)
- PainPoints (`#pain`): cards **blancas** con ícono X rojo y texto legible
- Features (`#features`): cards **blancas** sobre fondo gris `#F1F5F9`
- Demo (`#demo`): browser mockup **blanco**, calendario light mode
- HowItWorks, FAQ, CTA: fondos blancos (ya corregidos en PR anterior)

- [ ] **Step 3: Verificar coherencia visual Demo vs app**

Comparar mentalmente:
- Los colores de los dots en Demo (`#DC2626`, `#D97706`, `#0369A1`) deben ser **idénticos** a los que usa `Calendario.tsx` (usa `--danger`, `--warn`, `--em` que resuelven a esos mismos valores)
- El panel de detalle en Demo debe verse como una versión simplificada del panel lateral de `Calendario.tsx`
- La tipografía, bordes y espaciados deben sentirse del mismo sistema

- [ ] **Step 4: Push**

```bash
git push origin feat/ui-design-system-refactor
```

---

## Verificación end-to-end

```bash
# Compilación limpia
npm run build

# Tests existentes (27 tests)
npm test

# Dev server para revisión visual
npm run dev
```

**Checks visuales esperados:**

| Sección | Antes | Después |
|---------|-------|---------|
| `.card` CSS | Fondo `#0F172A` (negro) | Fondo `#FFFFFF` (blanco) |
| PainPoints cards | Fondo `#0F172A` (negro) | Fondo `#FFFFFF`, texto `#334155` |
| Features cards | Fondo `#0F172A` (negro, heredado) | Fondo `#FFFFFF` (via `.card`) |
| Demo browser | Mockup oscuro `#1a2a3a` | Mockup blanco `#FFFFFF` |
| Demo calendario | Texto `rgb(255/0.65)` sobre oscuro | Texto `#0F172A` sobre blanco |
| Demo dots | `#ef4444`, `#eab308` | `#DC2626`, `#D97706` (= tokens app) |

---

*Plan generado el 2026-04-24. Guarda coherencia con `src/pages/app/Calendario.tsx` como fuente de verdad visual para el componente Demo.*
