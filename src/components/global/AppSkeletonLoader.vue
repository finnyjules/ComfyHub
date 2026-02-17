<script setup>
defineProps({
  variant: {
    type: String,
    default: 'card',
    validator: (v) => ['card', 'list', 'profile', 'detail', 'text'].includes(v),
  },
  count: {
    type: Number,
    default: 1,
  },
})
</script>

<template>
  <div class="skeleton-loader">
    <!-- Card variant -->
    <template v-if="variant === 'card'">
      <div
        v-for="n in count"
        :key="`card-${n}`"
        class="skeleton-loader__card"
      >
        <div class="skeleton-loader__card-image skeleton" />
        <div class="skeleton-loader__card-body">
          <div class="skeleton-loader__card-title skeleton" />
          <div class="skeleton-loader__card-subtitle skeleton" />
          <div class="skeleton-loader__card-tags">
            <span class="skeleton-loader__card-tag skeleton" />
            <span class="skeleton-loader__card-tag skeleton" />
            <span class="skeleton-loader__card-tag skeleton" />
          </div>
        </div>
      </div>
    </template>

    <!-- List variant -->
    <template v-if="variant === 'list'">
      <div
        v-for="n in count"
        :key="`list-${n}`"
        class="skeleton-loader__list"
      >
        <div class="skeleton-loader__list-image skeleton" />
        <div class="skeleton-loader__list-content">
          <div class="skeleton-loader__list-title skeleton" />
          <div class="skeleton-loader__list-subtitle skeleton" />
        </div>
      </div>
    </template>

    <!-- Profile variant -->
    <template v-if="variant === 'profile'">
      <div
        v-for="n in count"
        :key="`profile-${n}`"
        class="skeleton-loader__profile"
      >
        <div class="skeleton-loader__profile-avatar skeleton" />
        <div class="skeleton-loader__profile-info">
          <div class="skeleton-loader__profile-name skeleton" />
          <div class="skeleton-loader__profile-bio skeleton" />
          <div class="skeleton-loader__profile-bio skeleton skeleton-loader__profile-bio--short" />
        </div>
      </div>
    </template>

    <!-- Detail variant -->
    <template v-if="variant === 'detail'">
      <div
        v-for="n in count"
        :key="`detail-${n}`"
        class="skeleton-loader__detail"
      >
        <div class="skeleton-loader__detail-image skeleton" />
        <div class="skeleton-loader__detail-lines">
          <div class="skeleton-loader__detail-line skeleton" />
          <div class="skeleton-loader__detail-line skeleton skeleton-loader__detail-line--md" />
          <div class="skeleton-loader__detail-line skeleton skeleton-loader__detail-line--sm" />
          <div class="skeleton-loader__detail-line skeleton skeleton-loader__detail-line--lg" />
        </div>
      </div>
    </template>

    <!-- Text variant -->
    <template v-if="variant === 'text'">
      <div
        v-for="n in count"
        :key="`text-${n}`"
        class="skeleton-loader__text"
      >
        <div class="skeleton-loader__text-line skeleton" />
        <div class="skeleton-loader__text-line skeleton skeleton-loader__text-line--md" />
        <div class="skeleton-loader__text-line skeleton skeleton-loader__text-line--sm" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.skeleton-loader {
  width: 100%;

  // ---- Card variant ----
  &__card {
    background: $color-bg-card;
    border-radius: $radius-lg;
    overflow: hidden;
  }

  &__card + &__card,
  &__list + &__list,
  &__profile + &__profile,
  &__detail + &__detail,
  &__text + &__text {
    margin-top: $space-4;
  }

  &__card-image {
    width: 100%;
    height: 200px;
    border-radius: 0;
  }

  &__card-body {
    padding: $space-4;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__card-title {
    height: 16px;
    width: 75%;
  }

  &__card-subtitle {
    height: 14px;
    width: 50%;
  }

  &__card-tags {
    display: flex;
    gap: $space-2;
    margin-top: $space-1;
  }

  &__card-tag {
    display: inline-block;
    height: 22px;
    width: 56px;
    border-radius: $radius-full;
  }

  // ---- List variant ----
  &__list {
    display: flex;
    align-items: center;
    gap: $space-4;
    background: $color-bg-card;
    border-radius: $radius-lg;
    padding: $space-4;
  }

  &__list-image {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    border-radius: $radius-md;
  }

  &__list-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__list-title {
    height: 16px;
    width: 60%;
  }

  &__list-subtitle {
    height: 14px;
    width: 40%;
  }

  // ---- Profile variant ----
  &__profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-4;
    padding: $space-8 $space-4;
  }

  &__profile-avatar {
    width: 96px;
    height: 96px;
    border-radius: $radius-full;
  }

  &__profile-info {
    width: 100%;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
  }

  &__profile-name {
    height: 20px;
    width: 45%;
  }

  &__profile-bio {
    height: 14px;
    width: 80%;

    &--short {
      width: 55%;
    }
  }

  // ---- Detail variant ----
  &__detail {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }

  &__detail-image {
    width: 100%;
    height: 400px;
    border-radius: $radius-lg;
  }

  &__detail-lines {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__detail-line {
    height: 16px;
    width: 100%;

    &--lg {
      width: 90%;
    }

    &--md {
      width: 70%;
    }

    &--sm {
      width: 50%;
    }
  }

  // ---- Text variant ----
  &__text {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__text-line {
    height: 14px;
    width: 100%;

    &--md {
      width: 80%;
    }

    &--sm {
      width: 60%;
    }
  }
}
</style>
