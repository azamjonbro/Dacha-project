<template>
  <div class="container app">
    <Navbar />
    <Main/>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    Navbar: defineAsyncComponent(() =>
      import('./components/Navbar.vue')
    ),
    Main: defineAsyncComponent(() =>
      import('./components/Main.vue')
    ) 
  }
}
</script>
<style >
.app{
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
