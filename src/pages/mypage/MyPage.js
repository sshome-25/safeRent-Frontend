import ContractCard from '../../components/ContractCard.vue'
  
export default {
  name: 'MyPage',
  components: {
    ContractCard
  },
  data() {
    return {
      profileName: '김안전님',
      profileMessage: '안녕하세요! 안전한 전세 계약을 응원합니다.',
      currentTab: 'progress',
      tabs: [
        { id: 'progress', name: '진행 중인 계약' },
        { id: 'completed', name: '완료된 계약' }
      ],
      progressingContracts: [
        {
            assessmentHouse: {
              id: 1,
              price: 50000,
              area: 84.5,
              address: "서울시 강남구 테헤란로 123",
              latitude: 37.5665,
              longitude: 126.9780,
              isSafe: true,
              marketPrice: 52000,
              floor: 15,
              createdAt: "2024-12-01T14:30:25" 
            }
        }
      ],
      completedContracts: [

      ]
    }
  }
}
