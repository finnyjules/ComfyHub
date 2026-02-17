<script setup>
import { ref, onMounted } from 'vue'
import { getCommunityStats } from '../../data/services/workflowService.js'
import { useGsap } from '../../composables/useGsap.js'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'

const { scaleBounce } = useScrollAnimation()

const sectionRef = ref(null)
const glowRef = ref(null)
const { gsap, ScrollTrigger, animate, prefersReducedMotion } = useGsap()

const stats = getCommunityStats()

const workflowCount = ref(0)
const runCount = ref(0)
const creatorCount = ref(0)
const favoriteCount = ref(0)

function formatNumber(value) {
  return Math.floor(value).toLocaleString('en-US')
}

const statItems = [
  { ref: workflowCount, target: stats.totalWorkflows, label: 'Workflows', icon: 'grid' },
  { ref: runCount, target: stats.totalRuns, label: 'Total Runs', icon: 'play' },
  { ref: creatorCount, target: stats.totalCreators, label: 'Creators', icon: 'users' },
  { ref: favoriteCount, target: stats.totalFavorites, label: 'Favorites', icon: 'heart' },
]

onMounted(() => {
  if (prefersReducedMotion) {
    workflowCount.value = stats.totalWorkflows
    runCount.value = stats.totalRuns
    creatorCount.value = stats.totalCreators
    favoriteCount.value = stats.totalFavorites
    return
  }

  animate(() => {
    statItems.forEach((item) => {
      const proxy = { value: 0 }

      gsap.to(proxy, {
        value: item.target,
        duration: 2,
        ease: 'power2.out',
        snap: { value: 1 },
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          once: true,
        },
        onUpdate() {
          item.ref.value = proxy.value
        },
      })
    })
  })

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
})
</script>

<template>
  <section ref="sectionRef" class="community-stats">
    <div ref="glowRef" class="community-stats__glow"></div>
    <div class="community-stats__container">
      <div class="community-stats__grid">
        <!-- Workflows -->
        <div class="community-stats__item">
          <svg
            class="community-stats__icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
          </svg>
          <span class="community-stats__number">{{ formatNumber(workflowCount) }}+</span>
          <span class="community-stats__label">Workflows</span>
        </div>

        <!-- Total Runs -->
        <div class="community-stats__item">
          <svg
            class="community-stats__icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36A1 1 0 0 0 8 5.14z"
              fill="currentColor"
            />
          </svg>
          <span class="community-stats__number">{{ formatNumber(runCount) }}+</span>
          <span class="community-stats__label">Total Runs</span>
        </div>

        <!-- Creators -->
        <div class="community-stats__item">
          <svg
            class="community-stats__icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="9" cy="7" r="4" fill="currentColor" />
            <path
              d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              fill="none"
            />
            <circle cx="18" cy="9" r="3" fill="currentColor" />
            <path
              d="M18 14a4 4 0 0 1 4 4v2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
          <span class="community-stats__number">{{ formatNumber(creatorCount) }}+</span>
          <span class="community-stats__label">Creators</span>
        </div>

        <!-- Favorites -->
        <div class="community-stats__item">
          <svg
            class="community-stats__icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
          <span class="community-stats__number">{{ formatNumber(favoriteCount) }}+</span>
          <span class="community-stats__label">Favorites</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.community-stats {
  position: relative;
  overflow: hidden;
  padding-block: $space-20;
  background: linear-gradient(180deg, $color-bg-secondary 0%, $color-bg-primary 100%);
  border-top: 1px solid $color-border;
  border-bottom: 1px solid $color-border;

  @include respond-below('md') {
    padding-block: $space-12;
  }

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

  &__container {
    position: relative;
    z-index: 1;
    @include container;
  }

  &__grid {
    display: flex;
    justify-content: space-evenly;
    align-items: flex-start;

    @include respond-below('md') {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $space-10;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-2;
    text-align: center;
  }

  &__icon {
    color: $color-primary;
    margin-bottom: $space-1;
    flex-shrink: 0;
  }

  &__number {
    font-size: $text-4xl;
    font-weight: $weight-bold;
    color: $color-text-primary;
    line-height: $leading-tight;
    font-variant-numeric: tabular-nums;

    @include respond-below('md') {
      font-size: $text-3xl;
    }
  }

  &__label {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
}
</style>
