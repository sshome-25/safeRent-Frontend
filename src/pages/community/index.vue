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
              <li 
                v-for="category in categories" 
                :key="category.id"
                :class="{ active: selectedCategory === category.id }"
                @click="selectCategory(category.id)"
              >
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
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="게시글 검색..." 
                  @keypress.enter="searchPosts"
                />
                <button class="search-btn" @click="searchPosts">
                  <i class="fas fa-search"></i>
                </button>
              </div>
              
              <div class="filter-options">
                <select v-model="sortOption" @change="sortPosts">
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                  <option value="views">조회순</option>
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
          <div class="post-list" v-if="filteredPosts.length > 0">
            <div 
              v-for="post in filteredPosts" 
              :key="post.id"
              class="post-card"
              @click="goToPostDetail(post.id)"
            >
              <div class="post-categories">
                <span class="category-tag">{{ getCategoryName(post.categoryId) }}</span>
                <span 
                    v-for="tag in post.tags" 
                    :key="tag"
                    v-show="post.tags && post.tags.length > 0" 
                  class="post-tag"
                >
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
                  <span class="post-views"><i class="fas fa-eye"></i> {{ post.views }}</span>
                  <span class="post-comments"><i class="fas fa-comment"></i> {{ post.comments.length }}</span>
                  <span class="post-likes"><i class="fas fa-heart"></i> {{ post.likes }}</span>
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
            <button class="create-post-btn" @click="openWriteModal">
              첫 게시글 작성하기
            </button>
          </div>
          
          <!-- 페이지네이션 -->
          <div class="pagination" v-if="totalPages > 1">
            <button 
              class="page-btn prev" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <i class="fas fa-chevron-left"></i> 이전
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in paginationNumbers" 
                :key="page"
                class="page-number"
                :class="{ active: currentPage === page }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="page-btn next" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
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
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="postTitle">제목</label>
            <input 
              type="text" 
              id="postTitle"
              v-model="newPost.title"
              class="form-control"
              placeholder="제목을 입력하세요"
            />
          </div>
          
          <div class="form-group">
            <label for="postContent">내용</label>
            <textarea 
              id="postContent"
              v-model="newPost.content"
              class="form-control post-content"
              placeholder="내용을 입력하세요"
              rows="10"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="postTags">태그 (쉼표로 구분)</label>
            <input 
              type="text" 
              id="postTags"
              v-model="newPost.tagsInput"
              class="form-control"
              placeholder="예: 전세사기, 계약팁, 경험담"
            />
          </div>
          
          <div class="form-group">
            <label>첨부 파일</label>
            <div 
              class="file-upload-area"
              @click="triggerFileUpload"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <div v-if="!newPost.file" class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>파일을 여기에 끌어다 놓거나 클릭하여 업로드</p>
                <input
                  ref="fileInput"
                  type="file"
                  @change="handleFileSelect"
                  hidden
                />
              </div>
              <div v-else class="file-preview">
                <div class="file-info">
                  <span class="file-name">{{ newPost.file.name }}</span>
                  <span class="file-size">{{ formatFileSize(newPost.file.size) }}</span>
                </div>
                <button 
                  class="remove-file-btn"
                  @click.stop="removeFile"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
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

<script>
import CommunityPage  from './CommunityPage';
export default CommunityPage;
</script>

<style scoped>
    @import './community-page.css';
</style>