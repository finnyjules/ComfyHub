<script setup>
const props = defineProps({
  creator: { type: Object, required: true },
})
</script>

<template>
  <div class="profile-header">
    <!-- Full-bleed banner -->
    <div class="profile-header__banner">
      <img
        v-if="creator.bannerUrl"
        :src="creator.bannerUrl"
        :alt="`${creator.displayName} banner`"
        class="profile-header__banner-img"
      />
      <!-- Gradient fade at bottom -->
      <div class="profile-header__banner-fade" />
    </div>

    <!-- Avatar overlapping banner -->
    <div class="profile-header__avatar-area">
      <div class="profile-header__avatar-wrap">
        <img
          v-if="creator.avatarUrl"
          :src="creator.avatarUrl"
          :alt="creator.displayName"
          class="profile-header__avatar"
        />
        <span v-else class="profile-header__avatar-fallback">
          {{ creator.displayName?.charAt(0) ?? '?' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-header {
  position: relative;

  // ===== BANNER =====
  &__banner {
    position: relative;
    width: 100%;
    height: 320px;
    overflow: hidden;

    @include respond-below('md') {
      height: 200px;
    }
  }

  &__banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  // Gradient fade to page background
  &__banner-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, $color-bg-primary, transparent);
    pointer-events: none;
  }

  // ===== AVATAR =====
  &__avatar-area {
    @include container;
    position: relative;
    margin-top: -48px;

    @include respond-below('md') {
      margin-top: -40px;
    }
  }

  &__avatar-wrap {
    width: 96px;
    height: 96px;
    border-radius: $radius-full;
    overflow: hidden;
    border: 4px solid $color-bg-primary;
    background: $color-bg-tertiary;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    @include respond-below('md') {
      width: 80px;
      height: 80px;
    }
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__avatar-fallback {
    font-size: $text-3xl;
    font-weight: $weight-bold;
    color: $color-text-tertiary;
    text-transform: uppercase;
  }
}
</style>
