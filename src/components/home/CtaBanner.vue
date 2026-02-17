<script setup>
import { ref, onMounted } from 'vue'
import { useGsap } from '../../composables/useGsap.js'

const sectionRef = ref(null)
const headlineRef = ref(null)
const subtextRef = ref(null)
const buttonRef = ref(null)

const { gsap, animate, prefersReducedMotion } = useGsap()

onMounted(() => {
  if (prefersReducedMotion || !sectionRef.value) return

  animate(() => {
    // Gradient angle shift on scroll
    gsap.fromTo(
      sectionRef.value,
      { '--gradient-angle': '135deg' },
      {
        '--gradient-angle': '195deg',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
        ease: 'none',
      }
    )

    // Headline clip-path reveal
    if (headlineRef.value) {
      gsap.from(headlineRef.value, {
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.8,
        ease: 'power2.inOut',
      })

      gsap.set(headlineRef.value, { clipPath: 'inset(0 0% 0 0)', delay: 1.2 })
    }

    // Subtext fade up
    if (subtextRef.value) {
      gsap.from(subtextRef.value, {
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'power3.out',
      })
    }

    // Button scale-in + glow pulse
    if (buttonRef.value) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        delay: 0.5,
      })

      tl.from(buttonRef.value, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(2)',
      })
      tl.to(buttonRef.value, {
        boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
        duration: 0.4,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1,
      })
    }
  })
})
</script>

<template>
  <section ref="sectionRef" class="cta-banner">
    <div class="cta-banner__container">
      <h2 ref="headlineRef" class="cta-banner__headline">Share your creativity.</h2>
      <p ref="subtextRef" class="cta-banner__subtext">Publish your workflow to the ComfyUI community today.</p>
      <a ref="buttonRef" href="/search" class="cta-banner__button">Submit Workflow</a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.cta-banner {
  background: linear-gradient(var(--gradient-angle, 135deg), $color-primary 0%, $color-primary-dark 100%);
  padding: $space-10 0;

  &__container {
    @include container;
    text-align: center;
  }

  &__headline {
    font-size: $text-3xl;
    font-weight: $weight-bold;
    color: #fff;
    margin: 0 0 $space-2;
  }

  &__subtext {
    font-size: $text-lg;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 $space-6;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    padding: $space-3 $space-6;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: $radius-md;
    transition: background $transition-fast, border-color $transition-fast;
    @include focus-ring;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }

  @include respond-below('md') {
    padding: $space-8 0;

    &__headline {
      font-size: $text-2xl;
    }

    &__subtext {
      font-size: $text-base;
    }
  }
}
</style>
