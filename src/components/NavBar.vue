<script setup lang="ts">
import { BNavbar, BNavbarBrand, BNavbarToggle, BCollapse, BNavbarNav, BNavItem } from 'bootstrap-vue-next'
</script>

<template>
  <BNavbar toggleable="lg" class="container-fluid" type="light" variant="light">
    <BNavbarBrand to="/">CityWalk</BNavbarBrand>

    <BNavbarToggle target="nav-collapse"></BNavbarToggle>

    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem to="/" exact-active-class="active">Home</BNavItem>
        <BNavItem to="/about" exact-active-class="active">About</BNavItem>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>
