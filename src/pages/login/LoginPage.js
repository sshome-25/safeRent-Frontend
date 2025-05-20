import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: "LoginPage",
  
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    
    return { authStore, router };
  },

  data() {
    return {
      loginData: {
        email: "",
        password: "",  
      },
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      errors: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors.email = "";
      this.errors.password = "";

      // 이메일 유효성 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.loginData.email) {
        this.errors.email = "이메일을 입력해주세요.";
        isValid = false;
      } else if (!emailRegex.test(this.loginData.email)) {
        this.errors.email = "유효한 이메일 주소를 입력해주세요.";
        isValid = false;
      }

      // 비밀번호 유효성 검사
      if (!this.loginData.password) {
        this.errors.password = "비밀번호를 입력해주세요.";
        isValid = false;
      } else if (this.loginData.password.length < 6) {
        this.errors.password = "비밀번호는 최소 6자리 이상이어야 합니다.";
        isValid = false;
      }

      return isValid;
    },

    async handleLogin() {
      if (!this.validateForm()) return;
      this.isLoading = true;

      try {
        // Pinia 스토어의 login 액션 사용
        console.log("로그인 전" + this.authStore.isLoggedIn);
        const result = await this.authStore.login(this.loginData);
        console.log("로그인 후" + this.authStore.isLoggedIn);
        if (result.success) {
          // 로그인 성공 시 홈으로 리다이렉트
          // Vue 3
          this.router.push('/');
        } else {
          this.errorMessage = result.error;
          if (this.$toast) {
            this.$toast.error(this.errorMessage);
          }
        }
      } catch (error) {
        console.error('로그인 처리 중 오류:', error);
        this.errorMessage = '로그인 중 오류가 발생했습니다.';
        if (this.$toast) {
          this.$toast.error(this.errorMessage);
        }
      } finally {
        this.isLoading = false;
      }
    },

    socialLogin(provider) {
      // 실제 구현에서는 OAuth 프로바이더로 리다이렉트
      alert(
        `${provider} 로그인은 실제 구현 시 해당 서비스의 OAuth 인증과 연동됩니다.`
      );
    },
  },
};
