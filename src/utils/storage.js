/**
 * 本地存储工具类
 */

const TOKEN_KEY = 'ailimo_admin_token'
const USER_KEY = 'ailimo_admin_user'

/**
 * 获取 Token
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置 Token
 * @param {string} token - JWT Token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 Token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取用户信息
 * @returns {Object|null}
 */
export function getUserInfo() {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

/**
 * 设置用户信息
 * @param {Object} user - 用户信息对象
 */
export function setUserInfo(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 移除用户信息
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_KEY)
}

/**
 * 清除所有登录信息
 */
export function clearAuth() {
  removeToken()
  removeUserInfo()
}

// ========== 记住密码相关 ==========

const REMEMBER_PASSWORD_KEY = 'ailimo_admin_remember_password'
const REMEMBER_USERNAME_KEY = 'ailimo_admin_remember_username'

/**
 * 保存记住密码信息
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
export function saveRememberPassword(username, password) {
  // 使用base64编码稍微隐藏密码（注意：这不是真正的加密，只是简单的编码）
  const encodedPassword = btoa(unescape(encodeURIComponent(password)))
  localStorage.setItem(REMEMBER_USERNAME_KEY, username)
  localStorage.setItem(REMEMBER_PASSWORD_KEY, encodedPassword)
}

/**
 * 获取记住的密码信息
 * @returns {Object|null} {username, password} 或 null
 */
export function getRememberPassword() {
  const username = localStorage.getItem(REMEMBER_USERNAME_KEY)
  const encodedPassword = localStorage.getItem(REMEMBER_PASSWORD_KEY)
  
  if (username && encodedPassword) {
    try {
      const password = decodeURIComponent(escape(atob(encodedPassword)))
      return { username, password }
    } catch (error) {
      console.error('解析记住的密码失败：', error)
      return null
    }
  }
  
  return null
}

/**
 * 清除记住的密码信息
 */
export function clearRememberPassword() {
  localStorage.removeItem(REMEMBER_USERNAME_KEY)
  localStorage.removeItem(REMEMBER_PASSWORD_KEY)
}
