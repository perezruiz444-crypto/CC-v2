import type { Vencimiento } from '../hooks/useVencimientos'

export function formatFechaCorta(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export function diasRestantes(fecha: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(fecha + 'T00:00:00').getTime() - hoy.getTime()) / 86400000)
}

export function getDotStatus(
  items: Pick<Vencimiento, 'estado_cumplimiento' | 'fecha_limite'>[]
): 'vencido' | 'proximo' | 'completado' | null {
  if (items.length === 0) return null

  let hasVencido = false
  let hasProximo = false
  let allCompletado = true

  items.forEach(v => {
    const dias = diasRestantes(v.fecha_limite)
    if (v.estado_cumplimiento === 'completado') {
      // allCompletado stays true
    } else {
      allCompletado = false
      if (dias < 0) hasVencido = true
      if (dias >= 0 && dias <= 7) hasProximo = true
    }
  })

  if (allCompletado && items.length > 0) return 'completado'
  if (hasVencido) return 'vencido'
  if (hasProximo) return 'proximo'
  return null
}

export function rangoMes(mes: Date): { inicio: string; fin: string } {
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1).toISOString().split('T')[0]
  const fin    = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).toISOString().split('T')[0]
  return { inicio, fin }
}

export function primerDiaSemana(mes: Date): number {
  // Lunes=0, Domingo=6
  return (new Date(mes.getFullYear(), mes.getMonth(), 1).getDay() + 6) % 7
}

export function diasEnMes(mes: Date): number {
  return new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
}
