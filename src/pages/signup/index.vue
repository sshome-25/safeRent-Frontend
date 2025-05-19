<template>
    <div class="register-page">
      <div class="auth-container">
        <div class="auth-header">
          <div class="logo" @click="$router.push('/')">안심전세</div>
          <h1 class="auth-title">회원가입</h1>
          <p class="auth-subtitle">안전한 전세 계약을 위한 서비스에 가입하세요</p>
        </div>
        
        <div class="auth-content">
          <div class="auth-tabs">
            <button 
              class="auth-tab" 
              :class="{ active: activeTab === 'email' }" 
              @click="activeTab = 'email'"
            >
              이메일로 가입
            </button>
          </div>
          
          <!-- 이메일 회원가입 폼 -->
          <form v-if="activeTab === 'email'" class="auth-form" @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="email">이메일</label>
              <div class="input-with-icon">
                <i class="fas fa-envelope"></i>
                <input 
                  type="email" 
                  id="email" 
                  v-model="email" 
                  required 
                  placeholder="이메일 주소를 입력하세요"
                  :class="{ 'input-error': errors.email }"
                />
              </div>
              <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
            </div>
            
            <div class="form-group">
              <label for="name">닉네임</label>
              <div class="input-with-icon">
                <i class="fas fa-user"></i>
                <input 
                  type="text" 
                  id="name" 
                  v-model="name" 
                  required 
                  placeholder="닉네임을 입력하세요"
                  :class="{ 'input-error': errors.name }"
                />
              </div>
              <div class="error-message" v-if="errors.name">{{ errors.name }}</div>
            </div>
            
            <div class="form-group">
              <label for="password">비밀번호</label>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="password" 
                  required 
                  placeholder="비밀번호를 입력하세요 (8자 이상)"
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
              
              <div class="password-strength" v-if="password">
                <div class="strength-label">비밀번호 강도:</div>
                <div class="strength-bars">
                  <div class="strength-bar" :class="getStrengthClass(1)"></div>
                  <div class="strength-bar" :class="getStrengthClass(2)"></div>
                  <div class="strength-bar" :class="getStrengthClass(3)"></div>
                  <div class="strength-bar" :class="getStrengthClass(4)"></div>
                </div>
                <div class="strength-text">{{ passwordStrengthText }}</div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">비밀번호 확인</label>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  id="confirmPassword" 
                  v-model="confirmPassword" 
                  required 
                  placeholder="비밀번호를 다시 입력하세요"
                  :class="{ 'input-error': errors.confirmPassword }"
                />
                <button 
                  type="button" 
                  class="toggle-password" 
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
            </div>
            
            <div class="form-group terms">
              <label class="checkbox-container">
                <input type="checkbox" v-model="agreeTerms" />
                <span class="checkmark"></span>
                <span>
                  <a href="#" @click.prevent="showTermsModal = true">이용약관</a> 및 
                  <a href="#" @click.prevent="showPrivacyModal = true">개인정보 처리방침</a>에 동의합니다.
                </span>
              </label>
              <div class="error-message" v-if="errors.terms">{{ errors.terms }}</div>
            </div>
            
            <button type="submit" class="auth-button" :disabled="isLoading">
              <span v-if="!isLoading">회원가입</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </form>
        </div>
        
        <div class="auth-footer">
          <p>이미 회원이신가요? <router-link to="/login" class="login-link">로그인</router-link></p>
        </div>
      </div>
      
      <!-- 이용약관 모달 -->
      <div class="modal" v-if="showTermsModal" @click.self="showTermsModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>이용약관</h2>
            <button class="close-modal" @click="showTermsModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <h3>안심전세 서비스 이용약관</h3>
            <p>제 1조 (목적)</p>
            <p>이 약관은 안심전세 서비스(이하 "서비스")의 이용조건 및 절차, 이용자와 회사의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
            
            <p>제 2조 (약관의 효력 및 변경)</p>
            <p>1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</p>
            <p>2. 회사는 합리적인 사유가 있는 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내에 공지함으로써 효력이 발생합니다.</p>
            
            <!-- 이용약관 내용 추가 -->
          </div>
          <div class="modal-footer">
            <button class="modal-button" @click="showTermsModal = false">확인</button>
          </div>
        </div>
      </div>
      
      <!-- 개인정보 처리방침 모달 -->
      <div class="modal" v-if="showPrivacyModal" @click.self="showPrivacyModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>개인정보 처리방침</h2>
            <button class="close-modal" @click="showPrivacyModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <h3>안심전세 개인정보 처리방침</h3>
            <p>안심전세(이하 "회사")는 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 따라 이용자의 개인정보를 보호하고 있습니다.</p>
            
            <p>1. 수집하는 개인정보 항목 및 수집 방법</p>
            <p>회사는 회원가입, 서비스 이용 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
            <ul>
              <li>필수 항목: 이메일 주소, 닉네임, 비밀번호</li>
              <li>선택 항목: 휴대폰 번호, 주소</li>
              <li>자동 수집 항목: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보</li>
            </ul>
            
            <!-- 개인정보 처리방침 내용 추가 -->
          </div>
          <div class="modal-footer">
            <button class="modal-button" @click="showPrivacyModal = false">확인</button>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>
    import SignupPage from './SignupPage';
    export default SignupPage;
</script>
  
<style scoped>
    @import './signup.css';
</style>