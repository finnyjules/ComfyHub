<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getWorkflows, getByCategory } from '../../data/services/workflowService.js'
import { categories } from '../../data/mock/generators/categories.js'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'
import WorkflowGrid from '../workflow/WorkflowGrid.vue'
import AppSearchBar from '../global/AppSearchBar.vue'
import BaseTabGroup from '../ui/BaseTabGroup.vue'

// Category filter state
const activeCategory = ref('all')
const allCategories = [
  { id: 'all', label: 'All' },
  ...categories.map((c) => ({ id: c.id, label: c.label })),
]

// Sort state
const activeSort = ref('popular')
const sortTabs = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
]

// Pagination state
const ITEMS_PER_PAGE = 24
const page = ref(1)
const allResults = ref([])
const total = ref(0)

// Fetch data based on current filters
function fetchData() {
  try {
    let result
    if (activeCategory.value === 'all') {
      result = getWorkflows({ page: 1, limit: 9999, sort: activeSort.value })
    } else {
      result = getByCategory(activeCategory.value, { page: 1, limit: 9999, sort: activeSort.value })
    }
    allResults.value = result.data
    total.value = result.total
  } catch (err) {
    console.error('[GallerySection] fetchData failed:', err)
    allResults.value = []
    total.value = 0
  }
}

// Displayed workflows (paginated slice)
const displayedWorkflows = computed(() => {
  return allResults.value.slice(0, page.value * ITEMS_PER_PAGE)
})

const canLoadMore = computed(() => {
  return displayedWorkflows.value.length < total.value
})

function loadMore() {
  page.value++
}

function setCategory(catId) {
  activeCategory.value = catId
  page.value = 1
  fetchData()
}

// Watch sort changes
watch(activeSort, () => {
  page.value = 1
  fetchData()
})

// Scroll animation
const sectionRef = ref(null)
const filtersRef = ref(null)
const { flipInChildren, staggerChildren } = useScrollAnimation()

onMounted(() => {
  fetchData()

  // Filter pills slide in
  if (filtersRef.value) {
    staggerChildren(filtersRef.value, '.gallery-section__pill', { y: 0 })
  }

  // Cards 3D flip-in
  if (sectionRef.value) {
    flipInChildren(sectionRef.value, '.workflow-card')
  }
})
</script>

<template>
  <section ref="sectionRef" class="gallery-section">
    <div class="gallery-section__container">
      <!-- Sticky toolbar: search + filters + sort -->
      <div class="gallery-section__toolbar">
        <!-- Search bar — full width, centered -->
        <div class="gallery-section__search">
          <AppSearchBar :placeholder="`Search ${total} workflows...`" />
        </div>

        <!-- Category pills — centered -->
        <div ref="filtersRef" class="gallery-section__filters">
          <button
            v-for="cat in allCategories"
            :key="cat.id"
            class="gallery-section__pill"
            :class="{ 'gallery-section__pill--active': activeCategory === cat.id }"
            @click="setCategory(cat.id)"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Sort tabs -->
        <div class="gallery-section__sort">
          <BaseTabGroup :tabs="sortTabs" v-model="activeSort" />
        </div>
      </div>

      <!-- Grid -->
      <WorkflowGrid
        :workflows="displayedWorkflows"
        variant="gallery"
        columns="3"
      />

      <!-- Load more -->
      <div v-if="canLoadMore" class="gallery-section__load-more">
        <button class="gallery-section__load-btn" @click="loadMore">
          Load more workflows
        </button>
        <p class="gallery-section__count">
          Showing {{ displayedWorkflows.length }} of {{ total }}
        </p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.gallery-section {
  background: $color-bg-primary;
  padding: $space-16 0;

  &__container {
    @include container;
  }

  // Sticky toolbar — sticks below the 56px navbar while grid is in view
  &__toolbar {
    position: sticky;
    top: 56px; // navbar height
    z-index: 50;
    padding-top: $space-4;
    padding-bottom: $space-4;
    margin-top: -$space-4; // compensate for padding so layout doesn't shift

    // Full-width background that covers the gap to the navbar
    &::before {
      content: '';
      position: absolute;
      top: -$space-16; // extend upward to cover any gap above
      left: 50%;
      transform: translateX(-50%);
      width: 100vw;
      height: calc(100% + $space-16);
      background: $color-bg-primary;
      z-index: -1;
      pointer-events: none;
    }

    // Fade-out edge so it doesn't clip harshly
    &::after {
      content: '';
      position: absolute;
      bottom: -16px;
      left: 50%;
      transform: translateX(-50%);
      width: 100vw;
      height: 16px;
      background: linear-gradient(to bottom, $color-bg-primary, transparent);
      pointer-events: none;
    }
  }

  // Search — full width, centered
  &__search {
    max-width: 640px;
    width: 100%;
    margin: 0 auto $space-6;
    position: relative;
    z-index: $z-dropdown;

    @include respond-below('md') {
      max-width: 100%;
    }
  }

  // Category filter pills — centered
  &__filters {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: $space-2;
    margin-bottom: $space-8;

    @include respond-below('md') {
      overflow-x: auto;
      flex-wrap: nowrap;
      justify-content: flex-start;
      padding-bottom: $space-1;
      -webkit-overflow-scrolling: touch;
      @include custom-scrollbar;
    }
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    padding: $space-2 $space-4;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    white-space: nowrap;
    cursor: pointer;
    transition: color $transition-fast, border-color $transition-fast, background $transition-fast;
    @include focus-ring;

    &:hover {
      color: $color-text-primary;
      border-color: $color-border-hover;
    }

    &--active {
      background: $color-text-primary;
      border-color: $color-text-primary;
      color: $color-bg-primary;

      &:hover {
        background: #fff;
        border-color: #fff;
        color: $color-bg-primary;
      }
    }

    @include respond-below('md') {
      flex-shrink: 0;
    }
  }

  // Sort tabs
  &__sort {
    margin-bottom: 0;
  }

  // Grid gap override
  :deep(.workflow-grid) {
    gap: $space-8;
    perspective: 1000px;
  }

  // Load more
  &__load-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
    margin-top: $space-10;
  }

  &__load-btn {
    padding: $space-3 $space-8;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background $transition-fast, border-color $transition-fast;
    @include focus-ring;

    &:hover {
      background: $color-bg-primary;
      border-color: $color-border-hover;
    }
  }

  &__count {
    font-size: $text-xs;
    color: $color-text-tertiary;
    margin: 0;
  }

  // Responsive
  @include respond-below('md') {
    padding: $space-10 0;
  }
}
</style>
