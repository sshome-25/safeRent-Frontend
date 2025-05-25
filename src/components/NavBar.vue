<template>
  <header class="header">
    <div class="container">
      <div class="logo"><router-link to="/">Safe Rent</router-link></div>
      <nav>
        <ul>
          <!-- <li><router-link to="/">홈</router-link></li> -->
          <li><router-link to="/community">게시판</router-link></li>
          <!-- 로그인 상태에 따라 다른 UI 표시 -->
          <li v-if="!isLoggedIn">
            <button class="login-btn" @click="goToLogin">로그인</button>
          </li>
          <li v-else>
            <div class="user-menu">
              <router-link to="/mypage" class="mypage-btn">마이페이지</router-link>
              <button class="logout-btn" @click="handleLogout">로그아웃</button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

export default {
  name: 'NavBar',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    // storeToRefs로 반응형 상태 추출 (중요!)
    const { isLoggedIn } = storeToRefs(authStore);

    // 로그아웃 핸들러
    const handleLogout = () => {
      authStore.logout();
      router.push('/');
    };

    // 로그인 페이지로 이동하는 함수
    const goToLogin = () => {
      // 현재 경로를 저장하여 로그인 후 돌아올 수 있도록 함 (선택적)
      const currentRoute = router.currentRoute.value.fullPath;
      if (currentRoute !== '/login') {
        router.push({
          path: '/login',
          query: currentRoute !== '/' ? { redirect: currentRoute } : {}
        });
      }
    };

    return {
      isLoggedIn,
      handleLogout,
      goToLogin,
    };
  }
}
</script>

<style scoped>
.header {
  background-color: #f8f9fa;
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin-bottom: 0;
  font-size: 36px;
  font-weight: bold;
  color: #333;

}


.logo a {
  text-decoration: none;
  color: var(--primary-color)
}

nav ul {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

nav ul li {
  margin-left: 20px;
  font-size: 24px;
}

nav ul li a {
  text-decoration: none;
  color: #333;
}

.login-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.user-menu {
  display: flex;
  gap: 10px;
}

.mypage-btn, .logout-btn {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 18px;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
}

.mypage-btn {
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  display: inline-block;
}
</style>