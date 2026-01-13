<template>
  <div class="container">
    <h1>Dacha holati</h1>

    <div :class="['status', status]">
      {{ status === 'band' ? '❌ BAND' : '✅ BO‘SH' }}
    </div>

    <button @click="toggle">
      Holatni o‘zgartirish
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const status = ref(localStorage.getItem('dacha') || 'bo‘sh')

function toggle() {
  status.value = status.value === 'band' ? 'bo‘sh' : 'band'
  localStorage.setItem('dacha', status.value)
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.status {
  padding: 20px 40px;
  font-size: 24px;
  border-radius: 10px;
}

.band {
  background: #ffcccc;
}

.bo‘sh {
  background: #ccffcc;
}

button {
  padding: 12px 24px;
  font-size: 16px;
}
</style>
