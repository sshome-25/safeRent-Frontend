<template>
  <div class="login-page">
    <div class="auth-container">
      <div class="auth-header">
        <div class="logo" @click="$router.push('/')">안심전세</div>
        <h1 class="auth-title">로그인</h1>
        <p class="auth-subtitle">안전한 전세 계약을 위한 서비스를 이용해보세요</p>
      </div>
      
      <div class="auth-content">
        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">이메일</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope"></i>
              <input 
                type="email" 
                id="email" 
                v-model="loginData.email" 
                required 
                placeholder="이메일 주소를 입력하세요"
                :class="{ 'input-error': errors.email }"
              />
            </div>
            <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
          </div>
          
          <div class="form-group">
            <div class="label-with-link">
              <label for="password">비밀번호</label>
              <router-link to="/forgot-password" class="forgot-password">비밀번호 찾기</router-link>
            </div>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="loginData.password" 
                required 
                placeholder="비밀번호를 입력하세요"
                :class="{ 'input-error': errors.password }"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
          </div>
          
          <div class="remember-me">
            <label class="checkbox-container">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              로그인 상태 유지
            </label>
          </div>
          
          <button type="submit" class="auth-button" :disabled="isLoading">
            <span v-if="!isLoading">로그인</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </form>

      </div>
      
      <div class="auth-footer">
        <p>아직 회원이 아니신가요? <router-link to="/signup" class="signup-link">회원가입</router-link></p>
      </div>
    </div>
  </div>
</template>
  
<script>
  import LoginPage from './LoginPage';
  export default LoginPage;
</script>

<style scoped>
  @import './login.css';
</style>
