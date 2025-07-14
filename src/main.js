import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vueUuid from "vue-uuid"
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(vueUuid)

app.mount('#app')
