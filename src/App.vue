<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <header class="container-fluid">
      <NavBar />
    </header>

    <main class="container-fluid flex-shrink-0 mb-4">
      <RouterView />
    </main>
  </div>

</template>

<style scoped></style>
