// 파일 업로드 관련 서비스
const fileUploadService = {
  // 허용된 파일 형식
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  
  // 최대 파일 크기 (10MB)
  maxFileSize: 10 * 1024 * 1024,
  
  // 파일 유효성 검사
  validateFile(file) {
    // 파일 형식 검사
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '지원되는 파일 형식은 PDF, JPG, PNG입니다.'
      };
    }
    
    // 파일 크기 검사
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: '파일 크기는 10MB를 초과할 수 없습니다.'
      };
    }
    
    return {
      valid: true
    };
  },
  
  // 파일 크기 포맷팅
  formatFileSize(size) {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
};

export default fileUploadService;