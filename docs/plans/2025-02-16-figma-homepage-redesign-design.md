# Figma Homepage Redesign — Design Doc

**Date:** 2025-02-16
**Source:** Figma `W4ocIQZ3BF3W7cW3mNBGSQ` node `22:919`

## Summary

Redesign the top portion of the homepage (navbar + hero + carousel) to match the Figma design, add a "Featured" horizontal ticker/marquee, and keep all existing sections below (Gallery, CuratedCollections, FeaturedCreators, CommunityStats).

## Changes

### 1. Navbar Update

Replace category links (Image Gen, Video, Upscaling…) with site-level nav links matching Figma:
- **ComfyHub** [NEW badge — yellow pill] | **Products** ▾ | **Enterprise** | **Gallery** | **About** | **Careers** | **Resources** ▾

All links use ABC ROM Bold, 16px. "Products" and "Resources" have a chevron-down icon.

Change the CTA button from `border-radius: 9999px` (pill) to `border-radius: 8px` (rounded rect) per Figma.

Keep: Comfy logo left, mobile hamburger, existing scroll-compact behavior.

### 2. Hero Headline (new)

Between navbar and carousel. Centered text:
- "Discover hundreds of workflows from the world's best creators."
- "Run them for **free** on Comfy Cloud" (free is semibold)
- Below: "• Updated daily" in green/lime accent

Font: Inter, 36px, normal weight. Max-width ~1075px centered.

### 3. Featured Carousel Updates

- Add a yellow "▶ Run on Comfy Cloud" button overlaid on the active slide (ABC ROM Heavy Italic, 24px, #ECFF00 bg, black text, rounded 8px)
- Add large radial gradient glow orbs on left and right sides of carousel (944px diameter, positioned at edges, subtle opacity)
- Below active slide: workflow title (larger), creator avatar + handle, category badge pill ("Image to Image")
- Remove the CtaBanner component from the page (replaced by hero headline + ticker)

### 4. ScrollTicker Component (new — "ScrollHorz")

Infinite horizontal marquee between carousel and gallery:
- Text: "Featured" in ~100-128px italic font (ABC ROM Black Italic or Inter Black Italic)
- Color: lime-yellow (#ECFF00) with stroke/outline style (transparent fill, 2px stroke via `-webkit-text-stroke`)
- Diamond SVG icon between each "Featured" word
- CSS `@keyframes` animation, scrolling left continuously
- Duplicate content for seamless loop
- Full viewport width, no overflow visible
- Height ~155px matching Figma

### 5. Page Structure

```
AppNavbar (updated)
HeroHeadline (new)
FeaturedCarousel (updated)
ScrollTicker (new)
GallerySection (existing)
CuratedCollections (existing)
FeaturedCreators (existing)
CommunityStats (existing)
AppFooter (existing)
```

Remove CtaBanner from index.astro (its purpose is absorbed by the hero headline).

### 6. Gallery Section — minor tweaks

Add tag pills to workflow cards if not already present (matching Figma: #wan, #anime, #video etc.).
Show heart count and fork/copy count on cards.

## Out of Scope

- Dropdown menus for Products/Resources (just links for now)
- Footer changes
- Mobile-specific carousel layout changes beyond responsive scaling
