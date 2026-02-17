<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: { type: String, required: true },
  creator: { type: Object, required: true },
})

const emit = defineEmits(['update:activeTab'])

const tabs = computed(() => [
  {
    id: 'workflows',
    label: 'Workflows',
    count: props.creator.stats?.workflowCount ?? 0,
  },
  {
    id: 'collections',
    label: 'Collections',
    count: props.creator.collections?.length ?? 0,
  },
  {
    id: 'favorites',
    label: 'Favorites',
    count: null,
  },
  {
    id: 'followers',
    label: 'Followers',
    count: props.creator.stats?.followers ?? 0,
  },
])

function selectTab(id) {
  emit('update:activeTab', id)
}
</script>

<template>
  <nav class="profile-tabs" role="tablist" aria-label="Profile sections">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      role="tab"
      :aria-selected="activeTab === tab.id"
      :aria-controls="`panel-${tab.id}`"
      class="profile-tabs__tab"
      :class="{ 'profile-tabs__tab--active': activeTab === tab.id }"
      @click="selectTab(tab.id)"
    >
      <span class="profile-tabs__label">{{ tab.label }}</span>
      <span v-if="tab.count !== null" class="profile-tabs__count">{{ tab.count }}</span>
    </button>
  </nav>
</template>

<style lang="scss" scoped>
.profile-tabs {
  display: flex;
  gap: $space-1;
  border-bottom: 1px solid $color-border;
  overflow-x: auto;
  @include custom-scrollbar;

  &__tab {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: $space-3 $space-5;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-tertiary;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: color $transition-fast, border-color $transition-fast;
    @include focus-ring;

    &:hover {
      color: $color-text-secondary;
    }

    &--active {
      color: $color-primary-light;
      border-bottom-color: $color-primary;
    }
  }

  &__label {
    pointer-events: none;
  }

  &__count {
    font-size: $text-xs;
    font-weight: $weight-normal;
    color: $color-text-tertiary;
    background: $color-bg-tertiary;
    padding: 1px $space-2;
    border-radius: $radius-full;
    min-width: 20px;
    text-align: center;

    .profile-tabs__tab--active & {
      background: rgba($color-primary, 0.15);
      color: $color-primary-light;
    }
  }
}
</style>
