<script setup>
import { computed } from 'vue'
import { categories as allCategories } from '../../data/mock/generators/categories.js'

const props = defineProps({
  filters: { type: Object, required: true },
  query: { type: String, default: '' },
})

const emit = defineEmits(['removeFilter', 'clearAll'])

function getCategoryLabel(id) {
  return allCategories.find((c) => c.id === id)?.label ?? id
}

const pills = computed(() => {
  const items = []

  if (props.filters.category?.length) {
    props.filters.category.forEach((id) => {
      items.push({ type: 'category', value: id, label: getCategoryLabel(id) })
    })
  }

  if (props.filters.model?.length) {
    props.filters.model.forEach((m) => {
      items.push({ type: 'model', value: m, label: m })
    })
  }

  if (props.filters.difficulty) {
    items.push({ type: 'difficulty', value: props.filters.difficulty, label: props.filters.difficulty })
  }

  if (props.filters.outputType?.length) {
    props.filters.outputType.forEach((t) => {
      items.push({ type: 'outputType', value: t, label: t })
    })
  }

  if (props.filters.technique?.length) {
    props.filters.technique.forEach((t) => {
      items.push({ type: 'technique', value: t, label: t })
    })
  }

  return items
})

const hasFilters = computed(() => pills.value.length > 0)
</script>

<template>
  <div v-if="hasFilters" class="active-filters">
    <TransitionGroup name="pill" tag="div" class="active-filters__list">
      <button
        v-for="pill in pills"
        :key="`${pill.type}-${pill.value}`"
        class="active-filters__pill"
        @click="emit('removeFilter', pill.type, pill.value)"
        :aria-label="`Remove ${pill.label} filter`"
      >
        <span class="active-filters__pill-type">{{ pill.type }}:</span>
        <span class="active-filters__pill-label">{{ pill.label }}</span>
        <svg
          class="active-filters__pill-remove"
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </TransitionGroup>

    <button class="active-filters__clear" @click="emit('clearAll')">
      Clear all
    </button>
  </div>
</template>

<style lang="scss" scoped>
.active-filters {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex-wrap: wrap;
  margin-bottom: $space-4;

  &__list {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    padding: $space-1 $space-2 $space-1 $space-3;
    background: rgba($color-primary, 0.15);
    border: 1px solid rgba($color-primary, 0.3);
    border-radius: $radius-full;
    cursor: pointer;
    transition: background-color $transition-fast, border-color $transition-fast;
    white-space: nowrap;

    @include focus-ring;

    &:hover {
      background: rgba($color-primary, 0.25);
      border-color: rgba($color-primary, 0.5);
    }
  }

  &__pill-type {
    font-size: $text-xs;
    color: $color-text-tertiary;
    text-transform: capitalize;
  }

  &__pill-label {
    font-size: $text-xs;
    font-weight: $weight-medium;
    color: $color-primary-light;
  }

  &__pill-remove {
    color: $color-text-tertiary;
    transition: color $transition-fast;
    flex-shrink: 0;

    .active-filters__pill:hover & {
      color: $color-text-primary;
    }
  }

  &__clear {
    font-size: $text-xs;
    color: $color-text-tertiary;
    background: none;
    border: none;
    cursor: pointer;
    padding: $space-1 0;
    transition: color $transition-fast;
    white-space: nowrap;

    &:hover {
      color: $color-error;
      text-decoration: underline;
    }
  }
}

// Transition animations for pills
.pill-enter-active {
  transition: all $transition-fast;
}

.pill-leave-active {
  transition: all $transition-fast;
  position: absolute;
}

.pill-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.pill-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.pill-move {
  transition: transform $transition-fast;
}
</style>
