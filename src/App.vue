<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import { useAuthStore } from '@/stores/auth'
import '@/pages/landing/landing-page.css';

export default {
  name: 'App',
  components: {
    NavBar
  },
  setup() {
    const authStore = useAuthStore()

    // 애플리케이션 시작 시 인증 상태 확인
    authStore.checkAuth()
  }
}
</script>

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
