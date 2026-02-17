<script setup>
import { ref, onMounted } from 'vue'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'

const collections = [
  {
    id: 'portrait-perfection',
    title: 'Portrait Perfection',
    description: 'Master portrait generation with these top-rated workflows',
    workflowCount: 12,
    thumbnails: [
      'https://picsum.photos/seed/col-1a/400/300',
      'https://picsum.photos/seed/col-1b/400/300',
      'https://picsum.photos/seed/col-1c/400/300',
      'https://picsum.photos/seed/col-1d/400/300',
    ],
  },
  {
    id: 'video-magic',
    title: 'Video Magic',
    description: 'Create stunning videos and animations from text or images',
    workflowCount: 8,
    thumbnails: [
      'https://picsum.photos/seed/col-2a/400/300',
      'https://picsum.photos/seed/col-2b/400/300',
      'https://picsum.photos/seed/col-2c/400/300',
      'https://picsum.photos/seed/col-2d/400/300',
    ],
  },
  {
    id: 'lora-essentials',
    title: 'LoRA Essentials',
    description: 'Everything you need to train and use custom LoRA models',
    workflowCount: 15,
    thumbnails: [
      'https://picsum.photos/seed/col-3a/400/300',
      'https://picsum.photos/seed/col-3b/400/300',
      'https://picsum.photos/seed/col-3c/400/300',
      'https://picsum.photos/seed/col-3d/400/300',
    ],
  },
  {
    id: 'beginner-friendly',
    title: 'Beginner Friendly',
    description: 'Perfect starting workflows for ComfyUI newcomers',
    workflowCount: 20,
    thumbnails: [
      'https://picsum.photos/seed/col-4a/400/300',
      'https://picsum.photos/seed/col-4b/400/300',
      'https://picsum.photos/seed/col-4c/400/300',
      'https://picsum.photos/seed/col-4d/400/300',
    ],
  },
]

const gridRef = ref(null)
const headingRef = ref(null)
const { flipInChildren, revealWords } = useScrollAnimation()

onMounted(() => {
  // Heading per-word reveal
  if (headingRef.value) {
    revealWords(headingRef.value)
  }

  // Cards 3D scale + rotateY entrance
  if (gridRef.value) {
    flipInChildren(gridRef.value, '.curated-collections__card', {
      rotateX: 0,
      rotateY: 8,
      y: 40,
      scale: 0.85,
      stagger: 0.12,
      perspective: 800,
    })
  }
})
</script>

<template>
  <section class="curated-collections">
    <div class="curated-collections__container">
      <!-- Header -->
      <div class="curated-collections__header">
        <div class="curated-collections__title-group">
          <svg
            class="curated-collections__icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <h2 ref="headingRef" class="curated-collections__title">Curated Collections</h2>
        </div>
        <a href="/collections" class="curated-collections__view-all">
          View all
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <!-- Grid -->
      <div ref="gridRef" class="curated-collections__grid">
        <a
          v-for="collection in collections"
          :key="collection.id"
          :href="`/collection/${collection.id}`"
          class="curated-collections__card"
        >
          <!-- 2x2 Thumbnail Grid -->
          <div class="curated-collections__thumbs">
            <img
              v-for="(thumb, i) in collection.thumbnails"
              :key="i"
              :src="thumb"
              :alt="`${collection.title} preview ${i + 1}`"
              class="curated-collections__thumb"
              loading="lazy"
            />
          </div>

          <!-- Card Info -->
          <div class="curated-collections__info">
            <h3 class="curated-collections__card-title">{{ collection.title }}</h3>
            <p class="curated-collections__description">{{ collection.description }}</p>
            <span class="curated-collections__count">{{ collection.workflowCount }} workflows</span>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.curated-collections {
  @include section-spacing;

  &__container {
    @include container;
  }

  // ===== HEADER =====
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-8;
  }

  &__title-group {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__icon {
    color: $color-primary-light;
    flex-shrink: 0;
  }

  &__title {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-text-primary;
    line-height: $leading-tight;
  }

  &__view-all {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-primary-light;
    transition: color $transition-base;

    &:hover {
      color: $color-primary;
    }
  }

  // ===== GRID =====
  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-6;
    perspective: 800px;

    @include respond-below('md') {
      grid-template-columns: 1fr;
    }
  }

  // ===== CARD =====
  &__card {
    @include card-base;
    display: flex;
    flex-direction: column;
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
  }

  &__thumb {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    transition: transform 0.4s ease;

    .curated-collections__card:hover & {
      transform: scale(1.03);
    }
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
