import { onMounted } from 'vue'
import ScrollReveal from 'scrollreveal'

export const useScrollReveal = () => {
  let sr

  onMounted(() => {
    sr = ScrollReveal({
      origin: 'bottom',
      distance: '60px',
      duration: 1600,
      delay: 250,
      reset: false,
      opacity: 0,
      easing: 'cubic-bezier(0.5, 0, 0, 1)',
      viewFactor: 0.3,
    })

    sr.reveal('.sidebar .sr-item', { interval: 120 })
    sr.reveal('.sidebar .sr-item-1', { delay: 0 })
    sr.reveal('.sidebar .sr-item-2', { delay: 120 })
    sr.reveal('.sidebar .sr-item-3', { delay: 240 })
    sr.reveal('.sidebar .sr-item-4', { delay: 360 })
    sr.reveal('.sidebar .sr-item-5', { delay: 480 })
  })

  return { ScrollReveal }
}
