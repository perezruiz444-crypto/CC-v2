import { useEffect, useState } from 'react'
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import SEO from '../components/SEO'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

const FAQ_ITEMS = [
  {
    q: '¿Quién debe presentar el RAOCE?',
    a: 'Todas las empresas que cuenten con un programa IMMEX activo al 31 de diciembre del año anterior, sin importar su modalidad (Manufacturera, Servicios, Controladora, Albergue o Terciarización).',
  },
  {
    q: '¿Cuál es el plazo para el RAOCE 2026?',
    a: 'El plazo fatal es el 31 de mayo de 2026. No existe prórroga automática. La Secretaría de Economía puede cancelar el programa si no se presenta a tiempo.',
  },
  {
    q: '¿Dónde se presenta el RAOCE?',
    a: 'En el VUCEM (Ventanilla Única de Comercio Exterior Mexicano) en ventanillaunica.gob.mx. Se requiere e.firma del representante legal.',
  },
  {
    q: '¿Qué pasa si no presento el RAOCE?',
    a: 'Las consecuencias incluyen multas entre 70 y 100 veces el valor de la UMA diaria, suspensión temporal del programa y, en caso de reincidencia, cancelación definitiva.',
  },
  {
    q: '¿El RAOCE es lo mismo que el reporte mensual IMMEX?',
    a: 'No. El reporte mensual se presenta el día 17 de cada mes. El RAOCE es un reporte anual consolidado que se presenta una sola vez al año, antes del 31 de mayo.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function Raoce2026() {
  const deadline = new Date('2026-05-31T23:59:59')
  const { days, hours, minutes, seconds } = useCountdown(deadline)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const isUrgent = days < 30

  return (
    <>
      <SEO
        title="RAOCE 2026: Fecha límite 31 de mayo — Cómo no pagar multas"
        description="El RAOCE 2026 vence el 31 de mayo. Qué es, quién debe presentarlo, consecuencias de omisión y cómo nunca más olvidarlo."
        canonical="https://calendariocompliance.mx/raoce-2026"
        schema={faqSchema}
      />
      <Navbar />

      {/* Hero countdown */}
      <section style={{
        background: isUrgent
          ? 'linear-gradient(160deg, #FFF7ED 0%, #FEF3C7 100%)'
          : 'linear-gradient(160deg, #F0F7FF 0%, #EFF6FF 100%)',
        paddingTop: 120, paddingBottom: 80,
        borderBottom: `1px solid ${isUrgent ? '#FDE68A' : 'var(--ink-4)'}`,
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="badge" style={{
              background: isUrgent ? 'rgba(217,119,6,0.1)' : 'rgba(3,105,161,0.08)',
              borderColor: isUrgent ? 'rgba(217,119,6,0.25)' : 'rgba(3,105,161,0.2)',
              color: isUrgent ? '#B45309' : '#0369A1',
            }}>
              {isUrgent ? '⚠ URGENTE' : 'OBLIGACIÓN ANUAL IMMEX'}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 800,
            color: '#0F172A', marginBottom: 20, lineHeight: 1.1,
          }}>
            RAOCE 2026<br />
            <span style={{ color: isUrgent ? '#D97706' : '#0369A1' }}>Vence el 31 de mayo</span>
          </h1>

          <p style={{ fontSize: 18, color: '#64748B', lineHeight: 1.7, marginBottom: 48 }}>
            Si tienes un programa IMMEX, debes presentar el Reporte de Análisis de Operaciones de Comercio Exterior antes de esta fecha. Sin excepción.
          </p>

          {/* Countdown */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 48, flexWrap: 'wrap' }}>
            {[
              { value: days, label: 'Días' },
              { value: hours, label: 'Horas' },
              { value: minutes, label: 'Minutos' },
              { value: seconds, label: 'Segundos' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                background: '#FFFFFF',
                border: `2px solid ${isUrgent ? '#FDE68A' : 'var(--ink-4)'}`,
                borderRadius: 'var(--r-xl)',
                padding: '20px 28px', minWidth: 90, textAlign: 'center',
                boxShadow: 'var(--sh-sm)',
              }}>
                <div style={{
                  fontSize: 42, fontWeight: 800, lineHeight: 1,
                  color: isUrgent ? '#D97706' : '#0369A1',
                  fontFamily: 'var(--font-display)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {String(value).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 30px', minHeight: 50 }}>
              Nunca más pierdas el RAOCE
              <ArrowRight size={17} />
            </a>
            <a href="/blog/raoce-2026-que-es-como-cumplir" className="btn btn-outline" style={{ fontSize: 15, padding: '14px 26px', minHeight: 50 }}>
              Guía completa RAOCE 2026
            </a>
          </div>
        </div>
      </section>

      {/* 3 pasos */}
      <section style={{ paddingBlock: 80, background: 'var(--ink)' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <h2 style={{
            fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700,
            color: '#0F172A', textAlign: 'center', marginBottom: 48,
          }}>
            ¿Qué es el RAOCE y cómo cumplirlo?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              {
                icon: <AlertTriangle size={24} color="#D97706" />,
                step: '01',
                title: 'Es obligatorio para IMMEX',
                desc: 'Todas las empresas con programa IMMEX activo deben presentarlo ante la Secretaría de Economía vía VUCEM antes del 31 de mayo.',
              },
              {
                icon: <Clock size={24} color="#0369A1" />,
                step: '02',
                title: 'Reúne la documentación',
                desc: 'Necesitas: estados financieros del ejercicio, pedimentos de importación, facturas de exportación y datos de personal directo en manufactura.',
              },
              {
                icon: <CheckCircle size={24} color="#16A34A" />,
                step: '03',
                title: 'Presenta y guarda el acuse',
                desc: 'Ingresa al VUCEM con tu e.firma, completa el formulario RAOCE y guarda el acuse de recibo como evidencia de cumplimiento.',
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} style={{
                background: '#FFFFFF', border: '1px solid var(--ink-4)',
                borderRadius: 'var(--r-xl)', padding: 28, boxShadow: 'var(--sh-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {icon}
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1', letterSpacing: '0.1em' }}>PASO {step}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingBlock: 64, background: '#FFFFFF', borderTop: '1px solid var(--ink-4)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#0F172A', textAlign: 'center', marginBottom: 40 }}>
            Preguntas frecuentes sobre el RAOCE
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <div key={i} style={{ border: '1px solid var(--ink-4)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 2 }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 20px', background: openFaq === i ? '#F8FAFC' : '#FFFFFF',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 15, fontWeight: 600, color: '#0F172A', gap: 12,
                  }}
                >
                  {q}
                  <span style={{ fontSize: 20, color: '#94A3B8', flexShrink: 0, lineHeight: 1 }}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        paddingBlock: 64,
        background: 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
            Nunca más pierdas el RAOCE ni ninguna otra obligación
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32, lineHeight: 1.7 }}>
            Calendario Compliance centraliza IMMEX, PROSEC y SAT con alertas automáticas. Configúralo en 10 minutos.
          </p>
          <a href="/register" className="btn" style={{
            background: '#FFFFFF', color: '#0369A1',
            fontSize: 15, padding: '14px 30px', minHeight: 50,
            fontWeight: 700, borderRadius: 'var(--r-full)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Empieza gratis — sin tarjeta
            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
