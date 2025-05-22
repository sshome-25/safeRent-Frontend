import api from '@/services/api'
import ContractCard from '../../components/ContractCard.vue'

export default {
	name: 'MyPage',
	components: {
		ContractCard,
	},
	data() {
		return {
			profileName: '김안전님',
			profileMessage: '안녕하세요! 안전한 전세 계약을 응원합니다.',
			currentTab: 'progress',
			tabs: [{ id: 'progress', name: '진행 중인 계약' }],
			progressingContracts: [
				{
					assessmentHouse: {
						id: 1,
						price: 50000,
						area: 84.5,
						address: '서울시 강남구 테헤란로 123',
						latitude: 37.5665,
						longitude: 126.978,
						isSafe: true,
						marketPrice: 52000,
						floor: 15,
						createdAt: '2024-12-01T14:30:25',
					},
				},
			],
			completedContracts: [],
		}
	},
	async mounted() {
		try {
			await this.fetchUserProfile()
			await this.fetchContracts()
		} catch (error) {
			console.error('데이터 로딩 중 오류 발생:', error)
			this.error = '데이터를 불러오는 중 오류가 발생했습니다.'
		} finally {
			this.loading = false
		}
	},
	methods: {
		async fetchUserProfile() {
			try {
				const response = await api.get('/user/profile')
				this.profileName = response.data.name || '김안전님'
				this.profileMessage = response.data.message || '안녕하세요! 안전한 전세 계약을 응원합니다.'
			} catch (error) {
				console.error('프로필 정보 로딩 실패:', error)
				// 기본값 설정
				this.profileName = '김안전님'
				this.profileMessage = '안녕하세요! 안전한 전세 계약을 응원합니다.'
			}
		},
		async fetchContracts() {
			try {
				// 진행 중인 계약 조회
				const progressResponse = await api.get('/assessments')
				console.log(progressResponse)
				this.progressingContracts = progressResponse.data.map((contract) => ({
					assessmentHouse: {
						id: contract.id,
						price: contract.price,
						area: contract.area,
						address: contract.address,
						latitude: contract.latitude,
						longitude: contract.longitude,
						isSafe: contract.isSafe,
						marketPrice: contract.marketPrice,
						floor: contract.floor,
						createdAt: contract.createdAt,
					},
				}))
			} catch (error) {
				console.error('계약 정보 로딩 실패:', error)
				throw error
			}
		},

		async refreshContracts() {
			this.loading = true
			try {
				await this.fetchContracts()
				this.error = null
			} catch (error) {
				this.error = '계약 정보를 새로고침하는 중 오류가 발생했습니다.'
			} finally {
				this.loading = false
			}
		},
	},
}
