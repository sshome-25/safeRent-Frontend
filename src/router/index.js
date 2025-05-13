import { createRouter, createWebHistory } from 'vue-router'

import LandingPage from '@/components/LandingPage.vue'
import DiagnosisPage from '@/components/Diagnosis.vue'
import MapPage from '@/components/MapPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
  {
    path: '/',
    name: 'landing',
    component: LandingPage
  },
  {
    path: '/diagnosis',
    name: 'diagnosis',
    component: DiagnosisPage
  },
  {
    path: '/map',
    name: 'map',
    component: MapPage
  }
]
})

export default router