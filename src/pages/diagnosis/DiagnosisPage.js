import axios from "axios";
import kakaoMapService from "./services/kakaoMapService";
import fileUploadService from "./services/fileUploadService";

export default {
  name: "diagnosisPage",
  data() {
    return {
      currentStep: 1,
      propertyData: {
        type: "아파트",
        address: "",
        detailAddress: "",
        size: "",
        deposit: "",
        contractDate: "",
        latitude: null,
        longitude: null,
      },
      documentFiles: {
        register: null,
        contract: null,
      },
      isAnalyzing: false,
      analysisStatus: "문서 스캔 중...",
      safetyScore: 85,
      overallAssessment:
        "이 매물은 대체로 안전하나, 일부 주의가 필요한 사항이 발견되었습니다. 계약 시 특약사항을 확인하고 적절한 조치를 취하시기 바랍니다.",
      issues: [
        {
          level: "warning",
          label: "특약사항 주의",
          title: "위험 특약 조항 발견",
          description:
            '계약서 특약조항 중 "임차인은 임대인의 채무불이행에 대해 책임을 묻지 않는다"는 조항이 발견되었습니다. 이는 임차인의 권리를 제한할 수 있는 불공정 조항입니다.',
          solution:
            "해당 특약조항의 삭제 또는 수정을 요청하세요. 임대인의 의무를 면제하는 조항은 법적으로 무효가 될 수 있으나, 분쟁 예방을 위해 계약 전 수정하는 것이 좋습니다.",
        },
        {
          level: "caution",
          label: "근저당권 확인",
          title: "근저당권 설정액 주의",
          description:
            "해당 매물에 총 2억원의 근저당권이 설정되어 있습니다. 전세금 3억원에 비해 위험 수준은 아니지만, 주의가 필요합니다.",
          solution:
            "전세권 설정 및 전세보증보험 가입을 통해 보증금을 보호하세요. 계약 후 즉시 전입신고와 확정일자를 받는 것도 중요합니다.",
        },
      ],
      recommendations: [
        "전세권 설정: 등기부등본에 전세권을 설정하여 법적 우선권을 확보하세요.",
        "전세보증보험 가입: 보증금 반환을 보장받기 위해 전세보증보험에 가입하는 것을 추천합니다.",
        "계약서 특약사항 수정: 발견된 위험 특약조항을 수정 또는 삭제하고 계약을 진행하세요.",
        "확정일자 및 전입신고: 계약 체결 후 즉시 확정일자를 받고 전입신고를 진행하세요.",
      ],
      marketData: {
        averageDeposit: 31000,
        depositRange: "2억 8천만원 ~ 3억 3천만원",
      },
    };
  },

  mounted() {
    // 카카오맵 스크립트 로드
    kakaoMapService.loadKakaoMapScript();
  },

  computed: {
    progressPercentage() {
      return ((this.currentStep - 1) * 100) / 3;
    },
    canProceed() {
      if (this.currentStep === 1) {
        return (
          this.propertyData.type &&
          this.propertyData.address &&
          this.propertyData.deposit
        );
      } else if (this.currentStep === 2) {
        return this.documentFiles.register !== null;
      } else if (this.currentStep === 3) {
        return this.documentFiles.contract !== null;
      }
      return true;
    },
  },

  methods: {
    // 단계 이동 관련 메소드
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep -= 1;
      }
    },

    nextStep() {
      if (this.currentStep < 4 && this.canProceed) {
        this.currentStep += 1;

        if (this.currentStep === 4) {
          this.startAnalysis();
        }
      }
    },

    // 카카오맵 관련 메소드
    updateAddress(address) {
      this.propertyData.address = address;
    },

    async openKakaoAddressSearch() {
      try {
        const addressData = await kakaoMapService.openAddressSearch();
        if (addressData) {
          this.propertyData.address = addressData.address;

          const coords = await kakaoMapService.getCoordinates(
            this.propertyData.address
          );
          this.propertyData.latitude = coords.lat;
          this.propertyData.longitude = coords.lng;

          // 지도 표시
          this.$nextTick(() => {
            const mapContainer = document.querySelector(".map-container");
            if (mapContainer) {
              kakaoMapService.displayMap(
                mapContainer,
                coords.lat,
                coords.lng,
                this.propertyData.address
              );
            }
          });
        }
      } catch (error) {
        console.error("주소 검색 중 오류 발생:", error);
        alert("주소를 검색하는 중 오류가 발생했습니다.");
      }
    },

    // 파일 업로드 관련 메소드
    triggerFileUpload(fileType) {
      const refName =
        fileType === "register" ? "registerFileInput" : "contractFileInput";
      this.$refs[refName].click();
    },

    handleFileSelect(event, fileType) {
      const file = event.target.files[0];
      if (file) {
        const validationResult = fileUploadService.validateFile(file);
        if (validationResult.valid) {
          this.documentFiles[fileType] = file;
        } else {
          alert(validationResult.error);
        }
      }
    },

    handleFileDrop(event, fileType) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        const validationResult = fileUploadService.validateFile(file);
        if (validationResult.valid) {
          this.documentFiles[fileType] = file;
        } else {
          alert(validationResult.error);
        }
      }
    },

    removeFile(fileType) {
      this.documentFiles[fileType] = null;
      const refName =
        fileType === "register" ? "registerFileInput" : "contractFileInput";
      if (this.$refs[refName]) {
        this.$refs[refName].value = "";
      }
    },

    formatFileSize(size) {
      return fileUploadService.formatFileSize(size);
    },

    // 분석 관련 메소드
    async startAnalysis() {
      this.isAnalyzing = true;

      // 1. 먼저 게스트 토큰을 받아옴
      const tokenResponse = await this.getGuestToken();
      const token = tokenResponse.token; // 서버 응답에 따라 구조가 달라질 수 있음

      // 여기서 넘깁니다.
      this.sendAssessmentRequest(
        token,
        this.this.propertyData.latitude,
        this.propertyData.longitude,
        this.propertyData.price,
        this.documentFiles.registerFile,
        this.documentFiles.contractFile
      );

      // 분석 완료 (실제로는 API 호출 결과 처리)
      setTimeout(() => {
        this.isAnalyzing = false;
      }, 9000);
    },

    async getGuestToken() {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/assessments/guest-token"
        );

        console.log("토큰 수신 완료:", response.data);
        return response.data; // 서버에서 반환된 토큰을 리턴
      } catch (error) {
        console.error("토큰 요청 오류:", error);
        throw error;
      }
    },

    async sendAssessmentRequest(
      token,
      latitude,
      longitude,
      price,
      registerFile,
      contractFile
    ) {
      try {
        // FormData 객체 생성
        const formData = new FormData();

        // JSON 데이터를 Blob으로 변환하여 FormData에 추가
        const assessmentRequest = {
          latitude: latitude,
          longitude: longitude,
          price: price,
        };

        // JSON 데이터를 FormData에 추가
        formData.append(
          "assessmentRequest",
          new Blob([JSON.stringify(assessmentRequest)], {
            type: "application/json",
          })
        );

        // 파일 추가
        formData.append("register_file", registerFile);
        formData.append("contract_file", contractFile);

        // API 요청 보내기
        const response = await axios.post(
          "http://localhost:8080/api/assessments/guest",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, // 토큰을 헤더에 추가
            },
          }
        );

        // 응답 처리
        console.log("응답 결과:", response.data);
        return response.data;
      } catch (error) {
        console.error("오류 발생:", error);
        throw error;
      }
    },

    // UI 헬퍼 메소드
    getSafetyScoreClass() {
      if (this.safetyScore >= 80) return "score-high";
      if (this.safetyScore >= 60) return "score-medium";
      return "score-low";
    },

    getTagClass(level) {
      if (level === "danger") return "tag-danger";
      if (level === "warning") return "tag-warning";
      if (level === "caution") return "tag-caution";
      return "tag-info";
    },

    getIssueCardClass(level) {
      if (level === "danger") return "issue-danger";
      if (level === "warning") return "issue-warning";
      if (level === "caution") return "issue-caution";
      return "issue-info";
    },

    getIssueLevelClass(level) {
      if (level === "danger") return "level-danger";
      if (level === "warning") return "level-warning";
      if (level === "caution") return "level-caution";
      return "level-info";
    },

    getIssueLevelText(level) {
      if (level === "danger") return "위험";
      if (level === "warning") return "경고";
      if (level === "caution") return "주의";
      return "정보";
    },

    // 데이터 포맷 관련 메소드
    formatCurrency(value) {
      return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value * 10000);
    },

    getPriceComparisonClass() {
      const ratio = this.propertyData.deposit / this.marketData.averageDeposit;
      if (ratio > 1.1) return "price-high";
      if (ratio < 0.9) return "price-low";
      return "price-normal";
    },

    getPriceComparisonText() {
      const ratio = this.propertyData.deposit / this.marketData.averageDeposit;
      const percent = Math.abs((ratio - 1) * 100).toFixed(1);

      if (ratio > 1.1) return `시세보다 ${percent}% 높음`;
      if (ratio < 0.9) return `시세보다 ${percent}% 낮음`;
      return `시세 수준`;
    },

    // 액션 버튼 메소드
    downloadReport() {
      alert(
        "상세 보고서 다운로드 기능은 실제 구현 시 PDF 생성 라이브러리를 연동하세요."
      );
    },

    shareResult() {
      alert("결과 공유 기능은 실제 구현 시 소셜 공유 기능을 연동하세요.");
    },
  },
};
