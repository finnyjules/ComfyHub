# Cinematic Scroll Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the ComfyHub homepage into a bold, showcase-style scroll experience with parallax, 3D card entrances, text reveals, and scrub-linked effects.

**Architecture:** Extend the existing `useScrollAnimation.js` composable with new reusable helpers (flipInChildren, revealWords, parallax, alternateSlideIn, scaleBounce). Each homepage section gets its own signature animation. All animations respect `prefers-reduced-motion` and use GPU-composited transforms.

**Tech Stack:** GSAP 3.14.2, ScrollTrigger plugin (already registered), Vue 3 composables, SCSS

---

### Task 1: Extend useScrollAnimation.js with new animation helpers

**Files:**
- Modify: `src/composables/useScrollAnimation.js`

**Step 1: Add flipInChildren helper**

Add after the existing `staggerChildren` function:

```js
function flipInChildren(parent, childSelector, options = {}) {
  if (prefersReducedMotion || !parent) return

  animate(() => {
    const children = parent.querySelectorAll(childSelector)
    if (!children.length) return

    // Add perspective to parent for 3D effect
    gsap.set(parent, { perspective: options.perspective ?? 1000 })

    gsap.from(children, {
      scrollTrigger: {
        trigger: parent,
        start: options.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
      rotateX: options.rotateX ?? 15,
      y: options.y ?? 60,
      opacity: 0,
      scale: options.scale ?? 0.95,
      duration: options.duration ?? 0.7,
      stagger: options.stagger ?? 0.06,
      ease: options.ease ?? 'power3.out',
      transformOrigin: 'center bottom',
    })
  })
}
```

**Step 2: Add revealWords helper**

```js
function revealWords(element, options = {}) {
  if (prefersReducedMotion || !element) return

  animate(() => {
    // Wrap each word in a span
    const text = element.textContent
    const words = text.trim().split(/\s+/)
    element.innerHTML = words
      .map((word) => `<span class="gsap-word" style="display:inline-block">${word}&nbsp;</span>`)
      .join('')

    gsap.from(element.querySelectorAll('.gsap-word'), {
      scrollTrigger: {
        trigger: element,
        start: options.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
      y: options.y ?? 40,
      opacity: 0,
      duration: options.duration ?? 0.6,
      stagger: options.stagger ?? 0.08,
      ease: options.ease ?? 'power3.out',
    })
  })
}
```

**Step 3: Add parallax helper**

```js
function parallax(element, options = {}) {
  if (prefersReducedMotion || !element) return

  animate(() => {
    gsap.to(element, {
      scrollTrigger: {
        trigger: options.trigger ?? element,
        start: options.start ?? 'top bottom',
        end: options.end ?? 'bottom top',
        scrub: options.scrub ?? true,
      },
      y: options.y ?? 50,
      ease: 'none',
    })
  })
}
```

**Step 4: Add alternateSlideIn helper**

```js
function alternateSlideIn(parent, childSelector, options = {}) {
  if (prefersReducedMotion || !parent) return

  animate(() => {
    const children = parent.querySelectorAll(childSelector)
    children.forEach((child, i) => {
      const fromLeft = i % 2 === 0
      gsap.from(child, {
        scrollTrigger: {
          trigger: parent,
          start: options.start ?? 'top 85%',
          toggleActions: 'play none none none',
        },
        x: fromLeft ? -(options.distance ?? 60) : (options.distance ?? 60),
        rotateZ: fromLeft ? -(options.rotation ?? 3) : (options.rotation ?? 3),
        opacity: 0,
        duration: options.duration ?? 0.7,
        delay: i * (options.stagger ?? 0.1),
        ease: options.ease ?? 'power3.out',
      })
    })
  })
}
```

**Step 5: Add scaleBounce helper**

```js
function scaleBounce(element, options = {}) {
  if (prefersReducedMotion || !element) return

  animate(() => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: options.trigger ?? element,
        start: options.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
      scale: options.fromScale ?? 0,
      duration: options.duration ?? 0.6,
      delay: options.delay ?? 0,
      ease: options.ease ?? 'back.out(2)',
    })
  })
}
```

**Step 6: Update the return statement**

Change the return to export all new helpers:

```js
return { revealOnScroll, staggerChildren, flipInChildren, revealWords, parallax, alternateSlideIn, scaleBounce }
```

**Step 7: Build to verify no errors**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 8: Commit**

```bash
git add src/composables/useScrollAnimation.js
git commit -m "feat: add cinematic animation helpers to useScrollAnimation"
```

---

### Task 2: FeaturedCarousel — parallax depth + title entrance

**Files:**
- Modify: `src/components/home/FeaturedCarousel.vue`

**Step 1: Add ScrollTrigger import and refs**

In `<script setup>`, add after existing imports:

```js
import { ScrollTrigger } from '../../lib/gsap.js'
```

Add new refs after `isHovered`:

```js
const sectionRef = ref(null)
const infoRef = ref(null)
```

**Step 2: Add the template refs**

Update the template — add `ref="sectionRef"` to the `<section>` element, and `ref="infoRef"` to the `.featured-carousel__info` div.

**Step 3: Add parallax + title entrance in onMounted**

Add inside the existing `onMounted`, after `startAutoAdvance()`:

```js
if (!prefersReducedMotion && sectionRef.value) {
  // Parallax on the viewport — moves slower than scroll
  const viewport = sectionRef.value.querySelector('.featured-carousel__viewport')
  if (viewport) {
    gsap.to(viewport, {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 80,
      ease: 'none',
    })
  }

  // Title + subtitle entrance
  if (infoRef.value) {
    const title = infoRef.value.querySelector('.featured-carousel__title')
    const subtitle = infoRef.value.querySelector('.featured-carousel__subtitle')

    gsap.from(title, {
      y: 50,
      opacity: 0,
      scale: 0.96,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.3,
    })

    gsap.from(subtitle, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      delay: 0.5,
    })
  }
}
```

**Step 4: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 5: Commit**

```bash
git add src/components/home/FeaturedCarousel.vue
git commit -m "feat: add parallax depth and title entrance to FeaturedCarousel"
```

---

### Task 3: CtaBanner — clip-path reveal, gradient shift, button glow

**Files:**
- Modify: `src/components/home/CtaBanner.vue`
- Modify: `src/pages/index.astro`

**Step 1: Convert CtaBanner to hydrated Vue island**

In `src/pages/index.astro`, change:
```html
<CtaBanner />
```
to:
```html
<CtaBanner client:visible />
```

**Step 2: Add GSAP script setup to CtaBanner**

Replace the entire `<script setup>` (currently empty / non-existent) with:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useGsap } from '../../composables/useGsap.js'

const sectionRef = ref(null)
const headlineRef = ref(null)
const subtextRef = ref(null)
const buttonRef = ref(null)

const { gsap, animate, prefersReducedMotion } = useGsap()

onMounted(() => {
  if (prefersReducedMotion || !sectionRef.value) return

  animate(() => {
    // Gradient angle shift on scroll
    gsap.fromTo(
      sectionRef.value,
      { '--gradient-angle': '135deg' },
      {
        '--gradient-angle': '195deg',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
        ease: 'none',
      }
    )

    // Headline clip-path reveal
    if (headlineRef.value) {
      gsap.from(headlineRef.value, {
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.8,
        ease: 'power2.inOut',
      })

      // Ensure final state is clean
      gsap.set(headlineRef.value, { clipPath: 'inset(0 0% 0 0)', delay: 1.2 })
    }

    // Subtext fade up
    if (subtextRef.value) {
      gsap.from(subtextRef.value, {
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'power3.out',
      })
    }

    // Button scale-in + glow pulse
    if (buttonRef.value) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        delay: 0.5,
      })

      tl.from(buttonRef.value, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(2)',
      })
      tl.to(buttonRef.value, {
        boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
        duration: 0.4,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1,
      })
    }
  })
})
</script>
```

**Step 3: Add refs to template elements**

Update the template:
```html
<section ref="sectionRef" class="cta-banner">
  <div class="cta-banner__container">
    <h2 ref="headlineRef" class="cta-banner__headline">Share your creativity.</h2>
    <p ref="subtextRef" class="cta-banner__subtext">Publish your workflow to the ComfyUI community today.</p>
    <a ref="buttonRef" href="/search" class="cta-banner__button">Submit Workflow</a>
  </div>
</section>
```

**Step 4: Update SCSS for gradient custom property**

In the `<style>` section, change the background line:
```scss
background: linear-gradient(var(--gradient-angle, 135deg), $color-primary 0%, $color-primary-dark 100%);
```

**Step 5: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 6: Commit**

```bash
git add src/components/home/CtaBanner.vue src/pages/index.astro
git commit -m "feat: add cinematic animations to CtaBanner (clip-path, gradient shift, glow)"
```

---

### Task 4: GallerySection — 3D flip-in cards, heading reveal, filter slide-in

**Files:**
- Modify: `src/components/home/GallerySection.vue`

**Step 1: Update imports and add refs**

Replace `useScrollAnimation` import usage:
```js
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'
```

Add new refs:
```js
const headingRef = ref(null)
const filtersRef = ref(null)
const sortRef = ref(null)
```

**Step 2: Replace onMounted animation logic**

Replace the existing `staggerChildren` call in `onMounted` with:

```js
onMounted(() => {
  fetchData()
  const { flipInChildren, revealWords, staggerChildren } = useScrollAnimation()

  // Section heading per-word reveal
  if (headingRef.value) {
    revealWords(headingRef.value)
  }

  // Filter pills slide in from left
  if (filtersRef.value) {
    staggerChildren(filtersRef.value, '.gallery-section__pill', {
      y: 0,
      stagger: 0.04,
    })
    // We need to add x animation — use the animate from composable
  }

  // Cards 3D flip-in
  if (sectionRef.value) {
    flipInChildren(sectionRef.value, '.workflow-card')
  }
})
```

Wait — the `useScrollAnimation()` call needs to happen at setup time (not inside onMounted) because it calls `useGsap()` which registers lifecycle hooks. Let me restructure:

Move the composable call to setup scope:
```js
const { flipInChildren, revealWords, staggerChildren } = useScrollAnimation()
```

Then in `onMounted`:
```js
onMounted(() => {
  fetchData()

  // Section heading per-word reveal
  if (headingRef.value) {
    revealWords(headingRef.value)
  }

  // Filter pills slide in from left
  if (filtersRef.value) {
    staggerChildren(filtersRef.value, '.gallery-section__pill', { y: 0 })
  }

  // Cards 3D flip-in
  if (sectionRef.value) {
    flipInChildren(sectionRef.value, '.workflow-card')
  }
})
```

**Step 3: Add refs to template**

Add `ref="headingRef"` to the `<h2>` title element, `ref="filtersRef"` to the `.gallery-section__filters` div, and `ref="sortRef"` to the `.gallery-section__sort` div.

**Step 4: Add perspective CSS to grid**

In the `<style>` section, add to the `:deep(.workflow-grid)` rule:
```scss
:deep(.workflow-grid) {
  gap: $space-8;
  perspective: 1000px;
}
```

**Step 5: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 6: Commit**

```bash
git add src/components/home/GallerySection.vue
git commit -m "feat: add 3D flip-in cards and heading reveal to GallerySection"
```

---

### Task 5: CuratedCollections — scale+rotate entrance, heading reveal

**Files:**
- Modify: `src/components/home/CuratedCollections.vue`

**Step 1: Update composable usage**

Change the composable destructuring to include new helpers:
```js
const { flipInChildren, revealWords } = useScrollAnimation()
```

Add a heading ref:
```js
const headingRef = ref(null)
```

**Step 2: Replace onMounted logic**

```js
onMounted(() => {
  // Heading per-word reveal
  if (headingRef.value) {
    revealWords(headingRef.value)
  }

  // Cards 3D scale + rotateY entrance
  if (gridRef.value) {
    flipInChildren(gridRef.value, '.curated-collections__card', {
      rotateX: 0,
      rotateY: 8,
      y: 40,
      scale: 0.85,
      stagger: 0.12,
      perspective: 800,
    })
  }
})
```

Note: `flipInChildren` currently only handles `rotateX`. We need to make it accept arbitrary GSAP properties. Update the helper in Step 3 if needed — or we can just pass `rotateX: 0` and handle rotateY via an override. Actually, the GSAP `from` will apply any property we pass, so we need to update `flipInChildren` to spread extra options.

**Step 3: Quick update to flipInChildren to support rotateY**

In `src/composables/useScrollAnimation.js`, update `flipInChildren` to spread additional GSAP properties:

```js
function flipInChildren(parent, childSelector, options = {}) {
  if (prefersReducedMotion || !parent) return

  animate(() => {
    const children = parent.querySelectorAll(childSelector)
    if (!children.length) return

    gsap.set(parent, { perspective: options.perspective ?? 1000 })

    const { perspective, start, stagger, duration, ease, ...extraProps } = options

    gsap.from(children, {
      scrollTrigger: {
        trigger: parent,
        start: start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
      rotateX: 15,
      y: 60,
      opacity: 0,
      scale: 0.95,
      duration: duration ?? 0.7,
      stagger: stagger ?? 0.06,
      ease: ease ?? 'power3.out',
      transformOrigin: 'center bottom',
      ...extraProps,
    })
  })
}
```

This way callers can override `rotateX`, add `rotateY`, etc.

**Step 4: Add ref to template heading**

Add `ref="headingRef"` to the `<h2 class="curated-collections__title">` element.

**Step 5: Add perspective to grid CSS**

```scss
&__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-6;
  perspective: 800px;

  @include respond-below('md') {
    grid-template-columns: 1fr;
  }
}
```

**Step 6: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 7: Commit**

```bash
git add src/composables/useScrollAnimation.js src/components/home/CuratedCollections.vue
git commit -m "feat: add 3D rotateY entrance and heading reveal to CuratedCollections"
```

---

### Task 6: FeaturedCreators — alternate slide-in, heading reveal, avatar bounce

**Files:**
- Modify: `src/components/home/FeaturedCreators.vue`

**Step 1: Update imports and add refs**

```js
const { alternateSlideIn, revealWords, scaleBounce } = useScrollAnimation()
const headingRef = ref(null)
```

**Step 2: Replace onMounted logic**

```js
onMounted(() => {
  // Heading per-word reveal
  if (headingRef.value) {
    revealWords(headingRef.value)
  }

  // Cards alternate slide-in from left/right
  if (gridRef.value) {
    alternateSlideIn(gridRef.value, '.creator-card')

    // Avatar bounce after cards enter
    const avatars = gridRef.value.querySelectorAll('.creator-card__avatar img, .creator-card__avatar')
    avatars.forEach((avatar, i) => {
      scaleBounce(avatar, {
        trigger: gridRef.value,
        fromScale: 0.5,
        delay: 0.3 + i * 0.1,
        ease: 'elastic.out(1, 0.5)',
        duration: 0.8,
      })
    })
  }
})
```

**Step 3: Add ref to heading**

Add `ref="headingRef"` to the heading `<h2>` element (the text "Featured Creators").

**Step 4: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 5: Commit**

```bash
git add src/components/home/FeaturedCreators.vue
git commit -m "feat: add alternate slide-in and avatar bounce to FeaturedCreators"
```

---

### Task 7: CommunityStats — icon bounce, background parallax, glow

**Files:**
- Modify: `src/components/home/CommunityStats.vue`

**Step 1: Add new refs and import useScrollAnimation**

Add to script setup:
```js
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'

const { scaleBounce, parallax } = useScrollAnimation()
const glowRef = ref(null)
```

**Step 2: Add icon bounce animations in onMounted**

Add inside `onMounted`, after the existing counter animations:

```js
// Icon scale-bounce entrance
const icons = sectionRef.value?.querySelectorAll('.community-stats__icon')
if (icons) {
  icons.forEach((icon, i) => {
    scaleBounce(icon, {
      trigger: sectionRef.value,
      start: 'top 80%',
      fromScale: 0,
      delay: i * 0.15,
      ease: 'back.out(3)',
      duration: 0.5,
    })
  })
}

// Glow expansion
if (glowRef.value) {
  animate(() => {
    gsap.fromTo(
      glowRef.value,
      { opacity: 0, scale: 0.3 },
      {
        opacity: 0.15,
        scale: 1,
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true,
        },
        ease: 'none',
      }
    )
  })
}
```

**Step 3: Add glow element to template**

Inside the `.community-stats` section, add a glow overlay element:

```html
<section ref="sectionRef" class="community-stats">
  <div ref="glowRef" class="community-stats__glow"></div>
  <div class="community-stats__container">
    ...
  </div>
</section>
```

**Step 4: Add glow CSS**

```scss
&__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, $color-primary 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  z-index: 0;
}

// Make section position relative for glow
position: relative;
overflow: hidden;
```

Also ensure the `__container` has `position: relative; z-index: 1;` so content is above glow.

**Step 5: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 6: Commit**

```bash
git add src/components/home/CommunityStats.vue
git commit -m "feat: add icon bounce and glow effect to CommunityStats"
```

---

### Task 8: AppNavbar — scroll-triggered compact state

**Files:**
- Modify: `src/components/global/AppNavbar.vue`

**Step 1: Add GSAP imports and scroll logic**

Add to `<script setup>`:

```js
import { onMounted } from 'vue'
import { gsap, ScrollTrigger } from '../../lib/gsap.js'

const navRef = ref(null)

onMounted(() => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion || !navRef.value) return

  const logo = navRef.value.querySelector('.navbar__logo-svg')

  ScrollTrigger.create({
    start: 'top -100',
    onEnter: () => {
      gsap.to(navRef.value, {
        height: 48,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(navRef.value, {
        background: 'rgba(16, 21, 26, 0.95)',
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        duration: 0.3,
      })
      if (logo) {
        gsap.to(logo, { scale: 0.85, duration: 0.3, ease: 'power2.out' })
      }
    },
    onLeaveBack: () => {
      gsap.to(navRef.value, {
        height: 56,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(navRef.value, {
        background: 'rgba(16, 21, 26, 0.82)',
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
        duration: 0.3,
      })
      if (logo) {
        gsap.to(logo, { scale: 1, duration: 0.3, ease: 'power2.out' })
      }
    },
  })
})
```

**Step 2: Add ref to nav element**

Add `ref="navRef"` to the `<nav class="navbar">` element.

**Step 3: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 4: Commit**

```bash
git add src/components/global/AppNavbar.vue
git commit -m "feat: add scroll-triggered compact state to navbar"
```

---

### Task 9: AppFooter — staggered column reveal, social bounce, border wipe

**Files:**
- Modify: `src/components/global/AppFooter.astro`

**Step 1: Add a client-side script tag**

At the bottom of `AppFooter.astro`, add a `<script>` tag (Astro will bundle this):

```html
<script>
import { gsap, ScrollTrigger } from '../lib/gsap.js'

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion) {
  const footer = document.querySelector('.footer')
  if (footer) {
    // Stagger footer columns
    const columns = footer.querySelectorAll('.footer__brand, .footer__col')
    gsap.from(columns, {
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power3.out',
    })

    // Social icons bounce-in
    const socialLinks = footer.querySelectorAll('.footer__social-link')
    gsap.from(socialLinks, {
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      scale: 0,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.4,
      ease: 'back.out(1.7)',
    })

    // Bottom bar border wipe
    const bottomBar = footer.querySelector('.footer__bottom')
    if (bottomBar) {
      gsap.from(bottomBar, {
        scrollTrigger: {
          trigger: bottomBar,
          start: 'top 95%',
          toggleActions: 'play none none none',
        },
        '--border-width': '0%',
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: 'power2.inOut',
      })
    }
  }
}
</script>
```

**Step 2: Update the bottom bar CSS for border wipe**

In the `&__bottom` style rule, change the `border-top` to use a gradient that can be animated:

```scss
&__bottom {
  margin-top: $space-12;
  padding-top: $space-6;
  border-top: 1px solid $color-border;
  text-align: center;

  p {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
}
```

(The border wipe will be done via opacity fade since animating border widths directionally requires pseudo-elements — keep it simple with the opacity approach.)

**Step 3: Build to verify**

Run: `npm run build`
Expected: 380 pages built, 0 errors

**Step 4: Commit**

```bash
git add src/components/global/AppFooter.astro
git commit -m "feat: add staggered reveal and social bounce to footer"
```

---

### Task 10: Final integration test — visual verification

**Step 1: Start dev server and reload**

Run: `npm run dev`

**Step 2: Full-page scroll verification**

Open `http://localhost:4321` in browser. Scroll through entire page and verify:

1. **FeaturedCarousel:** Title fades in on load, viewport has parallax shift on scroll
2. **CtaBanner:** Headline reveals with clip-path, gradient shifts, button glows
3. **GallerySection:** Heading reveals per-word, cards flip in with 3D effect
4. **CuratedCollections:** Heading reveals, cards rotate in with depth
5. **FeaturedCreators:** Cards alternate from left/right, avatars bounce
6. **CommunityStats:** Icons bounce in, glow expands, counters still animate
7. **Navbar:** Compacts on scroll past 100px, expands when scrolled back to top
8. **Footer:** Columns stagger in, social icons bounce, bottom bar fades in

**Step 3: Check for scroll jank**

Open browser DevTools → Performance tab → Record while scrolling. Verify no frames drop below 30fps. Parallax scrub effects should be smooth.

**Step 4: Test prefers-reduced-motion**

In DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce". Reload. Verify all animations are skipped — no jank, no broken layouts.

**Step 5: Final commit**

If any adjustments were needed during testing, commit them:

```bash
git add -A
git commit -m "feat: complete cinematic scroll animations for homepage"
```

---

## Summary

| Task | Section | Key Animation |
|------|---------|---------------|
| 1 | useScrollAnimation.js | 5 new helpers |
| 2 | FeaturedCarousel | Parallax + title entrance |
| 3 | CtaBanner | Clip-path reveal + gradient shift + glow |
| 4 | GallerySection | 3D flip-in cards + heading reveal |
| 5 | CuratedCollections | RotateY entrance + heading reveal |
| 6 | FeaturedCreators | Alternate slide-in + avatar bounce |
| 7 | CommunityStats | Icon bounce + glow effect |
| 8 | AppNavbar | Scroll-compact |
| 9 | AppFooter | Column stagger + social bounce |
| 10 | Integration test | Full visual verification |
