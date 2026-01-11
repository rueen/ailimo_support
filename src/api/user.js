/**
 * 用户管理接口
 */
import request from '@/utils/request'

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 */
export function getUserList(params) {
  return request({
    url: '/support/users',
    method: 'GET',
    params
  })
}

/**
 * 获取用户详情
 * @param {number} id - 用户ID
 */
export function getUserDetail(id) {
  return request({
    url: `/support/users/${id}`,
    method: 'GET'
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户信息
 */
export function createUser(data) {
  return request({
    url: '/support/users',
    method: 'POST',
    data
  })
}

/**
 * 更新用户
 * @param {number} id - 用户ID
 * @param {Object} data - 用户信息
 */
export function updateUser(id, data) {
  return request({
    url: `/support/users/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除用户
 * @param {number} id - 用户ID
 */
export function deleteUser(id) {
  return request({
    url: `/support/users/${id}`,
    method: 'DELETE'
  })
}

/**
 * 审核用户
 * @param {number} id - 用户ID
 * @param {Object} data - 审核信息（status: 1-通过 2-拒绝, rejectReason）
 */
export function auditUser(id, data) {
  return request({
    url: `/support/users/${id}/audit`,
    method: 'PUT',
    data
  })
}

/**
 * 启用/禁用用户
 * @param {number} id - 用户ID
 * @param {Object} data - 状态
 */
export function updateUserStatus(id, data) {
  return request({
    url: `/support/users/${id}/status`,
    method: 'PUT',
    data
  })
}
