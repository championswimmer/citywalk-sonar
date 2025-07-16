<script setup lang="ts">
import { inject } from 'vue';
import TheWelcome from '../components/TheWelcome.vue'

const geocoding = inject<google.maps.GeocodingLibrary>('geocoding')

console.log(geocoding)


</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
