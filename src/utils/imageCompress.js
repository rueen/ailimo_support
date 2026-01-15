/**
 * 图片压缩工具
 */

/**
 * 压缩图片
 * @param {File} file - 原始文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxWidth - 最大宽度，默认 1920
 * @param {number} options.maxHeight - 最大高度，默认 1080
 * @param {number} options.quality - 压缩质量 0-1，默认 0.8
 * @param {number} options.maxSize - 最大文件大小（KB），如果超过则降低质量，默认 500KB
 * @returns {Promise<File>} 压缩后的文件
 */
export function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSize = 500
  } = options

  return new Promise((resolve, reject) => {
    // 不是图片文件，直接返回
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    // GIF 不压缩，直接返回
    if (file.type === 'image/gif') {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 计算缩放比例
          let { width, height } = img
          let scale = 1
          
          if (width > maxWidth) {
            scale = maxWidth / width
          }
          if (height * scale > maxHeight) {
            scale = maxHeight / height
          }
          
          // 设置 canvas 尺寸
          canvas.width = width * scale
          canvas.height = height * scale
          
          // 绘制图片
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // 转换为 Blob
          let currentQuality = quality
          const compress = (q) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('图片压缩失败'))
                  return
                }
                
                const compressedSize = blob.size / 1024 // KB
                
                // 如果文件大小超过限制且质量还可以降低，则继续压缩
                if (compressedSize > maxSize && q > 0.3) {
                  compress(q - 0.1)
                  return
                }
                
                // 创建新的 File 对象
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                
                console.log(`图片压缩完成: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`)
                resolve(compressedFile)
              },
              file.type,
              q
            )
          }
          
          compress(currentQuality)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
  })
}

/**
 * 批量压缩图片
 * @param {File[]} files - 文件列表
 * @param {Object} options - 压缩选项
 * @returns {Promise<File[]>} 压缩后的文件列表
 */
export function compressImages(files, options = {}) {
  return Promise.all(files.map(file => compressImage(file, options)))
}
