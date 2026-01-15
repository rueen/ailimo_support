/**
 * 文件上传相关接口
 */
import request from '@/utils/request'

/**
 * 上传图片
 * @param {File} file - 图片文件
 * @param {Object} options - 上传选项
 * @param {string} options.directory - 上传目录，如 'equipment'、'cage'、'case' 等
 * @param {Function} options.onProgress - 上传进度回调
 * @returns {Promise}
 */
export function uploadImage(file, options = {}) {
  const { directory = '', onProgress } = options
  
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  
  return request({
    url: '/support/upload/image',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    }
  })
}

/**
 * 批量上传图片
 * @param {File[]} files - 图片文件列表
 * @param {Object} options - 上传选项
 * @returns {Promise<Array>} 上传结果数组
 */
export function uploadImages(files, options = {}) {
  return Promise.all(files.map(file => uploadImage(file, options)))
}
