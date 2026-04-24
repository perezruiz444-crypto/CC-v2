import { Calendar, Bell, FileCheck, Users, BarChart3, ShieldCheck } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const FEATURES = [
  {
    icon: <Calendar size={22} aria-hidden="true" />,
    title: 'Calendario automático',
    desc: 'Proyecta todas las fechas del año sin configuración manual.',
    accent: 'var(--em)',
  },
  {
    icon: <Bell size={22} aria-hidden="true" />,
    title: 'Alertas progresivas',
    desc: 'Recordatorios 30, 15, 7 y 1 día antes de cada vencimiento.',
    accent: 'var(--warn)',
  },
  {
    icon: <FileCheck size={22} aria-hidden="true" />,
    title: 'Evidencia documental',
    desc: 'Adjunta documentos a cada obligación, listos para auditoría.',
    accent: 'var(--em)',
  },
  {
    icon: <Users size={22} aria-hidden="true" />,
    title: 'Colaboración de equipo',
    desc: 'Asigna responsables. Todo el equipo ve lo mismo en tiempo real.',
    accent: 'var(--info)',
  },
  {
    icon: <BarChart3 size={22} aria-hidden="true" />,
    title: 'Reportes para auditoría',
    desc: 'Genera reportes de cumplimiento con semáforo por programa.',
    accent: 'var(--em)',
  },
  {
    icon: <ShieldCheck size={22} aria-hidden="true" />,
    title: 'Catálogo legal actualizado',
    desc: 'Monitoreamos el DOF para cambios regulatorios en tiempo real.',
    accent: '#a855f7',
  },
]

export default function Features() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="features"
      style={{ background: 'var(--ink-3)' }}>
      <div className="container">

        <div style={{ textAlign: 'center', maxWidth: 600, marginInline: 'auto', marginBottom: 60 }}>
          <span className="badge reveal" style={{ marginBottom: 16 }}>Funciones</span>
          <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 42px)', marginBottom: 14, color: '#0f172a' }}>
            Todo para gestionar tu Comercio Exterior
          </h2>
          <p className="reveal delay-2" style={{ fontSize: 15, color: '#666666', lineHeight: 1.7 }}>
            Construido para IMMEX, PROSEC y Padrón Importador.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map(({ icon, title, desc, accent }, i) => (
            <div key={title}
              className={`card reveal-scale delay-${(i % 3) + 1}`}
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
                color: '#0f172a', marginBottom: 10,
              }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.65 }}>{desc}</p>
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
