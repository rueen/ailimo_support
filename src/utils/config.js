/**
 * 应用配置工具
 */

/**
 * 获取用户端域名
 * 根据当前环境返回对应的用户端域名
 * @returns {string} 用户端域名
 */
export function getUserDomain() {
  // 判断是否为开发环境
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development'
  
  // 开发环境使用本地地址
  if (isDev) {
    return 'http://localhost:3002'
  }
  
  // 生产环境使用正式域名
  return 'https://www.ailimolab.com'
}

/**
 * 获取用户端预览URL
 * @param {string} path - 路径（如：/services/other-services/123）
 * @returns {string} 完整的预览URL
 */
export function getUserPreviewUrl(path) {
  const domain = getUserDomain()
  // 确保path以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${domain}/#${normalizedPath}`
}
