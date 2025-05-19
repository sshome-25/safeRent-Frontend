export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
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
      if (!this.email) {
        this.errors.email = "이메일을 입력해주세요.";
        isValid = false;
      } else if (!emailRegex.test(this.email)) {
        this.errors.email = "유효한 이메일 주소를 입력해주세요.";
        isValid = false;
      }

      // 비밀번호 유효성 검사
      if (!this.password) {
        this.errors.password = "비밀번호를 입력해주세요.";
        isValid = false;
      } else if (this.password.length < 6) {
        this.errors.password = "비밀번호는 최소 6자리 이상이어야 합니다.";
        isValid = false;
      }

      return isValid;
    },

    handleLogin() {
      if (!this.validateForm()) return;

      this.isLoading = true;

      // 실제 구현에서는 API 호출로 대체
      setTimeout(() => {
        // 로그인 성공 시뮬레이션
        localStorage.setItem("user", JSON.stringify({ email: this.email }));

        // 로딩 상태 해제
        this.isLoading = false;

        // 메인 페이지 또는 이전 페이지로 리다이렉트
        const redirectPath = this.$route.query.redirect || "/";
        this.$router.push(redirectPath);
      }, 1500);
    },

    socialLogin(provider) {
      // 실제 구현에서는 OAuth 프로바이더로 리다이렉트
      alert(
        `${provider} 로그인은 실제 구현 시 해당 서비스의 OAuth 인증과 연동됩니다.`
      );
    },
  },
};
