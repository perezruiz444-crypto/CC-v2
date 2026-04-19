// ── Fuente única de verdad para planes, límites y features ────────────────────
// TODOS los paywalls deben consumir este archivo.
// NUNCA hardcodear strings de plan en componentes individuales.

export type Plan = 'gratis' | 'equipo' | 'agencia'

// ── Metadata de UI (label, precio, CTA, etc.) ─────────────────────────────────
export const PLAN_META: Record<Plan, {
  label: string
  precio: string
  periodo: string
  desc: string
  color: string
  featured: boolean
  badge?: string
  cta: string
  href: string
}> = {
  gratis: {
    label: 'Básico', precio: 'Gratis', periodo: '', featured: false,
    desc: 'Explora sin compromisos.',
    color: 'rgb(255 255 255 / 0.25)',
    cta: 'Crear cuenta gratis', href: '/register',
  },
  equipo: {
    label: 'Equipo', precio: '$990', periodo: 'MXN/mes', featured: true,
    desc: 'Para departamentos de Comex.',
    color: 'var(--em)', badge: 'Más popular',
    cta: 'Empezar prueba gratis', href: '/register?plan=equipo',
  },
  agencia: {
    label: 'Agencia', precio: '$2,490', periodo: 'MXN/mes', featured: false,
    desc: 'Múltiples razones sociales.',
    color: 'var(--info)', badge: 'Recomendado',
    cta: 'Empezar prueba gratis', href: '/register?plan=agencia',
  },
}

// ── Límites cuantitativos ──────────────────────────────────────────────────────
export const PLAN_LIMITS: Record<Plan, {
  maxEmpresas: number | null   // null = ilimitado
  maxUsuarios: number | null
}> = {
  gratis:  { maxEmpresas: 1,    maxUsuarios: 1  },
  equipo:  { maxEmpresas: 1,    maxUsuarios: 5  },
  agencia: { maxEmpresas: 5,    maxUsuarios: 20 },
}

// ── Features booleanas por plan ────────────────────────────────────────────────
export type FeatureKey =
  // Dashboard
  | 'dashboardProgresoAnual'
  | 'dashboardResumenCategoria'
  // Ajustes
  | 'diasInhabilesOrg'
  // Equipo
  | 'invitarEquipo'
  // Obligaciones
  | 'asignacionObligaciones'
  | 'evidenciaDocumental'
  | 'obligacionesPersonalizadas'
  // Reportes
  | 'reportesPdf'
  // Agencia+
  | 'dashboardGlobal'
  | 'aislamientoCliente'

export const PLAN_FEATURES: Record<Plan, Record<FeatureKey, boolean>> = {
  gratis: {
    dashboardProgresoAnual:     false,
    dashboardResumenCategoria:  false,
    diasInhabilesOrg:           false,
    invitarEquipo:              false,
    asignacionObligaciones:     false,
    evidenciaDocumental:        false,
    obligacionesPersonalizadas: false,
    reportesPdf:                false,
    dashboardGlobal:            false,
    aislamientoCliente:         false,
  },
  equipo: {
    dashboardProgresoAnual:     true,
    dashboardResumenCategoria:  true,
    diasInhabilesOrg:           true,
    invitarEquipo:              true,
    asignacionObligaciones:     true,
    evidenciaDocumental:        true,
    obligacionesPersonalizadas: true,
    reportesPdf:                true,
    dashboardGlobal:            false,
    aislamientoCliente:         false,
  },
  agencia: {
    dashboardProgresoAnual:     true,
    dashboardResumenCategoria:  true,
    diasInhabilesOrg:           true,
    invitarEquipo:              true,
    asignacionObligaciones:     true,
    evidenciaDocumental:        true,
    obligacionesPersonalizadas: true,
    reportesPdf:                true,
    dashboardGlobal:            true,
    aislamientoCliente:         true,
  },
}

// ── Features legibles para el landing (Pricing.tsx) ───────────────────────────
export const PLAN_FEATURES_LANDING: Record<Plan, { included: string[]; disabled: string[] }> = {
  gratis: {
    included: [
      '1 empresa (RFC)',
      '1 usuario',
      'Catálogo completo de obligaciones',
      'Calendario de vencimientos',
      'Recordatorios por correo',
    ],
    disabled: [
      'Sin invitar equipo',
      'Sin asignación de tareas',
      'Sin reportes PDF',
    ],
  },
  equipo: {
    included: [
      '1 empresa (RFC)',
      'Hasta 5 usuarios',
      'Todo lo del plan Básico',
      'Asignación de obligaciones',
      'Evidencia documental',
      'Reportes PDF',
      'Progreso anual y resumen por categoría',
      'Días inhábiles personalizados',
      'Obligaciones internas personalizadas',
      'Soporte por correo',
    ],
    disabled: [],
  },
  agencia: {
    included: [
      'Hasta 5 empresas (RFCs)',
      'Hasta 20 usuarios',
      'Todo lo del plan Equipo',
      'Dashboard global multi-empresa',
      'Aislamiento por cliente',
      'Soporte prioritario',
    ],
    disabled: [],
  },
}

// ── Helper principal: verifica si un plan tiene una feature ───────────────────
// Uso: tieneFeature(organizacion?.plan_actual, 'dashboardProgresoAnual')
export function tieneFeature(plan: string | undefined | null, feature: FeatureKey): boolean {
  const p = (plan ?? 'gratis') as Plan
  return PLAN_FEATURES[p]?.[feature] ?? false
}

// Orden de planes para comparaciones
export const PLAN_ORDER: Plan[] = ['gratis', 'equipo', 'agencia']

// Plan mínimo que tiene una feature
export function planMinimoParaFeature(feature: FeatureKey): Plan {
  return PLAN_ORDER.find(p => PLAN_FEATURES[p][feature]) ?? 'agencia'
}
