<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from '@nanostores/vue'
import { $mobileMenuOpen, $searchModalOpen } from '../../stores/ui'
import { $currentUser } from '../../stores/auth'
import { gsap, ScrollTrigger } from '../../lib/gsap.js'

const mobileMenuOpen = useStore($mobileMenuOpen)
const currentUser = useStore($currentUser)

const navRef = ref(null)

const navLinks = [
  { id: 'comfyhub', label: 'ComfyHub', href: '/', isNew: true },
  { id: 'products', label: 'Products', href: '#', hasDropdown: true },
  { id: 'enterprise', label: 'Enterprise', href: '#' },
  { id: 'gallery', label: 'Gallery', href: '#' },
  { id: 'about', label: 'About', href: '#' },
  { id: 'careers', label: 'Careers', href: '#' },
  { id: 'resources', label: 'Resources', href: '#', hasDropdown: true },
]

function toggleMobileMenu() {
  $mobileMenuOpen.set(!$mobileMenuOpen.get())
}

function handleSearchClick() {
  if ($mobileMenuOpen.get()) {
    $mobileMenuOpen.set(false)
  }
  $searchModalOpen.set(true)
}

// Cmd+K / Ctrl+K opens search modal globally
function handleGlobalKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    $searchModalOpen.set(!$searchModalOpen.get())
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion || !navRef.value) return

  const logo = navRef.value.querySelector('.navbar__logo-svg')

  ScrollTrigger.create({
    start: 'top -100',
    onEnter: () => {
      gsap.to(navRef.value, {
        height: 48,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(navRef.value, {
        background: 'rgba(16, 21, 26, 0.95)',
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        duration: 0.3,
      })
      if (logo) {
        gsap.to(logo, { scale: 0.85, duration: 0.3, ease: 'power2.out' })
      }
    },
    onLeaveBack: () => {
      gsap.to(navRef.value, {
        height: 56,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(navRef.value, {
        background: 'rgba(16, 21, 26, 0.82)',
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
        duration: 0.3,
      })
      if (logo) {
        gsap.to(logo, { scale: 1, duration: 0.3, ease: 'power2.out' })
      }
    },
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <nav ref="navRef" class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar__inner">
      <div class="navbar__left">
        <a href="/" class="navbar__logo" aria-label="ComfyCloud Home">
          <img src="/comfy_logo.svg" alt="Comfy" class="navbar__logo-svg" />
        </a>

        <div class="navbar__categories">
          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="link.href"
            class="navbar__category-link"
          >
            {{ link.label }}
            <span v-if="link.isNew" class="navbar__new-badge">NEW</span>
            <svg v-if="link.hasDropdown" class="navbar__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
        </div>
      </div>

      <div class="navbar__right">
        <button
          class="navbar__search-btn"
          aria-label="Search workflows"
          @click="handleSearchClick"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <a href="/" class="navbar__cta-btn">
          Launch Comfy Cloud
        </a>

        <button
          class="navbar__mobile-toggle"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle menu"
          @click="toggleMobileMenu"
        >
          <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div v-if="mobileMenuOpen" class="navbar__mobile-menu">
        <div class="navbar__mobile-categories">
          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="link.href"
            class="navbar__mobile-link"
            @click="$mobileMenuOpen.set(false)"
          >
            {{ link.label }}
            <span v-if="link.isNew" class="navbar__new-badge">NEW</span>
            <svg v-if="link.hasDropdown" class="navbar__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
        </div>
        <a href="/" class="navbar__mobile-cta">Launch Comfy Cloud</a>
      </div>
    </Transition>
  </nav>
</template>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: $nav-height;
  z-index: $z-sticky;
  background: rgba(16, 21, 26, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &__inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 $space-6;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: $space-8;
  }

  &__logo {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    @include focus-ring;
    border-radius: $radius-sm;
  }

  &__logo-svg {
    height: 22px;
    width: auto;
    display: block;
  }

  &__categories {
    display: none;
    align-items: center;
    gap: 0;

    @include respond-to('lg') {
      display: flex;
    }
  }

  &__category-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: $space-2 $space-4;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: rgba(255, 255, 255, 0.7);
    border-radius: $radius-md;
    transition: color $transition-fast;
    white-space: nowrap;
    @include focus-ring;
    letter-spacing: -0.01em;

    &:hover {
      color: #ffffff;
    }
  }

  &__new-badge {
    background: $color-brand-yellow;
    color: black;
    font-family: $font-brand;
    font-size: 10px;
    font-weight: 900;
    font-style: italic;
    border-radius: 100px;
    padding: 0 8px;
    line-height: 1.6;
  }

  &__chevron {
    flex-shrink: 0;
    opacity: 0.6;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $space-3;
    flex-shrink: 0;
  }

  &__search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $radius-md;
    background: transparent;
    cursor: pointer;
    transition: color $transition-fast, border-color $transition-fast, background-color $transition-fast;
    @include focus-ring;

    &:hover {
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.05);
    }
  }

  &__cta-btn {
    display: none;
    padding: 8px 20px;
    background: $color-brand-yellow;
    color: #0a0f14;
    font-size: $text-sm;
    font-weight: $weight-bold;
    font-family: $font-brand;
    font-style: italic;
    border-radius: 8px;
    transition: background-color $transition-fast, transform $transition-fast;
    white-space: nowrap;
    letter-spacing: -0.01em;
    @include focus-ring;

    &:hover {
      background: #e5f03d;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    @include respond-to('md') {
      display: inline-flex;
    }
  }

  &__mobile-toggle {
    display: flex;
    color: rgba(255, 255, 255, 0.7);
    @include focus-ring;
    border-radius: $radius-sm;
    padding: $space-1;

    &:hover {
      color: #ffffff;
    }

    @include respond-to('lg') {
      display: none;
    }
  }

  // Mobile menu
  &__mobile-menu {
    position: absolute;
    top: $nav-height;
    left: 0;
    right: 0;
    background: rgba(16, 21, 26, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: $space-4 $space-6 $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-4;

    @include respond-to('lg') {
      display: none;
    }
  }

  &__mobile-categories {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__mobile-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $space-3 $space-4;
    font-size: $text-base;
    font-weight: $weight-medium;
    color: rgba(255, 255, 255, 0.7);
    border-radius: $radius-md;
    transition: color $transition-fast, background-color $transition-fast;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }
  }

  &__mobile-cta {
    padding: $space-3 $space-4;
    background: $color-brand-yellow;
    color: #0a0f14;
    font-weight: $weight-bold;
    font-family: $font-brand;
    font-style: italic;
    border-radius: 8px;
    text-align: center;
    font-size: $text-sm;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
