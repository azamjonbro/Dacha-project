<template lang="">
    <router-view></router-view>
</template>
<script>
export default {
  mounted(){
    let token = JSON.parse(localStorage.getItem("token"))
    if(!token){
      
    }
  }
}
</script>
<style lang="">
  
</style>