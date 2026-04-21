import { useEffect } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Demo from './components/Demo'
import PainPoints from './components/PainPoints'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Pricing from './components/Pricing'
import Testimonios from './components/Testimonios'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  // Activate hero reveals on mount (hero is visible immediately)
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('#hero-root .reveal, #hero-root .reveal-left, #hero-root .reveal-scale')
        .forEach(el => el.classList.add('visible'))
    }, 80)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Navbar />
      <main id="hero-root">
        <Hero />
        <Demo />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonios />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
