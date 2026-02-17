# Cinematic Scroll Animations — Design Doc

**Date:** 2025-02-15
**Approach:** Bold & showcase-y ("Cinematic Scroll")
**Stack:** GSAP 3.14.2 + ScrollTrigger (already installed)

---

## Overview

Transform the homepage from "cards fade up" into a cinematic scroll experience. Every section becomes a scene with its own signature animation. Parallax depth, 3D card entrances, text reveals, and scrub-linked effects throughout.

---

## Section-by-Section Animation Spec

### 1. FeaturedCarousel (Hero)

**Current:** Slide transitions with scale/opacity on manual nav + auto-advance.

**New additions:**
- **Hero title entrance:** Title text fades in from below (y: 60px, opacity: 0) with a slight scale (0.95 → 1.0) on page load. 0.8s duration, `power3.out`. Subtitle staggers in 0.15s after.
- **Parallax depth on viewport:** The entire carousel viewport has a subtle vertical parallax — as you scroll past, it translates Y at 0.85x speed (slower than scroll), creating depth. Uses `scrub: true`.
- **Image inner parallax:** Each carousel image translates Y by ~30px within its overflow-hidden frame as the section scrolls. Creates a "window looking at a scene" effect.

**Technical:** Add ScrollTrigger scrub animation to `FeaturedCarousel.vue` alongside existing manual carousel logic. The parallax only triggers on scroll, doesn't interfere with slide transitions.

---

### 2. CtaBanner (CTA Section)

**Current:** Completely static. Blue gradient with text and button.

**New animations:**
- **Background gradient shift:** The gradient angle animates from 135deg → 180deg as you scroll through. Achieved by animating a CSS custom property `--gradient-angle` with `scrub: 0.5`.
- **Headline clip-path reveal:** Text reveals left-to-right via `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)`. Duration 0.8s, `power2.inOut`. Triggers at 80% viewport.
- **Subtext fade-up:** Classic y: 30 + opacity: 0 entrance, staggered 0.2s after headline.
- **Button scale-in + glow pulse:** Button scales from 0.9 → 1.0 with a subtle box-shadow glow that pulses once using a yoyo timeline.

**Technical:** Convert CtaBanner from static Astro rendering to `client:visible` Vue component so it can use `useGsap()`. Add refs to headline, subtext, button elements.

---

### 3. GallerySection (Main Grid)

**Current:** Cards stagger fade-up (y: 30, opacity: 0, stagger: 0.08).

**New animations:**
- **Section heading split reveal:** The "{ComfyUI Gallery}" title animates per-word. Each word fades from below (y: 40, opacity: 0) with 0.1s stagger between words. The `{` and `}` braces animate separately with a slight rotation.
- **Filter bar slide-in:** Category pills slide in from the left (x: -30, opacity: 0) with stagger 0.04s. Sort tabs slide from right.
- **Card 3D flip-in:** Replace simple fade-up with `rotateX(15deg)` + `y: 60` + `opacity: 0` + `scale(0.95)` entrance. `perspective(1000px)` on the grid container. This gives cards a "flipping up from a table" effect. Stagger: 0.06s.
- **Card thumbnail inner parallax:** Each card's thumbnail image shifts Y by ~15px within its overflow-hidden container as the card scrolls through the viewport. Uses `scrub: true` per-card.

**Technical:** Update `useScrollAnimation.js` with a new `flipInChildren()` helper. Add `perspective` to the grid's CSS. Individual card parallax uses a batch ScrollTrigger.

---

### 4. CuratedCollections (2x2 Grid)

**Current:** Cards stagger fade-up.

**New animations:**
- **Heading reveal:** Same per-word stagger as GallerySection heading.
- **Cards scale + rotate entrance:** Cards animate from `scale(0.85)` + `rotateY(8deg)` + `opacity: 0` with 0.15s stagger. Creates a "fanning out" effect. `perspective(800px)` on grid.
- **Thumbnail inner parallax:** Collection card thumbnail images have vertical parallax within their overflow-hidden 2x2 grid. Each thumbnail shifts at slightly different speeds (alternating +-10px) for a mosaic-depth effect.

**Technical:** Similar to GallerySection but with rotateY instead of rotateX for variety.

---

### 5. FeaturedCreators (Creator Cards)

**Current:** Cards stagger fade-up.

**New animations:**
- **Heading reveal:** Same per-word pattern.
- **Cards alternate slide-in:** Odd cards slide from left (x: -60, opacity: 0), even cards from right (x: 60, opacity: 0). All with subtle rotation (rotateZ +-3deg). Stagger: 0.1s. Creates a "shuffling in" effect.
- **Avatar bounce:** Creator avatar images scale from 0.5 → 1.0 with `elastic.out(1, 0.5)` easing, triggered 0.2s after card entrance.

**Technical:** The `staggerChildren` call is replaced with custom per-card animation in `FeaturedCreators.vue`.

---

### 6. CommunityStats (Counter Section)

**Current:** Number counters animate from 0 to target. No other animations.

**New additions:**
- **Background parallax:** The gradient background shifts vertically as you scroll (background-position scrubbed to scroll).
- **Icon scale-bounce:** Each stat icon scales from 0 → 1.2 → 1.0 with `back.out(2)` easing, staggered 0.15s. Triggers before counter animation.
- **Divider lines:** Add subtle vertical divider lines between stats that grow from height: 0 to full height, staggered.
- **Section-wide scrub glow:** A subtle radial glow (CSS gradient overlay) expands from center as you scroll through. Scrub-linked.

**Technical:** Icons get refs, dividers are new DOM elements. Glow is a pseudo-element animated via a CSS custom property.

---

### 7. AppNavbar (Global)

**Current:** Fixed position, static styling.

**New scroll behavior:**
- **Compact on scroll:** When user scrolls past 100px, navbar height shrinks from 56px → 48px. Logo scales from 1.0 → 0.85. Background opacity increases. Border becomes slightly more visible.
- **Animation:** `scrub: false`, uses `toggleActions: 'play none none reverse'` so it reverses when scrolling back to top. Duration: 0.3s.

**Technical:** AppNavbar already hydrates as a Vue island. Add a ScrollTrigger in `onMounted` that toggles a compact state.

---

### 8. AppFooter (Global)

**Current:** Static Astro component, no animations.

**New animations:**
- **Staggered column reveal:** Each footer column (brand, categories, company, creators) fades up (y: 40, opacity: 0) with 0.15s stagger between columns.
- **Social icons bounce-in:** Social link icons scale from 0 → 1 with `back.out(1.7)` easing, staggered 0.08s.
- **Bottom bar wipe:** The copyright bar reveals via a width animation on its top border (from 0% to 100%).

**Technical:** Footer is an Astro component — animations will be added via a small `<script>` tag using raw GSAP (no Vue composable needed since it's not a Vue island).

---

## New Composable: `useScrollAnimation.js` Additions

Add these reusable helpers alongside existing `revealOnScroll` and `staggerChildren`:

```js
// 3D flip-in for card grids
flipInChildren(parent, selector, options)
  // rotateX: 15, y: 60, opacity: 0, scale: 0.95
  // perspective on parent

// Per-word text reveal
revealWords(element, options)
  // Split text into <span> wrappers per word
  // Stagger word animation: y: 40, opacity: 0

// Parallax on scroll (scrub-based)
parallax(element, options)
  // y offset scrubbed to scroll position
  // Configurable speed (default 0.15 = 15% slower)

// Alternating left/right card entrance
alternateSlideIn(parent, selector, options)
  // Odd: x: -60, even: x: 60, rotateZ: +-3deg

// Scale bounce entrance
scaleBounce(element, options)
  // scale: 0, ease: back.out(2)
```

---

## Performance Considerations

- All transform animations use `will-change: transform` (GPU-composited)
- Parallax uses `scrub: true` which ties to requestAnimationFrame — no jank
- `ScrollTrigger.batch()` for card-level parallax to avoid hundreds of individual triggers
- `prefers-reduced-motion` check in every animation path — falls back to instant or skipped
- Parallax offsets are modest (15–30px) to avoid layout thrashing
- `perspective` only added to grid containers that need 3D transforms

---

## Files Modified

| File | Change |
|------|--------|
| `src/composables/useScrollAnimation.js` | Add `flipInChildren`, `revealWords`, `parallax`, `alternateSlideIn`, `scaleBounce` |
| `src/components/home/FeaturedCarousel.vue` | Add parallax scrub on viewport + title entrance animation |
| `src/components/home/CtaBanner.vue` | Convert to `client:visible`, add clip-path reveal, gradient shift, button glow |
| `src/pages/index.astro` | Change `<CtaBanner />` to `<CtaBanner client:visible />` |
| `src/components/home/GallerySection.vue` | Replace stagger with flipInChildren, add heading reveal, filter slide-in, card parallax |
| `src/components/home/CuratedCollections.vue` | Scale+rotateY entrance, heading reveal, thumbnail parallax |
| `src/components/home/FeaturedCreators.vue` | Alternate slide-in, heading reveal, avatar bounce |
| `src/components/home/CommunityStats.vue` | Icon bounce, divider grow, background parallax, glow effect |
| `src/components/global/AppNavbar.vue` | Scroll-triggered compact state |
| `src/components/global/AppFooter.astro` | Column stagger reveal, social bounce, border wipe |
