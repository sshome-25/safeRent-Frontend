<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import profileImage from '../../assets/blank-profile.png'
import api from '@/services/api'

const router = useRouter()

// 게시글 데이터
const posts = ref([])

// 게시글 목록 api 요청 -> 화면에 띄움
const fetchPosts = async (category, orderBy) => {
	try {
		if (category == undefined) category = "all"
		const response = await api.get('/boards', {
			params: {
				page: 1,
				category: category,
				order_by: orderBy
			},
		})
		posts.value = response.data.postList.map((post) => ({
			id: post.post_id,
			categoryId: 'all',
			title: post.title,
			content: post.content,
			createdAt: post.created_at,
			author: {
				name: post.author_nickname,
				avatar: profileImage,
			},
			// views: post.view_count,
			likes: 0,
			comments: post.comment_count,
			tags: [],
			thumbnailUrl: null,
		}))
	} catch (error) {
		console.error('Error fetching posts:', error)
	}
}

// 카테고리 데이터
const categories = ref([
	{
		id: 'all',
		name: '전체글',
		icon: 'fas fa-th-large',
		description: '커뮤니티의 모든 게시글을 확인하세요.',
	},
	{
		id: 'tips',
		name: '계약 팁',
		icon: 'fas fa-lightbulb',
		description: '안전한 전세계약을 위한 유용한 팁을 공유합니다.',
	},
	{
		id: 'scam',
		name: '사기 예방',
		icon: 'fas fa-shield-alt',
		description: '전세사기 사례와 예방책을 공유하는 공간입니다.',
	},
	{
		id: 'qa',
		name: '질문/답변',
		icon: 'fas fa-question-circle',
		description: '전세 계약에 관한 질문과 답변을 나눠보세요.',
	},
	{
		id: 'review',
		name: '계약 후기',
		icon: 'fas fa-star',
		description: '실제 계약 경험과 후기를 공유합니다.',
	},
])
const selectedCategory = ref('all')

// 페이지네이션
const currentPage = ref(1)
const postsPerPage = ref(10)

// 검색 및 정렬
const searchQuery = ref('')
const sortOption = ref('created_at')

// 글쓰기 모달
const showWriteModal = ref(false)
const newPost = ref({
	categoryId: '',
	title: '',
	content: '',
	prefer_location: '',
	prefer_room_num: '',
	prefer_area: '',
	is_park: '',
	comment_count: '',
})

// computed
const filteredPosts = computed(() => {
	let result = [ ...posts.value ]

	if (selectedCategory.value !== 'all') {
		result = result.filter((post) => post.categoryId === selectedCategory.value)
	}

	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase()
		result = result.filter(
			(post) => post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
		)
	}

	// switch (sortOption.value) {
	// 	case 'latest':
	// 		result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
	// 		break
	// 	case 'popular':
	// 		result.sort((a, b) => b.likes - a.likes)
	// 		break
	// 	case 'views':
	// 		result.sort((a, b) => b.views - a.views)
	// 		break
	// }

	return result
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage.value))

const paginationNumbers = computed(() => {
	const pages = []
	const maxVisible = 5

	if (totalPages.value <= maxVisible) {
		for (let i = 1; i <= totalPages.value; i++) {
			pages.push(i)
		}
	} else {
		let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
		let end = start + maxVisible - 1

		if (end > totalPages.value) {
			end = totalPages.value
			start = Math.max(1, end - maxVisible + 1)
		}

		for (let i = start; i <= end; i++) {
			pages.push(i)
		}
	}

	return pages
})

// methods
const selectCategory = (categoryId) => {
	fetchPosts(categoryId, "created_at")
	selectedCategory.value = categoryId
	currentPage.value = 1
}

const getCategoryName = (categoryId) => {
	const category = categories.value.find((cat) => cat.id === categoryId)
	return category ? category.name : ''
}

const getCategoryDescription = (categoryId) => {
	const category = categories.value.find((cat) => cat.id === categoryId)
	return category ? category.description : ''
}

const searchPosts = () => {
	currentPage.value = 1
}

const sortPosts = () => {
	currentPage.value = 1
	fetchPosts(selectCategory.value, sortOption.value)
}

const truncateText = (text, maxLength) => {
	if (text.length <= maxLength) return text
	return text.slice(0, maxLength) + '...'
}

const formatDate = (dateString) => {
	const date = new Date(dateString)
	const now = new Date()
	const diff = now - date

	if (diff < 86400000) {
		if (diff < 3600000) {
			const minutes = Math.floor(diff / 60000)
			return `${minutes}분 전`
		}
		const hours = Math.floor(diff / 3600000)
		return `${hours}시간 전`
	}

	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()

	if (year === now.getFullYear()) {
		return `${month}월 ${day}일`
	}

	return `${year}. ${month}. ${day}`
}

const changePage = (page) => {
	currentPage.value = page
	window.scrollTo(0, 0)
}

const goToPostDetail = (post_id) => {
	router.push({ name: 'postDetail', params: { "post_id": post_id } })
}

const openWriteModal = () => {
	newPost.value = {
		// categoryId: 'all',
		title: '',
		content: '',
		prefer_location: '',
		prefer_room_num: '',
		prefer_area: '',
		is_park: '',
	}
	showWriteModal.value = true
}

const submitPost = async () => {
	if (!newPost.value.title.trim()) {
		alert('제목을 입력해주세요.')
		return
	}

	if (!newPost.value.content.trim()) {
		alert('내용을 입력해주세요.')
		return
	}

	const postData = {
		category_id: newPost.value.categoryId,
		title: newPost.value.title,
		content: newPost.value.content,
		prefer_location: newPost.value.prefer_location,
		prefer_room_num: parseInt(newPost.value.prefer_room_num) || 0,
		prefer_area: parseInt(newPost.value.prefer_area) || 0,
		is_park: newPost.value.is_park === 'true',
	}

	try {
		const response = await api.post('/boards', postData)
		// const newPostId = response.data.post_id
		console.log(response.data)
		alert('게시글이 성공적으로 등록되었습니다.')

		showWriteModal.value = false

		// 게시글 목록 새로고침
		await fetchPosts(selectedCategory.value, "created_at")

		// router.push({ name: 'post-detail', params: { id: newPostId } })
	} catch (error) {
		console.error('Error submitting post:', error)
		alert('게시글 작성에 실패했습니다.')
	}
}

onMounted(() => {
	fetchPosts(selectedCategory.value, "created_at")
})
</script>

<template>
	<div class="community-page">
		<div class="page-header">
			<div class="container">
				<h1>안심전세 커뮤니티</h1>
				<p class="header-description">전세 계약, 사기 예방, 부동산 정보를 함께 나눠요</p>
			</div>
		</div>

		<div class="container main-content">
			<div class="content-layout">
				<!-- 왼쪽 사이드바 (카테고리) -->
				<div class="sidebar">
					<div class="category-section">
						<h3>카테고리</h3>
						<ul class="category-list">
							<li v-for="category in categories" :key="category.id"
								:class="{ active: selectedCategory === category.id }" @click="selectCategory(category.id)">
								<i :class="category.icon"></i>
								{{ category.name }}
								<span class="post-count">{{ category.count }}</span>
							</li>
						</ul>
					</div>

					<div class="quick-links">
						<h3>바로가기</h3>
						<div class="link-buttons">
							<button class="link-btn diagnosis-btn" @click="$router.push('/diagnosis')">
								<i class="fas fa-clipboard-check"></i>
								내 매물 진단받기
							</button>
							<button class="link-btn map-btn" @click="$router.push('/map')">
								<i class="fas fa-map-marker-alt"></i>
								안전 매물 찾기
							</button>
						</div>
					</div>
				</div>

				<!-- 메인 컨텐츠 영역 -->
				<div class="main-section">
					<div class="board-header">
						<div class="search-and-filter">
							<div class="search-box">
								<input type="text" v-model="searchQuery" placeholder="게시글 검색..." @keypress.enter="searchPosts" />
								<button class="search-btn" @click="searchPosts">
									<i class="fas fa-search"></i>
								</button>
							</div>

							<div class="filter-options">
								<select v-model="sortOption" @change="sortPosts">
									<option value="created_at">최신순</option>
									<option value="view_count">조회순</option>
								</select>
							</div>
						</div>

						<button class="write-post-btn" @click="openWriteModal">
							<i class="fas fa-pencil-alt"></i> 글쓰기
						</button>
					</div>

					<div class="post-list-header" v-if="selectedCategory">
						<h2>{{ getCategoryName(selectedCategory) }}</h2>
						<p>{{ getCategoryDescription(selectedCategory) }}</p>
					</div>

					<!-- 게시글 목록 -->
					<div class="post-list" v-if="posts.length > 0">
						<div v-for="post in posts" :key="post.id" class="post-card" @click="goToPostDetail(post.id)">
							<div class="post-categories">
								<span class="category-tag">{{ getCategoryName(post.categoryId) }}</span>
								<span v-for="tag in post.tags" :key="tag" v-show="post.tags && post.tags.length > 0" class="post-tag">
									#{{ tag }}
								</span>
							</div>

							<h3 class="post-title">{{ post.title }}</h3>

							<p class="post-preview">{{ truncateText(post.content, 100) }}</p>

							<div class="post-meta">
								<span class="post-author">
									<img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
									{{ post.author.name }}
								</span>
								<div class="post-stats">
									<span class="post-date">{{ formatDate(post.createdAt) }}</span>
									<!-- <span class="post-views"><i class="fas fa-eye"></i> {{ post.views }}</span> -->
									<span class="post-comments"><i class="fas fa-comment"></i> {{ post.comment_count }}</span>
									<!-- <span class="post-likes"><i class="fas fa-heart"></i> {{ post.likes }}</span> -->
								</div>
							</div>

							<div class="post-thumbnail" v-if="post.thumbnailUrl">
								<img :src="post.thumbnailUrl" alt="게시글 썸네일" />
							</div>
						</div>
					</div>

					<!-- 게시글이 없을 때 -->
					<div class="empty-posts" v-else>
						<i class="fas fa-file-alt"></i>
						<p>게시글이 없습니다.</p>
						<button class="create-post-btn" @click="openWriteModal">첫 게시글 작성하기</button>
					</div>

					<!-- 페이지네이션 -->
					<div class="pagination" v-if="totalPages > 1">
						<button class="page-btn prev" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
							<i class="fas fa-chevron-left"></i> 이전
						</button>

						<div class="page-numbers">
							<button v-for="page in paginationNumbers" :key="page" class="page-number"
								:class="{ active: currentPage === page }" @click="changePage(page)">
								{{ page }}
							</button>
						</div>

						<button class="page-btn next" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
							다음 <i class="fas fa-chevron-right"></i>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- 글쓰기 모달 -->
		<div class="modal" v-if="showWriteModal">
			<div class="modal-content write-modal">
				<div class="modal-header">
					<h2>게시글 작성</h2>
					<button class="close-modal-btn" @click="showWriteModal = false">
						<i class="fas fa-times"></i>
					</button>
				</div>

				<div class="modal-body">
					<div class="form-group">
						<label for="postCategory">카테고리</label>
						<select id="postCategory" v-model="newPost.categoryId" class="form-control">
							<option v-for="category in categories" :key="category.id" :value="category.id">
								{{ category.name }}
							</option>
						</select>
					</div>

					<div class="form-group">
						<label for="postTitle">제목</label>
						<input type="text" id="postTitle" v-model="newPost.title" class="form-control" placeholder="제목을 입력하세요" />
					</div>

					<div class="form-group">
						<label for="postContent">내용</label>
						<textarea id="postContent" v-model="newPost.content" class="form-control post-content"
							placeholder="내용을 입력하세요" rows="10"></textarea>
					</div>

					<div class="form-group">
						<label for="preferLocation">선호 지역</label>
						<input type="text" id="preferLocation" v-model="newPost.prefer_location" class="form-control"
							placeholder="선호 지역을 입력하세요" />
					</div>

					<div class="form-group">
						<label for="preferRoomNum">선호 방 개수</label>
						<input type="number" id="preferRoomNum" v-model="newPost.prefer_room_num" class="form-control"
							placeholder="선호 방 개수를 입력하세요" />
					</div>

					<div class="form-group">
						<label for="preferArea">선호 평수</label>
						<input type="number" id="preferArea" v-model="newPost.prefer_area" class="form-control"
							placeholder="선호 평수를 입력하세요 (평)" />
					</div>

					<div class="form-group">
						<label for="isPark">주차 가능 여부</label>
						<select id="isPark" v-model="newPost.is_park" class="form-control">
							<option value="">선택하세요</option>
							<option value="true">가능</option>
							<option value="false">불가능</option>
						</select>
					</div>
				</div>

				<div class="modal-footer">
					<button class="cancel-btn" @click="showWriteModal = false">취소</button>
					<button class="submit-btn" @click="submitPost">게시하기</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
@import './community-page.css';
</style>
