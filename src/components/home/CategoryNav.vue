<script setup>
import { computed, ref, onMounted } from 'vue'
import { categories } from '../../data/mock/generators/categories.js'
import { workflows } from '../../data/mock/index.js'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'

const gridRef = ref(null)
const { staggerChildren } = useScrollAnimation()

onMounted(() => {
  if (gridRef.value) {
    staggerChildren(gridRef.value, '.category-nav__tile')
  }
})

const workflowCounts = computed(() => {
  const counts = {}
  workflows.forEach((w) => {
    counts[w.category] = (counts[w.category] || 0) + 1
  })
  return counts
})

const iconPaths = {
  image: {
    paths: ['M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10'],
    extras: '<polyline points="3 15 8 10 13 15"/><polyline points="14 13 17 10 21 14"/><circle cx="17" cy="7" r="2"/>',
  },
  video: {
    paths: ['M23 7l-7 5 7 5V7z', 'M14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z'],
    extras: '',
  },
  music: {
    paths: ['M9 18V5l12-2v13'],
    extras: '<circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  },
  cube: {
    paths: ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'],
    extras: '<polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  },
  maximize: {
    paths: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'],
    extras: '',
  },
  edit: {
    paths: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'],
    extras: '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  },
  cpu: {
    paths: ['M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z'],
    extras: '<rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  },
  layers: {
    paths: ['M12 2L2 7l10 5 10-5-10-5z'],
    extras: '<polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  },
  tool: {
    paths: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'],
    extras: '',
  },
}

function getIconMarkup(iconName) {
  const icon = iconPaths[iconName]
  if (!icon) return ''

  const pathsMarkup = icon.paths
    .map((d) => `<path d="${d}"/>`)
    .join('')

  return pathsMarkup + icon.extras
}
</script>

<template>
  <section class="category-nav">
    <div class="category-nav__container">
      <div class="category-nav__header">
        <h2 class="category-nav__title">Browse by Category</h2>
        <a href="/workflows" class="category-nav__view-all">
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div ref="gridRef" class="category-nav__grid">
        <a
          v-for="cat in categories"
          :key="cat.id"
          :href="`/workflows/${cat.id}`"
          class="category-nav__tile"
        >
          <div class="category-nav__icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="getIconMarkup(cat.icon)"
            />
          </div>
          <span class="category-nav__label">{{ cat.label }}</span>
          <span class="category-nav__count">{{ workflowCounts[cat.id] || 0 }} workflows</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.category-nav {
  @include section-spacing;

  &__container {
    @include container;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-8;
  }

  &__title {
    @include heading($text-2xl);
  }

  &__view-all {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-primary-light;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary;
    }
  }

  // Grid layout
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $space-4;

    @include respond-below('lg') {
      grid-template-columns: repeat(3, 1fr);
    }

    @include respond-below('md') {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: $space-3;
      padding-bottom: $space-3;
      -webkit-overflow-scrolling: touch;
      @include custom-scrollbar;

      // Fallback to 2-col grid on small screens when JS scroll isn't ideal
      @supports not (scroll-snap-type: x mandatory) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        overflow-x: visible;
      }
    }
  }

  // Individual tile
  &__tile {
    @include card-base;
    @include focus-ring;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    padding: $space-6 $space-4;
    text-align: center;
    cursor: pointer;
    transition: transform $transition-base,
                box-shadow $transition-base,
                border-color $transition-base;

    &:hover {
      border-color: $color-border-hover;
      background: $color-bg-secondary;
    }

    @include respond-below('md') {
      min-width: 160px;
      flex-shrink: 0;
      scroll-snap-align: start;
    }
  }

  // Icon wrapper
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;
    background: rgba($color-primary, 0.1);
    color: $color-primary-light;
    margin-bottom: $space-1;
    transition: background $transition-base, color $transition-base;

    .category-nav__tile:hover & {
      background: rgba($color-primary, 0.2);
      color: $color-primary;
    }
  }

  // Label
  &__label {
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    line-height: $leading-tight;
  }

  // Workflow count
  &__count {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }
}
</style>
