<template>
  <header class="header">
    <div class="container">
      <div class="logo"><router-link to="/">Safe Rent</router-link></div>
      <nav>
        <ul>
          <!-- <li><router-link to="/">홈</router-link></li> -->
          <li><router-link to="/diagnosis" class="community-btn">매물 진단</router-link></li>
          <li><router-link to="/map" class="community-btn">안전 매물 찾기</router-link></li>
          <li><router-link to="/community" class="community-btn">게시판</router-link></li>
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
/* .header {
  background-color: #f8f9fa;
  padding: 5px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
} */
.header {
  background-color: #f8f9fa;
  padding: 5px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  /* 그림자 강도 증가 및 아래쪽으로 확장 */
  z-index: 1000;
  position: relative;
  /* 레이아웃 안정화 */
  /* 다른 요소 위에 표시되도록 설정 */
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
  font-size: 20px;
}

nav ul li a {
  text-decoration: none;
  color: #333;
}


.community-btn {
  background: none;
  border: none;
  /* color: var(--primary-color); */
  font-size: 19px;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, text-shadow 0.2s, transform 0.2s;
  outline: none;
  box-shadow: none;
}

.community-btn:hover {
  color: var(--secondary-color);
  text-shadow: 0 2px 8px rgba(0, 85, 179, 0.15);
  transform: scale(1.2);
}

.login-btn,
.mypage-btn,
.logout-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 17px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, text-shadow 0.2s, transform 0.2s;
  outline: none;
  box-shadow: none;
}

.login-btn:hover,
.mypage-btn:hover,
.logout-btn:hover,
.login-btn:focus,
.mypage-btn:focus,
.logout-btn:focus {
  color: var(--secondary-color);
  text-shadow: 0 2px 8px rgba(0, 85, 179, 0.15);
  transform: scale(1.08);
}

.user-menu {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>