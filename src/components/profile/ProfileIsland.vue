<script setup>
import ProfileHeader from './ProfileHeader.vue'
import ProfileWorkflowsGrid from './ProfileWorkflowsGrid.vue'
import { formatNumber } from '../../lib/formatters.js'

const props = defineProps({
  creator: { type: Object, required: true },
})
</script>

<template>
  <div class="profile-island">
    <!-- Full-bleed banner + avatar -->
    <ProfileHeader :creator="creator" />

    <!-- Sidebar + content layout -->
    <div class="profile-island__layout">
      <!-- Left sidebar: identity, bio, links, stats -->
      <aside class="profile-island__sidebar">
        <h1 class="profile-island__name">
          {{ creator.displayName }}
          <svg v-if="creator.badges?.some(b => b === 'verified' || b.id === 'verified')" class="profile-island__verified" width="20" height="20" viewBox="0 0 24 24" fill="#F0FF41">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </h1>
        <p class="profile-island__handle">{{ creator.handle }}</p>

        <p v-if="creator.bio" class="profile-island__bio">{{ creator.bio }}</p>

        <!-- Social / contact links -->
        <div class="profile-island__links">
          <a
            v-if="creator.socialLinks?.twitter"
            :href="`https://x.com/${creator.socialLinks.twitter}`"
            class="profile-island__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            x.com/{{ creator.socialLinks.twitter }}
          </a>
          <a
            v-if="creator.socialLinks?.website"
            :href="creator.socialLinks.website"
            class="profile-island__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ creator.socialLinks.website.replace(/^https?:\/\//, '') }}
          </a>
        </div>

        <!-- Stats -->
        <div class="profile-island__stats">
          <div class="profile-island__stat">
            <span class="profile-island__stat-label">Views</span>
            <span class="profile-island__stat-value">{{ formatNumber(creator.stats.totalRuns) }}</span>
          </div>
          <div class="profile-island__stat">
            <span class="profile-island__stat-label">Likes</span>
            <span class="profile-island__stat-value">{{ formatNumber(creator.stats.totalFavorites) }}</span>
          </div>
          <div class="profile-island__stat">
            <span class="profile-island__stat-label">Runs</span>
            <span class="profile-island__stat-value">{{ formatNumber(creator.stats.totalRuns) }}</span>
          </div>
        </div>
      </aside>

      <!-- Right content: workflows -->
      <main class="profile-island__content">
        <div class="profile-island__section-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <span class="profile-island__section-title">Workflows</span>
          <span class="profile-island__section-count">{{ creator.stats.workflowCount }}</span>
        </div>

        <ProfileWorkflowsGrid :creator-id="creator.id" />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-island {
  min-height: 60vh;
  padding-bottom: $space-20;

  // ===== TWO-COLUMN LAYOUT =====
  &__layout {
    @include container;
    display: flex;
    gap: $space-10;
    margin-top: $space-6;

    @include respond-below('lg') {
      flex-direction: column;
      gap: $space-8;
    }
  }

  // ===== SIDEBAR =====
  &__sidebar {
    flex: 0 0 240px;
    min-width: 0;

    @include respond-below('lg') {
      flex: none;
      width: 100%;
    }
  }

  &__name {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-text-primary;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__verified {
    flex-shrink: 0;
  }

  &__handle {
    font-size: $text-sm;
    color: $color-text-tertiary;
    margin-top: $space-1;
  }

  &__bio {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-relaxed;
    margin-top: $space-4;
  }

  // ===== LINKS =====
  &__links {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    margin-top: $space-4;
  }

  &__link {
    font-size: $text-sm;
    color: $color-text-tertiary;
    transition: color $transition-fast;
    word-break: break-all;

    &:hover {
      color: $color-primary-light;
    }
  }

  // ===== STATS =====
  &__stats {
    margin-top: $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__stat {
    display: flex;
    align-items: baseline;
    gap: $space-3;
  }

  &__stat-label {
    font-size: $text-sm;
    color: $color-text-tertiary;
    min-width: 48px;
  }

  &__stat-value {
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-primary;
  }

  // ===== CONTENT =====
  &__content {
    flex: 1;
    min-width: 0;
  }

  &__section-header {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-bottom: $space-6;
    color: $color-text-primary;
  }

  &__section-title {
    font-size: $text-base;
    font-weight: $weight-semibold;
  }

  &__section-count {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
}
</style>
