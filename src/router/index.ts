import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutTab from '../components/AboutTab.vue'
import NearbyTab from '../components/NearbyTab.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      redirect: '/about',
      children: [
        {
          path: 'about',
          name: 'about',
          component: AboutTab,
        },
        {
          path: 'nearby',
          name: 'nearby',
          component: NearbyTab,
        },
      ],
    },
  ],
})

export default router
