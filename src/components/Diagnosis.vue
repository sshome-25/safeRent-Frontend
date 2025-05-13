<template>
  <div class="diagnosis-page">
    <header class="header">
      <div class="container">
        <div class="logo" @click="$router.push('/')">안심전세</div>
        <nav>
          <ul>
            <li><a href="#">홈</a></li>
            <li><a href="#">서비스 소개</a></li>
            <li><router-link to="/community">게시판</router-link></li>
            <li><button class="login-btn">로그인</button></li>
          </ul>
        </nav>
      </div>
    </header>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-steps">
        <div class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">매물 정보 입력</div>
        </div>
        <div class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">등기부등본 업로드</div>
        </div>
        <div class="progress-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <div class="step-number">3</div>
          <div class="step-label">계약서 업로드</div>
        </div>
        <div class="progress-step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
          <div class="step-number">4</div>
          <div class="step-label">진단 결과</div>
        </div>
      </div>
    </div>

    <div class="container main-content">
      <!-- Step 1: 매물 정보 입력 -->
      <div v-if="currentStep === 1" class="step-content">
        <h2>매물 정보 입력</h2>
        <p class="step-description">관심 있는 매물의 기본 정보를 입력해주세요.</p>
        
        <div class="form-container">
          <div class="form-group">
            <label for="propertyType">매물 유형</label>
            <select id="propertyType" v-model="propertyData.type" class="input-field">
              <option value="">선택하세요</option>
              <option value="apartment">아파트</option>
              <option value="villa">빌라/다세대</option>
              <option value="officetel">오피스텔</option>
              <option value="house">단독주택</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="address">주소</label>
            <div class="address-container">
              <input type="text" id="address" v-model="propertyData.address" class="input-field" placeholder="도로명 주소" readonly>
              <button class="search-address-btn" @click="openAddressSearch">주소 검색</button>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="detail-address">상세 주소</label>
              <input type="text" id="detail-address" v-model="propertyData.detailAddress" class="input-field" placeholder="동/호수 입력">
            </div>
            
            <div class="form-group half">
              <label for="size">전용면적</label>
              <div class="input-with-unit">
                <input type="number" id="size" v-model="propertyData.size" class="input-field" placeholder="숫자만 입력">
                <span class="unit">㎡</span>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group half">
              <label for="deposit">전세금</label>
              <div class="input-with-unit">
                <input type="number" id="deposit" v-model="propertyData.deposit" class="input-field" placeholder="숫자만 입력">
                <span class="unit">만원</span>
              </div>
            </div>
            
            <div class="form-group half">
              <label for="contract-date">계약 예정일</label>
              <input type="date" id="contract-date" v-model="propertyData.contractDate" class="input-field">
            </div>
          </div>
        </div>
        
        <div class="map-preview">
          <h3>위치 확인</h3>
          <div class="map-container">
            <!-- 카카오맵 또는 네이버맵 등을 통해 해당 주소 지도 표시 -->
            <div class="map-placeholder">
              선택한 주소의 지도가 표시됩니다.
            </div>
          </div>
        </div>
      </div>
      
      <!-- Step 2: 등기부등본 업로드 -->
      <div v-if="currentStep === 2" class="step-content">
        <h2>등기부등본 업로드</h2>
        <p class="step-description">
          정확한 진단을 위해 발급받은 등기부등본을 업로드해주세요.
          <br>
          <span class="info-text">파일 형식: PDF, JPG, PNG (최대 10MB)</span>
        </p>
        
        <div class="upload-container">
          <div class="upload-area" @click="triggerFileUpload('register')" @dragover.prevent @drop.prevent="handleFileDrop($event, 'register')">
            <div v-if="!documentFiles.register" class="upload-placeholder">
              <div class="upload-icon">
                <i class="fa fa-upload"></i>
              </div>
              <p>클릭하여 파일 선택 또는 파일을 여기에 드래그하세요</p>
              <input ref="registerFileInput" type="file" class="file-input" @change="handleFileSelect($event, 'register')" accept=".pdf,.jpg,.jpeg,.png" hidden>
            </div>
            <div v-else class="file-preview">
              <div class="file-info">
                <div class="file-name">{{ documentFiles.register.name }}</div>
                <div class="file-size">{{ formatFileSize(documentFiles.register.size) }}</div>
              </div>
              <button class="remove-file-btn" @click.stop="removeFile('register')">삭제</button>
            </div>
          </div>
        </div>
        
        <div class="help-section">
          <h3>등기부등본이란?</h3>
          <p>
            등기부등본은 부동산의 소유 현황, 권리관계, 담보설정 등 중요한 정보가 기재된 공적 문서입니다.
            전세계약 체결 전에 반드시 확인해야 하는 필수 서류입니다.
          </p>
          
          <div class="tips-box">
            <h4>등기부등본 확인 포인트</h4>
            <ul>
              <li>
                <strong>소유권 관계</strong>: 실제 집주인과 계약 상대방이 일치하는지 확인
              </li>
              <li>
                <strong>근저당권 설정</strong>: 근저당권 설정액이 시세 대비 적절한지 확인
              </li>
              <li>
                <strong>압류, 가압류</strong>: 재산권에 제한이 있는지 확인
              </li>
              <li>
                <strong>전세권 설정 여부</strong>: 이전 세입자의 전세권이 말소되었는지 확인
              </li>
            </ul>
          </div>
          
          <div class="get-document-info">
            <h4>등기부등본 발급 방법</h4>
            <p>
              인터넷 등기소(<a href="http://www.iros.go.kr" target="_blank">www.iros.go.kr</a>), 
              정부24(<a href="http://www.gov.kr" target="_blank">www.gov.kr</a>)에서 발급 가능합니다.
              발급 수수료는 1통당 1,000원입니다.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Step 3: 계약서 업로드 -->
      <div v-if="currentStep === 3" class="step-content">
        <h2>계약서 업로드</h2>
        <p class="step-description">
          계약서 내용을 분석하여 특약사항의 위험성을 진단해 드립니다.
          <br>
          <span class="info-text">파일 형식: PDF, JPG, PNG (최대 10MB)</span>
        </p>
        
        <div class="upload-container">
          <div class="upload-area" @click="triggerFileUpload('contract')" @dragover.prevent @drop.prevent="handleFileDrop($event, 'contract')">
            <div v-if="!documentFiles.contract" class="upload-placeholder">
              <div class="upload-icon">
                <i class="fa fa-upload"></i>
              </div>
              <p>클릭하여 파일 선택 또는 파일을 여기에 드래그하세요</p>
              <input ref="contractFileInput" type="file" class="file-input" @change="handleFileSelect($event, 'contract')" accept=".pdf,.jpg,.jpeg,.png" hidden>
            </div>
            <div v-else class="file-preview">
              <div class="file-info">
                <div class="file-name">{{ documentFiles.contract.name }}</div>
                <div class="file-size">{{ formatFileSize(documentFiles.contract.size) }}</div>
              </div>
              <button class="remove-file-btn" @click.stop="removeFile('contract')">삭제</button>
            </div>
          </div>
        </div>
        
        <div class="help-section">
          <h3>계약서 특약사항 주의점</h3>
          <p>
            임대차계약서의 특약사항에는 보증금 반환과 관련된 중요한 내용이 포함될 수 있습니다.
            다음과 같은 내용이 있는지 주의 깊게 살펴보세요.
          </p>
          
          <div class="tips-box">
            <h4>위험한 특약사항 예시</h4>
            <ul>
              <li>
                <strong>선순위 보증금에 대한 책임 전가</strong>: 임차인이 선순위 보증금에 대한 책임을 진다는 조항
              </li>
              <li>
                <strong>근저당 추가 설정 가능 조항</strong>: 임대인이 추가로 근저당을 설정할 수 있다는 조항
              </li>
              <li>
                <strong>대항력 발생 제한</strong>: 전입신고나 확정일자 취득을 제한하는 조항
              </li>
              <li>
                <strong>임대인 책임 회피 조항</strong>: "본 계약과 관련하여 발생하는 모든 민·형사상 책임은 임차인에게 있다" 등의 조항
              </li>
            </ul>
          </div>
          
          <div class="note-box">
            <h4>추천사항</h4>
            <p>
              계약 체결 전에 공인중개사나 법률 전문가의 검토를 받는 것이 안전합니다.
              특히 특약사항은 반드시 꼼꼼히 읽고 이해한 후 서명하세요.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Step 4: 진단 결과 -->
      <div v-if="currentStep === 4" class="step-content result-content">
        <div class="result-loading" v-if="isAnalyzing">
          <div class="spinner"></div>
          <h2>진단 중입니다</h2>
          <p>매물 정보와 등기부등본, 계약서를 분석하고 있습니다.</p>
          <p class="analysis-status">{{ analysisStatus }}</p>
        </div>
        
        <div class="result-complete" v-if="!isAnalyzing">
          <div class="result-header">
            <div class="safety-score" :class="getSafetyScoreClass()">
              <div class="score-circle">
                {{ safetyScore }}
              </div>
              <div class="score-label">안전 점수</div>
            </div>
            
            <div class="result-summary">
              <h2>진단 결과</h2>
              <p class="property-address">{{ propertyData.address }} {{ propertyData.detailAddress }}</p>
              <div class="result-tags">
                <span class="tag" :class="getTagClass(issue.level)" v-for="(issue, index) in issues" :key="index">
                  {{ issue.label }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="result-details">
            <div class="result-section">
              <h3>종합 평가</h3>
              <p>{{ overallAssessment }}</p>
            </div>
            
            <div class="result-section issues-section">
              <h3>발견된 위험 요소</h3>
              
              <div class="issue-card" v-for="(issue, index) in issues" :key="index" :class="getIssueCardClass(issue.level)">
                <div class="issue-header">
                  <div class="issue-level" :class="getIssueLevelClass(issue.level)">{{ getIssueLevelText(issue.level) }}</div>
                  <h4>{{ issue.title }}</h4>
                </div>
                <div class="issue-body">
                  <p>{{ issue.description }}</p>
                </div>
                <div class="issue-solution">
                  <h5>해결 방안</h5>
                  <p>{{ issue.solution }}</p>
                </div>
              </div>
              
              <div v-if="issues.length === 0" class="no-issues">
                <div class="safe-icon">✓</div>
                <p>위험 요소가 발견되지 않았습니다. 안전한 매물로 확인됩니다.</p>
              </div>
            </div>
            
            <div class="result-section recommendation-section">
              <h3>전문가 추천사항</h3>
              <div class="recommendation-list">
                <div class="recommendation-item" v-for="(recommendation, index) in recommendations" :key="index">
                  <div class="recommendation-icon">✓</div>
                  <div class="recommendation-text">{{ recommendation }}</div>
                </div>
              </div>
            </div>
            
            <div class="result-section comparative-section">
              <h3>주변 시세 비교</h3>
              <div class="chart-container">
                <!-- 차트가 들어갈 자리 -->
                <div class="chart-placeholder">
                  주변 시세와 비교한 그래프가 표시됩니다.
                </div>
              </div>
              <div class="comparative-data">
                <div class="data-item">
                  <div class="data-label">본 매물 전세가</div>
                  <div class="data-value">{{ formatCurrency(propertyData.deposit) }}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">주변 평균 전세가</div>
                  <div class="data-value">{{ formatCurrency(marketData.averageDeposit) }}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">시세 대비</div>
                  <div class="data-value" :class="getPriceComparisonClass()">{{ getPriceComparisonText() }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="report-download-btn" @click="downloadReport">
              <i class="fa fa-file-pdf-o"></i> 상세 보고서 다운로드
            </button>
            <button class="share-btn" @click="shareResult">
              <i class="fa fa-share-alt"></i> 결과 공유하기
            </button>
          </div>
          
          <div class="next-steps">
            <h3>다음 단계</h3>
            <div class="next-steps-options">
              <div class="next-step-option" @click="$router.push('/map')">
                <div class="option-icon">
                  <i class="fa fa-map-marker"></i>
                </div>
                <h4>안전 매물 찾기</h4>
                <p>검증된 안전한 매물을 지도에서 찾아보세요.</p>
              </div>
              
              <div class="next-step-option" @click="$router.push('/consultation')">
                <div class="option-icon">
                  <i class="fa fa-comments"></i>
                </div>
                <h4>전문가 상담</h4>
                <p>부동산 전문가에게 1:1 상담을 받아보세요.</p>
              </div>
              
              <div class="next-step-option" @click="$router.push('/community')">
                <div class="option-icon">
                  <i class="fa fa-users"></i>
                </div>
                <h4>커뮤니티</h4>
                <p>다른 사용자들의 경험과 정보를 공유해보세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="action-bar">
      <div class="container">
        <button v-if="currentStep > 1" class="back-btn" @click="prevStep">이전</button>
        <button v-if="currentStep < 4" class="next-btn" @click="nextStep" :disabled="!canProceed">다음</button>
        <button v-if="currentStep === 4 && isAnalyzing" class="analyze-btn" disabled>분석 중...</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiagnosisPage',
  data() {
    return {
      currentStep: 1,
      propertyData: {
        type: '',
        address: '',
        detailAddress: '',
        size: '',
        deposit: '',
        contractDate: ''
      },
      documentFiles: {
        register: null,
        contract: null
      },
      isAnalyzing: false,
      analysisStatus: '문서 스캔 중...',
      safetyScore: 85,
      overallAssessment: '이 매물은 대체로 안전하나, 일부 주의가 필요한 사항이 발견되었습니다. 계약 시 특약사항을 확인하고 적절한 조치를 취하시기 바랍니다.',
      issues: [
        {
          level: 'warning',
          label: '특약사항 주의',
          title: '위험 특약 조항 발견',
          description: '계약서 특약조항 중 "임차인은 임대인의 채무불이행에 대해 책임을 묻지 않는다"는 조항이 발견되었습니다. 이는 임차인의 권리를 제한할 수 있는 불공정 조항입니다.',
          solution: '해당 특약조항의 삭제 또는 수정을 요청하세요. 임대인의 의무를 면제하는 조항은 법적으로 무효가 될 수 있으나, 분쟁 예방을 위해 계약 전 수정하는 것이 좋습니다.'
        },
        {
          level: 'caution',
          label: '근저당권 확인',
          title: '근저당권 설정액 주의',
          description: '해당 매물에 총 2억원의 근저당권이 설정되어 있습니다. 전세금 3억원에 비해 위험 수준은 아니지만, 주의가 필요합니다.',
          solution: '전세권 설정 및 전세보증보험 가입을 통해 보증금을 보호하세요. 계약 후 즉시 전입신고와 확정일자를 받는 것도 중요합니다.'
        }
      ],
      recommendations: [
        '전세권 설정: 등기부등본에 전세권을 설정하여 법적 우선권을 확보하세요.',
        '전세보증보험 가입: 보증금 반환을 보장받기 위해 전세보증보험에 가입하는 것을 추천합니다.',
        '계약서 특약사항 수정: 발견된 위험 특약조항을 수정 또는 삭제하고 계약을 진행하세요.',
        '확정일자 및 전입신고: 계약 체결 후 즉시 확정일자를 받고 전입신고를 진행하세요.'
      ],
      marketData: {
        averageDeposit: 31000,
        depositRange: '2억 8천만원 ~ 3억 3천만원'
      }
    };
  },
  computed: {
    progressPercentage() {
      return (this.currentStep - 1) * 100 / 3;
    },
    canProceed() {
      if (this.currentStep === 1) {
        return this.propertyData.type && 
               this.propertyData.address && 
               this.propertyData.deposit;
      } else if (this.currentStep === 2) {
        return this.documentFiles.register !== null;
      } else if (this.currentStep === 3) {
        return this.documentFiles.contract !== null;
      }
      return true;
    }
  },
  methods: {
    openAddressSearch() {
      // 주소 검색 API 연동 (Daum 우편번호 서비스 등)
      alert('주소 검색 기능은 실제 구현 시 Daum 우편번호 서비스 등을 연동하세요.');
      // 임시 데이터 설정
      this.propertyData.address = '서울시 강남구 테헤란로 123';
    },
    
    triggerFileUpload(fileType) {
      if (fileType === 'register') {
        this.$refs.registerFileInput.click();
      } else if (fileType === 'contract') {
        this.$refs.contractFileInput.click();
      }
    },
    
    handleFileSelect(event, fileType) {
      const file = event.target.files[0];
      if (file) {
        this.documentFiles[fileType] = file;
      }
    },
    
    handleFileDrop(event, fileType) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.documentFiles[fileType] = file;
      }
    },
    
    removeFile(fileType) {
      this.documentFiles[fileType] = null;
      if (fileType === 'register') {
        this.$refs.registerFileInput.value = '';
      } else if (fileType === 'contract') {
        this.$refs.contractFileInput.value = '';
      }
    },
    
    formatFileSize(size) {
      if (size < 1024) {
        return size + ' B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + ' KB';
      } else {
        return (size / (1024 * 1024)).toFixed(1) + ' MB';
      }
    },
    
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
    
    startAnalysis() {
      this.isAnalyzing = true;
      
      // 분석 과정 시뮬레이션
      setTimeout(() => {
        this.analysisStatus = '등기부등본 분석 중...';
      }, 1000);
      
      setTimeout(() => {
        this.analysisStatus = '계약서 특약사항 분석 중...';
      }, 3000);
      
      setTimeout(() => {
        this.analysisStatus = '주변 시세 데이터 수집 중...';
      }, 5000);
      
      setTimeout(() => {
        this.analysisStatus = '종합 위험도 평가 중...';
      }, 7000);
      
      // 분석 완료
      setTimeout(() => {
        this.isAnalyzing = false;
      }, 9000);
    },
    
    getSafetyScoreClass() {
      if (this.safetyScore >= 80) return 'score-high';
      if (this.safetyScore >= 60) return 'score-medium';
      return 'score-low';
    },
    
    getTagClass(level) {
      if (level === 'danger') return 'tag-danger';
      if (level === 'warning') return 'tag-warning';
      if (level === 'caution') return 'tag-caution';
      return 'tag-info';
    },
    
    getIssueCardClass(level) {
      if (level === 'danger') return 'issue-danger';
      if (level === 'warning') return 'issue-warning';
      if (level === 'caution') return 'issue-caution';
      return 'issue-info';
    },
    
    getIssueLevelClass(level) {
      if (level === 'danger') return 'level-danger';
      if (level === 'warning') return 'level-warning';
      if (level === 'caution') return 'level-caution';
      return 'level-info';
    },
    
    getIssueLevelText(level) {
      if (level === 'danger') return '위험';
      if (level === 'warning') return '경고';
      if (level === 'caution') return '주의';
      return '정보';
    },
    
    formatCurrency(value) {
      return new Intl.NumberFormat('ko-KR', { 
        style: 'currency', 
        currency: 'KRW',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value * 10000);
    },
    
    getPriceComparisonClass() {
      const ratio = this.propertyData.deposit / this.marketData.averageDeposit;
      if (ratio > 1.1) return 'price-high';
      if (ratio < 0.9) return 'price-low';
      return 'price-normal';
    },
    
    getPriceComparisonText() {
      const ratio = this.propertyData.deposit / this.marketData.averageDeposit;
      const percent = Math.abs((ratio - 1) * 100).toFixed(1);
      
      if (ratio > 1.1) return `시세보다 ${percent}% 높음`;
      if (ratio < 0.9) return `시세보다 ${percent}% 낮음`;
      return `시세 수준`;
    },
    
    downloadReport() {
      alert('상세 보고서 다운로드 기능은 실제 구현 시 PDF 생성 라이브러리를 연동하세요.');
    },
    
    shareResult() {
      alert('결과 공유 기능은 실제 구현 시 소셜 공유 기능을 연동하세요.');
    }
  }
}
</script>

<style scoped>
    @import '../styles/diagnosis.css';
</style>