// 카카오맵 관련 서비스
const kakaoMapService = {
  // API 키 (환경변수에서 가져오는 것이 좋음)
  apiKey: 'cca9f1aa6092161b7976c4daad39b081',
  
  // 카카오맵 API 스크립트 로드
  loadKakaoMapScript() {
    return new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${this.apiKey}&libraries=services&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          console.log('카카오맵 API 로드 완료');
          resolve();
        });
      };
      script.onerror = (error) => {
        console.error('카카오맵 API 로드 실패:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  },
  
  // 다음 우편번호 서비스 로드 및 주소 검색
  openAddressSearch() {
    return new Promise((resolve, reject) => {
      if (!window.daum || !window.daum.Postcode) {
        // 다음 우편번호 서비스 스크립트 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = () => {
          this._openPostcode(resolve, reject);
        };
        script.onerror = (error) => {
          console.error('우편번호 서비스 로드 실패:', error);
          reject(error);
        };
        document.head.appendChild(script);
      } else {
        this._openPostcode(resolve, reject);
      }
    });
  },
  
  // 우편번호 검색 창 열기 (내부 메소드)
  _openPostcode(resolve, reject) {
    try {
      new window.daum.Postcode({
        oncomplete: (data) => {
          resolve({
            address: data.roadAddress || data.jibunAddress,
            buildingName: data.buildingName,
            zonecode: data.zonecode
          });
        },
        onclose: () => {
          // 취소했을 때
          resolve(null);
        }
      }).open();
    } catch (error) {
      reject(error);
    }
  },
  
  // 주소로 좌표 얻기
  getCoordinates(address) {
    return new Promise((resolve, reject) => {
      if (!window.kakao || !window.kakao.maps) {
        reject(new Error('카카오맵 API가 로드되지 않았습니다.'));
        return;
      }
      
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve({
            lat: result[0].y,
            lng: result[0].x
          });
        } else {
          reject(new Error('주소를 좌표로 변환하는 데 실패했습니다.'));
        }
      });
    });
  },
  
  // 지도 표시
  displayMap(container, lat, lng, address) {
    if (!window.kakao || !window.kakao.maps) {
        console.error('카카오맵 API가 로드되지 않았습니다.');
        return null;
    }
    
    // 이전 지도 요소 제거 (재렌더링 시 중복 방지)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // 새 지도 요소 생성
    const mapElement = document.createElement('div');
    mapElement.style.width = '100%';
    mapElement.style.height = '300px';
    container.appendChild(mapElement);
    
    const coords = new window.kakao.maps.LatLng(lat, lng);
    
    // 지도 생성
    const map = new window.kakao.maps.Map(mapElement, {
      center: coords,
      level: 3
    });
    
    // 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: coords,
      map: map
    });
    
    // 인포윈도우 생성
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">${address}</div>`
    });
    infowindow.open(map, marker);
    
    // 지도 컨트롤 추가
    map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);
    map.addControl(new window.kakao.maps.MapTypeControl(), window.kakao.maps.ControlPosition.TOPRIGHT);
    
    return map;
  }
};

export default kakaoMapService;