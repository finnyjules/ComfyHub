<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tabs: { type: Array, required: true }, // [{ id, label, count? }]
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const activeTab = ref(props.modelValue || props.tabs[0]?.id)

watch(() => props.modelValue, (val) => {
  if (val) activeTab.value = val
})

function selectTab(id) {
  activeTab.value = id
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="tab-group" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      role="tab"
      :aria-selected="activeTab === tab.id"
      class="tab-group__tab"
      :class="{ 'tab-group__tab--active': activeTab === tab.id }"
      @click="selectTab(tab.id)"
    >
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="tab-group__count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tab-group {
  display: flex;
  gap: $space-1;
  border-bottom: 1px solid $color-border;
  overflow-x: auto;
  @include custom-scrollbar;

  &__tab {
    padding: $space-3 $space-4;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-tertiary;
    border-bottom: 2px solid transparent;
    transition: color $transition-fast, border-color $transition-fast;
    white-space: nowrap;
    @include focus-ring;

    &:hover {
      color: $color-text-secondary;
    }

    &--active {
      color: $color-primary-light;
      border-bottom-color: $color-primary;
    }
  }

  &__count {
    margin-left: $space-1;
    font-size: $text-xs;
    color: $color-text-tertiary;
  }
}
</style>
