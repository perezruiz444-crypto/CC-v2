import { Calendar, Bell, FileCheck, Users, BarChart3, ShieldCheck } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const FEATURES = [
  {
    icon: <Calendar size={22} aria-hidden="true" />,
    title: 'Calendario automático',
    desc: 'Activa tu programa y el sistema proyecta todas las fechas del año automáticamente. Sin configuración manual.',
    accent: 'var(--em)',
  },
  {
    icon: <Bell size={22} aria-hidden="true" />,
    title: 'Alertas progresivas',
    desc: 'Recordatorios 30, 15, 7 y 1 día antes. Tu equipo llega preparado, no de sorpresa.',
    accent: 'var(--warn)',
  },
  {
    icon: <FileCheck size={22} aria-hidden="true" />,
    title: 'Evidencia documental',
    desc: 'Adjunta acuses y constancias a cada obligación. Todo listo para auditoría en segundos.',
    accent: 'var(--em)',
  },
  {
    icon: <Users size={22} aria-hidden="true" />,
    title: 'Colaboración de equipo',
    desc: 'Asigna cada obligación al responsable. El consultor, gerente y área de comex ven lo mismo.',
    accent: 'var(--info)',
  },
  {
    icon: <BarChart3 size={22} aria-hidden="true" />,
    title: 'Reportes para auditoría',
    desc: 'Genera en un clic el reporte de cumplimiento con semáforo por empresa, programa y período.',
    accent: 'var(--em)',
  },
  {
    icon: <ShieldCheck size={22} aria-hidden="true" />,
    title: 'Catálogo legal actualizado',
    desc: 'Monitoreamos el DOF y actualizamos el catálogo cada vez que el SAT o SE publican cambios.',
    accent: '#a855f7',
  },
]

export default function Features() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="features"
      style={{ background: 'var(--snow)' }}>
      <div className="container">

        <div style={{ textAlign: 'center', maxWidth: 600, marginInline: 'auto', marginBottom: 60 }}>
          <span className="badge reveal" style={{ marginBottom: 16 }}>Funciones</span>
          <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 42px)', marginBottom: 14 }}>
            Todo lo que necesitas para no volver a perder una obligación
          </h2>
          <p className="reveal delay-2" style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Diseñado para empresas con programas de Comercio Exterior en México. No es un gestor de tareas genérico — conoce la ley.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map(({ icon, title, desc, accent }, i) => (
            <div key={title}
              className={`card reveal-scale delay-${i + 1}`}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {/* accent line top */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${accent}, transparent)`,
                borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
              }} aria-hidden="true" />

              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-md)',
                background: `${accent}14`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18, color: accent,
                transition: 'background var(--dur-base), transform var(--dur-base) var(--ease-spring)',
              }}
                className="feature-icon"
              >
                {icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 10,
              }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .card:hover .feature-icon {
          transform: scale(1.1) rotate(-5deg);
        }
      `}</style>
    </section>
  )
}
