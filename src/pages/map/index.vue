<template>
  <header class="header">
    <div class="container">
      <div class="logo" @click="$router.push('/')">안심전세</div>
      <nav>
        <ul>
          <li><a href="#">홈</a></li>
          <li><router-link to="/">서비스 소개</router-link></li>
          <li><router-link to="/community">게시판</router-link></li>
          <li><button class="login-btn">로그인</button></li>
        </ul>
      </nav>
    </div>
  </header>
  <div class="kakao-map-page">
    <div class="map-container" ref="mapContainer" id="kakao-map"></div>
  </div>
</template>

<script>
export default {
  name: 'KakaoMapPage',
  data() {
    return {
      map: null,
      marker: null,
      // 기본 중심 좌표 (서울시청)
      center: { lat: 37.5666805, lng: 126.9784147 }
    };
  },
  mounted() {
    // 페이지 로드 시 카카오 맵 API 스크립트 로드
    this.loadKakaoMapScript();
  },
  methods: {
    loadKakaoMapScript() {
      // 이미 로드되었는지 확인
      if (window.kakao && window.kakao.maps) {
        this.initMap();
        return;
      }
      
      // 카카오 맵 API 스크립트 로드
      const script = document.createElement('script');
      /* 
          아래 YOUR_APP_KEY 부분에 발급받은 앱 키를 넣으세요.
          앱 키는 카카오 개발자 사이트(https://developers.kakao.com)에서 
          애플리케이션을 등록하고 받을 수 있습니다.
      */
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=cca9f1aa6092161b7976c4daad39b081&autoload=false`;
      script.async = true;
      
      script.onload = () => {
        // 카카오 맵 API 로드 후 초기화
        window.kakao.maps.load(() => {
          this.initMap();
        });
      };
      
      document.head.appendChild(script);
    },
    
    initMap() {
      // 지도를 표시할 컨테이너 요소
      const container = this.$refs.mapContainer;
      
      // 지도 옵션
      const options = {
        center: new window.kakao.maps.LatLng(this.center.lat, this.center.lng), // 지도 중심 좌표
        level: 3 // 지도 확대 레벨 (1~14, 숫자가 작을수록 더 확대됨)
      };
      
      // 지도 생성
      this.map = new window.kakao.maps.Map(container, options);
      
      // 지도 컨트롤 추가
      this.addMapControls();
      
      // 마커 추가
      this.addMarker(this.center.lat, this.center.lng);
      
      // 지도 클릭 이벤트 등록
      window.kakao.maps.event.addListener(this.map, 'click', (mouseEvent) => {
        // 클릭한 위치의 좌표
        const latlng = mouseEvent.latLng;
        
        // 마커 위치 변경
        this.moveMarker(latlng.getLat(), latlng.getLng());
        
        // 지도 중심 이동
        this.map.setCenter(latlng);
      });
    },
    
    addMapControls() {
      // 지도 타입 변경 컨트롤 추가
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      this.map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
      
      // 확대/축소 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      this.map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    },
    
    addMarker(lat, lng) {
      // 마커 위치
      const position = new window.kakao.maps.LatLng(lat, lng);
      
      // 마커 생성
      this.marker = new window.kakao.maps.Marker({
        position: position,
        map: this.map,
        // 마커 드래그 가능 설정
        draggable: true
      });
      
      // 마커 드래그 이벤트 등록
      window.kakao.maps.event.addListener(this.marker, 'dragend', () => {
        const position = this.marker.getPosition();
        const lat = position.getLat();
        const lng = position.getLng();
        
        // 마커 위치 정보 업데이트 (필요시 활용)
        console.log(`마커 위치: 위도 ${lat}, 경도 ${lng}`);
      });
      
      // 마커 클릭 이벤트 등록
      window.kakao.maps.event.addListener(this.marker, 'click', () => {
        // 마커 클릭 시 인포윈도우 표시
        this.showInfoWindow();
      });
    },
    
    moveMarker(lat, lng) {
      // 마커가 없으면 생성
      if (!this.marker) {
        this.addMarker(lat, lng);
        return;
      }
      
      // 마커 위치 변경
      const position = new window.kakao.maps.LatLng(lat, lng);
      this.marker.setPosition(position);
    },
    
    showInfoWindow() {
      // 인포윈도우에 표시할 내용
      const content = '<div style="padding:5px;width:150px;text-align:center;">선택한 위치입니다</div>';
      
      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: content,
        removable: true // 닫기 버튼 표시
      });
      
      // 인포윈도우 열기
      infowindow.open(this.map, this.marker);
    }
  },
  beforeUnmount() {
    // 컴포넌트 제거 시 정리 작업
    if (this.map) {
      // 이벤트 리스너 제거 등의 작업이 필요하다면 여기서 수행
      this.map = null;
      this.marker = null;
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

/* 모바일 반응형 대응 */
@media (max-width: 768px) {
  .kakao-map-page {
    height: calc(100vh - 56px); /* 모바일 상단 바를 고려한 높이 조정 */
  }
}
</style>