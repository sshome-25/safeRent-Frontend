<template>
  <div class="kakao-map-page">
    <div class="map-container" ref="mapContainer" id="kakao-map"></div>
    
    <!-- 로딩 인디케이터 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
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
      isLoading: false,
      // 기본 중심 좌표 (서울시청)
      center: { lat: 37.5666805, lng: 126.9784147 },
      // API 호출 디바운스를 위한 타이머
      debounceTimer: null,
      // 마지막으로 데이터를 가져온 영역 (중복 호출 방지)
      lastBounds: null
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
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=cca9f1aa6092161b7976c4daad39b081&autoload=false`;
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
        
        // 커스텀 마커 내용 생성
        const content = this.createMarkerContent(property);
        
        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: content,
          xAnchor: 0.5,
          yAnchor: 1.0
        });
        customOverlay.setMap(this.map);
        this.markers.push(customOverlay);
        
      });
      
      console.log('총 생성된 마커 수:', this.markers.length);
      
      // 테스트용 기본 마커 추가 (디버깅용)
      if (this.markers.length === 0) {
        console.log('마커가 하나도 없어서 테스트 마커 추가');
        this.addTestMarker();
      }
    },
    
    // 테스트용 마커 추가 (디버깅용)
    addTestMarker() {
      const testPosition = new window.kakao.maps.LatLng(37.5666805, 126.9784147);
      const testContent = `
        <div class="custom-marker">
          <div class="marker-price">테스트</div>
        </div>
      `;
      
      const testOverlay = new window.kakao.maps.CustomOverlay({
        position: testPosition,
        content: testContent,
        xAnchor: 0.5,
        yAnchor: 1.0
      });
      
      testOverlay.setMap(this.map);
      this.markers.push(testOverlay);
      console.log('테스트 마커 추가 완료');
    },
    
    // 마커 컨텐츠 HTML 생성
    createMarkerContent(property) {
      const priceText = this.formatPrice(property.price);
      return `
        <div class="custom-marker" data-property-id="${property.id}">
          <div class="marker-price">${priceText}</div>
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
  height: 100vh;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  background-color: #f8f8f8;
}

.loading-overlay {
  position: absolute;
  top: 20px;
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

.property-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  font-size: 12px;
  z-index: 1000;
}

/* 커스텀 마커 스타일 */
:deep(.custom-marker) {
  background: white;
  border: 2px solid #ff6b35;
  border-radius: 8px;
  padding: 4px 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.2s;
  min-width: 60px;
  text-align: center;
  font-family: Arial, sans-serif;
}

:deep(.custom-marker:hover) {
  transform: scale(1.1);
  z-index: 1000;
}

:deep(.marker-price) {
  font-weight: bold;
  color: #ff6b35;
  font-size: 12px;
  line-height: 1.2;
}

/* 모바일 반응형 대응 */
@media (max-width: 768px) {
  .kakao-map-page {
    height: calc(100vh - 56px);
  }
  
  .property-info {
    top: 10px;
    right: 10px;
    font-size: 11px;
    padding: 6px 10px;
  }
  
  :deep(.custom-marker) {
    padding: 3px 6px;
    min-width: 50px;
  }
  
  :deep(.marker-price) {
    font-size: 11px;
  }
}
</style>