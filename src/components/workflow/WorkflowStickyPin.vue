<script setup>
import { onMounted, onUnmounted } from 'vue'
import { ScrollTrigger } from '../../lib/gsap.js'

let pin = null

onMounted(() => {
  const right = document.querySelector('.wf-detail__right')
  const grid = document.querySelector('.wf-detail__grid')
  if (!right || !grid) return
  if (window.innerWidth < 1024) return

  // Small delay to ensure ScrollSmoother has initialized
  requestAnimationFrame(() => {
    pin = ScrollTrigger.create({
      trigger: right,
      pin: true,
      start: 'top 80px',
      endTrigger: grid,
      end: 'bottom bottom',
      pinSpacing: false,
    })
  })
})

onUnmounted(() => {
  pin?.kill()
  ScrollTrigger.refresh()
})
</script>

<template>
  <div style="display: contents" />
</template>
