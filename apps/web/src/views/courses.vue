<script setup lang="ts">

const a = ref(1)
const change = () => {
  a.value++
}
</script>

<template>
 <A :a="a" @change="change"/>
</template>

<style scoped>

</style>