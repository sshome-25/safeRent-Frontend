<template>
    <header class="header">
      <div class="container">
        <div class="logo">안심전세</div>
        <nav>
          <ul>
            <li><a href="#">홈</a></li>
            <li><router-link to="/">서비스 소개</router-link></li>
            <li><router-link to="/community">게시판</router-link></li>
            <!-- 로그인 상태에 따라 다른 UI 표시 -->
            <li v-if="!isLoggedIn">
              <button class="login-btn" @click="goToLogin">로그인</button>
            </li>
            <li v-else>
              <div class="user-menu">
                <router-link to="/mypage" class="mypage-btn">마이페이지</router-link>
                <button class="logout-btn" @click="logout">로그아웃</button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    name: 'NavBar',
    data() {
      return {
        isLoggedIn: false
      }
    },
    created() {
      // 컴포넌트가 생성될 때 로그인 상태 확인
      this.checkLoginStatus()
      
      // 로그인 상태 변경 이벤트 리스너 등록 (이벤트 버스 사용 시)
      // this.$eventBus.$on('login-status-changed', this.checkLoginStatus)
    },
    methods: {
      checkLoginStatus() {
        // 로컬 스토리지에서 토큰이나 로그인 정보 확인
        const token = localStorage.getItem('userToken')
        this.isLoggedIn = !!token
      },
      goToLogin() {
        // 로그인 페이지로 이동
        this.$router.push('/login')
      },
      logout() {
        // 로그아웃 처리
        localStorage.removeItem('userToken')
        this.isLoggedIn = false
        
        // 다른 컴포넌트에 로그아웃 알림 (이벤트 버스 사용 시)
        // this.$eventBus.$emit('login-status-changed')
        
        this.$router.push('/')
      }
    }
  }
  </script>
  
  <style scoped>
  .header {
    background-color: #f8f9fa;
    padding: 10px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  
  nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  nav ul li {
    margin-left: 20px;
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
  }
  
  .user-menu {
    display: flex;
    gap: 10px;
  }
  
  .mypage-btn, .logout-btn {
    padding: 8px 12px;
    cursor: pointer;
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