/**
 * 认证相关接口
 */
import request from '@/utils/request'

/**
 * 管理员登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 */
export function login(data) {
  return request({
    url: '/support/auth/login',
    method: 'POST',
    data
  })
}

/**
 * 获取当前管理员信息
 */
export function getProfile() {
  return request({
    url: '/support/auth/profile',
    method: 'GET'
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码信息
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 */
export function changePassword(data) {
  return request({
    url: '/support/auth/password',
    method: 'PUT',
    data
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/support/auth/logout',
    method: 'POST'
  })
}
