<template>
    <div class="container">
      <!-- 프로필 영역 -->
      <div class="profile-card">
        <div class="profile-image">
          <!-- Font Awesome 대신 텍스트나 아이콘으로 대체 -->
          <span class="user-icon">👤</span>
        </div>
        <div class="profile-info">
          <div class="profile-name">{{ profileName }}</div>
          <div class="profile-message">{{ profileMessage }}</div>
        </div>
        <button class="profile-button">프로필 관리</button>
      </div>
      
      <!-- 통계 영역 -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-label">
            <span class="stat-icon">🏠</span>진행 중인 계약
          </div>
          <div class="stat-value">{{ progressContracts }}건</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            <span class="stat-icon">📄</span>완료된 계약
          </div>
          <div class="stat-value">{{ completedContracts }}건</div>
        </div>
      </div>
      
      <!-- 새 계약 버튼 -->
      <div class="new-contract-button">
        <span class="button-icon">🏠</span>새로운 전세 계약 검증하기
      </div>
      
      <!-- 탭 영역 -->
      <div class="tab-container">
        <div class="tab-buttons">
          <button 
            v-for="tab in tabs" 
            :key="tab.id" 
            :class="['tab-button', { active: currentTab === tab.id }]" 
            @click="currentTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>
        
        <div v-if="currentTab === 'progress'" class="contract-list">
          <h3>진행 중인 전세 계약 검증</h3>
          <contract-card 
            v-for="(contract, index) in progressingContracts" 
            :key="index" 
            :contract="contract"
          />
        </div>
        
        <div v-if="currentTab === 'completed'" class="contract-list">
          <h3>완료된 계약</h3>
          <!-- 완료된 계약 목록 -->
        </div>
      </div>
    </div>
  </template>
  
  <script>
    import MyPage from "./MyPage.js";
    export default MyPage;
  </script>
  
  <style scoped>
  @import './my-page.css';
  </style>