import axios from "axios"; // 파일 상단에 axios import 추가

export default {
  name: "SignupPage",
  data() {
    return {
      activeTab: "email",
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      isVerificationSent: false,
      remainingTime: 0,
      timerInterval: null,
      agreeTerms: false,
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
      showTermsModal: false,
      showPrivacyModal: false,
      errors: {
        email: "",
        verificationCode: "",
        name: "",
        password: "",
        confirmPassword: "",
        terms: "",
      },
    };
  },
  computed: {
    isEmailValid() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    },

    passwordStrength() {
      let strength = 0;

      if (!this.password) return 0;

      // 길이 점수
      if (this.password.length >= 8) strength += 1;

      // 문자 조합 점수
      if (/[A-Z]/.test(this.password)) strength += 1; // 대문자
      if (/[0-9]/.test(this.password)) strength += 1; // 숫자
      if (/[^A-Za-z0-9]/.test(this.password)) strength += 1; // 특수문자

      return strength;
    },

    passwordStrengthText() {
      switch (this.passwordStrength) {
        case 0:
          return "매우 약함";
        case 1:
          return "약함";
        case 2:
          return "보통";
        case 3:
          return "강함";
        case 4:
          return "매우 강함";
        default:
          return "";
      }
    },
  },
  methods: {
    getStrengthClass(level) {
      if (this.passwordStrength >= level) {
        switch (this.passwordStrength) {
          case 1:
            return "weak";
          case 2:
            return "medium";
          case 3:
            return "strong";
          case 4:
            return "very-strong";
          default:
            return "";
        }
      }
      return "";
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    },

    sendVerificationCode() {
      if (!this.isEmailValid) {
        this.errors.email = "유효한 이메일 주소를 입력해주세요.";
        return;
      }

      // 실제 구현에서는 API 호출로 인증 코드 발송
      alert(
        `${this.email}로 인증 코드를 발송했습니다. (실제 구현 시 이메일 발송 API와 연동)`
      );

      this.isVerificationSent = true;
      this.errors.email = "";

      // 인증 타이머 설정 (3분)
      this.remainingTime = 180;

      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
          clearInterval(this.timerInterval);
        }
      }, 1000);
    },

    validateForm() {
      let isValid = true;

      // 에러 메시지 초기화
      Object.keys(this.errors).forEach((key) => {
        this.errors[key] = "";
      });

      // 이메일 유효성 검사
      if (!this.email) {
        this.errors.email = "이메일을 입력해주세요.";
        isValid = false;
      } else if (!this.isEmailValid) {
        this.errors.email = "유효한 이메일 주소를 입력해주세요.";
        isValid = false;
      }

      // 인증 코드 검사
      if (this.isVerificationSent && !this.verificationCode) {
        this.errors.verificationCode = "인증 코드를 입력해주세요.";
        isValid = false;
      } else if (
        this.isVerificationSent &&
        this.verificationCode !== "123456"
      ) {
        // 테스트용 인증 코드
        this.errors.verificationCode = "인증 코드가 일치하지 않습니다.";
        isValid = false;
      }

      // 이름 검사
      if (!this.name) {
        this.errors.name = "이름을 입력해주세요.";
        isValid = false;
      } else if (this.name.length < 2) {
        this.errors.name = "이름은 최소 2자 이상이어야 합니다.";
        isValid = false;
      }

      // 비밀번호 검사
      if (!this.password) {
        this.errors.password = "비밀번호를 입력해주세요.";
        isValid = false;
      } else if (this.password.length < 8) {
        this.errors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
        isValid = false;
      } else if (this.passwordStrength < 2) {
        this.errors.password =
          "안전한 비밀번호를 사용해주세요. (대소문자, 숫자, 특수문자 조합 권장)";
        isValid = false;
      }

      // 비밀번호 확인 검사
      if (!this.confirmPassword) {
        this.errors.confirmPassword = "비밀번호 확인을 입력해주세요.";
        isValid = false;
      } else if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        isValid = false;
      }

      // 약관 동의 검사
      if (!this.agreeTerms) {
        this.errors.terms = "서비스 이용을 위해 약관에 동의해주세요.";
        isValid = false;
      }

      return isValid;
    },

    async handleRegister() {
      if (!this.validateForm()) return;

      this.isLoading = true;

      // 실제 구현에서는 API 호출로 회원가입 처리
      const signupData = {
        email: this.email,
        nickname: this.name,
        password: this.password,
      };

      console.log(signupData);

      // API 호출
      const response = await axios
        .post("http://localhost:8080/api/user/signup", signupData)
        .then((response) => {
          // 회원가입 성공
          console.log("회원가입 성공:", response.data);

          // 로그인 페이지로 리다이렉트
          this.$router.push({
            path: "/login",
            query: { registered: "true" },
          });
        })
        .catch((error) => {
          // 오류 처리
          console.error("회원가입 실패:", error);

          // 서버에서 받은 오류 메시지 표시
          let errorMessage = "회원가입 중 오류가 발생했습니다.";
          if (error.response && error.response.data) {
            errorMessage =
              error.response.data.message ||
              error.response.data.error ||
              errorMessage;
          }

          // 오류 메시지 표시 (알림 라이브러리 사용 또는 상태 변수에 저장)
          this.errorMessage = errorMessage;
          this.$toast.error(errorMessage);
        })
        .finally(() => {
          // 로딩 상태 해제
          this.isLoading = false;
        });
      console.log(response);
    },
  },
  beforeDestroy() {
    // 컴포넌트 제거 시 타이머 정리
    clearInterval(this.timerInterval);
  },
};
