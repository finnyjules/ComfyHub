# Figma Homepage Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the homepage hero area to match the Figma design — updated navbar links, hero headline, carousel overlay button, "Featured" ticker marquee, and simplified page layout.

**Architecture:** Modify existing AppNavbar and FeaturedCarousel components in-place, create two new lightweight components (HeroHeadline.astro, ScrollTicker.astro), update index.astro page layout. Keep all existing sections below the gallery.

**Tech Stack:** Astro 5.x, Vue 3, SCSS/BEM, GSAP ScrollTrigger, ABC ROM font

---

### Task 1: Update AppNavbar links and CTA style

**Files:**
- Modify: `src/components/global/AppNavbar.vue`

**What to do:**

Replace the `categories` array with site-level navigation links matching Figma:

```js
const navLinks = [
  { id: 'comfyhub', label: 'ComfyHub', href: '/', isNew: true },
  { id: 'products', label: 'Products', href: '#', hasDropdown: true },
  { id: 'enterprise', label: 'Enterprise', href: '#' },
  { id: 'gallery', label: 'Gallery', href: '#' },
  { id: 'about', label: 'About', href: '#' },
  { id: 'careers', label: 'Careers', href: '#' },
  { id: 'resources', label: 'Resources', href: '#', hasDropdown: true },
]
```

Update the template `navbar__categories` section to render these links instead of category links. For items with `isNew: true`, add a yellow badge pill. For items with `hasDropdown: true`, add a chevron-down SVG icon.

Change the CTA button border-radius from `$radius-full` (pill) to `8px` (rounded rect). Use `font-family: $font-brand` and `font-style: italic` on the CTA to match Figma's ABC ROM Heavy Italic.

**Build & verify:**
Run: `npm run build`
Expected: 0 errors

**Commit:** `feat: update navbar links to match Figma site navigation`

---

### Task 2: Create HeroHeadline component

**Files:**
- Create: `src/components/home/HeroHeadline.astro`

**What to do:**

Create a simple Astro component with the hero headline text. Structure:

```astro
---
// No props needed — static content
---

<section class="hero-headline">
  <div class="hero-headline__container">
    <h1 class="hero-headline__title">
      Discover hundreds of workflows from the world's best creators.<br />
      Run them for <strong>free</strong> on Comfy Cloud
    </h1>
    <p class="hero-headline__updated">• Updated daily</p>
  </div>
</section>

<style lang="scss">
.hero-headline {
  padding: $space-12 0 $space-8;
  background: $color-bg-primary;
  text-align: center;

  &__container {
    @include container;
    max-width: 1075px;
  }

  &__title {
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: $weight-normal;
    color: $color-text-primary;
    line-height: $leading-tight;
    margin: 0;

    strong {
      font-weight: $weight-semibold;
    }
  }

  &__updated {
    margin-top: $space-4;
    font-size: $text-sm;
    color: $color-brand-yellow;
  }
}
</style>
```

**Build & verify:**
Run: `npm run build`
Expected: 0 errors (component not referenced yet, but should compile)

**Commit:** `feat: add HeroHeadline component`

---

### Task 3: Create ScrollTicker marquee component

**Files:**
- Create: `src/components/home/ScrollTicker.astro`

**What to do:**

Create a CSS-only infinite horizontal marquee. The Figma shows "Featured" text at ~100-128px in italic with a diamond SVG icon between repetitions. The text and icon use lime-yellow (#ECFF00) outline style (transparent fill, stroke).

```astro
---
// No props needed
---

<section class="scroll-ticker" aria-hidden="true">
  <div class="scroll-ticker__track">
    <!-- Duplicate content for seamless loop -->
    {[0, 1].map(() => (
      <div class="scroll-ticker__content">
        {[0, 1, 2, 3, 4].map(() => (
          <span class="scroll-ticker__item">
            <svg class="scroll-ticker__diamond" width="60" height="52" viewBox="0 0 130 112" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M65 2L128 56L65 110L2 56L65 2Z" stroke="#ECFF00" stroke-width="3" fill="none"/>
            </svg>
            <span class="scroll-ticker__text">Featured</span>
          </span>
        ))}
      </div>
    ))}
  </div>
</section>

<style lang="scss">
.scroll-ticker {
  overflow: hidden;
  background: $color-bg-primary;
  padding: $space-4 0;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &__track {
    display: flex;
    width: max-content;
    animation: ticker-scroll 30s linear infinite;
  }

  &__content {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-6;
    padding: 0 $space-10;
  }

  &__text {
    font-family: $font-brand;
    font-size: clamp(4rem, 8vw, 7rem);
    font-weight: 900;
    font-style: italic;
    color: transparent;
    -webkit-text-stroke: 2px #ECFF00;
    text-stroke: 2px #ECFF00;
    line-height: 1;
    white-space: nowrap;
    text-transform: uppercase;
    user-select: none;
  }

  &__diamond {
    flex-shrink: 0;
    width: clamp(40px, 4vw, 60px);
    height: auto;
  }
}

@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
```

The animation moves -50% because the content is duplicated, creating an infinite seamless loop.

**Build & verify:**
Run: `npm run build`
Expected: 0 errors

**Commit:** `feat: add ScrollTicker marquee component`

---

### Task 4: Update FeaturedCarousel with overlay button and glow orbs

**Files:**
- Modify: `src/components/home/FeaturedCarousel.vue`

**What to do:**

1. Add a "▶ Run on Comfy Cloud" yellow button overlaid on the active carousel slide. Position it centered-right on the active slide. Style: `background: #ECFF00`, `color: black`, `border-radius: 8px`, `font-family: $font-brand`, `font-style: italic`, `font-size: 1.25rem`, `padding: 10px 16px`.

2. Add two large radial gradient glow orbs as pseudo-elements or divs on the carousel section — one on the left, one on the right. They're 944px circles with a soft radial gradient fading from a subtle blue/purple to transparent. Position them bleeding off-screen on each side, vertically centered on the carousel.

3. Update the info section below the active slide to show a category badge pill next to the "Updated daily" text. The badge matches the Figma: small rounded pill with the workflow's `categoryLabel`.

In the template, add inside `featured-carousel__viewport` after the track:

```html
<a :href="`/workflow/${activeItem.slug}`" class="featured-carousel__run-btn">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  Run on Comfy Cloud
</a>
```

Add glow orbs as two divs inside the section:
```html
<div class="featured-carousel__glow featured-carousel__glow--left"></div>
<div class="featured-carousel__glow featured-carousel__glow--right"></div>
```

SCSS for new elements:

```scss
&__run-btn {
  position: absolute;
  z-index: 5;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-3 $space-5;
  background: $color-brand-yellow;
  color: #000;
  font-family: $font-brand;
  font-style: italic;
  font-weight: 900;
  font-size: $text-lg;
  border-radius: 8px;
  white-space: nowrap;
  transition: transform $transition-fast, box-shadow $transition-fast;
  box-shadow: 0 4px 24px rgba(240, 255, 65, 0.3);

  &:hover {
    transform: translate(-50%, 50%) scale(1.05);
    box-shadow: 0 6px 32px rgba(240, 255, 65, 0.45);
  }
}

&__glow {
  position: absolute;
  width: 944px;
  height: 944px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.15;

  &--left {
    left: -466px;
    top: 50%;
    transform: translateY(-50%);
    background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
  }

  &--right {
    right: -466px;
    top: 50%;
    transform: translateY(-50%);
    background: radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%);
  }
}
```

Also add a category badge below the title in the info section:
```html
<span v-if="activeItem.categoryLabel" class="featured-carousel__category-badge">
  {{ activeItem.categoryLabel }}
</span>
```

**Build & verify:**
Run: `npm run build`
Expected: 0 errors

**Commit:** `feat: add carousel overlay button, glow orbs, and category badge`

---

### Task 5: Update index.astro page layout

**Files:**
- Modify: `src/pages/index.astro`

**What to do:**

1. Import the two new components:
```astro
import HeroHeadline from '../components/home/HeroHeadline.astro';
import ScrollTicker from '../components/home/ScrollTicker.astro';
```

2. Remove the CtaBanner import and usage.

3. Update the page layout to:
```astro
<BaseLayout>
  <HeroHeadline />
  <FeaturedCarousel client:load />
  <ScrollTicker />
  <GallerySection client:load />
  <CuratedCollections client:visible />
  <FeaturedCreators client:visible />
  <CommunityStats client:visible />
</BaseLayout>
```

**Build & verify:**
Run: `npm run build`
Expected: 0 errors, pages still generate correctly

**Commit:** `feat: update homepage layout — add hero headline and ticker, remove CTA banner`

---

### Task 6: Visual verification and polish

**Files:**
- Possibly tweak: any of the above components

**What to do:**

1. Start dev server: `npm run dev`
2. Open the homepage in browser
3. Verify:
   - Navbar shows new site-level links with yellow NEW badge on ComfyHub
   - CTA button is rounded rect (not pill)
   - Hero headline text is centered and properly sized
   - Carousel shows the yellow "Run on Comfy Cloud" button overlaid
   - Glow orbs are visible but subtle on carousel sides
   - ScrollTicker marquee scrolls smoothly and loops seamlessly
   - Gallery, CuratedCollections, FeaturedCreators, CommunityStats all still render below
4. Fix any visual issues found

**Commit:** `fix: visual polish for homepage redesign`
