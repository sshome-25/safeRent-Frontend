import kakaoMapService from './services/kakaoMapService'
import fileUploadService from './services/fileUploadService'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import BarChart from './BarChart.vue'
import { useRouter } from 'vue-router'

export default {
	name: 'diagnosisPage',
	setup() {
		const router = useRouter()

		return { router }
	},
	data() {
		return {
			isMypage: false,
			currentStep: 1,
			propertyData: {
				type: '아파트',
				address: '',
				detailAddress: '',
				size: '',
				deposit: '',
				contractDate: '',
				floor: '',
				latitude: null,
				longitude: null,
			},
			documentFiles: {
				register: null,
				contract: null,
			},
			isAnalyzing: false,
			analysisStatus: '문서 스캔 중...',
			safetyScore: 85,
			overallAssessment: '',
			// '이 매물은 대체로 안전하나, 일부 주의가 필요한 사항이 발견되었습니다. 계약 시 특약사항을 확인하고 적절한 조치를 취하시기 바랍니다.',
			// issues: [
			// 	{
			// 		level: 'warning',
			// 		label: '특약사항 주의',
			// 		title: '위험 특약 조항 발견',
			// 		description:
			// 			'계약서 특약조항 중 "임차인은 임대인의 채무불이행에 대해 책임을 묻지 않는다"는 조항이 발견되었습니다. 이는 임차인의 권리를 제한할 수 있는 불공정 조항입니다.',
			// 		solution:
			// 			'해당 특약조항의 삭제 또는 수정을 요청하세요. 임대인의 의무를 면제하는 조항은 법적으로 무효가 될 수 있으나, 분쟁 예방을 위해 계약 전 수정하는 것이 좋습니다.',
			// 	},
			// 	{
			// 		level: 'caution',
			// 		label: '근저당권 확인',
			// 		title: '근저당권 설정액 주의',
			// 		description:
			// 			'해당 매물에 총 2억원의 근저당권이 설정되어 있습니다. 전세금 3억원에 비해 위험 수준은 아니지만, 주의가 필요합니다.',
			// 		solution:
			// 			'전세권 설정 및 전세보증보험 가입을 통해 보증금을 보호하세요. 계약 후 즉시 전입신고와 확정일자를 받는 것도 중요합니다.',
			// 	},
			// ],
			issues: [
				{
					level: 'warning',
					label: '근저당권 주의',
					title: '',
					description: '',
					solution: '',
				},
				{
					level: 'caution',
					label: '특약사항 확인',
					title: '',
					description: '',
					solution: '',
				},
			],
			recommendations: [
				'전세권 설정: 등기부등본에 전세권을 설정하여 법적 우선권을 확보하세요.',
				'전세보증보험 가입: 보증금 반환을 보장받기 위해 전세보증보험에 가입하는 것을 추천합니다.',
				'계약서 특약사항 수정: 발견된 위험 특약조항을 수정 또는 삭제하고 계약을 진행하세요.',
				'확정일자 및 전입신고: 계약 체결 후 즉시 확정일자를 받고 전입신고를 진행하세요.',
			],
			marketData: {
				averageDeposit: 0,
				depositRange: '',
			},
		}
	},

	async mounted() {
		// 카카오맵 스크립트 로드
		kakaoMapService.loadKakaoMapScript()
		// 최초 진입 시에도 체크
		// Mypage의 상세페이지로 쓰일 때
		if (this.analysis_id) {
			this.currentStep = 3
			this.isMypage = true
			this.fetchAnalysisData()
		}
	},

	computed: {
		progressPercentage() {
			return ((this.currentStep - 1) * 100) / 2
		},
		canProceed() {
			if (this.currentStep === 1) {
				return this.propertyData.type && this.propertyData.address && this.propertyData.deposit
			} else if (this.currentStep === 2) {
				return this.documentFiles.register !== null
			}
			// else if (this.currentStep === 3) {
			//   return this.documentFiles.contract !== null;
			// }
			return true
		},
	},

	methods: {
		// my-page에서 접근 하는 경우 analysis 관련 데이터를 fetch 해서 갖고온다.
		async fetchAnalysisData() {
			console.log('===============fetchAnalysisData 진입=============')
			// analysis_id가 없으면 함수 실행하지 않음
			if (!this.analysis_id) {
				console.warn('analysis_id가 없습니다. 분석 데이터를 조회하지 않습니다.')
				return
			}
			try {
				const response = await api.get('/assessments/analysis', {
					params: { analysis_id: this.analysis_id },
				})

				console.log(response)
				// 응답 데이터에서 5개 값 추출 (null/undefined 방지)
				const data = response?.data
				console.log(data)

				if (data.overallAssessment) {
					this.overallAssessment = data.overallAssessment
				}
				// issues 배열 초기화 (기존 데이터 제거)
				this.issues = []

				// riskFactor1과 solution1이 있으면 issues에 추가
				if (data.riskFactor1 && data.solution1) {
					this.issues.push({
						level: 'warning',
						label: '위험 요소 1',
						title: '위험 요소 발견',
						description: data.riskFactor1,
						solution: data.solution1,
					})
				}

				// riskFactor2와 solution2가 있으면 issues에 추가
				if (data.riskFactor2 && data.solution2) {
					this.issues.push({
						level: 'caution',
						label: '위험 요소 2',
						title: '추가 위험 요소',
						description: data.riskFactor2,
						solution: data.solution2,
					})
				}

				if (data.price !== undefined) {
					this.marketData.averageDeposit = data.price
				}

				if (data.marketPrice !== undefined) {
					this.propertyData.deposit = data.marketPrice
				}

				// 원래 값도 저장 (필요한 경우)
				if (data.riskFactor1) this.riskFactor1 = data.riskFactor1
				if (data.solution1) this.solution1 = data.solution1
				if (data.riskFactor2) this.riskFactor2 = data.riskFactor2
				if (data.solution2) this.solution2 = data.solution2
			} catch (error) {
				console.error('분석 데이터 조회 오류:', error)
				// 에러 발생 시에도 기본값 처리
				this.overallAssessment = ''
				this.riskFactor1 = ''
				this.solution1 = ''
				this.riskFactor2 = ''
				this.solution2 = ''
			}
		},

		prevStep() {
			if (this.currentStep > 1) {
				this.currentStep -= 1
			}
		},

		nextStep() {
			if (this.currentStep < 3 && this.canProceed) {
				this.currentStep += 1

				if (this.currentStep === 3) {
					this.startAnalysis()
				}
			}
		},

		// 카카오맵 관련 메소드
		updateAddress(address) {
			this.propertyData.address = address
		},

		async openKakaoAddressSearch() {
			try {
				const addressData = await kakaoMapService.openAddressSearch()
				if (addressData) {
					this.propertyData.address = addressData.address

					const coords = await kakaoMapService.getCoordinates(this.propertyData.address)
					this.propertyData.latitude = coords.lat
					this.propertyData.longitude = coords.lng

					// 지도 표시
					this.$nextTick(() => {
						const mapContainer = document.querySelector('.map-container')
						if (mapContainer) {
							kakaoMapService.displayMap(mapContainer, coords.lat, coords.lng, this.propertyData.address)
						}
					})
				}
			} catch (error) {
				console.error('주소 검색 중 오류 발생:', error)
				alert('주소를 검색하는 중 오류가 발생했습니다.')
			}
		},

		// 파일 업로드 관련 메소드
		triggerFileUpload(fileType) {
			const refName = fileType === 'register' ? 'registerFileInput' : 'contractFileInput'
			this.$refs[refName].click()
		},

		handleFileSelect(event, fileType) {
			const file = event.target.files[0]
			if (file) {
				const validationResult = fileUploadService.validateFile(file)
				if (validationResult.valid) {
					this.documentFiles[fileType] = file
				} else {
					alert(validationResult.error)
				}
			}
		},

		handleFileDrop(event, fileType) {
			event.preventDefault()
			const file = event.dataTransfer.files[0]
			if (file) {
				const validationResult = fileUploadService.validateFile(file)
				if (validationResult.valid) {
					this.documentFiles[fileType] = file
				} else {
					alert(validationResult.error)
				}
			}
		},

		removeFile(fileType) {
			this.documentFiles[fileType] = null
			const refName = fileType === 'register' ? 'registerFileInput' : 'contractFileInput'
			if (this.$refs[refName]) {
				this.$refs[refName].value = ''
			}
		},

		formatFileSize(size) {
			return fileUploadService.formatFileSize(size)
		},

		// 분석 관련 메소드
		async startAnalysis() {
			this.isAnalyzing = true

			try {
				// await를 사용하여 비동기 요청의 결과를 기다림
				const response = await this.sendAssessmentRequest(
					this.propertyData.latitude,
					this.propertyData.longitude,
					this.propertyData.deposit,
					this.propertyData.size,
					this.propertyData.address + ' ' + this.propertyData.detailAddress,
					this.propertyData.floor,
					this.documentFiles.register
				)

				if (response && response.grokResult) {
					try {
						// 응답 데이터 확인
						console.log(response)
						console.log(response.grokResult)
						const grokResponse = response.grokResult

						if (grokResponse.overallAssessment) {
							this.overallAssessment = grokResponse.overallAssessment
						}

						// issues 배열 초기화 (기존 데이터 제거)
						this.issues = []

						// riskFactor1과 solution1이 있으면 issues에 추가
						if (grokResponse.riskFactor1 && grokResponse.solution1) {
							this.issues.push({
								level: 'warning',
								label: '위험 요소 1',
								title: '위험 요소 발견',
								description: grokResponse.riskFactor1,
								solution: grokResponse.solution1,
							})
						}

						// riskFactor2와 solution2가 있으면 issues에 추가
						if (grokResponse.riskFactor2 && grokResponse.solution2) {
							this.issues.push({
								level: 'caution',
								label: '위험 요소 2',
								title: '추가 위험 요소',
								description: grokResponse.riskFactor2,
								solution: grokResponse.solution2,
							})
						}

						if (response.aroundAvgPrice !== undefined) {
							this.marketData.averageDeposit = response.aroundAvgPrice
						}

						// 원래 값도 저장 (필요한 경우)
						if (grokResponse.riskFactor1) this.riskFactor1 = grokResponse.riskFactor1
						if (grokResponse.solution1) this.solution1 = grokResponse.solution1
						if (grokResponse.riskFactor2) this.riskFactor2 = grokResponse.riskFactor2
						if (grokResponse.solution2) this.solution2 = grokResponse.solution2
					} catch (parseError) {
						console.error('JSON 파싱 오류:', parseError)
					}
				}

				// 안전 여부 업데이트
				if (response.isSafe !== undefined) {
					this.isSafe = response.isSafe
				}

				// 주소 정보 업데이트
				if (response.address) {
					this.address = response.address
				}

				// 분석 완료
				this.isAnalyzing = false
			} catch (error) {
				console.error('분석 중 오류 발생:', error)
				this.isAnalyzing = false
				// 오류 처리 로직 추가
			}
			// 분석 완료 (실제로는 API 호출 결과 처리)
			// setTimeout(() => {
			// 	this.isAnalyzing = false
			// }, 9000)
		},

		async sendAssessmentRequest(latitude, longitude, price, size, address, floor, registerFile) {
			try {
				const authStore = useAuthStore()

				// 게스트 토큰이 필요한 경우에만 발급
				if (!authStore.isLoggedIn) {
					const tokenResponse = await api.post('/user/guest-token', {
						purpose: 'assessment-view',
					})
					// 게스트 토큰은 일시적으로만 사용
					api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`
				}

				const houseInfo = {
					latitude,
					longitude,
					price,
					area: size,
					address,
					floor,
				}
				const formData = new FormData()
				formData.append('house_info', new Blob([JSON.stringify(houseInfo)], { type: 'application/json' }))
				formData.append('register_file', registerFile)

				const endpoint = authStore.isLoggedIn ? '/assessments/member' : '/assessments/guest'
				const response = await api.post(endpoint, formData)
				console.log(endpoint + '응답: ' + response)
				return response.data
			} catch (error) {
				console.error('평가 요청 실패:', error)
				this.isAnalyzing = false
				throw error
			}
		},

		// UI 헬퍼 메소드
		getSafetyScoreClass() {
			if (this.safetyScore >= 80) return 'score-high'
			if (this.safetyScore >= 60) return 'score-medium'
			return 'score-low'
		},

		getTagClass(level) {
			if (level === 'danger') return 'tag-danger'
			if (level === 'warning') return 'tag-warning'
			if (level === 'caution') return 'tag-caution'
			return 'tag-info'
		},

		getIssueCardClass(level) {
			if (level === 'danger') return 'issue-danger'
			if (level === 'warning') return 'issue-warning'
			if (level === 'caution') return 'issue-caution'
			return 'issue-info'
		},

		getIssueLevelClass(level) {
			if (level === 'danger') return 'level-danger'
			if (level === 'warning') return 'level-warning'
			if (level === 'caution') return 'level-caution'
			return 'level-info'
		},

		getIssueLevelText(level) {
			if (level === 'danger') return '위험'
			if (level === 'warning') return '경고'
			if (level === 'caution') return '주의'
			return '정보'
		},

		// 데이터 포맷 관련 메소드
		formatCurrency(value) {
			// value는 만원 단위로 들어온다고 가정 (예: 125000 == 1억2500만원)
			if (value === null || value === undefined || isNaN(value)) return '-'

			// 억 단위 이상
			if (value >= 10000) {
				// 1억 = 10,000만원
				const eok = Math.floor(value / 10000)
				const man = value % 10000
				if (man === 0) {
					return `${eok}억`
				} else {
					// 만 단위도 표시
					return `${eok}억 ${man.toLocaleString('ko-KR')}만원`
				}
			}
			// 만원 단위 이상
			if (value >= 1) {
				return `${value.toLocaleString('ko-KR')}만원`
			}
			// 1 미만(0 등)
			return '-'
		},

		getPriceComparisonClass() {
			if (!this.marketData.averageDeposit || !this.propertyData.deposit) return ''
			const ratio = this.propertyData.deposit / this.marketData.averageDeposit
			return ratio >= 0.8 ? 'danger' : 'safe'
		},

		getPriceComparisonText() {
			const ratio = this.propertyData.deposit / this.marketData.averageDeposit
			const percent = Math.abs((ratio - 1) * 100).toFixed(1)

			if (ratio >= 1.0) return `시세보다 ${percent}% 높음`
			if (ratio < 1.0) return `시세보다 ${percent}% 낮음`
		},

		// 액션 버튼 메소드
		downloadReport() {
			alert('상세 보고서 다운로드 기능은 실제 구현 시 PDF 생성 라이브러리를 연동하세요.')
		},

		shareResult() {
			alert('결과 공유 기능은 실제 구현 시 소셜 공유 기능을 연동하세요.')
		},
		getSummaryText() {
			if (!this.marketData.averageDeposit || !this.propertyData.deposit) return '-'
			const ratio = this.propertyData.deposit / this.marketData.averageDeposit
			if (ratio > 0.8) {
				return '위험한 매물입니다'
			} else {
				const percent = Math.round(ratio * 100)
				return `해당 전세가가 매물의 ${percent}% 이하이므로 안전한 매물입니다`
			}
		},
	},
	props: {
		analysis_id: {
			type: String,
			required: false,
			default: null,
		},
	},
	watch: {
		// analysisId가 변할 때마다 currentStep을 업데이트
		analysis_id: {
			immediate: true,
			handler(newVal) {
				if (newVal) {
					this.currentStep = 3
				}
			},
		},
	},
	components: {
		BarChart,
	},
}
