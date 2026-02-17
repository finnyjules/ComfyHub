<script setup>
defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: '' },
  size: { type: String, default: 'md' }, // xs, sm, md, lg, xl
  fallback: { type: String, default: '?' },
})
</script>

<template>
  <div class="avatar" :class="`avatar--${size}`">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatar__img"
      loading="lazy"
    />
    <span v-else class="avatar__fallback">{{ fallback.charAt(0) }}</span>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  flex-shrink: 0;
  border-radius: $radius-full;
  overflow: hidden;
  background: $color-bg-tertiary;
  display: flex;
  align-items: center;
  justify-content: center;

  &--xs { width: 24px; height: 24px; font-size: $text-xs; }
  &--sm { width: 32px; height: 32px; font-size: $text-sm; }
  &--md { width: 40px; height: 40px; font-size: $text-base; }
  &--lg { width: 56px; height: 56px; font-size: $text-xl; }
  &--xl { width: 80px; height: 80px; font-size: $text-3xl; }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__fallback {
    color: $color-text-tertiary;
    font-weight: $weight-semibold;
    text-transform: uppercase;
  }
}
</style>
