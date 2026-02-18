<script setup>
import { ref, onMounted } from 'vue'
import { collections } from '../../data/collections.js'
import { getCollectionWorkflows } from '../../data/services/workflowService.js'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'

// Order: VFX, Marketing, Gaming, Architecture, Animation, 3D, Fashion (4x2 grid)
const displayOrder = ['vfx', 'marketing', 'gaming', 'architecture', 'animation', '3d', 'fashion']

// Override cover images for specific collections
const coverOverrides = {
  vfx: 'https://workflow-templates.vercel.app/templates/thumbnails/api_grok_video-1.webp',
  marketing: 'https://workflow-templates.vercel.app/templates/thumbnails/templates-photo_to_product_vid-1.webp',
  gaming: 'https://workflow-templates.vercel.app/templates/thumbnails/api_rodin_image_to_model-1.webp',
  architecture: 'https://workflow-templates.vercel.app/templates/thumbnails/image_qwen_image_edit_2509-1.webp',
  animation: 'https://workflow-templates.vercel.app/templates/thumbnails/03_video_wan2_2_14B_i2v_subgraphed-1.webp',
  fashion: 'https://workflow-templates.vercel.app/templates/thumbnails/templates-fashion_shoot_vton-1.webp',
}

const collectionBlocks = displayOrder
  .map((id) => {
    const col = collections.find((c) => c.id === id)
    if (!col) return null
    const workflows = getCollectionWorkflows(id, 9999)
    return {
      ...col,
      count: workflows.length,
      image: coverOverrides[id] || workflows[0]?.thumbnailUrl || `https://picsum.photos/seed/${id}/600/400`,
    }
  })
  .filter(Boolean)

const gridRef = ref(null)
const { staggerChildren } = useScrollAnimation()

onMounted(() => {
  if (gridRef.value) {
    staggerChildren(gridRef.value, '.collection-grid__block', {
      y: 30,
      stagger: 0.06,
      duration: 0.5,
    })
  }
})
</script>

<template>
  <section class="collection-grid">
    <div class="collection-grid__container">
      <div ref="gridRef" class="collection-grid__grid">
        <a
          v-for="col in collectionBlocks"
          :key="col.id"
          :href="`/collection/${col.id}`"
          class="collection-grid__block"
        >
          <img
            :src="col.image"
            :alt="col.title"
            class="collection-grid__bg"
            loading="lazy"
          />
          <div class="collection-grid__overlay" />
          <div class="collection-grid__content">
            <span class="collection-grid__title">{{ col.title }}</span>
            <span class="collection-grid__count">{{ col.count }} workflows</span>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.collection-grid {
  padding-bottom: $space-8;
  background: $color-bg-primary;

  &__container {
    @include container;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $space-4;

    @include respond-below('lg') {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-below('sm') {
      grid-template-columns: 1fr;
    }
  }

  &__block {
    position: relative;
    aspect-ratio: 16 / 9;
    border-radius: $radius-xl;
    overflow: hidden;
    text-decoration: none;
    display: block;

    &:hover {
      .collection-grid__bg {
        transform: scale(1.05);
      }
    }
  }

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.75) 0%,
      rgba(0, 0, 0, 0.15) 50%,
      rgba(0, 0, 0, 0.05) 100%
    );
    z-index: 1;
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $space-4 $space-5;
    z-index: 2;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: $space-2;
  }

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  &__count {
    font-size: $text-xs;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
  }
}
</style>
