<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  filters: { type: Object, required: true },
  filterCounts: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  baseModels: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:filters'])

const outputTypes = ['Image', 'Video', 'Audio', '3D', 'Text']
const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

// Track collapsed state per group
const collapsed = ref({
  category: false,
  model: false,
  difficulty: false,
  outputType: true,
})

function toggleGroup(group) {
  collapsed.value[group] = !collapsed.value[group]
}

function getCount(group, value) {
  return props.filterCounts?.[group]?.[value] ?? 0
}

function isChecked(group, value) {
  const arr = props.filters[group]
  if (!arr) return false
  return arr.includes(value)
}

function toggleCheckbox(group, value) {
  const current = [...(props.filters[group] || [])]
  const idx = current.indexOf(value)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(value)
  }
  emit('update:filters', { ...props.filters, [group]: current })
}

function setDifficulty(value) {
  const newVal = props.filters.difficulty === value ? null : value
  emit('update:filters', { ...props.filters, difficulty: newVal })
}

const hasActiveFilters = computed(() => {
  return (
    (props.filters.category?.length > 0) ||
    (props.filters.model?.length > 0) ||
    props.filters.difficulty ||
    (props.filters.outputType?.length > 0) ||
    (props.filters.technique?.length > 0)
  )
})

function clearAll() {
  emit('update:filters', {
    category: [],
    model: [],
    difficulty: null,
    outputType: [],
    technique: [],
  })
}
</script>

<template>
  <aside class="filter-sidebar">
    <div class="filter-sidebar__header">
      <h3 class="filter-sidebar__title">Filters</h3>
      <button
        v-if="hasActiveFilters"
        class="filter-sidebar__clear"
        @click="clearAll"
      >
        Clear all
      </button>
    </div>

    <!-- Category filter -->
    <div class="filter-group">
      <button
        class="filter-group__heading"
        @click="toggleGroup('category')"
        :aria-expanded="!collapsed.category"
      >
        <span>Category</span>
        <svg
          class="filter-group__chevron"
          :class="{ 'filter-group__chevron--collapsed': collapsed.category }"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div v-show="!collapsed.category" class="filter-group__body">
        <label
          v-for="cat in categories"
          :key="cat.id"
          class="filter-option"
        >
          <input
            type="checkbox"
            class="filter-option__input"
            :checked="isChecked('category', cat.id)"
            @change="toggleCheckbox('category', cat.id)"
          />
          <span class="filter-option__checkmark" />
          <span class="filter-option__label">{{ cat.label }}</span>
          <span class="filter-option__count">{{ getCount('category', cat.id) }}</span>
        </label>
      </div>
    </div>

    <!-- Base Model filter -->
    <div class="filter-group">
      <button
        class="filter-group__heading"
        @click="toggleGroup('model')"
        :aria-expanded="!collapsed.model"
      >
        <span>Base Model</span>
        <svg
          class="filter-group__chevron"
          :class="{ 'filter-group__chevron--collapsed': collapsed.model }"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div v-show="!collapsed.model" class="filter-group__body">
        <label
          v-for="model in baseModels"
          :key="model"
          class="filter-option"
        >
          <input
            type="checkbox"
            class="filter-option__input"
            :checked="isChecked('model', model)"
            @change="toggleCheckbox('model', model)"
          />
          <span class="filter-option__checkmark" />
          <span class="filter-option__label">{{ model }}</span>
          <span class="filter-option__count">{{ getCount('model', model) }}</span>
        </label>
      </div>
    </div>

    <!-- Difficulty filter -->
    <div class="filter-group">
      <button
        class="filter-group__heading"
        @click="toggleGroup('difficulty')"
        :aria-expanded="!collapsed.difficulty"
      >
        <span>Difficulty</span>
        <svg
          class="filter-group__chevron"
          :class="{ 'filter-group__chevron--collapsed': collapsed.difficulty }"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div v-show="!collapsed.difficulty" class="filter-group__body">
        <label
          v-for="level in difficulties"
          :key="level"
          class="filter-option filter-option--radio"
        >
          <input
            type="radio"
            name="difficulty"
            class="filter-option__input"
            :checked="filters.difficulty === level"
            @change="setDifficulty(level)"
          />
          <span class="filter-option__radio-mark" />
          <span class="filter-option__label">{{ level }}</span>
          <span class="filter-option__count">{{ getCount('difficulty', level) }}</span>
        </label>
      </div>
    </div>

    <!-- Output Type filter -->
    <div class="filter-group">
      <button
        class="filter-group__heading"
        @click="toggleGroup('outputType')"
        :aria-expanded="!collapsed.outputType"
      >
        <span>Output Type</span>
        <svg
          class="filter-group__chevron"
          :class="{ 'filter-group__chevron--collapsed': collapsed.outputType }"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div v-show="!collapsed.outputType" class="filter-group__body">
        <label
          v-for="type in outputTypes"
          :key="type"
          class="filter-option"
        >
          <input
            type="checkbox"
            class="filter-option__input"
            :checked="isChecked('outputType', type)"
            @change="toggleCheckbox('outputType', type)"
          />
          <span class="filter-option__checkmark" />
          <span class="filter-option__label">{{ type }}</span>
          <span class="filter-option__count">{{ getCount('outputType', type) }}</span>
        </label>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.filter-sidebar {
  width: $sidebar-width;
  flex-shrink: 0;

  @include respond-below('lg') {
    width: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-6;
  }

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text-primary;
  }

  &__clear {
    font-size: $text-sm;
    color: $color-primary-light;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary;
      text-decoration: underline;
    }
  }
}

.filter-group {
  border-bottom: 1px solid $color-border;
  padding-bottom: $space-4;
  margin-bottom: $space-4;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: $space-2 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    font-family: $font-sans;

    @include focus-ring;

    &:hover {
      color: $color-primary-light;
    }
  }

  &__chevron {
    transition: transform $transition-fast;
    color: $color-text-tertiary;

    &--collapsed {
      transform: rotate(-90deg);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    padding-top: $space-2;
    max-height: 280px;
    overflow-y: auto;
    @include custom-scrollbar;
  }
}

.filter-option {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-1 $space-2;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: background-color $transition-fast;
  user-select: none;

  &:hover {
    background: $color-bg-hover;
  }

  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  // Checkbox mark
  &__checkmark {
    position: relative;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border: 2px solid $color-border-hover;
    border-radius: $radius-sm;
    background: $color-bg-tertiary;
    transition: background-color $transition-fast, border-color $transition-fast;

    &::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 4px;
      width: 5px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) scale(0);
      transition: transform $transition-fast;
    }
  }

  &__input:checked + &__checkmark {
    background: $color-primary;
    border-color: $color-primary;

    &::after {
      transform: rotate(45deg) scale(1);
    }
  }

  &__input:focus-visible + &__checkmark {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  // Radio mark
  &__radio-mark {
    position: relative;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border: 2px solid $color-border-hover;
    border-radius: $radius-full;
    background: $color-bg-tertiary;
    transition: border-color $transition-fast;

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 6px;
      height: 6px;
      border-radius: $radius-full;
      background: $color-primary;
      transform: scale(0);
      transition: transform $transition-fast;
    }
  }

  &__input:checked + &__radio-mark {
    border-color: $color-primary;

    &::after {
      transform: scale(1);
    }
  }

  &__input:focus-visible + &__radio-mark {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  &__label {
    flex: 1;
    font-size: $text-sm;
    color: $color-text-secondary;
    @include text-ellipsis;
  }

  &__count {
    font-size: $text-xs;
    color: $color-text-tertiary;
    font-variant-numeric: tabular-nums;
    min-width: 20px;
    text-align: right;
  }
}
</style>
