import { ref } from 'vue'

const toastMessage = ref('')
let timer = null

export function useToast() {
  function notify(message) {
    toastMessage.value = message
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      toastMessage.value = ''
    }, 3200)
  }

  function dismiss() {
    toastMessage.value = ''
    if (timer) clearTimeout(timer)
  }

  return { toastMessage, notify, dismiss }
}
