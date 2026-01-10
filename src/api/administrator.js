/**
 * 管理员管理接口
 */
import request from '@/utils/request'

// ========== 管理员管理 ==========

/**
 * 获取管理员列表
 * @param {Object} params - 查询参数
 */
export function getAdministratorList(params) {
  return request({
    url: '/support/administrators',
    method: 'GET',
    params
  })
}

/**
 * 获取管理员详情
 * @param {number} id - 管理员ID
 */
export function getAdministratorDetail(id) {
  return request({
    url: `/support/administrators/${id}`,
    method: 'GET'
  })
}

/**
 * 创建管理员
 * @param {Object} data - 管理员信息
 */
export function createAdministrator(data) {
  return request({
    url: '/support/administrators',
    method: 'POST',
    data
  })
}

/**
 * 更新管理员
 * @param {number} id - 管理员ID
 * @param {Object} data - 管理员信息
 */
export function updateAdministrator(id, data) {
  return request({
    url: `/support/administrators/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除管理员
 * @param {number} id - 管理员ID
 */
export function deleteAdministrator(id) {
  return request({
    url: `/support/administrators/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取管理员选项列表
 */
export function getAdministratorOptions() {
  return request({
    url: '/support/administrators/options',
    method: 'GET'
  })
}

// ========== 角色管理 ==========

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 */
export function getRoleList(params) {
  return request({
    url: '/support/roles',
    method: 'GET',
    params
  })
}

/**
 * 获取角色详情
 * @param {number} id - 角色ID
 */
export function getRoleDetail(id) {
  return request({
    url: `/support/roles/${id}`,
    method: 'GET'
  })
}

/**
 * 创建角色
 * @param {Object} data - 角色信息
 */
export function createRole(data) {
  return request({
    url: '/support/roles',
    method: 'POST',
    data
  })
}

/**
 * 更新角色
 * @param {number} id - 角色ID
 * @param {Object} data - 角色信息
 */
export function updateRole(id, data) {
  return request({
    url: `/support/roles/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除角色
 * @param {number} id - 角色ID
 */
export function deleteRole(id) {
  return request({
    url: `/support/roles/${id}`,
    method: 'DELETE'
  })
}

// ========== 权限管理 ==========

/**
 * 获取权限树形列表
 */
export function getPermissionTree() {
  return request({
    url: '/support/permissions',
    method: 'GET'
  })
}

/**
 * 创建权限
 * @param {Object} data - 权限信息
 */
export function createPermission(data) {
  return request({
    url: '/support/permissions',
    method: 'POST',
    data
  })
}

/**
 * 更新权限
 * @param {number} id - 权限ID
 * @param {Object} data - 权限信息
 */
export function updatePermission(id, data) {
  return request({
    url: `/support/permissions/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除权限
 * @param {number} id - 权限ID
 */
export function deletePermission(id) {
  return request({
    url: `/support/permissions/${id}`,
    method: 'DELETE'
  })
}
