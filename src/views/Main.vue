<template>
  <main role="main" class="container app">
    <Navbar @reload="reloadMain"/>
    <Main ref="mainRef"/>
  </main>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    Navbar: defineAsyncComponent(() =>
      import('../components/Navbar.vue')
    ),
    Main: defineAsyncComponent(() =>
      import('../components/Main.vue')
    ) 

  },
  methods: {
    reloadMain() {
      this.$refs.mainRef?.getAllDachas();
    },
  },
}
</script>
<style >
.app{
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
