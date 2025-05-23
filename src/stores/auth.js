// stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  // 상태 정의
  state: () => ({
    token: localStorage.getItem('userToken') || '',
    userId: localStorage.getItem('userId') || null,
    isLoggedIn: !!localStorage.getItem('userToken')
  }),
  
  // 게터
  getters: {
    // 필요한 경우 추가 게터 정의
  },
  
  // 액션 (상태를 변경하는 메서드)
  actions: {
    // 토큰 설정 및 로그인 상태 업데이트
    setToken(token) {
      this.token = token;
      this.isLoggedIn = !!token;

      // localStorage에 토큰 저장
      if (token) {
        localStorage.setItem('userToken', token);
      } else {
        localStorage.removeItem('userToken');
      }
    },
    
    // 사용자 정보 설정
    setUser(userId) {
      this.userId = userId;

      if (userId) {
        localStorage.setItem('userId', userId);
      } else {
        localStorage.removeItem('userId');
      }
    },
    
    // 로그인 액션
    async login(loginData) {
      try {
        const response = await axios.post('http://localhost:8080/api/user/login', loginData);
        // 토큰 및 로그인 상태 설정
        this.setToken(response.data.token);
        
        // 사용자 정보가 포함된 경우 설정
        if (response.data.userId) {
          this.setUser(response.data.userId);
        }
        
        return { success: true, data: response.data };
      } catch (error) {
        console.error('로그인 실패:', error);
        
        return { 
          success: false, 
          error: error.response?.data?.message || 
                 error.response?.data?.error || 
                 '로그인 중 오류가 발생했습니다.' 
        };
      }
    },
    
    // 로그아웃 액션
    logout() {
      this.setToken('');
      this.user = null;
    },
    
    // 인증 상태 체크 (토큰 유효성 검증 등)
    async checkAuth() {
      // TODO: 토큰이 있을 경우 유효성 검증 또는 사용자 정보 조회 
    }
  }
});