<template>
  <div class="map-page">
    <!-- 필터 섹션 -->
    <div class="filter-section">
      <div class="container">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="지역명, 지하철역으로 검색" 
            @keypress.enter="searchLocation"
          />
          <button @click="searchLocation" class="search-btn">
            <i class="fas fa-search"></i> 검색
          </button>
        </div>
        
        <div class="filter-chips">
          <div 
            v-for="(filter, index) in filters" 
            :key="index" 
            class="filter-chip"
            :class="{ active: filter.active }"
            @click="toggleFilter(filter)"
          >
            <i :class="filter.icon"></i> {{ filter.name }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 메인 컨텐츠 영역 (지도 + 사이드바) -->
    <div class="map-content">
      <!-- 사이드바 (매물 목록) -->
      <div class="property-sidebar" :class="{ 'mobile-hidden': !showSidebar }">
        <div class="sidebar-header">
          <h2>추천 매물 <span class="property-count">{{ properties.length }}</span></h2>
          <div class="sort-options">
            <select v-model="sortOption" @change="sortProperties">
              <option value="safetyScore">안전 점수 높은 순</option>
              <option value="distance">거리 순</option>
              <option value="priceAsc">가격 낮은 순</option>
              <option value="priceDesc">가격 높은 순</option>
            </select>
          </div>
          <button class="close-sidebar-btn" @click="toggleSidebar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="property-list" v-if="properties.length > 0">
          <div 
            v-for="property in properties" 
            :key="property.id" 
            class="property-card"
            :class="{ active: selectedProperty && selectedProperty.id === property.id }"
            @click="selectProperty(property)"
          >
            <div class="property-image">
              <img :src="property.image" :alt="property.title" />
              <div class="safety-score" :class="getSafetyScoreClass(property.safetyScore)">
                {{ property.safetyScore }}
              </div>
            </div>
            
            <div class="property-info">
              <h3 class="property-title">{{ property.title }}</h3>
              <p class="property-address">{{ property.address }}</p>
              <div class="property-details">
                <span class="property-price">{{ formatPrice(property.price) }}</span>
                <span class="property-area">{{ property.area }}㎡</span>
              </div>
              
              <div class="property-amenities" v-if="activeFilters.length > 0">
                <div class="amenity-ranking">
                  <div 
                    v-for="(filter, index) in activeFilters" 
                    :key="index"
                    class="ranking-item"
                  >
                    <span class="ranking-label">
                      <i :class="filter.icon"></i> {{ filter.name }}
                    </span>
                    <div class="ranking-score">
                      <div class="ranking-bar">
                        <div 
                          class="ranking-fill"
                          :style="{ width: calculateRanking(property, filter.id) + '%' }"
                        ></div>
                      </div>
                      <span class="ranking-value">{{ Math.round(calculateRanking(property, filter.id)) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="property-tags">
                <span 
                  v-for="(tag, tagIndex) in property.tags" 
                  :key="tagIndex" 
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="empty-results" v-else>
          <i class="fas fa-search"></i>
          <p>검색 결과가 없습니다.</p>
          <p>다른 지역이나 필터 조건을 시도해보세요.</p>
        </div>
      </div>
      
      <!-- 지도 영역 -->
      <div class="map-container" ref="mapContainer">
        <!-- 실제 지도는 JavaScript로 이곳에 렌더링됨 -->
        
        <!-- 모바일에서 사이드바 버튼 -->
        <button class="show-sidebar-btn" @click="toggleSidebar" v-if="!showSidebar">
          <i class="fas fa-list"></i> 매물 목록
        </button>
        
        <!-- 선택된 매물 정보 (모바일) -->
        <div class="mobile-property-detail" v-if="selectedProperty && !showSidebar">
          <div class="mobile-property-info">
            <h3>{{ selectedProperty.title }}</h3>
            <div class="property-price">{{ formatPrice(selectedProperty.price) }}</div>
          </div>
          <button class="detail-btn" @click="showPropertyDetail">
            상세보기
          </button>
        </div>
      </div>
      
      <!-- 선택된 매물 상세 정보 팝업 -->
      <div class="property-detail-popup" v-if="showPropertyDetailPopup">
        <div class="popup-content">
          <button class="close-popup-btn" @click="closePropertyDetail">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="popup-image">
            <img :src="selectedProperty.image" :alt="selectedProperty.title" />
            <div class="safety-score" :class="getSafetyScoreClass(selectedProperty.safetyScore)">
              안전 점수 {{ selectedProperty.safetyScore }}
            </div>
          </div>
          
          <div class="popup-body">
            <h2>{{ selectedProperty.title }}</h2>
            <p class="popup-address">{{ selectedProperty.address }}</p>
            
            <div class="property-details-row">
              <div class="detail-item">
                <label>전세가</label>
                <div class="value price">{{ formatPrice(selectedProperty.price) }}</div>
              </div>
              <div class="detail-item">
                <label>전용면적</label>
                <div class="value">{{ selectedProperty.area }}㎡</div>
              </div>
              <div class="detail-item">
                <label>방/욕실</label>
                <div class="value">{{ selectedProperty.rooms }}개/{{ selectedProperty.bathrooms }}개</div>
              </div>
            </div>
            
            <div class="property-safety">
              <h3>안전 진단 결과</h3>
              <ul class="safety-checks">
                <li 
                  v-for="(item, index) in selectedProperty.safetyChecks" 
                  :key="index"
                  :class="{ 'status-safe': item.status === 'safe', 'status-warning': item.status === 'warning' }"
                >
                  <i 
                    :class="item.status === 'safe' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"
                  ></i>
                  <div class="check-content">
                    <div class="check-title">{{ item.title }}</div>
                    <div class="check-description">{{ item.description }}</div>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="amenities-section" v-if="activeFilters.length > 0">
              <h3>주변 시설</h3>
              <div class="amenities-grid">
                <div 
                  v-for="(filter, index) in activeFilters" 
                  :key="index"
                  class="amenity-item"
                >
                  <div class="amenity-icon">
                    <i :class="filter.icon"></i>
                  </div>
                  <div class="amenity-info">
                    <div class="amenity-name">{{ filter.name }}</div>
                    <div class="amenity-distance">{{ getRandomDistance() }}m 이내 {{ getRandomCount() }}개</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="contact-btn">
                <i class="fas fa-phone"></i> 연락처 보기
              </button>
              <button class="diagnosis-btn" @click="navigateTo('diagnosis')">
                <i class="fas fa-clipboard-check"></i> 상세 진단 받기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapPage',
  data() {
    return {
      searchQuery: '',
      showSidebar: true,
      selectedProperty: null,
      showPropertyDetailPopup: false,
      sortOption: 'safetyScore',
      filters: [
        { id: 'subway', name: '지하철', icon: 'fas fa-subway', active: false },
        { id: 'school', name: '교육시설', icon: 'fas fa-school', active: false },
        { id: 'hospital', name: '병원', icon: 'fas fa-hospital', active: false },
        { id: 'bus', name: '버스정류장', icon: 'fas fa-bus', active: false },
        { id: 'park', name: '공원', icon: 'fas fa-tree', active: false },
        { id: 'mart', name: '마트/편의점', icon: 'fas fa-shopping-cart', active: false },
        { id: 'cafe', name: '카페', icon: 'fas fa-coffee', active: false }
      ],
      properties: [
        {
          id: 1,
          title: '역삼동 신축 빌라 전세',
          address: '서울시 강남구 역삼동 123-45',
          price: 38000,
          area: 32,
          rooms: 2,
          bathrooms: 1,
          safetyScore: 95,
          image: '/api/placeholder/320/180',
          latlng: { lat: 37.501, lng: 127.037 },
          tags: ['신축', '역세권', '남향'],
          amenities: {
            subway: 92,
            school: 75,
            hospital: 60,
            bus: 88,
            park: 45,
            mart: 90,
            cafe: 95
          },
          safetyChecks: [
            { title: '등기부등본 검증', description: '근저당권, 압류, 가압류 등 특이사항 없음', status: 'safe' },
            { title: '계약서 특약 검토', description: '불공정 특약 조항 없음', status: 'safe' },
            { title: '전세가율 적정성', description: '시세 대비 전세가율 적정', status: 'safe' }
          ]
        },
        {
          id: 2,
          title: '서초동 아파트 전세',
          address: '서울시 서초구 서초동 456-78',
          price: 65000,
          area: 84,
          rooms: 3,
          bathrooms: 2,
          safetyScore: 90,
          image: '/api/placeholder/320/180',
          latlng: { lat: 37.488, lng: 127.024 },
          tags: ['주차가능', '남향', '공원근처'],
          amenities: {
            subway: 70,
            school: 95,
            hospital: 85,
            bus: 75,
            park: 90,
            mart: 65,
            cafe: 70
          },
          safetyChecks: [
            { title: '등기부등본 검증', description: '근저당권 설정액이 전세금의 35% 수준으로 안전함', status: 'safe' },
            { title: '계약서 특약 검토', description: '일부 특약 조항 검토 필요', status: 'warning' },
            { title: '전세가율 적정성', description: '시세 대비 전세가율 적정', status: 'safe' }
          ]
        },
        {
          id: 3,
          title: '신논현역 오피스텔 풀옵션',
          address: '서울시 강남구 논현동 234-56',
          price: 32000,
          area: 24,
          rooms: 1,
          bathrooms: 1,
          safetyScore: 87,
          image: '/api/placeholder/320/180',
          latlng: { lat: 37.504, lng: 127.025 },
          tags: ['역세권', '풀옵션', '신축'],
          amenities: {
            subway: 98,
            school: 60,
            hospital: 75,
            bus: 95,
            park: 50,
            mart: 85,
            cafe: 90
          },
          safetyChecks: [
            { title: '등기부등본 검증', description: '근저당권 설정액이 전세금의 40% 수준으로 안전함', status: 'safe' },
            { title: '계약서 특약 검토', description: '불공정 특약 조항 없음', status: 'safe' },
            { title: '전세가율 적정성', description: '시세 대비 전세가율 다소 높음', status: 'warning' }
          ]
        },
        {
          id: 4,
          title: '강남역 인근 빌라 전세',
          address: '서울시 강남구 역삼동 345-67',
          price: 42000,
          area: 38,
          rooms: 2,
          bathrooms: 1,
          safetyScore: 92,
          image: '/api/placeholder/320/180',
          latlng: { lat: 37.498, lng: 127.029 },
          tags: ['역세권', '주차가능', '남향'],
          amenities: {
            subway: 95,
            school: 80,
            hospital: 70,
            bus: 85,
            park: 60,
            mart: 90,
            cafe: 95
          },
          safetyChecks: [
            { title: '등기부등본 검증', description: '근저당권, 압류, 가압류 등 특이사항 없음', status: 'safe' },
            { title: '계약서 특약 검토', description: '불공정 특약 조항 없음', status: 'safe' },
            { title: '전세가율 적정성', description: '시세 대비 전세가율 적정', status: 'safe' }
          ]
        },
        {
          id: 5,
          title: '학동역 인근 아파트 전세',
          address: '서울시 강남구 논현동 456-78',
          price: 58000,
          area: 59,
          rooms: 2,
          bathrooms: 1,
          safetyScore: 85,
          image: '/api/placeholder/320/180',
          latlng: { lat: 37.515, lng: 127.032 },
          tags: ['역세권', '공원근처', '남향'],
          amenities: {
            subway: 85,
            school: 90,
            hospital: 65,
            bus: 80,
            park: 75,
            mart: 70,
            cafe: 80
          },
          safetyChecks: [
            { title: '등기부등본 검증', description: '근저당권 설정액이 전세금의 50% 수준으로 주의 필요', status: 'warning' },
            { title: '계약서 특약 검토', description: '불공정 특약 조항 없음', status: 'safe' },
            { title: '전세가율 적정성', description: '시세 대비 전세가율 적정', status: 'safe' }
          ]
        }
      ],
      map: null,
      markers: [],
      mapInitialized: false
    };
  },
  computed: {
    activeFilters() {
      return this.filters.filter(filter => filter.active);
    }
  },
  methods: {
    toggleFilter(filter) {
      filter.active = !filter.active;
      this.reRankProperties();
    },
    
    selectProperty(property) {
      this.selectedProperty = property;
      this.centerMapOnProperty(property);
      // 모바일에서는 목록을 숨김
      if (window.innerWidth < 768) {
        this.showSidebar = false;
      }
    },
    
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    
    showPropertyDetail() {
      if (this.selectedProperty) {
        this.showPropertyDetailPopup = true;
      }
    },
    
    closePropertyDetail() {
      this.showPropertyDetailPopup = false;
    },
    
    getSafetyScoreClass(score) {
      if (score >= 90) return 'score-high';
      if (score >= 80) return 'score-medium';
      return 'score-low';
    },
    
    calculateRanking(property, filterId) {
      // 실제 구현에서는 amenities 값에 따라 랭킹을 계산
      return property.amenities[filterId] || 0;
    },
    
    reRankProperties() {
      // 활성화된 필터에 따라 매물의 정렬을 변경
      if (this.activeFilters.length > 0) {
        this.sortOption = 'filterRanking';
        this.sortProperties();
      }
    },
    
    sortProperties() {
      const sortedProperties = [...this.properties];
      
      switch(this.sortOption) {
        case 'safetyScore':
          sortedProperties.sort((a, b) => b.safetyScore - a.safetyScore);
          break;
        case 'priceAsc':
          sortedProperties.sort((a, b) => a.price - b.price);
          break;
        case 'priceDesc':
          sortedProperties.sort((a, b) => b.price - a.price);
          break;
        case 'filterRanking':
          // 활성화된 필터들의 평균 점수로 정렬
          if (this.activeFilters.length > 0) {
            sortedProperties.sort((a, b) => {
              const aScore = this.getAverageFilterScore(a);
              const bScore = this.getAverageFilterScore(b);
              return bScore - aScore;
            });
          }
          break;
      }
      
      this.properties = sortedProperties;
    },
    
    getAverageFilterScore(property) {
      if (this.activeFilters.length === 0) return 0;
      
      let totalScore = 0;
      for (const filter of this.activeFilters) {
        totalScore += this.calculateRanking(property, filter.id);
      }
      return totalScore / this.activeFilters.length;
    },
    
    searchLocation() {
      // 실제 구현시 여기에 주소 검색 API 연동
      console.log('검색어:', this.searchQuery);
      alert('실제 구현 시 지도 API와 연동하여 해당 지역으로 이동합니다.');
    },
    
    formatPrice(price) {
      if (price >= 10000) {
        const uk = Math.floor(price / 10000);
        const man = price % 10000;
        return man > 0 ? `${uk}억 ${man}만원` : `${uk}억원`;
      } else {
        return `${price}만원`;
      }
    },
    
    initMap() {
      // 실제 구현 시 카카오맵 또는 네이버맵 API를 이용해 지도 초기화
      console.log('지도 초기화');
      this.mapInitialized = true;
      
      setTimeout(() => {
        // 임시 알림 (실제 구현 시 제거)
        alert('실제 구현 시 이곳에 카카오맵 또는 네이버맵이 로드됩니다. 현재는 시뮬레이션 모드입니다.');
      }, 500);
    },
    
    centerMapOnProperty(property) {
      if (this.mapInitialized) {
        // 실제 구현 시 선택한 매물 위치로 지도 중심 이동
        console.log('지도 중심 이동:', property.latlng);
      }
    },
    
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
    },
    
    getRandomDistance() {
      // 데모용 랜덤 거리
      return Math.floor(Math.random() * 400 + 100);
    },
    
    getRandomCount() {
      // 데모용 랜덤 개수
      return Math.floor(Math.random() * 10 + 1);
    }
  },
  mounted() {
    this.initMap();
    this.sortProperties();
    
    // 첫 번째 매물 선택
    if (this.properties.length > 0) {
      this.selectProperty(this.properties[0]);
    }
    
    // 모바일인 경우 초기에 사이드바 표시 여부 설정
    this.showSidebar = window.innerWidth >= 768;
    
    // 창 크기 변경 감지
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        this.showSidebar = true;
      }
    });
  }
}
</script>

<style scoped>
    @import '../styles/map-page.css';
</style>