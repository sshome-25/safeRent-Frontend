<template>
    <div class="contract-card">
      <div class="contract-address">{{ contract.assessmentHouse.address }}</div>      
      <!-- 부동산 기본 정보 -->
      <div class="house-info-section">
        <div class="house-info-row">
          <div class="house-info-item">
            <span class="info-label">계약 전세금</span>
            <span class="info-value">{{ formatPrice(contract.assessmentHouse?.price) }}</span>
          </div>
          <div class="house-info-item">
            <span class="info-label">시장 매매가</span>
            <span class="info-value">{{ formatPrice(contract.assessmentHouse?.marketPrice) }}</span>
          </div>
        </div>
        
        <div class="house-info-row">
          <div class="house-info-item">
            <span class="info-label">면적</span>
            <span class="info-value">{{ contract.assessmentHouse?.area }}㎡</span>
          </div>
          <div class="house-info-item">
            <span class="info-label">층수</span>
            <span class="info-value">{{ contract.assessmentHouse?.floor }}층</span>
          </div>
        </div>
        
        <!-- 안전성 표시 -->
        <div class="safety-status" v-if="contract.assessmentHouse?.isSafe !== undefined">
          <span class="safety-icon">{{ contract.assessmentHouse.isSafe ? '🛡️' : '⚠️' }}</span>
          <span class="safety-text">{{ contract.assessmentHouse.isSafe ? '안전' : '주의 필요' }}</span>
        </div>
                
        <!-- 생성일시 정보 -->
        <div class="created-info" v-if="contract.assessmentHouse?.createdAt">
          <span class="created-icon">📅</span>
          <span class="created-text">{{ formatCreatedAt(contract.assessmentHouse.createdAt) }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ContractCard',
    props: {
      contract: {
        type: Object,
        required: true
      }
    },
    methods: {
      formatPrice(price) {
        if (!price) return '-';
        return new Intl.NumberFormat('ko-KR').format(price) + '만원';
      },
      formatCreatedAt(createdAt) {
        if (!createdAt) return '-';
        const date = new Date(createdAt);
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    }
  }
  </script>
  
  <style scoped>
  .contract-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    position: relative;
  }
  
  .contract-address {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  }
  
  .contract-time {
    display: flex;
    align-items: center;
    color: #777;
    font-size: 14px;
    margin-bottom: 15px;
  }
  
  .contract-time i {
    margin-right: 8px;
  }
  
  /* 부동산 정보 섹션 */
  .house-info-section {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .house-info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .house-info-row:last-child {
    margin-bottom: 0;
  }
  
  .house-info-item {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  .house-info-item:first-child {
    margin-right: 20px;
  }
  
  .info-label {
    font-size: 12px;
    color: #777;
    margin-bottom: 4px;
  }
  
  .info-value {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  
  .safety-status {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    background-color: #fff;
  }
  
  .safety-icon {
    margin-right: 8px;
    font-size: 16px;
  }
  
  .safety-text {
    font-size: 14px;
    font-weight: 500;
  }
  
  .location-info {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #666;
    background-color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 10px;
  }
  
  .location-icon {
    margin-right: 8px;
  }
  
  .location-text {
    font-family: 'Courier New', monospace;
  }
  
  .created-info {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #666;
    background-color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
  }
  
  .created-icon {
    margin-right: 8px;
  }
  
  .created-text {
    font-weight: 500;
  }
  
  .progress-bar {
    height: 6px;
    background-color: #eee;
    border-radius: 3px;
    margin-bottom: 15px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #3478f6;
  }
  
  .contract-status {
    display: flex;
    color: #22c55e;
    align-items: center;
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .contract-status i {
    margin-right: 8px;
  }
  
  .contract-detail {
    display: flex;
    align-items: center;
    color: #777;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .contract-detail i {
    margin-right: 8px;
  }
  
  .continue-button {
    position: absolute;
    top: 15px;
    right: 20px;
    color: #3478f6;
    font-size: 14px;
    display: flex;
    align-items: center;
  }
  
  .continue-button i {
    margin-left: 5px;
  }
  </style>