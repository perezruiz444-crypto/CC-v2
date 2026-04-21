import { useEffect, useRef } from 'react'

/**
 * Scroll-reveal with per-element stagger.
 * Skill rules (ui-ux-pro-max §7):
 *  - stagger-sequence: 55ms per sibling group
 *  - hierarchy-motion: enter from below (translateY)
 *  - spring-physics: ease-out spring curve in CSS
 *  - transform/opacity only — no layout properties
 *  - interruptible: no JS blocking, pure CSS transitions
 *  - reduced-motion: CSS handles disabling via @media
 */
export function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const SELECTOR = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-word'
    const targets = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR))

    // Group siblings so stagger resets per visual row/group
    // Each element gets a delay based on its index within its parent group
    const parentMap = new Map<Element, number>()

    targets.forEach((el) => {
      const parent = el.parentElement ?? root
      const idx = parentMap.get(parent) ?? 0
      // Apply stagger delay directly — overrides static delay-N classes
      el.style.transitionDelay = `${idx * 55}ms`
      parentMap.set(parent, idx + 1)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -56px 0px' }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
