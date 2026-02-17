<script setup>
import { ref } from 'vue'
import { getCreatorCollections } from '../../data/services/creatorService.js'

const props = defineProps({
  creatorId: { type: String, required: true },
})

const collections = ref([])

collections.value = getCreatorCollections(props.creatorId)

// Build a 2x2 thumbnail grid from collection workflows (up to 4 thumbnails)
function getCollectionThumbnails(collection) {
  return collection.workflows
    .slice(0, 4)
    .map((w) => w.thumbnailUrl)
}
</script>

<template>
  <div class="profile-collections">
    <!-- Empty state -->
    <div v-if="collections.length === 0" class="profile-collections__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
      <h3 class="profile-collections__empty-title">No collections yet</h3>
      <p class="profile-collections__empty-text">This creator has not created any collections yet.</p>
    </div>

    <!-- Collections grid -->
    <div v-else class="profile-collections__grid">
      <a
        v-for="collection in collections"
        :key="collection.id"
        :href="`/collection/${collection.id}`"
        class="profile-collections__card"
      >
        <!-- 2x2 Thumbnail grid -->
        <div class="profile-collections__thumbs">
          <img
            v-for="(thumb, i) in getCollectionThumbnails(collection)"
            :key="i"
            :src="thumb"
            :alt="`${collection.title} preview ${i + 1}`"
            class="profile-collections__thumb"
            loading="lazy"
          />
          <!-- Fill empty slots with placeholder divs -->
          <div
            v-for="n in Math.max(0, 4 - getCollectionThumbnails(collection).length)"
            :key="`placeholder-${n}`"
            class="profile-collections__thumb-placeholder"
          />
        </div>

        <!-- Card info -->
        <div class="profile-collections__info">
          <h3 class="profile-collections__card-title">{{ collection.title }}</h3>
          <p v-if="collection.description" class="profile-collections__description">
            {{ collection.description }}
          </p>
          <span class="profile-collections__count">
            {{ collection.workflows.length }} workflow{{ collection.workflows.length !== 1 ? 's' : '' }}
          </span>
        </div>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-collections {
  // ===== EMPTY =====
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: $space-20 $space-6;
    color: $color-text-tertiary;

    svg {
      opacity: 0.4;
      margin-bottom: $space-4;
    }
  }

  &__empty-title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    margin-bottom: $space-2;
  }

  &__empty-text {
    font-size: $text-sm;
    color: $color-text-tertiary;
    max-width: 360px;
  }

  // ===== GRID =====
  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-6;

    @include respond-below('md') {
      grid-template-columns: 1fr;
    }
  }

  // ===== CARD =====
  &__card {
    @include card-base;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    transition: transform $transition-base, box-shadow $transition-base, border-color $transition-base;

    &:hover {
      border-color: $color-border-hover;
      box-shadow: $shadow-lg;
      transform: translateY(-2px);
    }
  }

  // ===== THUMBNAIL GRID =====
  &__thumbs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    overflow: hidden;
    border-radius: $radius-md $radius-md 0 0;
  }

  &__thumb {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    transition: transform 0.4s ease;

    .profile-collections__card:hover & {
      transform: scale(1.03);
    }
  }

  &__thumb-placeholder {
    width: 100%;
    aspect-ratio: 4/3;
    background: $color-bg-tertiary;
  }

  // ===== INFO =====
  &__info {
    padding: $space-4 $space-5;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__card-title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text-primary;
  }

  &__description {
    font-size: $text-sm;
    color: $color-text-tertiary;
    line-height: $leading-normal;
    @include line-clamp(2);
  }

  &__count {
    font-size: $text-xs;
    color: $color-text-secondary;
    font-weight: $weight-medium;
    margin-top: $space-1;
  }
}
</style>
