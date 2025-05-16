export default {
  name: 'CommunityPage',
  data() {
    return {
      // 카테고리 데이터
      categories: [
        { id: 'all', name: '전체글', icon: 'fas fa-th-large', count: 127, description: '커뮤니티의 모든 게시글을 확인하세요.' },
        { id: 'tips', name: '계약 팁', icon: 'fas fa-lightbulb', count: 45, description: '안전한 전세계약을 위한 유용한 팁을 공유합니다.' },
        { id: 'scam', name: '사기 예방', icon: 'fas fa-shield-alt', count: 38, description: '전세사기 사례와 예방책을 공유하는 공간입니다.' },
        { id: 'qa', name: '질문/답변', icon: 'fas fa-question-circle', count: 23, description: '전세 계약에 관한 질문과 답변을 나눠보세요.' },
        { id: 'review', name: '계약 후기', icon: 'fas fa-star', count: 18, description: '실제 계약 경험과 후기를 공유합니다.' },
        { id: 'news', name: '부동산 뉴스', icon: 'fas fa-newspaper', count: 3, description: '최신 부동산 소식과 정책 정보를 확인하세요.' }
      ],
      selectedCategory: 'all',
      
      // 게시글 데이터
      posts: [
        {
          id: 1,
          categoryId: 'tips',
          title: '전세계약 시 꼭 확인해야 할 5가지 체크리스트',
          content: '안녕하세요, 오늘은 제가 전세계약을 진행하면서 깨달은 중요한 체크리스트를 공유하려고 합니다. 첫째, 등기부등본을 꼼꼼히 확인하세요. 특히 근저당권 설정 여부와 금액을 확인하는 것이 중요합니다. 둘째, 전세권 설정이 가능한지 미리 확인하세요. 셋째, 계약서의 특약사항을 상세히 검토하세요. 넷째, 선순위 보증금이 있는지 확인하세요. 다섯째, 계약금 지불 전에 집주인의 신원을 확실히 확인하세요. 이런 기본적인 사항들만 체크해도 큰 문제를 피할 수 있습니다.',
          createdAt: '2023-12-15T10:30:00',
          author: {
            name: '부동산전문가',
            avatar: '/api/placeholder/36/36'
          },
          views: 1237,
          likes: 92,
          comments: [
            { id: 1, author: '신규계약자', content: '정말 유용한 정보 감사합니다! 저도 곧 전세계약을 앞두고 있어서 많은 도움이 되네요.' },
            { id: 2, author: '안전제일', content: '전세권 설정은 정말 중요한 것 같아요. 저는 이걸 놓쳐서 나중에 고생했습니다.' }
          ],
          tags: ['계약팁', '체크리스트', '초보가이드']
        },
        {
          id: 2,
          categoryId: 'scam',
          title: '위험했던 깡통전세 사례와 대처법',
          content: '작년에 제가 겪었던 깡통전세 위기 상황을 공유합니다. 처음에는 너무 좋은 조건의 매물이라 의심없이 계약을 진행했는데, 우연히 알게 된 이웃분이 집주인의 대출 상황을 알려주셨어요. 알고보니 건물 가치보다 대출금이 훨씬 많은 상태였습니다. 다행히 계약금만 건네고 잔금은 지불하기 전이었습니다. 바로 확인해보니 등기부등본에 여러 금융기관의 근저당이 설정되어 있었고, 총 금액이 전세금을 크게 웃돌았습니다. 이런 상황에서 제가 취한 행동과 법적 대응 방법을 자세히 설명해드릴게요.',
          createdAt: '2023-12-10T14:20:00',
          author: {
            name: '위기탈출',
            avatar: '/api/placeholder/36/36'
          },
          views: 2568,
          likes: 145,
          comments: [
            { id: 3, author: '조심또조심', content: '정말 아찔한 경험이셨네요. 등기부등본 확인이 얼마나 중요한지 다시 한번 깨닫습니다.' },
            { id: 4, author: '법무사맘', content: '계약금 返還 소송은 어떻게 진행하셨나요? 더 자세한 정보 부탁드립니다.' },
            { id: 5, author: '위기탈출', content: '@법무사맘 계약금 반환은 내용증명 발송 후에...' }
          ],
          tags: ['깡통전세', '사기예방', '실제사례', '대처법'],
          thumbnailUrl: '/api/placeholder/200/120'
        },
        {
          id: 3,
          categoryId: 'qa',
          title: '전세보증보험 가입 방법 및 비용이 궁금합니다.',
          content: '다음 주에 전세계약을 앞두고 있는데, 전세보증보험에 대해 궁금한 점이 있습니다. 가입 방법과 대략적인 비용은 어떻게 될까요? 그리고 보증보험과 전세권 설정 중 어떤 것이 더 안전한지도 알고 싶습니다. 혹시 두 가지 모두 진행하는 것이 좋을까요?',
          createdAt: '2023-12-05T09:15:00',
          author: {
            name: '초보계약자',
            avatar: '/api/placeholder/36/36'
          },
          views: 845,
          likes: 23,
          comments: [
            { id: 6, author: '보험전문가', content: '전세보증보험 비용은 보통 전세금의 0.2~0.4% 정도입니다. 가입 방법은...' },
            { id: 7, author: '안전장치필수', content: '가능하다면 전세권과 보증보험 둘 다 하시는 것을 추천합니다. 이유는...' }
          ],
          tags: ['전세보증보험', '질문', '비용']
        }
      ],
      
      // 페이지네이션
      currentPage: 1,
      postsPerPage: 10,
      
      // 검색 및 정렬
      searchQuery: '',
      sortOption: 'latest',
      
      // 글쓰기 모달
      showWriteModal: false,
      newPost: {
        categoryId: '',
        title: '',
        content: '',
        tagsInput: '',
        file: null
      }
    };
  },
  computed: {
    filteredPosts() {
      let result = [...this.posts];
      
      // 카테고리 필터링
      if (this.selectedCategory !== 'all') {
        result = result.filter(post => post.categoryId === this.selectedCategory);
      }
      
      // 검색어 필터링
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(post => 
          post.title.toLowerCase().includes(query) || 
          post.content.toLowerCase().includes(query)
        );
      }
      
      // 정렬
      switch (this.sortOption) {
        case 'latest':
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          result.sort((a, b) => b.likes - a.likes);
          break;
        case 'views':
          result.sort((a, b) => b.views - a.views);
          break;
      }
      
      return result;
    },
    
    totalPages() {
      return Math.ceil(this.filteredPosts.length / this.postsPerPage);
    },
    
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage;
      const end = start + this.postsPerPage;
      return this.filteredPosts.slice(start, end);
    },
    
    paginationNumbers() {
      const pages = [];
      const maxVisible = 5;
      
      if (this.totalPages <= maxVisible) {
        // 전체 페이지가 maxVisible보다 작으면 모든 페이지 번호 표시
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 현재 페이지 주변의 번호만 표시
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;
        
        if (end > this.totalPages) {
          end = this.totalPages;
          start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    }
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.currentPage = 1;
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : '';
    },
    
    getCategoryDescription(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.description : '';
    },
    
    searchPosts() {
      this.currentPage = 1;
    },
    
    sortPosts() {
      this.currentPage = 1;
    },
    
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      // 24시간 이내
      if (diff < 86400000) {
        // 1시간 이내
        if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000);
          return `${minutes}분 전`;
        }
        // 1시간 이상 24시간 이내
        const hours = Math.floor(diff / 3600000);
        return `${hours}시간 전`;
      }
      
      // 오늘 이전
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // 올해인 경우 년도 생략
      if (year === now.getFullYear()) {
        return `${month}월 ${day}일`;
      }
      
      return `${year}. ${month}. ${day}`;
    },
    
    changePage(page) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    },
    
    goToPostDetail(postId) {
      this.$router.push({ name: 'post-detail', params: { id: postId } });
    },
    
    openWriteModal() {
      this.newPost = {
        categoryId: this.selectedCategory !== 'all' ? this.selectedCategory : 'tips',
        title: '',
        content: '',
        tagsInput: '',
        file: null
      };
      this.showWriteModal = true;
    },
    
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.newPost.file = file;
      }
    },
    
    handleFileDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.newPost.file = file;
      }
    },
    
    removeFile() {
      this.newPost.file = null;
      this.$refs.fileInput.value = '';
    },
    
    formatFileSize(size) {
      if (size < 1024) {
        return size + ' B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + ' KB';
      } else {
        return (size / (1024 * 1024)).toFixed(1) + ' MB';
      }
    },
    
    submitPost() {
      // 입력값 검증
      if (!this.newPost.title.trim()) {
        alert('제목을 입력해주세요.');
        return;
      }
      
      if (!this.newPost.content.trim()) {
        alert('내용을 입력해주세요.');
        return;
      }
      
      // 태그 처리
      const tags = this.newPost.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      // 실제 구현에서는 API 요청으로 대체
      const newPostId = this.posts.length + 1;
      
      const post = {
        id: newPostId,
        categoryId: this.newPost.categoryId,
        title: this.newPost.title,
        content: this.newPost.content,
        createdAt: new Date().toISOString(),
        author: {
          name: '사용자', // 실제 구현에서는 로그인 사용자 정보
          avatar: '/api/placeholder/36/36'
        },
        views: 0,
        likes: 0,
        comments: [],
        tags: tags,
        thumbnailUrl: this.newPost.file ? URL.createObjectURL(this.newPost.file) : null
      };
      
      // 게시글 추가
      this.posts.unshift(post);
      
      // 모달 닫기
      this.showWriteModal = false;
      
      // 작성한 게시글 상세 페이지로 이동
      this.$router.push({ name: 'post-detail', params: { id: newPostId } });
    }
  }
}