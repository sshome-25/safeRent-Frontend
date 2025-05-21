<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import profileImage from '../../assets/blank-profile.png'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const post_id = route.params.post_id

// 스토어 인스턴스 생성
// const userStore = useUserStore()
// 반응형 참조로 현재 로그인한 사용자 정보 가져오기
// const { currentUserId } = storeToRefs(userStore)
const currentUserId = 2 //테스트용

// 게시글 및 댓글 데이터
const post = ref(null)
const comments = ref([])
const newComment = ref('')
const isLoading = ref(true)
const error = ref(null)
const isAuthor = ref(false) // 작성자 여부 확인용 변수
const isEditing = ref(false) // 수정 모드 여부

// 수정용 게시글 데이터 
const editedPost = ref({
  title: '',
  content: '',
  prefer_location: '',
  prefer_room_num: 0,
  prefer_area: 0,
  is_park: false
})

// 게시글 상세 정보 가져오기
const fetchPostDetail = async () => {
  isLoading.value = true
  try {
    const response = await api.get(`/boards/${post_id}`)
    post.value = {
      id: response.data.post_id,
      title: response.data.title,
      content: response.data.content,
      createdAt: response.data.created_at,
      author: {
        name: response.data.author_nickname || '사용자',
        avatar: profileImage,
      },
      user_id: response.data.user_id, // 게시글 작성자 ID 추가
      // views: response.data.view_count,
      // likes: 0,
      prefer_location: response.data.prefer_location,
      prefer_room_num: response.data.prefer_room_num,
      prefer_area: response.data.prefer_area,
      is_park: response.data.is_park,
    }
    // 현재 사용자가 작성자인지 확인
    // TODO: token 에서 시용자 이메일 또는 닉네임 빼서 작성지 이메일 또는 닉네임이랑 비교 
    isAuthor.value = currentUserId === post.value.user_id

    // 댓글 가져오기
    await fetchComments()
  } catch (err) {
    console.error('게시글을 불러오는 중 오류가 발생했습니다:', err)
    error.value = '게시글을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }

  // 수정 폼  입력값 초기화
  editedPost.value = {
    title: post.value.title,
    content: post.value.content,
    prefer_location: post.value.prefer_location || '',
    prefer_room_num: post.value.prefer_room_num || 0,
    prefer_area: post.value.prefer_area || 0,
    is_park: post.value.is_park || false
  }
}

// 게시글 수정 모드 전환
const editPost = () => {
  // router.push(`/post/edit/${post_id}`)
  isEditing.value = true
}

// 게시글 수정 취소 -> 수정 폼 초기값으로 되돌리기
const cancelEdit = () => {
  isEditing.value = false
  editedPost.value = {
    title: post.value.title,
    content: post.value.content,
    prefer_location: post.value.prefer_location || '',
    prefer_room_num: post.value.prefer_room_num || 0,
    prefer_area: post.value.prefer_area || 0,
    is_park: post.value.is_park || false
  }
}

// 게시글 수정 저장 (새로 추가)
const saveEdit = async () => {
  if (!editedPost.value.title.trim()) {
    alert('제목을 입력해주세요.')
    return
  }

  if (!editedPost.value.content.trim()) {
    alert('내용을 입력해주세요.')
    return
  }

  try {
    const postData = {
      title: editedPost.value.title,
      content: editedPost.value.content,
      prefer_location: editedPost.value.prefer_location,
      prefer_room_num: parseInt(editedPost.value.prefer_room_num) || 0,
      prefer_area: parseInt(editedPost.value.prefer_area) || 0,
      is_park: editedPost.value.is_park === true || editedPost.value.is_park === 'true',
    }

    await api.patch(`/boards/${post_id}`, postData)

    alert('게시글이 성공적으로 수정되었습니다.')
    isEditing.value = false

    // 게시글 정보 다시 불러오기
    await fetchPostDetail()
  } catch (err) {
    console.error('게시글 수정 중 오류가 발생했습니다:', err)
    alert('게시글 수정에 실패했습니다.')
  }
}

// 게시글 삭제
const deletePost = async () => {
  if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    return
  }

  try {
    await api.delete(`/boards/${post_id}`)
    alert('게시글이 삭제되었습니다.')
    router.push('/community')
  } catch (err) {
    console.error('게시글 삭제 중 오류가 발생했습니다:', err)
    alert('게시글 삭제에 실패했습니다.')
  }
}


// 댓글 목록 가져오기
const fetchComments = async () => {
  try {
    const response = await api.get(`/boards/comments`, {
      params: { 'post_id': post_id }
    })
    comments.value = response.data.commentList.map(comment => ({
      id: comment.comment_id,
      content: comment.content,
      createdAt: comment.created_at,
      author: {
        name: comment.author_nickname || '사용자',
        avatar: profileImage
      }
    }))
  } catch (err) {
    console.error('댓글을 불러오는 중 오류가 발생했습니다:', err)
  }
}

// 댓글 작성하기
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('댓글 내용을 입력해주세요.')
    return
  }

  try {
    await api.post(`/boards/${post_id}/comments`, {
      content: newComment.value
    })

    // 성공 알림 표시
    alert('댓글이 등록되었습니다.')

    // 댓글 입력창 초기화
    newComment.value = ''

    // 댓글 목록 새로고침
    await fetchComments()
  } catch (err) {
    console.error('댓글 등록 중 오류가 발생했습니다:', err)
    alert('댓글 등록에 실패했습니다.')
  }
}

// 날짜 포맷팅
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

// 뒤로 가기
const goBack = () => {
  router.push('/community')
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<template>
  <div class="post-detail-page">
    <div class="container">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>게시글을 불러오는 중입니다...</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-else-if="error" class="error-container">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="back-btn" @click="goBack">목록으로 돌아가기</button>
      </div>


      <!-- 게시글 수정 폼 -->
      <div v-else-if="isEditing" class="post-edit-container">
        <div class="post-form">
          <h2 class="form-title">게시글 수정</h2>

          <div class="form-group">
            <label for="post-title">제목</label>
            <input 
              id="post-title" type="text" v-model="editedPost.title" class="form-control"
              placeholder="제목을 입력하세요" />
          </div>

          <div class="form-group">
            <label for="post-content">내용</label>
            <textarea 
              id="post-content" v-model="editedPost.content" class="form-control" rows="10"
              placeholder="내용을 입력하세요"></textarea>
          </div>

          <div class="form-section">
            <h3 class="section-title">선호 조건 (선택사항)</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="prefer-location">선호 지역</label>
                <input 
                  id="prefer-location" type="text" v-model="editedPost.prefer_location" class="form-control"
                  placeholder="예: 강남구, 서초구" />
              </div>

              <div class="form-group">
                <label for="prefer-room-num">방 개수</label>
                <input 
                  id="prefer-room-num" type="number" v-model="editedPost.prefer_room_num" class="form-control"
                  min="0" />
              </div>

              <div class="form-group">
                <label for="prefer-area">선호 평수</label>
                <input id="prefer-area" type="number" v-model="editedPost.prefer_area" class="form-control" min="0" />
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="editedPost.is_park" />
                  <span>주차 가능</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="cancelEdit">취소</button>
            <button class="submit-btn" @click="saveEdit">저장</button>
          </div>
        </div>
      </div>

      <!-- 게시글 상세 내용 -->
      <div v-else-if="post" class="post-detail-container">
        <div class="post-header">
          <div class="header-actions">

            <button class="back-btn" @click="goBack">
              <i class="fas fa-arrow-left"></i> 목록으로
            </button>


            <!-- 작성자인 경우에만 수정/삭제 버튼 표시 -->
            <div v-if="isAuthor" class="author-actions">
              <button class="edit-btn" @click="editPost">
                <i class="fas fa-edit"></i> 수정
              </button>
              <button class="delete-btn" @click="deletePost">
                <i class="fas fa-trash"></i> 삭제
              </button>
            </div>
          </div>

          <h1 class="post-title">{{ post.title }}</h1>

          <div class="post-meta">
            <div class="author-info">
              <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
              <span class="author-name">{{ post.author.name }}</span>
            </div>
            <div class="post-stats">
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              <!-- <span class="post-views"><i class="fas fa-eye"></i> {{ post.views }}</span> -->
              <span class="post-comments"><i class="fas fa-comment"></i> {{ post.comment_count }}</span>
              <!-- <span class="post-likes"><i class="fas fa-heart"></i> {{ post.likes }}</span> -->
            </div>
          </div>
        </div>

        <div class="post-content">
          <p>{{ post.content }}</p>
        </div>

        <div 
          class="post-preferences"
          v-if="post.prefer_location || post.prefer_room_num || post.prefer_area || post.is_park !== undefined">
          <h3>선호 조건</h3>
          <div class="preferences-grid">
            <div class="preference-item" v-if="post.prefer_location">
              <i class="fas fa-map-marker-alt"></i>
              <div class="preference-content">
                <span class="preference-label">선호 지역</span>
                <span class="preference-value">{{ post.prefer_location }}</span>
              </div>
            </div>
            <div class="preference-item" v-if="post.prefer_room_num">
              <i class="fas fa-door-open"></i>
              <div class="preference-content">
                <span class="preference-label">방 개수</span>
                <span class="preference-value">{{ post.prefer_room_num }}개</span>
              </div>
            </div>
            <div class="preference-item" v-if="post.prefer_area">
              <i class="fas fa-expand"></i>
              <div class="preference-content">
                <span class="preference-label">선호 평수</span>
                <span class="preference-value">{{ post.prefer_area }}평</span>
              </div>
            </div>
            <div class="preference-item" v-if="post.is_park !== undefined">
              <i class="fas fa-car"></i>
              <div class="preference-content">
                <span class="preference-label">주차 가능</span>
                <span class="preference-value">{{ post.is_park ? '가능' : '불가능' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <div class="comments-section">
          <h3 class="comments-title">
            댓글 <span class="comments-count">{{ comments.length }}</span>
          </h3>

          <!-- 댓글 작성 폼 -->
          <div class="comment-form">
            <div class="form-group">
              <textarea v-model="newComment" class="comment-input" placeholder="댓글을 작성해주세요..." rows="3"></textarea>
              <button class="submit-comment-btn" @click="submitComment">
                댓글 작성
              </button>
            </div>
          </div>

          <!-- 댓글 목록 -->
          <div class="comments-list">
            <div v-if="comments.length === 0" class="no-comments">
              <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
            </div>
            <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-author">
                <img :src="comment.author.avatar" :alt="comment.author.name" class="comment-avatar" />
                <div class="comment-author-info">
                  <span class="comment-author-name">{{ comment.author.name }}</span>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
              </div>
              <div class="comment-content">
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail-page {
  padding-top: 60px;
  min-height: calc(100vh - 60px);
  background-color: var(--light-gray);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 로딩 컨테이너 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 에러 컨테이너 */
.error-container {
  text-align: center;
  padding: 60px 0;
}

.error-container i {
  font-size: 48px;
  color: var(--danger-color);
  margin-bottom: 20px;
}

.error-container p {
  margin-bottom: 20px;
  color: var(--text-color);
}

/* 게시글 상세 컨테이너 */
.post-detail-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.post-header {
  padding: 25px 30px;
  border-bottom: 1px solid var(--border-color);
}

.back-btn {
  background: none;
  border: none;
  color: var(--light-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  margin-bottom: 15px;
  font-size: 14px;
}

.back-btn:hover {
  color: var(--primary-color);
}

.post-title {
  font-size: 24px;
  margin-bottom: 15px;
  color: var(--text-color);
  line-height: 1.4;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 500;
  color: var(--text-color);
}

.post-stats {
  display: flex;
  gap: 15px;
  color: var(--light-text);
  font-size: 14px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.post-content {
  padding: 30px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-color);
  white-space: pre-line;
}

/* 선호 조건 */
.post-preferences {
  padding: 0 30px 30px;
  border-bottom: 1px solid var(--border-color);
}

.post-preferences h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: var(--secondary-color);
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: var(--light-gray);
  border-radius: 8px;
}

.preference-item i {
  font-size: 20px;
  color: var(--primary-color);
}

.preference-content {
  display: flex;
  flex-direction: column;
}

.preference-label {
  font-size: 12px;
  color: var(--light-text);
}

.preference-value {
  font-weight: 500;
  color: var(--text-color);
}

/* 댓글 섹션 */
.comments-section {
  display: flex;
  flex-direction: column;
  padding: 30px;
}

.comments-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: var(--secondary-color);
  display: flex;
  align-items: center;
}

.comments-count {
  margin-left: 8px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 14px;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-input {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  resize: vertical;
  font-size: 14px;
  margin-bottom: 10px;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.submit-comment-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  float: right;
}

.submit-comment-btn:hover {
  background-color: var(--secondary-color);
}

.no-comments {
  text-align: center;
  padding: 30px 0;
  color: var(--light-text);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 20px;
  background-color: var(--light-gray);
  border-radius: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-author-info {
  display: flex;
  flex-direction: column;
}

.comment-author-name {
  font-weight: 500;
  color: var(--text-color);
  font-size: 14px;
}

.comment-date {
  font-size: 12px;
  color: var(--light-text);
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  text-align: left;
  margin-left: 120px;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .post-stats {
    width: 100%;
    justify-content: space-between;
  }

  .preferences-grid {
    grid-template-columns: 1fr;
  }
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.author-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.edit-btn {
  color: var(--primary-color);
}

.edit-btn:hover {
  background-color: var(--primary-light);
}

.delete-btn {
  color: var(--danger-color);
}

.delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* 게시글 수정 폼 스타일 추가 */
.post-edit-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 30px;
}

.post-form {
  width: 100%;
}

.form-title {
  font-size: 24px;
  margin-bottom: 25px;
  color: var(--text-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-section {
  margin-top: 30px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: var(--secondary-color);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-control {
  resize: vertical;
  min-height: 150px;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn, .submit-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background-color: var(--light-gray);
  color: var(--text-color);
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
}

.submit-btn:hover {
  background-color: var(--secondary-color);
}
</style>
