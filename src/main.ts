import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Loader } from '@googlemaps/js-api-loader'
import { createBootstrap } from 'bootstrap-vue-next'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

const loader = new Loader({
  apiKey: import.meta.env.GOOGLE_MAPS_API_KEY,
})

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createBootstrap())

app.use(createPinia())
app.use(router)


loader.importLibrary('geocoding').then((geocoding) => {
  console.log(geocoding)
  app.provide('geocoding', geocoding)
  app.mount('#app')

})


