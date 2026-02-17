<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGsap } from '../../composables/useGsap.js'

const props = defineProps({
  images: { type: Array, default: () => [] },
})

const { gsap, animate } = useGsap()

const activeIndex = ref(0)
const mainImageRef = ref(null)
const lightboxOpen = ref(false)

function selectImage(index) {
  if (index === activeIndex.value) return
  const direction = index > activeIndex.value ? 1 : -1
  activeIndex.value = index

  animate(() => {
    if (!mainImageRef.value) return
    gsap.fromTo(
      mainImageRef.value,
      { opacity: 0, x: direction * 40 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    )
  })
}

function openLightbox() {
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function handleKeydown(e) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight' && activeIndex.value < props.images.length - 1) {
    selectImage(activeIndex.value + 1)
  }
  if (e.key === 'ArrowLeft' && activeIndex.value > 0) {
    selectImage(activeIndex.value - 1)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="output-gallery">
    <!-- Main hero image -->
    <div v-if="images.length" class="output-gallery__main" @click="openLightbox">
      <img
        ref="mainImageRef"
        :src="images[activeIndex]?.url || images[activeIndex]"
        alt="Workflow output"
        class="output-gallery__image"
      />
      <span v-if="images.length > 1" class="output-gallery__counter">
        {{ activeIndex + 1 }} / {{ images.length }}
      </span>
    </div>

    <!-- 2x2 thumbnail grid -->
    <div v-if="images.length > 1" class="output-gallery__thumbs">
      <img
        v-for="(img, i) in images.slice(0, 4)"
        :key="i"
        :src="img?.url || img"
        :alt="`Output ${i + 1}`"
        class="output-gallery__thumb"
        :class="{ 'output-gallery__thumb--active': i === activeIndex }"
        loading="lazy"
        @click="selectImage(i)"
      />
    </div>

    <!-- Lightbox overlay -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div
          v-if="lightboxOpen"
          class="output-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          @click.self="closeLightbox"
        >
          <button class="output-gallery__lightbox-close" @click="closeLightbox" aria-label="Close lightbox">
            &times;
          </button>
          <img
            :src="images[activeIndex]?.url || images[activeIndex]"
            alt="Workflow output full size"
            class="output-gallery__lightbox-image"
          />
          <span v-if="images.length > 1" class="output-gallery__lightbox-counter">
            {{ activeIndex + 1 }} / {{ images.length }}
          </span>
          <div v-if="images.length > 1" class="output-gallery__lightbox-nav">
            <button
              class="output-gallery__lightbox-btn"
              :disabled="activeIndex === 0"
              @click.stop="selectImage(activeIndex - 1)"
              aria-label="Previous image"
            >
              &#8249;
            </button>
            <button
              class="output-gallery__lightbox-btn"
              :disabled="activeIndex === images.length - 1"
              @click.stop="selectImage(activeIndex + 1)"
              aria-label="Next image"
            >
              &#8250;
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.output-gallery {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__main {
    position: relative;
    border-radius: $radius-md;
    overflow: hidden;
    cursor: zoom-in;
  }

  &__image {
    width: 100%;
    display: block;
    aspect-ratio: 16/9;
    object-fit: cover;
  }

  &__counter {
    position: absolute;
    bottom: $space-3;
    right: $space-3;
    background: rgba(0, 0, 0, 0.65);
    color: $color-text-primary;
    font-size: $text-xs;
    font-weight: $weight-medium;
    padding: $space-1 $space-2;
    border-radius: $radius-full;
    pointer-events: none;
    backdrop-filter: blur(4px);
    font-variant-numeric: tabular-nums;
  }

  // 2x2 thumbnail grid (matching Figma)
  &__thumbs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-4;
  }

  &__thumb {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    border-radius: $radius-xl;
    cursor: pointer;
    border: 2px solid transparent;
    opacity: 0.7;
    transition: border-color $transition-fast, opacity $transition-fast;

    &:hover {
      border-color: $color-primary;
      opacity: 0.9;
    }

    &--active {
      border-color: $color-primary;
      opacity: 1;
    }
  }

  // Lightbox
  &__lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    backdrop-filter: blur(8px);
  }

  &__lightbox-close {
    position: absolute;
    top: $space-4;
    right: $space-4;
    background: none;
    border: none;
    color: $color-text-primary;
    font-size: $text-4xl;
    cursor: pointer;
    line-height: 1;
    padding: $space-2;
    opacity: 0.7;
    transition: opacity $transition-fast;
    z-index: 1;

    &:hover {
      opacity: 1;
    }
  }

  &__lightbox-image {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: $radius-md;
    cursor: default;
  }

  &__lightbox-counter {
    position: absolute;
    bottom: $space-6;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.65);
    color: $color-text-primary;
    font-size: $text-sm;
    font-weight: $weight-medium;
    padding: $space-1 $space-4;
    border-radius: $radius-full;
    pointer-events: none;
    font-variant-numeric: tabular-nums;
  }

  &__lightbox-nav {
    position: absolute;
    bottom: $space-6;
    right: $space-6;
    display: flex;
    gap: $space-2;
  }

  &__lightbox-btn {
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: $color-text-primary;
    font-size: $text-2xl;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background $transition-fast;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

// Lightbox transition
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
