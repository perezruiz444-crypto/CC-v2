import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatFechaCorta, diasRestantes, getDotStatus, rangoMes, primerDiaSemana, diasEnMes } from './calendario'

// ─── formatFechaCorta ────────────────────────────────────────────────────────

describe('formatFechaCorta', () => {
  it('formatea fecha en español mexicano (día + mes abreviado)', () => {
    const resultado = formatFechaCorta('2025-01-15')
    expect(resultado).toMatch(/^15\s+ene\.?$/i)
  })

  it('formatea correctamente el 1 de diciembre', () => {
    const resultado = formatFechaCorta('2025-12-01')
    expect(resultado).toMatch(/^1\s+dic\.?$/i)
  })

  it('incluye el día numérico correcto', () => {
    const resultado = formatFechaCorta('2025-07-20')
    expect(resultado).toMatch(/^20/)
  })
})

// ─── diasRestantes ───────────────────────────────────────────────────────────

describe('diasRestantes', () => {
  beforeEach(() => {
    // Fijar "hoy" en 2025-05-02
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-05-02T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('devuelve 0 cuando el vencimiento es hoy', () => {
    expect(diasRestantes('2025-05-02')).toBe(0)
  })

  it('devuelve número positivo para fechas futuras', () => {
    expect(diasRestantes('2025-05-10')).toBe(8)
  })

  it('devuelve número negativo para fechas pasadas', () => {
    expect(diasRestantes('2025-04-25')).toBe(-7)
  })

  it('devuelve 1 para mañana', () => {
    expect(diasRestantes('2025-05-03')).toBe(1)
  })

  it('devuelve -1 para ayer', () => {
    expect(diasRestantes('2025-05-01')).toBe(-1)
  })
})

// ─── getDotStatus ────────────────────────────────────────────────────────────

describe('getDotStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-05-02T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('devuelve null si no hay items', () => {
    expect(getDotStatus([])).toBeNull()
  })

  it('devuelve "completado" si todos están completados', () => {
    const items = [
      { estado_cumplimiento: 'completado' as const, fecha_limite: '2025-05-02' },
      { estado_cumplimiento: 'completado' as const, fecha_limite: '2025-05-02' },
    ]
    expect(getDotStatus(items)).toBe('completado')
  })

  it('devuelve "vencido" si alguno está vencido (fecha pasada y no completado)', () => {
    const items = [
      { estado_cumplimiento: 'pendiente' as const, fecha_limite: '2025-04-25' },
    ]
    expect(getDotStatus(items)).toBe('vencido')
  })

  it('devuelve "proximo" si vence en los próximos 7 días', () => {
    const items = [
      { estado_cumplimiento: 'pendiente' as const, fecha_limite: '2025-05-07' },
    ]
    expect(getDotStatus(items)).toBe('proximo')
  })

  it('devuelve "proximo" si vence hoy', () => {
    const items = [
      { estado_cumplimiento: 'pendiente' as const, fecha_limite: '2025-05-02' },
    ]
    expect(getDotStatus(items)).toBe('proximo')
  })

  it('devuelve null si vence en más de 7 días y no está completado', () => {
    const items = [
      { estado_cumplimiento: 'pendiente' as const, fecha_limite: '2025-05-20' },
    ]
    expect(getDotStatus(items)).toBeNull()
  })

  it('"vencido" tiene prioridad sobre "completado" parcial', () => {
    const items = [
      { estado_cumplimiento: 'completado' as const, fecha_limite: '2025-05-02' },
      { estado_cumplimiento: 'pendiente' as const, fecha_limite: '2025-04-01' },
    ]
    expect(getDotStatus(items)).toBe('vencido')
  })
})

// ─── rangoMes ────────────────────────────────────────────────────────────────

describe('rangoMes', () => {
  it('genera rango correcto para enero', () => {
    const { inicio, fin } = rangoMes(new Date(2025, 0, 1))
    expect(inicio).toBe('2025-01-01')
    expect(fin).toBe('2025-01-31')
  })

  it('genera rango correcto para febrero en año bisiesto', () => {
    const { inicio, fin } = rangoMes(new Date(2024, 1, 1))
    expect(inicio).toBe('2024-02-01')
    expect(fin).toBe('2024-02-29')
  })

  it('genera rango correcto para febrero en año no bisiesto', () => {
    const { inicio, fin } = rangoMes(new Date(2025, 1, 1))
    expect(inicio).toBe('2025-02-01')
    expect(fin).toBe('2025-02-28')
  })

  it('genera rango correcto para diciembre', () => {
    const { inicio, fin } = rangoMes(new Date(2025, 11, 1))
    expect(inicio).toBe('2025-12-01')
    expect(fin).toBe('2025-12-31')
  })
})

// ─── primerDiaSemana ─────────────────────────────────────────────────────────

describe('primerDiaSemana', () => {
  it('mayo 2025 empieza en jueves (3)', () => {
    expect(primerDiaSemana(new Date(2025, 4, 1))).toBe(3)
  })

  it('enero 2025 empieza en miércoles (2)', () => {
    expect(primerDiaSemana(new Date(2025, 0, 1))).toBe(2)
  })

  it('lunes devuelve 0', () => {
    // Septiembre 2025 empieza lunes
    expect(primerDiaSemana(new Date(2025, 8, 1))).toBe(0)
  })

  it('domingo devuelve 6', () => {
    // Junio 2025 empieza domingo
    expect(primerDiaSemana(new Date(2025, 5, 1))).toBe(6)
  })
})

// ─── diasEnMes ───────────────────────────────────────────────────────────────

describe('diasEnMes', () => {
  it('enero tiene 31 días', () => {
    expect(diasEnMes(new Date(2025, 0, 1))).toBe(31)
  })

  it('febrero 2024 tiene 29 días (bisiesto)', () => {
    expect(diasEnMes(new Date(2024, 1, 1))).toBe(29)
  })

  it('febrero 2025 tiene 28 días', () => {
    expect(diasEnMes(new Date(2025, 1, 1))).toBe(28)
  })

  it('abril tiene 30 días', () => {
    expect(diasEnMes(new Date(2025, 3, 1))).toBe(30)
  })
})
