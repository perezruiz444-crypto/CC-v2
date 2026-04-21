// ── Shared constants — evita duplicación entre componentes ───

export const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',  className: 'chip chip-warn',    color: 'var(--warn)',   bg: 'rgb(245 158 11 / 0.1)' },
  completado: { label: 'Completado', className: 'chip chip-success', color: 'var(--em)',     bg: 'rgb(16 185 129 / 0.1)' },
  vencido:    { label: 'Vencido',    className: 'chip chip-danger',  color: 'var(--danger)', bg: 'rgb(239 68 68 / 0.1)' },
  omitido:    { label: 'Omitido',    className: 'chip',              color: 'rgb(255 255 255 / 0.4)', bg: 'rgb(255 255 255 / 0.06)' },
  prorrogado: { label: 'Prorrogado', className: 'chip chip-info',    color: 'var(--info)',   bg: 'rgb(59 130 246 / 0.1)' },
} as const

export type EstadoCumplimiento = keyof typeof ESTADO_CONFIG

export const CAT_LABELS: Record<string, { label: string; color: string }> = {
  immex:    { label: 'IMMEX',    color: 'var(--em)' },
  prosec:   { label: 'PROSEC',  color: 'var(--info)' },
  iva_ieps: { label: 'IVA/IEPS', color: 'var(--warn)' },
  padron:   { label: 'Padrón',   color: '#a855f7' },
  general:  { label: 'General',  color: 'rgb(255 255 255 / 0.4)' },
}
