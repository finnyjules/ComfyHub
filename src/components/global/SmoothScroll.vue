<script setup>
import { onMounted, onUnmounted } from 'vue'
import { ScrollSmoother, ScrollTrigger } from '../../lib/gsap.js'

let smoother = null

onMounted(() => {
  // Respect reduced-motion preference
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return

  // Create ScrollSmoother — wrapper & content IDs must exist in DOM
  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 0.6,         // lighter smoothing — less lag, less jitter with pins
    effects: true,       // enable data-speed / data-lag attributes
    smoothTouch: false,  // disable on touch — avoids jank on mobile
    normalizeScroll: true, // intercepts native scroll for consistent behavior with pins
  })
})

onUnmounted(() => {
  if (smoother) {
    smoother.kill()
    smoother = null
  }
  ScrollTrigger.refresh()
})
</script>

<template>
  <!-- Renderless — only initializes ScrollSmoother -->
  <div style="display: contents" />
</template>
