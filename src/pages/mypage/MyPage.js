import ContractCard from "../../components/ContractCard.vue";

export default {
  name: "MyPage",
  components: {
    ContractCard,
  },
  data() {
    return {
      profileName: "김안전님",
      profileMessage: "안녕하세요! 안전한 전세 계약을 응원합니다.",
      progressContracts: 2,
      completedContracts: 2,
      currentTab: "progress",
      tabs: [
        { id: "progress", name: "진행 중인 계약" },
        { id: "completed", name: "완료된 계약" },
      ],
      progressingContracts: [
        {
          address: "서울시 강남구 테헤란로 123, 502호",
          date: "2025-04-28 시작",
          progressRatio: "2/3",
          progressPercentage: "66%",
          status: "강화 전세 판단",
          registerDetail: "등기부 등본 등록",
          contractDetail: "계약서 등록",
        },
        {
          address: "서울시 종로구 인사동길 45, 203호",
          date: "2025-04-30 시작",
          progressRatio: "1/3",
          progressPercentage: "33%",
          status: "강화 전세 판단",
          registerDetail: "등기부 등본 등록",
          contractDetail: "계약서 등록",
        },
      ],
    };
  },
};
