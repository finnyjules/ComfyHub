import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip)

gsap.defaults({
  ease: 'power2.out',
  duration: 0.6,
})

export { gsap, ScrollTrigger, ScrollSmoother, Flip }
