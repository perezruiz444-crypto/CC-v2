import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  schema?: object | object[]
  noindex?: boolean
}

export default function SEO({ title, description, canonical, ogImage, schema, noindex }: SEOProps) {
  const fullTitle = title.includes('Calendario Compliance') ? title : `${title} — Calendario Compliance`
  const image = ogImage ?? 'https://calendariocompliance.mx/og-image.png'
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
