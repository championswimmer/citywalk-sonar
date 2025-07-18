<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <navbar>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </navbar>

  <header>
    <h1>CityWalk</h1>
  </header>

  <RouterView />
</template>

<style scoped>
navbar {
  display: block;
  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
  margin-bottom: 2rem;
}

nav {
  width: 100%;
  text-align: center;
  font-size: 1rem;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  margin: 0 0.5rem;
  border-radius: 4px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.3s ease;
}

nav a:hover {
  background-color: var(--color-background-mute);
}

nav a.router-link-exact-active {
  color: var(--color-text);
  background-color: var(--color-background-mute);
  font-weight: 600;
}

nav a.router-link-exact-active:hover {
  background-color: var(--color-background-mute);
}

header {
  line-height: 1.5;
  text-align: center;
  padding: 2rem 0;
}

.logo {
  display: block;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  navbar {
    padding: 1rem 2rem;
  }

  nav {
    text-align: left;
  }

  header {
    padding: 3rem 0;
  }
}
</style>
