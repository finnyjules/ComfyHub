<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { getFeatured, getTrending } from '../../data/services/workflowService.js'
import { gsap, ScrollTrigger } from '../../lib/gsap.js'

// Data — prefer featured/staff picks, fall back to trending
const allFeatured = getFeatured(5)
const items = allFeatured.length >= 3 ? allFeatured : getTrending(5)

// Carousel state
const currentIndex = ref(0)
const isHovered = ref(false)
const sectionRef = ref(null)
const infoRef = ref(null)
const trackRef = ref(null)
const stageRef = ref(null)
let autoAdvanceTimer = null
let isAnimating = false
let resizeObserver = null
let resizeRafId = null
let lastStageW = 0

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const activeItem = computed(() => items[currentIndex.value] || items[0])

// Measure card dimensions from the actual DOM
function getCardMetrics() {
  if (!trackRef.value || !stageRef.value) return null
  const cards = trackRef.value.querySelectorAll('.featured-carousel__card')
  if (cards.length < 2) return null
  const cardW = cards[0].offsetWidth
  const stride = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
  const stageW = stageRef.value.offsetWidth
  return { cardW, stride, stageW }
}

// Calculate translateX to center a given extended-track index in the stage
function getCenteredX(extTrackIndex, metrics) {
  const { cardW, stride, stageW } = metrics
  // Card left edge position in the track (before any translate)
  const cardLeft = extTrackIndex * stride
  // We want the card's center to align with the stage's center
  const cardCenter = cardLeft + cardW / 2
  const stageCenter = stageW / 2
  return stageCenter - cardCenter
}

// Extended items: clone last at start, clone first at end (for infinite loop)
const extendedItems = computed(() => {
  if (items.length === 0) return []
  return [
    { ...items[items.length - 1], _clone: 'last' },
    ...items,
    { ...items[0], _clone: 'first' },
  ]
})

function slideTo(index, animate = true) {
  if (isAnimating) return
  const trackEl = trackRef.value
  if (!trackEl) return

  const metrics = getCardMetrics()
  if (!metrics) return

  // index in extended track = index + 1 (leading clone)
  const targetX = getCenteredX(index + 1, metrics)

  if (!animate || prefersReducedMotion) {
    gsap.set(trackEl, { x: targetX })
    currentIndex.value = index
    return
  }

  isAnimating = true

  gsap.to(trackEl, {
    x: targetX,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      currentIndex.value = index
      isAnimating = false
    },
  })

  animateInfo()
}

function goNext() {
  if (isAnimating) return
  const trackEl = trackRef.value
  if (!trackEl) return

  const metrics = getCardMetrics()
  if (!metrics) return

  const nextIndex = currentIndex.value + 1
  const extIndex = nextIndex + 1 // +1 for leading clone
  const targetX = getCenteredX(extIndex, metrics)

  isAnimating = true
  currentIndex.value = nextIndex % items.length

  gsap.to(trackEl, {
    x: targetX,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      // If we slid to the clone of first item, jump back to the real one
      if (nextIndex >= items.length) {
        gsap.set(trackEl, { x: getCenteredX(1, metrics) })
      }
      isAnimating = false
    },
  })

  animateInfo()
  startAutoAdvance()
}

function goPrev() {
  if (isAnimating) return
  const trackEl = trackRef.value
  if (!trackEl) return

  const metrics = getCardMetrics()
  if (!metrics) return

  const prevIndex = currentIndex.value - 1
  // If -1, slide to leading clone (ext index 0)
  const extIndex = prevIndex < 0 ? 0 : prevIndex + 1
  const targetX = getCenteredX(extIndex, metrics)

  isAnimating = true
  currentIndex.value = (prevIndex + items.length) % items.length

  gsap.to(trackEl, {
    x: targetX,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      // If we slid to the clone of last item, jump back to the real one
      if (prevIndex < 0) {
        gsap.set(trackEl, { x: getCenteredX(items.length, metrics) })
      }
      isAnimating = false
    },
  })

  animateInfo()
  startAutoAdvance()
}

function goTo(index) {
  if (isAnimating || index === currentIndex.value) return
  slideTo(index, true)
  startAutoAdvance()
}

function animateInfo() {
  const info = infoRef.value
  if (!info) return
  info.style.transition = 'none'
  info.style.opacity = '0'
  info.style.transform = 'translateY(8px)'
  info.offsetHeight // force reflow
  info.style.transition = 'opacity 0.35s ease 0.15s, transform 0.35s ease 0.15s'
  info.style.opacity = '1'
  info.style.transform = 'translateY(0)'
}

function startAutoAdvance() {
  stopAutoAdvance()
  autoAdvanceTimer = setInterval(() => {
    if (!isHovered.value) goNext()
  }, 6000)
}

function stopAutoAdvance() {
  if (autoAdvanceTimer) {
    clearInterval(autoAdvanceTimer)
    autoAdvanceTimer = null
  }
}

onMounted(() => {
  // Set initial position without animation
  nextTick(() => {
    slideTo(0, false)
  })

  startAutoAdvance()

  // Re-center active card on window resize only (not animation-triggered layout shifts)
  if (stageRef.value) {
    lastStageW = stageRef.value.offsetWidth
    resizeObserver = new ResizeObserver((entries) => {
      const newW = entries[0].contentRect.width
      // Only react to actual width changes (not height shifts from animations)
      if (Math.abs(newW - lastStageW) < 1) return
      lastStageW = newW
      if (isAnimating) return
      if (resizeRafId) cancelAnimationFrame(resizeRafId)
      resizeRafId = requestAnimationFrame(() => {
        slideTo(currentIndex.value, false)
      })
    })
    resizeObserver.observe(stageRef.value)
  }

  if (prefersReducedMotion || !sectionRef.value) return

  // Entrance animation — cards fade up
  requestAnimationFrame(() => {
    const cards = sectionRef.value?.querySelectorAll('.featured-carousel__card')
    if (cards) {
      cards.forEach((card, i) => {
        gsap.fromTo(card, {
          y: 30,
          opacity: 0,
          scale: 0.95,
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.06,
        })
      })
    }
  })

  // Ticker parallax — shifts slightly on scroll
  const ticker = sectionRef.value.querySelector('.featured-carousel__ticker')
  if (ticker) {
    gsap.to(ticker, {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
      x: -120,
      ease: 'none',
    })
  }
})

onUnmounted(() => {
  stopAutoAdvance()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (resizeRafId) {
    cancelAnimationFrame(resizeRafId)
  }
})
</script>

<template>
  <section
    ref="sectionRef"
    class="featured-carousel"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Ticker background layer (behind everything) -->
    <div class="featured-carousel__ticker" aria-hidden="true">
      <div class="featured-carousel__ticker-track">
        <div class="featured-carousel__ticker-content" v-for="dup in 2" :key="dup">
          <span class="featured-carousel__ticker-item" v-for="n in 5" :key="n">
            <svg class="featured-carousel__ticker-diamond" width="60" height="52" viewBox="0 0 130 112" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M65 2L128 56L65 110L2 56L65 2Z" stroke="#ECFF00" stroke-width="3" fill="none"/>
            </svg>
            <span class="featured-carousel__ticker-text">Featured</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Glow orbs -->
    <div class="featured-carousel__glow featured-carousel__glow--left"></div>
    <div class="featured-carousel__glow featured-carousel__glow--right"></div>

    <div class="featured-carousel__container">
      <!-- Cards + side arrows wrapper -->
      <div ref="stageRef" class="featured-carousel__stage">
        <!-- Sliding track with all cards + clones for infinite loop -->
        <div ref="trackRef" class="featured-carousel__track">
          <div
            v-for="(item, i) in extendedItems"
            :key="(item._clone || '') + item.id"
            class="featured-carousel__card"
            :class="{
              'featured-carousel__card--active':
                (!item._clone && items.indexOf(items.find(it => it.id === item.id)) === currentIndex)
                || (item._clone === 'first' && currentIndex === 0)
                || (item._clone === 'last' && currentIndex === items.length - 1)
            }"
          >
            <a :href="`/workflow/${item.slug}`" class="featured-carousel__card-link">
              <img
                :src="item.thumbnailUrl"
                :alt="item.title"
                class="featured-carousel__card-image"
                loading="lazy"
              />
            </a>
            <a
              v-if="
                (!item._clone && items.indexOf(items.find(it => it.id === item.id)) === currentIndex)
                || (item._clone === 'first' && currentIndex === 0)
                || (item._clone === 'last' && currentIndex === items.length - 1)
              "
              :href="`/workflow/${item.slug}`"
              class="featured-carousel__run-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Run on Comfy Cloud
            </a>
          </div>
        </div>

        <!-- Side navigation arrows -->
        <button
          @click="goPrev"
          class="featured-carousel__arrow featured-carousel__arrow--left"
          aria-label="Previous workflow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          @click="goNext"
          class="featured-carousel__arrow featured-carousel__arrow--right"
          aria-label="Next workflow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <!-- Info below carousel -->
      <div ref="infoRef" class="featured-carousel__info">
        <h2 class="featured-carousel__title">
          <a :href="`/workflow/${activeItem.slug}`">{{ activeItem.title }}</a>
        </h2>
        <p class="featured-carousel__subtitle">
          by <a :href="`/creators/${activeItem.creator.handle.replace('@', '')}`">{{ activeItem.creator.displayName }}</a>
        </p>
        <span v-if="activeItem.categoryLabel" class="featured-carousel__category-badge">
          {{ activeItem.categoryLabel }}
        </span>
      </div>

      <!-- Dot indicators -->
      <div class="featured-carousel__dots">
        <button
          v-for="(w, i) in items"
          :key="w.id"
          class="featured-carousel__dot"
          :class="{ 'featured-carousel__dot--active': i === currentIndex }"
          @click="goTo(i)"
          :aria-label="`Go to slide ${i + 1}`"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.featured-carousel {
  position: relative;
  overflow: hidden;
  padding: $space-8 0 $space-8;
  background: $color-bg-primary;

  // Ticker background layer — z-index 0, behind cards
  &__ticker {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
  }

  &__ticker-track {
    display: flex;
    width: max-content;
    animation: ticker-scroll 30s linear infinite;
  }

  &__ticker-content {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__ticker-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0 2.5rem;
  }

  &__ticker-text {
    font-family: $font-brand;
    font-size: clamp(5rem, 10vw, 9rem);
    font-weight: 900;
    font-style: italic;
    color: transparent;
    -webkit-text-stroke: 2px rgba(236, 255, 0, 0.4);
    line-height: 1;
    white-space: nowrap;
    text-transform: uppercase;
    user-select: none;
  }

  &__ticker-diamond {
    flex-shrink: 0;
    width: clamp(50px, 5vw, 70px);
    height: auto;
    opacity: 0.4;
  }

  &__container {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 0;
  }

  // Stage wraps track + side arrows, clips overflow
  &__stage {
    position: relative;
    overflow: hidden;
  }

  // Horizontal sliding track containing all cards + clones
  &__track {
    display: flex;
    align-items: stretch;
    gap: $space-3;
    will-change: transform;
  }

  &__card {
    border-radius: $radius-xl;
    overflow: hidden;
    min-width: 0;
    position: relative;
    box-shadow: 0 4px 64px rgba(0, 0, 0, 0.25);
    flex: 0 0 calc(60vh * 16 / 9);
    height: 60vh;
    opacity: 0.6;
    transition: opacity 0.4s ease;

    &--active {
      z-index: 2;
      opacity: 1;
    }
  }

  &__card-link {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__run-btn {
    position: absolute;
    z-index: 5;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
    transition: transform $transition-fast;
    box-shadow: 0 4px 24px rgba(240, 255, 65, 0.3);

    &:hover {
      transform: translate(-50%, -50%) scale(1.05);
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

  // Info
  &__info {
    text-align: center;
    margin-top: $space-6;
  }

  &__title {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-text-primary;
    margin: 0;

    a {
      color: inherit;
      transition: color $transition-fast;

      &:hover {
        color: $color-primary-light;
      }
    }
  }

  &__subtitle {
    font-size: $text-sm;
    color: $color-text-tertiary;
    margin-top: $space-1;

    a {
      color: $color-primary-light;
      transition: color $transition-fast;

      &:hover {
        color: $color-primary;
      }
    }
  }

  &__category-badge {
    display: inline-block;
    margin-top: $space-2;
    padding: $space-1 $space-3;
    font-size: $text-xs;
    color: $color-text-secondary;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-full;
  }

  // Side navigation arrows — vertically centered on the cards
  &__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba($color-bg-tertiary, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid $color-border;
    color: $color-text-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background $transition-fast, border-color $transition-fast, opacity $transition-fast, transform $transition-fast;
    @include focus-ring;
    opacity: 0;

    .featured-carousel:hover &,
    .featured-carousel:focus-within & {
      opacity: 1;
    }

    &:hover {
      background: $color-bg-secondary;
      border-color: $color-border-hover;
      transform: translateY(-50%) scale(1.1);
    }

    &--left {
      left: $space-4;
    }

    &--right {
      right: $space-4;
    }
  }

  // Dot indicators
  &__dots {
    display: flex;
    justify-content: center;
    gap: $space-2;
    margin-top: $space-4;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease, border-color 0.3s ease, width 0.3s ease;

    &--active {
      background: $color-primary;
      border-color: $color-primary;
      width: 24px;
      border-radius: 4px;
    }

    &:hover:not(&--active) {
      background: $color-text-tertiary;
      transform: scale(1.2);
    }
  }

  // Responsive
  @include respond-below('md') {
    padding: $space-6 0;

    &__arrow {
      width: 36px;
      height: 36px;
      opacity: 1; // Always visible on mobile (no hover)

      &--left {
        left: $space-2;
      }

      &--right {
        right: $space-2;
      }
    }

    &__title {
      font-size: $text-xl;
    }

    &__run-btn {
      font-size: $text-sm;
      padding: $space-2 $space-4;
    }
  }
}

@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
