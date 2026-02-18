<script setup>
import { onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../lib/gsap.js'

let lenis = null
let rafCallback = null

function initLenis() {
  // Respect reduced-motion preference
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    smoothWheel: true,
  })

  // Sync Lenis scroll position with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  // Drive Lenis from GSAP's ticker for frame-perfect sync
  rafCallback = (time) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(rafCallback)

  // Disable GSAP's built-in lag smoothing so it doesn't fight Lenis
  gsap.ticker.lagSmoothing(0)
}

function destroyLenis() {
  if (lenis) {
    if (rafCallback) {
      gsap.ticker.remove(rafCallback)
      rafCallback = null
    }
    lenis.destroy()
    lenis = null
  }
}

onMounted(() => {
  initLenis()

  // Handle Astro ClientRouter page transitions
  document.addEventListener('astro:before-swap', destroyLenis)
  document.addEventListener('astro:after-swap', initLenis)
})

onUnmounted(() => {
  document.removeEventListener('astro:before-swap', destroyLenis)
  document.removeEventListener('astro:after-swap', initLenis)
  destroyLenis()
  ScrollTrigger.refresh()
})
</script>

<template>
  <!-- Renderless — only initializes Lenis smooth scroll -->
  <div style="display: contents" />
</template>
