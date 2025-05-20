  <template>
    <div class="contract-card">
      <div class="contract-address">{{ contract.address }}</div>
      <div class="contract-time">
        <span class="clock-icon">🕒</span> {{ contract.date }}
      </div>
      <div class="contract-status">진행 상태: {{ contract.progressRatio }} 단계</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: contract.progressPercentage }"></div>
      </div>
      <div class="contract-status">
        <span class="check-icon">✅</span> {{ contract.status }}
      </div>
      <div class="contract-detail">
        <span class="clock-icon">🕒</span> {{ contract.registerDetail }}
      </div>
      <div class="contract-detail">
        <span class="clock-icon">🕒</span> {{ contract.contractDetail }}
      </div>
      <div class="continue-button">
        이어서 진행하기 <span class="arrow-icon">▶️</span>
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