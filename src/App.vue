<template>
  <div v-if="show" class="install-box">
    <button @click="install">
      📲 Ilovani o‘rnatish
    </button>

    <!-- iOS instruction -->
    <p v-if="isIOS" class="hint">
      Safari → Share ⬆️ → <b>Add to Home Screen</b>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)
const isIOS = ref(false)
let deferredPrompt = null

onMounted(() => {
  isIOS.value = /iphone|ipad|ipod/i.test(navigator.userAgent)

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    show.value = true
  })

  // iOS uchun: agar standalone bo‘lmasa, ko‘rsat
  if (isIOS.value && !window.navigator.standalone) {
    show.value = true
  }
})

async function install() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    deferredPrompt = null
    show.value = false
  }
}
</script>

<style scoped>
.install-box {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  text-align: center;
}

button {
  padding: 10px 16px;
  font-size: 16px;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 8px;
}

.hint {
  margin-top: 8px;
  font-size: 14px;
  color: #555;
}
</style>
