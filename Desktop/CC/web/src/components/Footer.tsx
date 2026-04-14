const LINKS = {
  Producto:  ['Funciones', 'Precios', 'Demo', 'Changelog'],
  Normativa: ['Obligaciones ComEx', 'IMMEX', 'Blog SAT'],
  Empresa:   ['Sobre nosotros', 'Contacto', 'Privacidad', 'Términos'],
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'rgb(255 255 255 / 0.4)', paddingBlock: 56 }}>
      <div className="container">
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(3,1fr)',
          gap: 48, marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--snow)' }}>
                Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 200 }}>
              Cumplimiento regulatorio de Comercio Exterior en México.
            </p>
          </div>

          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--snow)', marginBottom: 14,
              }}>{section}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {items.map(item => (
                  <li key={item}>
                    <a href="#" style={{
                      fontSize: 13, color: 'rgb(255 255 255 / 0.4)',
                      textDecoration: 'none',
                      transition: 'color var(--dur-fast)',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--em)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgb(255 255 255 / 0.4)')}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--ink-4)', paddingTop: 24,
          display: 'flex', flexWrap: 'wrap', gap: 14,
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontSize: 12 }}>© 2026 Calendario Compliance. Todos los derechos reservados.</p>
          <p style={{ fontSize: 12 }}>Hecho en México 🇲🇽</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  )
}
