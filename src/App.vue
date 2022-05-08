<script setup lang="ts">
import { useStore } from 'vuex4';

const store = useStore()
console.log(store)
const add = () => {
  store.commit('user/setA', 999)
}
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  {{store.getters['user/b']}}
  <button @click="add">点击</button>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
