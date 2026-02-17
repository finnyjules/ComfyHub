<script setup>
defineProps({
  hover: { type: Boolean, default: true },
  padding: { type: Boolean, default: true },
})
</script>

<template>
  <div class="base-card" :class="{ 'base-card--hover': hover, 'base-card--padded': padding }">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.base-card {
  @include card-base;

  &--padded {
    padding: $space-6;
  }

  &--hover {
    @include hover-lift;
  }
}
</style>
