import { createRouter, createWebHistory } from 'vue-router'

import LandingPage from '@/pages/landing/index.vue'
import DiagnosisPage from '@/pages/diagnosis/index.vue'
import MapPage from '@/pages/map/index.vue'
import CommunityPage from '@/pages/community/index.vue'

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
  },
  {
    path: '/community',
    name: 'community',
    component: CommunityPage
  }
]
})

export default router