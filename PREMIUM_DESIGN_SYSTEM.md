# Premium Design System — Calendario Compliance

**Goal:** Elevate landing page to look expensive, elegant, and high-end (enterprise-grade SaaS aesthetic)

---

## 1. COLOR PALETTE REFINEMENT

### Current
- Primary: Emerald-500 (#10b981) — good but too bright/saturated for premium
- Background: Very dark (#0d1117) — correct tone but lacks nuance
- Accent: Single green — needs supporting colors

### Premium Upgrade

**Primary Accent:** Shift to teal/emerald with more control
```css
--em:           #0d9488;   /* emerald-700 (deeper, more sophisticated) */
--em-light:     #14b8a6;   /* teal-500 for hover/interactive */
--em-dark:      #047857;   /* emerald-800 for pressed */
--em-subtle:    rgb(13 148 136 / 0.08);
--em-glow:      rgb(13 148 136 / 0.15);
```

**Secondary Accents (neutral, premium):**
```css
--accent-slate:  #64748b;  /* slate-500 for secondary text/icons */
--accent-zinc:   #71717a;  /* zinc-500 for muted interactions */
```

**Dark Background Layering (depth + elegance):**
```css
--ink:          #0f172a;   /* slate-950 (slightly warmer than pure black) */
--ink-2:        #1e293b;   /* slate-900 for cards */
--ink-3:        #334155;   /* slate-800 for elevated surfaces */
--ink-4:        #475569;   /* slate-700 for borders/dividers */
--ink-light:    #1a1f35;   /* subtle navy tint for slight contrast */
```

**Surface & Text:**
```css
--snow:         #ffffff;
--text-primary: #f8fafc;   /* slate-50 for primary text on dark */
--text-secondary: #cbd5e1; /* slate-300 for secondary text */
--text-muted:   #94a3b8;   /* slate-400 for tertiary text */
--text-faint:   #64748b;   /* slate-500 for disabled/hints */
```

---

## 2. TYPOGRAPHY HIERARCHY (PREMIUM TIER)

### Font Pairing
- **Headings (H1–H3):** Syne (current) — KEEP, it's high-quality
- **Body & UI (14–16px):** Inter (current) — KEEP

### Size Scale (refined)
```css
/* Display / Hero */
h1: clamp(36px, 6vw, 64px);    /* was flexible, now more constrained for elegance */
h2: clamp(28px, 4.5vw, 48px);  /* cards/section headers */
h3: clamp(20px, 3vw, 32px);    /* subsection titles */

/* Body */
p-lg:   18px;  /* hero subheading, featured text */
p-body: 16px;  /* standard paragraph */
p-sm:   14px;  /* secondary content, captions */
p-xs:   12px;  /* labels, hints (only when necessary) */
```

### Line Height & Spacing
```css
/* Generous line height = breathing room = premium feel */
h1, h2, h3: line-height 1.2;   /* tight for headings */
p: line-height 1.6;             /* 1.5 is standard; 1.6 feels more luxurious */
p-sm: line-height 1.5;          /* smaller text needs less height */

/* Letter Spacing */
h1, h2: letter-spacing -0.02em; /* slight tightening for sophistication */
label:  letter-spacing 0.05em;  /* modest tracking for labels/badges */
```

### Font Weights
```css
h1, h2, h3: font-weight 700;   /* bold headings */
p: font-weight 400;             /* regular body */
label: font-weight 600;         /* medium for UI labels */
strong: font-weight 700;        /* bold emphasis */
```

---

## 3. SPACING & LAYOUT (BREATHING ROOM)

### Base Unit: 8px Grid
```css
/* Spacing scale */
sp-2:  8px;
sp-3:  12px;
sp-4:  16px;
sp-6:  24px;
sp-8:  32px;
sp-10: 40px;
sp-12: 48px;
sp-16: 64px;
sp-20: 80px;
sp-24: 96px;
```

### Component Padding (generous)
```css
/* Cards / Sections */
--card-p-mobile:  24px;   /* was 20px — increase breathing room */
--card-p-desktop: 40px;   /* was 32px — premium feels spacious */

/* Section Vertical Spacing */
section: padding-top 80px; padding-bottom 80px;   /* vs current 60px */
```

### Gap Between Elements
```css
/* Component grid gaps */
--gap-tight:   16px;  /* card grid items */
--gap-default: 24px;  /* section content */
--gap-loose:   40px;  /* major section breaks */
```

---

## 4. SHADOW & DEPTH SYSTEM (ELEVATION)

### Current Shadows
```css
--sh-sm: 0 1px 3px ...     /* too subtle for premium */
--sh-md: 0 4px 12px ...
--sh-lg: 0 12px 32px ...   /* good base */
```

### Premium Upgrade (multi-layer, expensive)
```css
/* Subtle elevation for "floating" feel */
--sh-xs:  0 1px 2px rgb(0 0 0 / 0.08), 0 1px 3px rgb(0 0 0 / 0.04);

/* Cards at rest */
--sh-card: 0 4px 16px rgb(0 0 0 / 0.12), 0 2px 8px rgb(0 0 0 / 0.06);

/* Elevated surfaces (modals, dropdowns) */
--sh-md:  0 8px 24px rgb(0 0 0 / 0.16), 0 4px 12px rgb(0 0 0 / 0.08);

/* Hero/Feature shadows (premium glow) */
--sh-lg:  0 16px 40px rgb(0 0 0 / 0.20), 0 8px 16px rgb(0 0 0 / 0.10);

/* Extra emphasis (CTAs, featured cards) */
--sh-xl:  0 20px 48px rgb(0 0 0 / 0.25), 0 10px 20px rgb(0 0 0 / 0.12);

/* Accent glow (brand color) */
--sh-accent: 0 4px 24px rgb(13 148 136 / 0.20), 0 2px 12px rgb(13 148 136 / 0.10);
```

### Backdrop & Scrim
```css
/* Modal overlay — strong enough to isolate */
--modal-scrim: rgb(0 0 0 / 0.50);  /* 50% black for premium focus */
```

---

## 5. BORDER & DIVIDER REFINEMENT

### Border Radius (slightly softer)
```css
--r-xs:  4px;   /* inputs, small components */
--r-sm:  8px;   /* buttons, chips */
--r-md:  12px;  /* cards, modals (slightly more than current 10px) */
--r-lg:  16px;  /* large containers (was 14px) */
--r-xl:  24px;  /* featured cards (was 20px) */
--r-2xl: 32px;  /* hero sections (was 28px) */
--r-full: 9999px; /* pills/circles */
```

### Dividers & Borders
```css
/* Light mode (on white) */
--border-light:     rgba(0 0 0 / 0.08);

/* Dark mode (on dark bg) */
--border-dark:      rgba(255 255 255 / 0.08);   /* subtle, not harsh */
--border-elevated:  rgba(255 255 255 / 0.12);   /* slightly more visible on dark cards */
--border-accent:    rgba(13 148 136 / 0.20);    /* teal tint for premium feel */
```

---

## 6. MICRO-INTERACTIONS (POLISH)

### Transition Timings (slightly faster = responsive)
```css
--dur-instant:  100ms;  /* button states */
--dur-fast:     140ms;  /* hover/focus */
--dur-base:     220ms;  /* default transitions */
--dur-entrance: 400ms;  /* entrance animations */
```

### Easing Functions
```css
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);       /* smooth exit */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);       /* smooth entrance */
--ease-quad:   cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* balanced */
```

### Button States (premium polish)
```css
/* Primary CTA */
button.primary {
  background: var(--em-light);
  transition: all var(--dur-fast) var(--ease-out);
}

button.primary:hover {
  background: var(--em);
  box-shadow: var(--sh-accent);   /* glow on hover */
  transform: translateY(-1px);    /* subtle lift */
}

button.primary:active {
  background: var(--em-dark);
  transform: translateY(0);        /* click down */
}

/* Ghost/Secondary Button */
button.ghost {
  border: 1px solid var(--border-elevated);
  color: var(--text-primary);
  transition: all var(--dur-fast);
}

button.ghost:hover {
  background: rgba(255 255 255 / 0.04);
  border-color: var(--em-light);
  color: var(--em-light);
}
```

### Card Interactions
```css
.card {
  transition: all var(--dur-base);
  box-shadow: var(--sh-card);
}

.card:hover {
  box-shadow: var(--sh-md);
  transform: translateY(-4px);    /* hover lift */
  border-color: var(--border-accent);  /* accent tint */
}
```

### Loading & Feedback
```css
/* Loading spinner — elegant, not bouncy */
@keyframes spin-smooth {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin-smooth 1s linear infinite;
}

/* Success feedback — subtle green pulse */
@keyframes pulse-success {
  0%, 100% { box-shadow: 0 0 0 0 rgba(20 184 166 / 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(20 184 166 / 0); }
}
```

---

## 7. VISUAL POLISH CHECKLIST

### Imagery & Icons
- ✅ Use SVG icons only (no emojis)
- ✅ Icon stroke-width: 1.5px (consistent across all)
- ✅ Icon colors: teal primary, slate-400 for secondary
- ✅ Browser mockup in Demo: use subtle gradient bg, not flat color

### Accent Lines & Borders
- ✅ Top-border accent on feature cards: 2px solid teal (not 3px, too thick)
- ✅ Left-border accent on testimonial cards: 2px
- ✅ Dividers between sections: 1px, very subtle opacity

### Glows & Glows
- ✅ Primary CTA glow on hover: teal radial gradient, 20-24px blur
- ✅ Featured card subtle glow: inset top highlight (rgba white / 0.05)

### Empty States & Placeholders
- ✅ Use skeleton screens (shimmer effect) not spinners for >300ms loads
- ✅ Empty state illustration: slate-700 placeholder, not gray

---

## 8. IMPLEMENTATION PRIORITIES

### Phase 1 (Immediate — High Impact)
1. Update color tokens in `index.css` (primary → teal-700, backgrounds → slate tones)
2. Increase section padding from 60px → 80px
3. Enhance shadows: add --sh-card, --sh-accent
4. Refine button hover states: add shadow + lift

### Phase 2 (Polish)
1. Increase line-height on all text (1.6 for paragraphs)
2. Refine spacing between grid items (24px → 32px on desktop)
3. Add subtle accent borders to cards (2px top/left teal)
4. Upgrade button transitions (add transform: translateY)

### Phase 3 (Final Polish)
1. Add sophisticated dividers between sections
2. Refine modal/overlay scrim (dark + subtle)
3. Implement success/error feedback animations
4. Test dark mode contrast on all text (all ≥4.5:1)

---

## 9. ANTI-PATTERNS TO AVOID

❌ Do NOT use bright green (#10b981) — too vibrant, not premium  
❌ Do NOT use pure black (#000) — use slate-950 (#0f172a)  
❌ Do NOT use gray text on gray background — maintain 4.5:1 contrast  
❌ Do NOT animate width/height — use transform/opacity only  
❌ Do NOT use drop shadows without blur — always use multi-layer shadows  
❌ Do NOT place text directly against images without scrim  
❌ Do NOT use emoji as icons — SVG only  

---

## Summary: From Good → Premium

| Element | Current | Premium |
|---------|---------|---------|
| **Primary Color** | Emerald-500 (#10b981) | Emerald-700 (#0d9488) — deeper, sophisticated |
| **BG Dark** | #0d1117 | Slate-950 (#0f172a) — warmer, luxe |
| **Section Padding** | 60px | 80px — breathing room |
| **Card Shadow** | sh-sm/md/lg only | Multi-layer sh-card, sh-accent |
| **Line Height** | 1.5 (standard) | 1.6 (generous) |
| **Button Hover** | Color change | Color + shadow + lift (transform: translateY) |
| **Border Radius** | 20px/28px | 24px/32px — softer, more refined |
| **Micro-interaction** | Basic transitions | Spring easing, elevation on hover |
| **Typography Weight** | Standard | 700 headings, 500 labels |

This creates the "expensive" look: **depth, breathing room, subtle motion, sophisticated color, multi-layer shadows, generous spacing.**
