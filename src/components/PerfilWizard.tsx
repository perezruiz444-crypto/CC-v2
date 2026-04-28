import { useState, useMemo, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, Check, Briefcase, Factory, Truck,
  GitBranch, ShieldAlert, FileSearch,
} from 'lucide-react'
import {
  type PerfilEmpresa,
  type Programa,
  type ModalidadImmex,
  type RolCtm,
  type DiffResult,
  PERFIL_VACIO,
  PROGRAMAS,
  MODALIDADES_IMMEX,
  ROLES_CTM,
  muestraPasoModalidad,
  muestraPasoCtm,
  muestraPasoSubmaquila,
  muestraPasoSensibles,
  pasoValido,
  normalizarPerfil,
} from '../lib/perfil'
import { useAsignarObligaciones } from '../hooks/useAsignarObligaciones'
import { PerfilDiff } from './PerfilDiff'

export type ModoWizard = 'onboarding' | 'empresa'

export interface PerfilWizardProps {
  modo: ModoWizard
  empresaId?: string | null         // requerido en modo 'empresa'
  perfilActual?: PerfilEmpresa
  onComplete: (perfil: PerfilEmpresa) => Promise<void> | void
  onCancel?: () => void
}

const TEMA_POR_MODO: Record<ModoWizard, 'oscuro' | 'claro'> = {
  onboarding: 'oscuro',
  empresa:    'claro',
}

export function PerfilWizard({
  modo,
  empresaId,
  perfilActual,
  onComplete,
  onCancel,
}: PerfilWizardProps) {
  const tema = TEMA_POR_MODO[modo]
  const t = tokens(tema)

  const [perfil, setPerfil] = useState<PerfilEmpresa>(perfilActual ?? PERFIL_VACIO)
  const [paso, setPaso] = useState(1)
  const [diff, setDiff] = useState<DiffResult | null>(null)
  const [diffLoading, setDiffLoading] = useState(false)
  const [diffError, setDiffError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { calcularDiff } = useAsignarObligaciones(empresaId ?? null)

  // Cuando perfilActual cambia desde fuera (re-fetch), sincroniza
  useEffect(() => {
    if (perfilActual) setPerfil(perfilActual)
  }, [perfilActual])

  // Calcula los pasos visibles según las respuestas
  const pasosVisibles = useMemo(() => calcularPasosVisibles(perfil), [perfil])

  // Convertir índice de paso lógico (1..5) al índice visible para el stepper
  const pasoIndex = pasosVisibles.indexOf(paso)
  const totalPasos = pasosVisibles.length + 1 // +1 = paso confirmación
  const esPasoDiff = paso === 6

  function actualizar(patch: Partial<PerfilEmpresa>) {
    setPerfil(p => normalizarPerfil({ ...p, ...patch }))
  }

  function siguiente() {
    if (!pasoValido(paso, perfil)) return
    if (paso === 6) return
    const idx = pasosVisibles.indexOf(paso)
    const next = pasosVisibles[idx + 1]
    if (next !== undefined) {
      setPaso(next)
    } else {
      // Todos los pasos hechos → ir al paso 6 (diff)
      irADiff()
    }
  }

  function anterior() {
    if (paso === 6) {
      // Volver al último paso visible
      setPaso(pasosVisibles[pasosVisibles.length - 1] ?? 1)
      return
    }
    const idx = pasosVisibles.indexOf(paso)
    const prev = pasosVisibles[idx - 1]
    if (prev !== undefined) setPaso(prev)
  }

  async function irADiff() {
    setPaso(6)
    if (modo === 'empresa' && empresaId) {
      setDiffLoading(true)
      setDiffError(null)
      try {
        const result = await calcularDiff(perfil)
        setDiff(result)
      } catch (err) {
        setDiffError(err instanceof Error ? err.message : 'Error al calcular cambios')
      } finally {
        setDiffLoading(false)
      }
    } else {
      // En onboarding no hay empresa todavía, mostramos resumen sin diff
      setDiff(null)
    }
  }

  async function handleConfirmar() {
    setSaving(true)
    try {
      await onComplete(perfil)
    } catch (err) {
      setDiffError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Stepper */}
      <Stepper tema={tema} totalPasos={totalPasos} pasoActualIndex={esPasoDiff ? totalPasos - 1 : pasoIndex} />

      {/* Paso actual */}
      <div style={t.card}>
        {paso === 1 && <PasoProgramas tema={tema} perfil={perfil} onChange={actualizar} />}
        {paso === 2 && <PasoModalidad tema={tema} perfil={perfil} onChange={actualizar} />}
        {paso === 3 && <PasoCtm tema={tema} perfil={perfil} onChange={actualizar} />}
        {paso === 4 && <PasoSubmaquila tema={tema} perfil={perfil} onChange={actualizar} />}
        {paso === 5 && <PasoSensibles tema={tema} perfil={perfil} onChange={actualizar} />}

        {paso === 6 && (
          <div>
            <Header
              tema={tema}
              icono={<FileSearch size={22} color="var(--em)" />}
              titulo={modo === 'onboarding' ? 'Resumen del perfil' : 'Revisa los cambios'}
              descripcion={modo === 'onboarding'
                ? 'Confirma para crear la empresa con sus obligaciones.'
                : 'Estas son las obligaciones que se agregarán o desactivarán según tu perfil actualizado.'}
            />
            {modo === 'onboarding'
              ? <ResumenOnboarding tema={tema} perfil={perfil} />
              : (
                <PerfilDiff
                  diff={diff}
                  loading={diffLoading}
                  saving={saving}
                  error={diffError}
                  tema={tema}
                  onConfirmar={handleConfirmar}
                  onCancelar={anterior}
                />
              )
            }
          </div>
        )}
      </div>

      {/* Footer de navegación (solo en pasos 1-5 y en paso 6 modo onboarding) */}
      {(!esPasoDiff || modo === 'onboarding') && (
        <div style={{
          display: 'flex',
          justifyContent: paso === 1 && !onCancel ? 'flex-end' : 'space-between',
          gap: 10,
        }}>
          {(paso > 1 || onCancel) && (
            <button
              onClick={paso === 1 ? onCancel : anterior}
              disabled={saving}
              style={{
                padding: '10px 16px', borderRadius: 'var(--r-md)',
                background: 'transparent', border: `1px solid ${t.border}`,
                color: t.muted, fontSize: 13, fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <ChevronLeft size={14} /> {paso === 1 ? 'Cancelar' : 'Anterior'}
            </button>
          )}

          {paso < 6 && (
            <button
              onClick={siguiente}
              disabled={!pasoValido(paso, perfil)}
              style={{
                padding: '10px 22px', borderRadius: 'var(--r-md)',
                background: pasoValido(paso, perfil) ? 'var(--em)' : t.disabledBg,
                color: pasoValido(paso, perfil) ? '#fff' : t.muted,
                border: 'none', fontSize: 13, fontWeight: 600,
                cursor: pasoValido(paso, perfil) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {esUltimoPasoVisible(paso, pasosVisibles) ? 'Revisar' : 'Siguiente'} <ChevronRight size={14} />
            </button>
          )}

          {paso === 6 && modo === 'onboarding' && (
            <button
              onClick={handleConfirmar}
              disabled={saving}
              style={{
                padding: '10px 22px', borderRadius: 'var(--r-md)',
                background: saving ? t.disabledBg : 'var(--em)',
                color: saving ? t.muted : '#fff',
                border: 'none', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Check size={14} /> {saving ? 'Creando…' : 'Crear empresa'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcularPasosVisibles(p: PerfilEmpresa): number[] {
  const pasos = [1] // siempre programas
  if (muestraPasoModalidad(p))  pasos.push(2)
  if (muestraPasoCtm(p))        pasos.push(3)
  if (muestraPasoSubmaquila(p)) pasos.push(4)
  if (muestraPasoSensibles(p))  pasos.push(5)
  return pasos
}

function esUltimoPasoVisible(paso: number, pasosVisibles: number[]): boolean {
  return pasosVisibles[pasosVisibles.length - 1] === paso
}

// ─── Subcomponentes de paso ─────────────────────────────────────────────────

function Header({
  tema, icono, titulo, descripcion,
}: { tema: 'oscuro' | 'claro'; icono: React.ReactNode; titulo: string; descripcion: string }) {
  const t = tokens(tema)
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={t.iconWrap}>{icono}</div>
      <h2 style={t.heading}>{titulo}</h2>
      <p style={t.muted_text}>{descripcion}</p>
    </div>
  )
}

function PasoProgramas({
  tema, perfil, onChange,
}: { tema: 'oscuro' | 'claro'; perfil: PerfilEmpresa; onChange: (p: Partial<PerfilEmpresa>) => void }) {
  const toggle = (id: Programa) => {
    const set = new Set(perfil.programas_activos)
    if (set.has(id)) set.delete(id); else set.add(id)
    onChange({ programas_activos: Array.from(set) })
  }

  return (
    <div>
      <Header
        tema={tema}
        icono={<Briefcase size={22} color="var(--em)" />}
        titulo="¿Qué programas tiene activos tu empresa?"
        descripcion="Selecciona todos los que apliquen. Esto determina qué obligaciones se asignarán."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PROGRAMAS.map(p => {
          const selected = perfil.programas_activos.includes(p.value)
          return (
            <Card
              key={p.value}
              tema={tema}
              selected={selected}
              onClick={() => toggle(p.value)}
              titulo={p.label}
              descripcion={p.desc}
              checkbox
            />
          )
        })}
      </div>
    </div>
  )
}

function PasoModalidad({
  tema, perfil, onChange,
}: { tema: 'oscuro' | 'claro'; perfil: PerfilEmpresa; onChange: (p: Partial<PerfilEmpresa>) => void }) {
  return (
    <div>
      <Header
        tema={tema}
        icono={<Factory size={22} color="var(--em)" />}
        titulo="¿Cuál es tu modalidad IMMEX?"
        descripcion="Define qué obligaciones específicas aplican a tu programa."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MODALIDADES_IMMEX.map(m => (
          <Card
            key={m.value}
            tema={tema}
            selected={perfil.modalidad_immex === m.value}
            onClick={() => onChange({ modalidad_immex: m.value as ModalidadImmex })}
            titulo={m.label}
            descripcion={m.desc}
          />
        ))}
      </div>
    </div>
  )
}

function PasoCtm({
  tema, perfil, onChange,
}: { tema: 'oscuro' | 'claro'; perfil: PerfilEmpresa; onChange: (p: Partial<PerfilEmpresa>) => void }) {
  const valorActual: 'no' | RolCtm = !perfil.opera_ctm ? 'no' : (perfil.rol_ctm ?? 'no')

  function setRol(v: 'no' | RolCtm) {
    if (v === 'no') onChange({ opera_ctm: false, rol_ctm: null })
    else onChange({ opera_ctm: true, rol_ctm: v })
  }

  return (
    <div>
      <Header
        tema={tema}
        icono={<Truck size={22} color="var(--em)" />}
        titulo="¿Operas con Constancias de Transferencia (CTM)?"
        descripcion="Las CTM aplican al sector automotriz: proveedores Tier 1 y armadoras."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ROLES_CTM.map(r => (
          <Card
            key={r.value}
            tema={tema}
            selected={valorActual === r.value}
            onClick={() => setRol(r.value)}
            titulo={r.label}
            descripcion={r.descripcion}
          />
        ))}
      </div>
    </div>
  )
}

function PasoSubmaquila({
  tema, perfil, onChange,
}: { tema: 'oscuro' | 'claro'; perfil: PerfilEmpresa; onChange: (p: Partial<PerfilEmpresa>) => void }) {
  return (
    <div>
      <Header
        tema={tema}
        icono={<GitBranch size={22} color="var(--em)" />}
        titulo="¿Tienes operaciones de submaquila?"
        descripcion="Envías mercancía temporal a fabricantes terceros para procesamiento."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Card
          tema={tema}
          selected={!perfil.opera_submaquila}
          onClick={() => onChange({ opera_submaquila: false })}
          titulo="No"
          descripcion="No mandamos mercancía a terceros para procesamiento"
        />
        <Card
          tema={tema}
          selected={perfil.opera_submaquila}
          onClick={() => onChange({ opera_submaquila: true })}
          titulo="Sí"
          descripcion="Tenemos contratos de submaquila con fabricantes terceros"
        />
      </div>
    </div>
  )
}

function PasoSensibles({
  tema, perfil, onChange,
}: { tema: 'oscuro' | 'claro'; perfil: PerfilEmpresa; onChange: (p: Partial<PerfilEmpresa>) => void }) {
  return (
    <div>
      <Header
        tema={tema}
        icono={<ShieldAlert size={22} color="var(--em)" />}
        titulo="¿Importas mercancías del Anexo II?"
        descripcion="Armas, explosivos, precursores químicos, equipos de vigilancia, etc."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Card
          tema={tema}
          selected={!perfil.importa_sensibles}
          onClick={() => onChange({ importa_sensibles: false })}
          titulo="No"
          descripcion="No importamos mercancías del Anexo II del Decreto IMMEX"
        />
        <Card
          tema={tema}
          selected={perfil.importa_sensibles}
          onClick={() => onChange({ importa_sensibles: true })}
          titulo="Sí"
          descripcion="Importamos mercancías sensibles listadas en el Anexo II"
        />
      </div>
    </div>
  )
}

function ResumenOnboarding({ tema, perfil }: { tema: 'oscuro' | 'claro'; perfil: PerfilEmpresa }) {
  const t = tokens(tema)
  const items: { label: string; valor: string }[] = []
  items.push({
    label: 'Programas',
    valor: perfil.programas_activos.length ? perfil.programas_activos.join(', ') : '—',
  })
  if (perfil.modalidad_immex) {
    const m = MODALIDADES_IMMEX.find(x => x.value === perfil.modalidad_immex)
    items.push({ label: 'Modalidad IMMEX', valor: m?.label ?? perfil.modalidad_immex })
  }
  if (perfil.opera_ctm) {
    const r = ROLES_CTM.find(x => x.value === perfil.rol_ctm)
    items.push({ label: 'CTMs', valor: r?.label ?? 'Sí' })
  }
  if (perfil.opera_submaquila) items.push({ label: 'Submaquila', valor: 'Sí' })
  if (perfil.importa_sensibles) items.push({ label: 'Sensibles (Anexo II)', valor: 'Sí' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(it => (
        <div key={it.label} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '10px 14px',
          background: t.cardBg2, border: `1px solid ${t.border}`,
          borderRadius: 'var(--r-md)',
        }}>
          <span style={{ ...t.muted_text }}>{it.label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{it.valor}</span>
        </div>
      ))}
      <p style={{ ...t.muted_text, marginTop: 6 }}>
        Las obligaciones aplicables se asignarán automáticamente al crear la empresa.
      </p>
    </div>
  )
}

// ─── Card seleccionable ─────────────────────────────────────────────────────

function Card({
  tema, selected, onClick, titulo, descripcion, checkbox = false,
}: {
  tema: 'oscuro' | 'claro'
  selected: boolean
  onClick: () => void
  titulo: string
  descripcion: string
  checkbox?: boolean
}) {
  const t = tokens(tema)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 'var(--r-md)',
        background: selected ? t.selectedBg : t.cardBg2,
        border: `1px solid ${selected ? 'var(--em)' : t.border}`,
        cursor: 'pointer',
        transition: 'all 150ms',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}
    >
      {checkbox && (
        <div style={{
          width: 18, height: 18, flexShrink: 0,
          marginTop: 2,
          borderRadius: 4,
          border: `1.5px solid ${selected ? 'var(--em)' : t.border}`,
          background: selected ? 'var(--em)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <Check size={12} color="#fff" />}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 2 }}>{titulo}</p>
        <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.4 }}>{descripcion}</p>
      </div>
    </button>
  )
}

// ─── Stepper ────────────────────────────────────────────────────────────────

function Stepper({
  tema, totalPasos, pasoActualIndex,
}: { tema: 'oscuro' | 'claro'; totalPasos: number; pasoActualIndex: number }) {
  const t = tokens(tema)
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: totalPasos }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 4, borderRadius: 999,
            background: i <= pasoActualIndex ? 'var(--em)' : t.border,
            transition: 'background 200ms',
          }}
        />
      ))}
    </div>
  )
}

// ─── Tema (tokens) ──────────────────────────────────────────────────────────

function tokens(tema: 'oscuro' | 'claro') {
  if (tema === 'oscuro') {
    return {
      text:        'var(--snow)',
      muted:       'rgb(255 255 255 / 0.5)',
      muted_text:  { fontSize: 13, color: 'rgb(255 255 255 / 0.5)', lineHeight: 1.5 } as React.CSSProperties,
      heading:     {
        fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700,
        color: 'var(--snow)', marginBottom: 6,
      } as React.CSSProperties,
      iconWrap:    {
        width: 44, height: 44,
        background: 'rgb(16 185 129 / 0.1)',
        border: '1px solid rgb(16 185 129 / 0.2)',
        borderRadius: 'var(--r-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      } as React.CSSProperties,
      border:      'rgb(255 255 255 / 0.08)',
      cardBg2:     'rgb(255 255 255 / 0.03)',
      selectedBg:  'rgb(16 185 129 / 0.08)',
      disabledBg:  'rgb(255 255 255 / 0.06)',
      card: {
        background: 'transparent',
        padding: 0,
      } as React.CSSProperties,
    }
  }
  return {
    text:        '#0F172A',
    muted:       '#64748B',
    muted_text:  { fontSize: 13, color: '#64748B', lineHeight: 1.5 } as React.CSSProperties,
    heading:     {
      fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
      color: '#0F172A', marginBottom: 4,
    } as React.CSSProperties,
    iconWrap:    {
      width: 44, height: 44,
      background: 'var(--em-subtle, rgb(3 105 161 / 0.1))',
      border: '1px solid rgb(3 105 161 / 0.18)',
      borderRadius: 'var(--r-lg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 12,
    } as React.CSSProperties,
    border:      '#E2E8F0',
    cardBg2:     '#FFFFFF',
    selectedBg:  'rgb(3 105 161 / 0.06)',
    disabledBg:  '#E2E8F0',
    card: {
      background: 'transparent',
      padding: 0,
    } as React.CSSProperties,
  }
}
