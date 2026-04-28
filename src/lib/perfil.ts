/**
 * Perfil de Cumplimiento de Empresa
 * ─────────────────────────────────
 * Tipos y helpers compartidos entre Onboarding y la página de Empresa.
 * El perfil se traduce a JSONB y se envía a los RPCs:
 *   - calcular_diff_perfil
 *   - actualizar_perfil_empresa
 */

export type Programa = 'IMMEX' | 'PROSEC' | 'CERTIVA' | 'SENER'

export type ModalidadImmex =
  | 'industrial'
  | 'servicios'
  | 'albergue'
  | 'controladora'
  | 'tercerizacion'

export type RolCtm = 'emisor' | 'receptor' | 'ambos'

export interface PerfilEmpresa {
  programas_activos: Programa[]
  modalidad_immex: ModalidadImmex | null
  opera_ctm: boolean
  rol_ctm: RolCtm | null
  opera_submaquila: boolean
  importa_sensibles: boolean
}

export const PERFIL_VACIO: PerfilEmpresa = {
  programas_activos: [],
  modalidad_immex: null,
  opera_ctm: false,
  rol_ctm: null,
  opera_submaquila: false,
  importa_sensibles: false,
}

// ─── Catálogos para UI ────────────────────────────────────────────────────────

export const PROGRAMAS: { value: Programa; label: string; desc: string }[] = [
  { value: 'IMMEX',   label: 'IMMEX',    desc: 'Industria Manufacturera, Maquiladora y de Servicios de Exportación' },
  { value: 'PROSEC',  label: 'PROSEC',   desc: 'Programa de Promoción Sectorial' },
  { value: 'CERTIVA', label: 'CERTIVA',  desc: 'Certificación IVA/IEPS (Esquema de Certificación de Empresas)' },
  { value: 'SENER',   label: 'SENER',    desc: 'Programa de energéticos / combustibles' },
]

export const MODALIDADES_IMMEX: { value: ModalidadImmex; label: string; desc: string }[] = [
  { value: 'industrial',    label: 'Industrial',     desc: 'Manufactura directa de productos de exportación' },
  { value: 'servicios',     label: 'Servicios',      desc: 'Prestación de servicios vinculados a exportaciones' },
  { value: 'albergue',      label: 'Albergue',       desc: 'Shelter — empresa extranjera bajo programa de empresa mexicana' },
  { value: 'controladora',  label: 'Controladora',   desc: 'Administra programas IMMEX de subsidiarias' },
  { value: 'tercerizacion', label: 'Tercerización',  desc: 'Outsourcing — manda manufactura a terceros registrados' },
]

export const ROLES_CTM: { value: 'no' | RolCtm; label: string; descripcion: string }[] = [
  { value: 'no',       label: 'No opera con CTMs',                                descripcion: 'No emite ni recibe Constancias de Transferencia de Mercancías' },
  { value: 'emisor',   label: 'Sí — somos proveedor de autopartes (Tier 1)',     descripcion: 'Emitimos CTMs a la armadora' },
  { value: 'receptor', label: 'Sí — somos armadora / Automotriz Terminal',       descripcion: 'Recibimos CTMs de proveedores' },
  { value: 'ambos',    label: 'Sí — ambos roles',                                descripcion: 'Emitimos y recibimos CTMs' },
]

// ─── Lógica condicional del wizard ────────────────────────────────────────────

export function muestraPasoModalidad(p: PerfilEmpresa): boolean {
  return p.programas_activos.includes('IMMEX')
}

export function muestraPasoCtm(p: PerfilEmpresa): boolean {
  return p.modalidad_immex === 'industrial'
}

export function muestraPasoSubmaquila(p: PerfilEmpresa): boolean {
  return p.programas_activos.includes('IMMEX')
}

export function muestraPasoSensibles(p: PerfilEmpresa): boolean {
  return (
    p.modalidad_immex === 'industrial' ||
    p.modalidad_immex === 'albergue' ||
    p.modalidad_immex === 'controladora'
  )
}

// ─── Validación por paso ──────────────────────────────────────────────────────

export function pasoValido(paso: number, p: PerfilEmpresa): boolean {
  switch (paso) {
    case 1: return p.programas_activos.length > 0
    case 2: return !muestraPasoModalidad(p) || p.modalidad_immex !== null
    case 3: return !muestraPasoCtm(p) || (!p.opera_ctm || p.rol_ctm !== null)
    case 4: return true // submaquila boolean siempre válido
    case 5: return true // sensibles boolean siempre válido
    default: return true
  }
}

// ─── Diff result (lo que devuelve el RPC) ────────────────────────────────────

export interface ObligacionDiff {
  id: string
  nombre: string
  fundamento_legal?: string | null
  nivel_riesgo?: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO' | null
  periodicidad?: string | null
}

export interface DiffResult {
  aAgregar: ObligacionDiff[]
  aDesactivar: ObligacionDiff[]
  sinCambios: ObligacionDiff[]
}

export interface ApplyResult {
  agregadas: number
  desactivadas: number
  sin_cambios: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Limpia campos del perfil que dejaron de aplicar tras cambios anteriores.
 * Ej: si el usuario quita IMMEX, modalidad_immex debe pasar a null.
 */
export function normalizarPerfil(p: PerfilEmpresa): PerfilEmpresa {
  const tieneImmex = p.programas_activos.includes('IMMEX')
  const modalidad = tieneImmex ? p.modalidad_immex : null
  const esIndustrial = modalidad === 'industrial'

  return {
    programas_activos: p.programas_activos,
    modalidad_immex:   modalidad,
    opera_ctm:         esIndustrial && p.opera_ctm,
    rol_ctm:           esIndustrial && p.opera_ctm ? p.rol_ctm : null,
    opera_submaquila:  tieneImmex && p.opera_submaquila,
    importa_sensibles:
      (modalidad === 'industrial' || modalidad === 'albergue' || modalidad === 'controladora')
        ? p.importa_sensibles
        : false,
  }
}

/**
 * Convierte un perfil de TS a JSONB plano para enviar al RPC.
 */
export function perfilToJsonb(p: PerfilEmpresa): Record<string, unknown> {
  const norm = normalizarPerfil(p)
  return {
    programas_activos: norm.programas_activos,
    modalidad_immex:   norm.modalidad_immex,
    opera_ctm:         norm.opera_ctm,
    rol_ctm:           norm.rol_ctm,
    opera_submaquila:  norm.opera_submaquila,
    importa_sensibles: norm.importa_sensibles,
  }
}
