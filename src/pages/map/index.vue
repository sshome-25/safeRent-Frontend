<template>
  <div class="kakao-map-page">
    <div class="map-container" ref="mapContainer" id="kakao-map"></div>

    <!-- 인프라 필터 -->
    <div class="infrastructure-filters">
      <div class="filter-title">주변 인프라</div>
      <div class="filter-buttons">
        <button v-for="filter in infrastructureFilters" :key="filter.key" class="filter-btn"
          :class="{ 'active': selectedFilter === filter.key }" @click="toggleFilter(filter.key)">
          <span class="filter-icon">{{ filter.icon }}</span>
          {{ filter.name }}
        </button>
      </div>
      <div v-if="selectedFilter" class="filter-info">
        {{ getFilterInfo() }}
      </div>
    </div>

    <!-- 로딩 인디케이터 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 사이드바 -->
    <div class="sidebar" :class="{ 'sidebar-open': selectedProperty }">
      <div class="sidebar-header">
        <h3>매물 정보</h3>
        <button class="close-btn" @click="closeSidebar">×</button>
      </div>

      <div v-if="selectedProperty" class="sidebar-content">
        <div class="property-details">
          <div class="property-price">
            <span class="price-label">매매가</span>
            <span class="price-value">{{ formatPrice(selectedProperty.price) }}</span>
          </div>

          <!-- 인프라 점수 표시 -->
          <div v-if="selectedFilter && selectedProperty.infrastructureScore" class="infrastructure-score">
            <span class="score-label">{{ getFilterName(selectedFilter) }} 점수</span>
            <div class="score-bar">
              <div class="score-fill"
                :style="{ width: (selectedProperty.infrastructureScore / maxInfrastructureScore * 100) + '%' }"></div>
              <span class="score-text">{{ selectedProperty.infrastructureScore }}개</span>
            </div>
          </div>

          <div class="property-info-grid">
            <div class="info-item">
              <span class="info-label">매물 ID</span>
              <span class="info-value">{{ selectedProperty.id }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">위치</span>
              <span class="info-value">
                {{ selectedProperty.location }}
              </span>
            </div>
          </div>

          <!-- 추가 정보가 있다면 여기에 표시 -->
          <div v-if="selectedProperty.additionalInfo" class="additional-info">
            <div class="info-section">
              <h4>상세 정보</h4>
              <div class="info-item" v-for="(value, key) in selectedProperty.additionalInfo" :key="key">
                <span class="info-label">{{ formatLabel(key) }}</span>
                <span class="info-value">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- 주변 인프라 정보 -->
          <div v-if="selectedFilter && selectedProperty.nearbyInfrastructure" class="nearby-infrastructure">
            <div class="info-section">
              <h4>주변 {{ getFilterName(selectedFilter) }} ({{ selectedProperty.nearbyInfrastructure.length }}개)</h4>
              <div class="infrastructure-list">
                <div v-for="(place, index) in selectedProperty.nearbyInfrastructure" :key="place.id || index"
                  class="infrastructure-item">
                  <div class="place-info">
                    <div class="place-name">{{ place.place_name }}</div>
                    <div class="place-details">
                      <span class="place-category" v-if="place.category_name">{{ place.category_name }}</span>
                      <span class="place-address" v-if="place.road_address_name">{{ place.road_address_name }}</span>
                      <span class="place-address" v-else-if="place.address_name">{{ place.address_name }}</span>
                    </div>
                  </div>
                  <div class="place-distance-info">
                    <span class="place-distance">{{ place.distance }}m</span>
                    <span class="place-rank">#{{ index + 1 }}</span>
                  </div>
                </div>
                <div v-if="selectedProperty.nearbyInfrastructure.length === 0" class="no-infrastructure">
                  <div class="no-infrastructure-icon">🔍</div>
                  <div class="no-infrastructure-text">
                    반경 500m 내에 {{ getFilterName(selectedFilter) }}가 없습니다.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="sidebar-placeholder">
        <p>지도에서 매물을 선택하세요</p>
      </div>
    </div>

  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'KakaoPropertyMap',
  data() {
    return {
      map: null,
      markers: [], // 현재 표시된 마커들
      properties: [], // 현재 매물 데이터
      selectedProperty: null, // 선택된 매물 정보
      isLoading: false,
      // 기본 중심 좌표 (서울시청)
      center: { lat: 37.5666805, lng: 126.9784147 },
      // API 호출 디바운스를 위한 타이머
      debounceTimer: null,
      // 마지막으로 데이터를 가져온 영역 (중복 호출 방지)
      lastBounds: null,
      // 인프라 필터 관련
      selectedFilter: null,
      maxInfrastructureScore: 0,
      infrastructureFilters: [
        { key: 'subway', name: '지하철', icon: '🚇', category: 'SW8', keyword: '지하철역' },
        { key: 'convenience', name: '편의점', icon: '🏪', category: 'CS2', keyword: '편의점점' },
        { key: 'hospital', name: '병원', icon: '🏥', category: 'HP8', keyword: '병원' },
        { key: 'cafe', name: '카페', icon: '☕', category: 'CE7', keyword: '카페' },
        { key: 'pharmacy', name: '약국', icon: '💊', category: 'PM9', keyword: '약국' },
        { key: 'school', name: '학교', icon: '🏫', category: 'SC4', keyword: '학교' }
      ]
    };
  },
  mounted() {
    this.loadKakaoMapScript();
  },
  methods: {
    loadKakaoMapScript() {
      if (window.kakao && window.kakao.maps) {
        this.initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=cca9f1aa6092161b7976c4daad39b081&autoload=false&libraries=services`;
      script.async = true;

      script.onload = () => {
        window.kakao.maps.load(() => {
          this.initMap();
        });
      };

      document.head.appendChild(script);
    },

    initMap() {
      const container = this.$refs.mapContainer;
      const options = {
        center: new window.kakao.maps.LatLng(this.center.lat, this.center.lng),
        level: 3
      };

      this.map = new window.kakao.maps.Map(container, options);
      console.log('지도 초기화 완료');

      this.addMapControls();

      // 지도 이동 관련 이벤트 등록
      this.addMapEvents();

      // 초기 매물 데이터 로드
      this.loadPropertiesInCurrentView();
    },

    addMapControls() {
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      this.map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      const zoomControl = new window.kakao.maps.ZoomControl();
      this.map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    },

    addMapEvents() {
      // 지도 드래그 종료 시
      window.kakao.maps.event.addListener(this.map, 'dragend', () => {
        console.log('지도 드래그 종료');
        this.debouncedLoadProperties();
      });

      // 지도 줌 변경 시
      window.kakao.maps.event.addListener(this.map, 'zoom_changed', () => {
        console.log('지도 줌 변경');
        this.debouncedLoadProperties();
      });

      // 지도 영역 변경 시 (크기 조정 등)
      window.kakao.maps.event.addListener(this.map, 'bounds_changed', () => {
        console.log('지도 영역 변경');
        this.debouncedLoadProperties();
      });
    },

    // 인프라 필터 토글
    async toggleFilter(filterKey) {
      if (this.selectedFilter === filterKey) {
        // 같은 필터를 다시 클릭하면 해제
        this.selectedFilter = null;
        this.resetMarkerStyles();
      } else {
        // 새로운 필터 선택
        this.selectedFilter = filterKey;
        this.isLoading = true;

        try {
          await this.analyzeInfrastructure();
          this.updateMarkersWithInfrastructureData();
        } catch (error) {
          console.error('인프라 분석 실패:', error);
        } finally {
          this.isLoading = false;
        }
      }
    },

    // 선택된 필터의 이름 반환
    getFilterName(filterKey) {
      const filter = this.infrastructureFilters.find(f => f.key === filterKey);
      return filter ? filter.name : '';
    },

    // 필터 정보 표시
    getFilterInfo() {
      if (!this.selectedFilter) return '';
      const filterName = this.getFilterName(this.selectedFilter);
      return `${filterName} 기준으로 매물을 분석 중입니다.`;
    },

    // 주변 인프라 분석
    async analyzeInfrastructure() {
      if (!this.selectedFilter || !this.properties.length) return;

      const filter = this.infrastructureFilters.find(f => f.key === this.selectedFilter);
      if (!filter) return;

      console.log('인프라 분석 시작:', filter.name);

      // 각 매물별 주변 인프라 검색
      const analysisPromises = this.properties.map(async (property) => {
        const nearbyPlaces = await this.searchNearbyPlaces(property.lat, property.lng, filter);
        property.nearbyInfrastructure = nearbyPlaces;
        property.infrastructureScore = nearbyPlaces.length;
        return property;
      });

      this.properties = await Promise.all(analysisPromises);

      // 최대 점수 계산
      this.maxInfrastructureScore = Math.max(...this.properties.map(p => p.infrastructureScore || 0));

      console.log('인프라 분석 완료. 최대 점수:', this.maxInfrastructureScore);
    },

    // 카카오 로컬 API로 주변 장소 검색
    async searchNearbyPlaces(lat, lng, filter) {
      return new Promise((resolve) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
          console.error('카카오맵 서비스 라이브러리가 로드되지 않았습니다.');
          resolve([]);
          return;
        }

        const places = new window.kakao.maps.services.Places();
        const position = new window.kakao.maps.LatLng(lat, lng);

        const searchOptions = {
          location: position,
          radius: 500, // 500m 반경
          sort: window.kakao.maps.services.SortBy.DISTANCE
        };

        // 카테고리로 검색
        places.categorySearch(filter.category, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            // 거리 순으로 정렬하고 상위 10개만 반환
            const sortedData = data
              .sort((a, b) => parseInt(a.distance) - parseInt(b.distance))
              .slice(0, 10);
            resolve(sortedData);
          } else {
            console.log('장소 검색 실패:', status);
            resolve([]);
          }
        }, searchOptions);
      });
    },

    // 마커를 인프라 데이터로 업데이트
    updateMarkersWithInfrastructureData() {
      // 기존 마커 제거
      this.clearMarkers();

      // 새로운 마커 생성 (인프라 점수 반영)
      this.createPropertyMarkers(this.properties);

      // 선택된 매물이 있다면 업데이트
      if (this.selectedProperty) {
        const updatedProperty = this.properties.find(p => p.id === this.selectedProperty.id);
        if (updatedProperty) {
          this.selectedProperty = updatedProperty;
        }
      }
    },

    // 마커 스타일 초기화
    resetMarkerStyles() {
      this.properties.forEach(property => {
        property.infrastructureScore = 0;
        property.nearbyInfrastructure = [];
      });

      this.maxInfrastructureScore = 0;

      // 마커 다시 생성
      this.clearMarkers();
      this.createPropertyMarkers(this.properties);
    },

    // 디바운스된 매물 로드 함수 (너무 빈번한 API 호출 방지)
    debouncedLoadProperties() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.loadPropertiesInCurrentView();
      }, 300); // 300ms 디바운스
    },

    // 현재 화면 영역의 매물 데이터 로드
    async loadPropertiesInCurrentView() {
      try {
        console.log('매물 데이터 로드 시작');

        // 현재 지도 영역 가져오기
        const bounds = this.map.getBounds();
        const sw = bounds.getSouthWest(); // 남서쪽 좌표
        const ne = bounds.getNorthEast(); // 북동쪽 좌표

        console.log('현재 지도 영역:', {
          swLat: sw.getLat(),
          swLng: sw.getLng(),
          neLat: ne.getLat(),
          neLng: ne.getLng(),
          zoom: this.map.getLevel()
        });

        // 이전과 같은 영역이면 API 호출하지 않음
        if (this.isSameBounds(bounds)) {
          console.log('같은 영역이므로 API 호출 생략');
          return;
        }

        this.isLoading = true;
        this.lastBounds = bounds;

        // 매물 API 호출
        const properties = await this.fetchProperties({
          swLat: sw.getLat(),
          swLng: sw.getLng(),
          neLat: ne.getLat(),
          neLng: ne.getLng(),
          zoom: this.map.getLevel()
        });

        console.log('받아온 매물 데이터:', properties);

        // 기존 마커 제거
        this.clearMarkers();

        // 새로운 매물 데이터 저장
        this.properties = properties;

        // 새로운 마커들 생성
        if (properties && properties.length > 0) {
          this.createPropertyMarkers(properties);

          // 필터가 선택되어 있다면 인프라 분석 수행
          if (this.selectedFilter) {
            await this.analyzeInfrastructure();
            this.updateMarkersWithInfrastructureData();
          }
        } else {
          console.log('표시할 매물이 없습니다.');
        }

      } catch (error) {
        console.error('매물 데이터 로드 실패:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 이전 영역과 비교하여 같은 영역인지 확인
    isSameBounds(currentBounds) {
      if (!this.lastBounds) return false;

      const threshold = 0.0001; // 좌표 차이 임계값
      const currentSw = currentBounds.getSouthWest();
      const currentNe = currentBounds.getNorthEast();
      const lastSw = this.lastBounds.getSouthWest();
      const lastNe = this.lastBounds.getNorthEast();

      return Math.abs(currentSw.getLat() - lastSw.getLat()) < threshold &&
        Math.abs(currentSw.getLng() - lastSw.getLng()) < threshold &&
        Math.abs(currentNe.getLat() - lastNe.getLat()) < threshold &&
        Math.abs(currentNe.getLng() - lastNe.getLng()) < threshold;
    },

    // 실제 traded_houses 테이블에서 매물 데이터 가져오기
    async fetchProperties({ swLat, swLng, neLat, neLng, zoom }) {
      try {
        console.log('API 호출 시작:', { swLat, swLng, neLat, neLng, zoom });

        const response = await api.get('/recommend/list', {
          params: {
            swLat,
            swLng,
            neLat,
            neLng,
            zoom,
            // 추가 필터 옵션들
            limit: 10, // 데이터 제한을 늘림
          }
        });

        console.log('API 응답 전체:', response.data);

        // 응답 데이터 구조 확인
        if (!response.data || !response.data.houseList) {
          console.warn('응답 데이터에 houseList가 없습니다:', response.data);
          return [];
        }

        // 서버에서 받은 데이터를 지도에 표시할 형태로 변환
        const properties = response.data.houseList.map(house => {
          console.log('변환 중인 house 데이터:', house);

          return {
            id: house.id,
            lat: parseFloat(house.latitude),  // 문자열일 수 있으므로 parseFloat 적용
            lng: parseFloat(house.longitude), // 문자열일 수 있으므로 parseFloat 적용
            price: house.price * 10000, // 만원 단위를 원 단위로 변환
            location: house.umdNm + " " + house.jibun,
            infrastructureScore: 0, // 초기값
            nearbyInfrastructure: [], // 초기값
            // 추가 정보가 있다면 저장
            additionalInfo: {
              // 예시 - 실제 데이터 구조에 맞게 수정 필요
              area: house.area,
              floor: house.floor,
              buildYear: house.builtYear,
              name: house.aptNm,
              transactionDate: house.transactionDate
              // 기타 필요한 정보들...
            }
          };
        });

        // 좌표값 검증
        const validProperties = properties.filter(property => {
          const isValid = !isNaN(property.lat) && !isNaN(property.lng) &&
            property.lat >= 33 && property.lat <= 43 && // 대한민국 위도 범위
            property.lng >= 124 && property.lng <= 132; // 대한민국 경도 범위

          if (!isValid) {
            console.warn('잘못된 좌표 데이터:', property);
          }

          return isValid;
        });
        return validProperties;

      } catch (error) {
        console.error('매물 데이터 로드 실패:', error);
        return [];
      }
    },

    // 기존 마커들 제거
    clearMarkers() {
      console.log('기존 마커 제거:', this.markers.length);
      this.markers.forEach(marker => {
        marker.setMap(null);
      });
      this.markers = [];
    },

    // 매물 마커들 생성
    createPropertyMarkers(properties) {
      console.log('마커 생성 시작:', properties.length, '개');

      properties.forEach((property, index) => {

        // 좌표 유효성 재검증
        if (isNaN(property.lat) || isNaN(property.lng)) {
          console.error('잘못된 좌표값:', property);
          return;
        }

        const position = new window.kakao.maps.LatLng(property.lat, property.lng);

        // 커스텀 마커 내용 생성 (인프라 점수 반영)
        const content = this.createMarkerContent(property);

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: content,
          xAnchor: 0.5,
          yAnchor: 1.0
        });

        customOverlay.setMap(this.map);

        // 마커 클릭 이벤트 추가
        this.addMarkerClickEvent(customOverlay, property);

        this.markers.push(customOverlay);

      });

      console.log('총 생성된 마커 수:', this.markers.length);

      // 테스트용 기본 마커 추가 (디버깅용)
      if (this.markers.length === 0) {
        console.log('마커가 하나도 없어서 테스트 마커 추가');
        this.addTestMarker();
      }
    },

    // 마커 클릭 이벤트 추가
    addMarkerClickEvent(marker, property) {
      // DOM 요소에 직접 이벤트 리스너 추가
      const markerElement = marker.getContent();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = markerElement;
      const markerDiv = tempDiv.firstElementChild;

      // 마커 클릭 이벤트 핸들러
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('마커 클릭됨:', property);

        // 이미 선택된 마커를 다시 클릭한 경우 사이드바 닫기 (토글)
        if (this.selectedProperty && this.selectedProperty.id === property.id) {
          console.log('같은 마커 재클릭 - 사이드바 닫기');
          this.closeSidebar();
        } else {
          // 새로운 마커 선택
          this.selectProperty(property);
        }
      };

      // 실제 DOM에 마커가 추가된 후 이벤트 리스너 등록
      setTimeout(() => {
        const actualMarkerElement = document.querySelector(`[data-property-id="${property.id}"]`);
        if (actualMarkerElement) {
          actualMarkerElement.addEventListener('click', clickHandler);
          actualMarkerElement.style.cursor = 'pointer';
        }
      }, 100);
    },

    // 매물 선택 처리
    selectProperty(property) {
      console.log('매물 선택:', property);
      this.selectedProperty = property;

      // 선택된 마커 하이라이트 처리
      this.highlightSelectedMarker(property.id);
    },

    // 선택된 마커 하이라이트
    highlightSelectedMarker(propertyId) {
      // 모든 마커의 하이라이트 제거
      document.querySelectorAll('.custom-marker').forEach(marker => {
        marker.classList.remove('selected');
      });

      // 선택된 마커에 하이라이트 추가
      const selectedMarker = document.querySelector(`[data-property-id="${propertyId}"]`);
      if (selectedMarker) {
        selectedMarker.classList.add('selected');
      }
    },

    // 사이드바 닫기
    closeSidebar() {
      this.selectedProperty = null;
      // 모든 마커의 하이라이트 제거
      document.querySelectorAll('.custom-marker').forEach(marker => {
        marker.classList.remove('selected');
      });
    },

    // 라벨 포맷팅 (camelCase를 사용자 친화적으로 변환)
    formatLabel(key) {
      const labelMap = {
        name: '아파트 명',
        area: '면적',
        floor: '층수',
        buildYear: '건축년도',
        transactionDate: '거래일자'
      };

      return labelMap[ key ] || key;
    },

    // 테스트용 마커 추가 (디버깅용)
    addTestMarker() {
      const testProperty = {
        id: 'test-1',
        lat: 37.5666805,
        lng: 126.9784147,
        price: 50000000,
        infrastructureScore: 0,
        nearbyInfrastructure: [],
        additionalInfo: {
          buildingType: '아파트',
          area: '84㎡',
          rooms: 3,
          bathrooms: 2,
          floor: 5,
          totalFloors: 15,
          buildYear: 2018
        }
      };

      const testPosition = new window.kakao.maps.LatLng(testProperty.lat, testProperty.lng);
      const testContent = this.createMarkerContent(testProperty);

      const testOverlay = new window.kakao.maps.CustomOverlay({
        position: testPosition,
        content: testContent,
        xAnchor: 0.5,
        yAnchor: 1.0
      });

      testOverlay.setMap(this.map);
      this.addMarkerClickEvent(testOverlay, testProperty);
      this.markers.push(testOverlay);
      console.log('테스트 마커 추가 완료');
    },

    // 마커 컨텐츠 HTML 생성 (인프라 점수에 따른 스타일 적용)
    createMarkerContent(property) {
      const priceText = this.formatPrice(property.price);

      // 인프라 점수에 따른 마커 스타일 결정
      let markerClass = 'custom-marker';
      let scoreClass = '';

      if (this.selectedFilter && this.maxInfrastructureScore > 0) {
        const scoreRatio = (property.infrastructureScore || 0) / this.maxInfrastructureScore;

        if (scoreRatio >= 0.8) {
          scoreClass = 'score-excellent';
        } else if (scoreRatio >= 0.6) {
          scoreClass = 'score-good';
        } else if (scoreRatio >= 0.4) {
          scoreClass = 'score-average';
        } else if (scoreRatio >= 0.2) {
          scoreClass = 'score-below';
        } else {
          scoreClass = 'score-poor';
        }
      }

      return `
          <div class="${markerClass} ${scoreClass}" data-property-id="${property.id}">
            <div class="marker-price">${priceText}</div>
            ${this.selectedFilter && property.infrastructureScore !== undefined ?
          `<div class="marker-score">${property.infrastructureScore}</div>` : ''}
          </div>
        `;
    },

    // 가격 포맷팅
    formatPrice(price) {
      if (price >= 100000000) {
        return `${Math.floor(price / 100000000)}억`;
      } else if (price >= 10000) {
        return `${Math.floor(price / 10000)}만`;
      } else {
        return `${price}원`;
      }
    }
  },

  beforeUnmount() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.clearMarkers();

    if (this.map) {
      this.map = null;
    }
  }
}
</script>

<style scoped>
.kakao-map-page {
  width: 100%;
  height: calc(100vh - 62px);
  position: relative;
  display: flex;
}

.map-container {
  flex: 1;
  height: 100%;
  background-color: #f8f8f8;
  transition: margin-right 0.3s ease;
}

/* 인프라 필터 스타일 */
.infrastructure-filters {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  /* padding: 15px; */
  padding: 20px 25px;
  /* 세로 20px, 가로 25px */
  width: 900px;
  /* 고정 너비 */
  max-width: 95vw;
  /* 모바일 대응 */
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  /* margin-bottom: 10px; */
  text-align: center;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  font-weight: 500;
  color: #666;
}

.filter-btn:hover {
  border-color: #007BFF;
  color: #007BFF;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: #007BFF;
  border-color: #007BFF;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.filter-icon {
  font-size: 14px;
}

.filter-info {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: #007BFF;
  font-weight: 500;
}

.loading-overlay {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
}

.loading-spinner {
  display: flex;
  align-items: center;
}

/* 사이드바 스타일 */
.sidebar {
  position: fixed;
  top: 0;
  left: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-open {
  left: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
  background: #e9ecef;
  border-radius: 50%;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.sidebar-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;
}

.property-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.property-price {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border: 2px solid #007BFF;
}

.price-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.price-value {
  font-size: 24px;
  font-weight: bold;
  color: #007BFF;
}

/* 인프라 점수 스타일 */
.infrastructure-score {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.score-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.score-bar {
  position: relative;
  background: #e9ecef;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
}

.score-fill {
  background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.property-info-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.info-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  text-align: right;
}

/* 주변 인프라 정보 스타일 */
.nearby-infrastructure {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.infrastructure-list {
  max-height: 200px;
  overflow-y: auto;
}

.infrastructure-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  gap: 10px;
}

.infrastructure-item:last-child {
  border-bottom: none;
}

.place-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.place-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  line-height: 1.3;
}

.place-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.place-category {
  font-size: 11px;
  color: #007BFF;
  background: #e7f3ff;
  padding: 2px 6px;
  border-radius: 10px;
  align-self: flex-start;
  font-weight: 500;
}

.place-address {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.place-distance-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.place-distance {
  font-size: 12px;
  color: #333;
  font-weight: 600;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.place-rank {
  font-size: 10px;
  color: #6c757d;
  font-weight: 500;
}

.no-infrastructure {
  text-align: center;
  color: #999;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.no-infrastructure-icon {
  font-size: 24px;
  opacity: 0.7;
}

.no-infrastructure-text {
  font-size: 14px;
  font-style: italic;
}

.additional-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.info-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

/* 커스텀 마커 스타일 */
:deep(.custom-marker) {
  background: white;
  border: 2px solid #007BFF;
  border-radius: 8px;
  padding: 4px 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  text-align: center;
  font-family: Arial, sans-serif;
  position: relative;
}

:deep(.custom-marker:hover) {
  transform: scale(1.1);
  z-index: 1000;
}

:deep(.custom-marker.selected) {
  background: #007BFF;
  color: white;
  transform: scale(1.15);
  z-index: 1001;
}

:deep(.custom-marker.selected .marker-price) {
  color: white;
}

:deep(.custom-marker.selected .marker-score) {
  color: white;
}

/* 인프라 점수별 마커 스타일 */
:deep(.custom-marker.score-excellent) {
  border-color: #28a745;
  background: #d4edda;
}

:deep(.custom-marker.score-excellent .marker-price) {
  color: #28a745;
}

:deep(.custom-marker.score-good) {
  border-color: #17a2b8;
  background: #d1ecf1;
}

:deep(.custom-marker.score-good .marker-price) {
  color: #17a2b8;
}

:deep(.custom-marker.score-average) {
  border-color: #ffc107;
  background: #fff3cd;
}

:deep(.custom-marker.score-average .marker-price) {
  color: #856404;
}

:deep(.custom-marker.score-below) {
  border-color: #fd7e14;
  background: #ffe8d1;
}

:deep(.custom-marker.score-below .marker-price) {
  color: #fd7e14;
}

:deep(.custom-marker.score-poor) {
  border-color: #dc3545;
  background: #f8d7da;
}

:deep(.custom-marker.score-poor .marker-price) {
  color: #dc3545;
}

:deep(.marker-price) {
  font-weight: bold;
  color: #007BFF;
  font-size: 12px;
  line-height: 1.2;
}

:deep(.marker-score) {
  font-size: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 4px;
  border-radius: 8px;
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 사이드바가 열렸을 때 지도 영역 조정 */
.sidebar-open~.map-container {
  margin-right: 400px;
}

/* 모바일 반응형 대응 */
@media (max-width: 768px) {
  .kakao-map-page {
    height: calc(100vh - 56px);
  }

  .infrastructure-filters {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: none;
    max-width: none;
  }

  .filter-buttons {
    gap: 6px;
  }

  .filter-btn {
    padding: 6px 10px;
    font-size: 11px;
  }

  .sidebar {
    width: 100vw;
    right: -100vw;
  }

  .sidebar-open {
    right: 0;
  }

  .sidebar-open~.map-container {
    margin-right: 0;
  }

  .property-price {
    padding: 15px;
  }

  .price-value {
    font-size: 20px;
  }

  .sidebar-content {
    padding: 15px;
  }

  :deep(.custom-marker) {
    padding: 3px 6px;
    min-width: 50px;
  }

  :deep(.marker-price) {
    font-size: 11px;
  }

  :deep(.marker-score) {
    font-size: 9px;
    top: -6px;
    right: -6px;
    min-width: 14px;
    height: 14px;
  }
}
</style>