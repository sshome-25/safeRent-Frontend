<template>
  <div class="landing-page">
    <header class="header">
      <div class="container">
        <div class="logo">안심전세</div>
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

    <section class="hero">
      <div class="container">
        <h1>전세사기 걱정 없는 <span class="highlight">안전한 주거생활</span>을 시작하세요</h1>
        <p>등기부등본 분석과 계약서 검토를 통한 전문적인 진단 서비스로 안전한 전세 계약을 도와드립니다</p>
        <div class="hero-buttons">
          <button class="primary-btn" @click="navigateTo('diagnosis')">내 매물 진단받기</button>
          <button class="secondary-btn" @click="navigateTo('map')">안전 매물 찾기</button>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2>전세사기 유형과 예방법</h2>
        
        <div class="feature-cards">
          <div class="feature-card">
            <h3>깡통 전세</h3>
            <p>집주인이 여러 금융기관에서 대출을 받아 건물 가치보다 많은 대출금을 빌린 후, 
            전세금을 받고 사라지는 사기 수법입니다.</p>
            <div class="card-tip">
              <strong>확인 방법:</strong> 등기부등본에서 근저당 설정액을 확인하고 
              건물 시세와 비교해보세요.
            </div>
          </div>
          
          <div class="feature-card">
            <h3>등기부등본 사기</h3>
            <p>등기부등본상 다양한 권리관계를 숨기거나 속여 전세금을 가로채는 
            수법입니다.</p>
            <div class="card-tip">
              <strong>확인 방법:</strong> 소유권, 저당권, 가압류, 가처분 등 권리관계를 
              꼼꼼히 확인하세요.
            </div>
          </div>
          
          <div class="feature-card">
            <h3>계약서 특약 사기</h3>
            <p>계약서 특약 조항에 불리한 내용을 포함시켜 전세보증금 반환을 회피하는 
            수법입니다.</p>
            <div class="card-tip">
              <strong>확인 방법:</strong> 특약 조항을 꼼꼼히 검토하고, 의심스러운 조항은 
              법률 전문가와 상담하세요.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <div class="container">
        <h2>안심전세 서비스 이용 방법</h2>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>매물 정보 등록</h3>
            <p>관심 있는 매물의 기본 정보와 주소를 입력하세요.</p>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <h3>서류 업로드</h3>
            <p>등기부등본과 계약서를 업로드하여 분석을 요청하세요.</p>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <h3>전문 분석</h3>
            <p>AI와 전문가의 협업으로 잠재적 위험요소를 분석합니다.</p>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <h3>진단 결과 확인</h3>
            <p>상세한 리포트와 안전 점수로 매물의 안전성을 확인하세요.</p>
          </div>
        </div>
        
        <div class="cta-buttons">
          <button class="primary-btn" @click="navigateTo('diagnosis')">내 매물 진단받기</button>
          <button class="secondary-btn" @click="navigateTo('map')">안전 매물 찾기</button>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">안심전세</div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>서비스</h4>
              <ul>
                <li><a href="#">매물 진단</a></li>
                <li><a href="#">안전 매물 찾기</a></li>
                <li><a href="#">전세사기 사례</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h4>회사</h4>
              <ul>
                <li><a href="#">소개</a></li>
                <li><a href="#">팀</a></li>
                <li><a href="#">블로그</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h4>지원</h4>
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">문의하기</a></li>
                <li><a href="#">피드백</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2025 안심전세. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import LandingPage from './LandingPage';
export default LandingPage;
</script>

<style scoped>
    @import './landing-page.css';
</style>