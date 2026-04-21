import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const FAQS = [
  { q: '¿El catálogo está actualizado con la normativa 2026?', a: 'Sí. Nuestro equipo legal monitorea el DOF, el SAT y la SE de forma continua. Cada cambio normativo se refleja en el catálogo antes de la fecha de entrada en vigor.' },
  { q: '¿Puedo gestionar varias empresas (RFCs) desde una sola cuenta?', a: 'Sí, a partir del plan Agencia puedes administrar múltiples razones sociales desde un dashboard global. Cada empresa tiene su propio calendario y semáforo de cumplimiento.' },
  { q: '¿Qué pasa si una obligación se prorroga o se cancela un mes?', a: 'Puedes marcar cualquier instancia como prorrogada o exceptuada sin afectar el resto de las recurrencias. El historial queda registrado para auditoría.' },
  { q: '¿El sistema sirve para consultores aduanales con múltiples clientes?', a: 'Es uno de los casos de uso principales. Con el plan Agencia gestionas todos tus clientes, asignas usuarios y generas reportes individuales por empresa.' },
  { q: '¿Qué tan segura está mi información?', a: 'Usamos PostgreSQL con Row Level Security — ningún usuario puede ver datos de otra organización a nivel de base de datos. Servidores con certificación SOC 2.' },
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, sin penalidades ni contratos de permanencia. Al cancelar conservas acceso hasta el final del período pagado y puedes exportar todos tus datos.' },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`reveal delay-${Math.min(index + 1, 6)}`}
      style={{
        border: `1px solid ${open ? 'var(--em-light)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        background: 'var(--snow)',
        overflow: 'hidden',
        transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
        boxShadow: open ? 'var(--sh-accent)' : 'var(--sh-sm)',
      }}
    >
      <button
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          padding: '18px 22px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.45 }}>{q}</span>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: open ? 'var(--em)' : 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? 'white' : '#475569',
          transition: 'background var(--dur-base) var(--ease-spring), transform var(--dur-base) var(--ease-spring)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          {open ? <Minus size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
        </div>
      </button>

      <div style={{
        maxHeight: open ? 240 : 0,
        overflow: 'hidden',
        transition: 'max-height var(--dur-slow) var(--ease-out)',
      }}>
        <p style={{
          padding: '0 22px 18px',
          fontSize: 14, color: '#3f3f3f', lineHeight: 1.7,
          borderTop: '1px solid var(--surface-2)',
          paddingTop: 14,
        }}>{a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="faq"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--surface-2)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 520, marginInline: 'auto', marginBottom: 52 }}>
          <span className="badge reveal" style={{ marginBottom: 16 }}>FAQ</span>
          <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 14, color: '#0f172a' }}>Preguntas frecuentes</h2>
          <p className="reveal delay-2" style={{ fontSize: 15, color: '#666666' }}>
            ¿Algo más? Escríbenos a{' '}
            <a href="mailto:hola@calendariocompliance.mx" style={{ color: 'var(--em-light)', textDecoration: 'none', fontWeight: 600 }}>
              hola@calendariocompliance.mx
            </a>
          </p>
        </div>

        <div style={{ maxWidth: 700, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((item, i) => <FAQItem key={item.q} {...item} index={i} />)}
        </div>
      </div>
    </section>
  )
}
