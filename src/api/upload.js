/**
 * 文件上传相关接口
 */
import request from '@/utils/request'
import { compressImage } from '@/utils/imageCompress'

/**
 * 上传图片（自动压缩）
 * @param {File} file - 图片文件
 * @param {Object} options - 上传选项
 * @param {string} options.directory - 上传目录，如 'equipment'、'cage'、'case' 等
 * @param {Function} options.onProgress - 上传进度回调
 * @param {Function} options.onCompress - 压缩完成回调
 * @param {boolean} options.compress - 是否压缩，默认 true
 * @param {Object} options.compressOptions - 压缩选项
 * @param {number} options.compressOptions.maxWidth - 最大宽度，默认 1920
 * @param {number} options.compressOptions.maxHeight - 最大高度，默认 1080
 * @param {number} options.compressOptions.quality - 压缩质量 0-1，默认 0.8
 * @param {number} options.compressOptions.maxSize - 最大文件大小（KB），默认 500KB
 * @param {number} options.maxOriginalSize - 原始文件最大大小（MB），默认 10MB
 * @param {number} options.maxCompressedSize - 压缩后文件最大大小（MB），默认 5MB
 * @returns {Promise}
 */
export async function uploadImage(file, options = {}) {
  const {
    directory = '',
    onProgress,
    onCompress,
    compress = true,
    compressOptions = {},
    maxOriginalSize = 10,
    maxCompressedSize = 5
  } = options
  
  // 校验文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    throw new Error('只能上传图片文件')
  }
  
  // 校验文件格式
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持 jpg、png、gif、webp 格式的图片')
  }
  
  // 校验原始文件大小（避免处理过大的文件）
  const originalSizeMB = file.size / 1024 / 1024
  if (originalSizeMB > maxOriginalSize) {
    throw new Error(`原始文件大小不能超过 ${maxOriginalSize}MB`)
  }
  
  let fileToUpload = file
  
  // 如果需要压缩且是图片文件
  if (compress && file.type.startsWith('image/')) {
    try {
      // 压缩图片
      fileToUpload = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSize: 500, // KB
        ...compressOptions
      })
      
      // 回调通知压缩完成
      if (onCompress) {
        onCompress(fileToUpload)
      }
      
      // 校验压缩后的文件大小
      const compressedSizeMB = fileToUpload.size / 1024 / 1024
      if (compressedSizeMB > maxCompressedSize) {
        throw new Error(`压缩后文件大小 ${compressedSizeMB.toFixed(2)}MB，仍超过 ${maxCompressedSize}MB 限制`)
      }
    } catch (error) {
      // 如果是压缩错误，直接抛出
      throw error
    }
  }
  
  // 构建表单数据
  const formData = new FormData()
  formData.append('file', fileToUpload)
  if (directory) {
    formData.append('directory', directory)
  }
  
  // 上传文件
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

/**
 * 上传文档
 * @param {File} file - 文档文件
 * @param {Object} options - 上传选项
 * @param {string} options.directory - 上传目录，如 'contracts'、'reports'、'price-list' 等
 * @param {Function} options.onProgress - 上传进度回调
 * @param {number} options.maxSize - 最大文件大小（MB），默认 20MB
 * @returns {Promise}
 */
export async function uploadDocument(file, options = {}) {
  const {
    directory = '',
    onProgress,
    maxSize = 20
  } = options
  
  // 校验文件类型
  const allowedTypes = [
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/pdf', // .pdf
    'text/plain' // .txt
  ]
  
  // 校验文件扩展名
  const allowedExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt']
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error('不支持的文件类型，仅支持 doc, docx, txt, pdf, xls, xlsx, ppt, pptx 格式')
  }
  
  // 校验文件大小
  const fileSizeMB = file.size / 1024 / 1024
  if (fileSizeMB > maxSize) {
    throw new Error(`文件大小不能超过 ${maxSize}MB`)
  }
  
  // 构建表单数据
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  
  // 上传文件
  return request({
    url: '/support/upload/document',
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
