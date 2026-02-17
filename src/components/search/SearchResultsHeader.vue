<script setup>
import { computed } from 'vue'
import { formatNumber } from '../../lib/formatters.js'

const props = defineProps({
  total: { type: Number, default: 0 },
  query: { type: String, default: '' },
  sort: { type: String, default: 'relevance' },
  viewMode: { type: String, default: 'grid' },
})

const emit = defineEmits(['update:sort', 'update:viewMode'])

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'runs', label: 'Most Runs' },
  { value: 'favorites', label: 'Most Favorites' },
]

const resultText = computed(() => {
  const count = formatNumber(props.total)
  const suffix = props.total === 1 ? 'result' : 'results'
  if (props.query) {
    return `${count} ${suffix} for "${props.query}"`
  }
  return `${count} ${suffix}`
})
</script>

<template>
  <div class="results-header">
    <p class="results-header__count">{{ resultText }}</p>

    <div class="results-header__controls">
      <!-- Sort dropdown -->
      <div class="results-header__sort">
        <label for="sort-select" class="results-header__sort-label">Sort by</label>
        <select
          id="sort-select"
          class="results-header__sort-select"
          :value="sort"
          @change="emit('update:sort', $event.target.value)"
        >
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- View toggle -->
      <div class="results-header__view-toggle" role="group" aria-label="View mode">
        <button
          class="results-header__view-btn"
          :class="{ 'results-header__view-btn--active': viewMode === 'grid' }"
          aria-label="Grid view"
          @click="emit('update:viewMode', 'grid')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button
          class="results-header__view-btn"
          :class="{ 'results-header__view-btn--active': viewMode === 'list' }"
          aria-label="List view"
          @click="emit('update:viewMode', 'list')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  padding-bottom: $space-6;
  border-bottom: 1px solid $color-border;
  margin-bottom: $space-6;

  @include respond-below('md') {
    flex-direction: column;
    align-items: flex-start;
  }

  &__count {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    white-space: nowrap;

    @include respond-below('md') {
      font-size: $text-base;
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $space-4;
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__sort-label {
    font-size: $text-sm;
    color: $color-text-tertiary;
    white-space: nowrap;
  }

  &__sort-select {
    appearance: none;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-primary;
    font-size: $text-sm;
    font-family: $font-sans;
    padding: $space-2 $space-8 $space-2 $space-3;
    cursor: pointer;
    transition: border-color $transition-fast;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6b80' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right $space-3 center;

    @include focus-ring;

    &:hover {
      border-color: $color-border-hover;
    }

    option {
      background: $color-bg-secondary;
      color: $color-text-primary;
    }
  }

  &__view-toggle {
    display: flex;
    align-items: center;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    overflow: hidden;
  }

  &__view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $space-2;
    color: $color-text-tertiary;
    background: none;
    border: none;
    cursor: pointer;
    transition: color $transition-fast, background-color $transition-fast;

    @include focus-ring;

    &:hover {
      color: $color-text-primary;
      background: $color-bg-hover;
    }

    &--active {
      color: $color-primary-light;
      background: rgba($color-primary, 0.15);
    }

    & + & {
      border-left: 1px solid $color-border;
    }
  }
}
</style>
