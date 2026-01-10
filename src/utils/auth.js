/**
 * 权限相关工具函数
 */
import { getUserInfo } from './storage'

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isAuthenticated() {
  const user = getUserInfo()
  return !!user
}

/**
 * 检查是否有指定权限
 * @param {string} permissionCode - 权限代码
 * @returns {boolean}
 */
export function hasPermission(permissionCode) {
  const user = getUserInfo()
  if (!user || !user.permissions) {
    return false
  }

  // 超级管理员拥有所有权限
  if (user.role && user.role.id === 1) {
    return true
  }

  // 检查用户权限列表
  return user.permissions.some((permission) => permission.code === permissionCode)
}

/**
 * 检查是否有任一权限
 * @param {Array<string>} permissionCodes - 权限代码数组
 * @returns {boolean}
 */
export function hasAnyPermission(permissionCodes) {
  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    return false
  }
  return permissionCodes.some((code) => hasPermission(code))
}

/**
 * 检查是否有所有权限
 * @param {Array<string>} permissionCodes - 权限代码数组
 * @returns {boolean}
 */
export function hasAllPermissions(permissionCodes) {
  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    return false
  }
  return permissionCodes.every((code) => hasPermission(code))
}

/**
 * 获取用户角色
 * @returns {Object|null}
 */
export function getUserRole() {
  const user = getUserInfo()
  return user ? user.role : null
}

/**
 * 检查是否为超级管理员
 * @returns {boolean}
 */
export function isSuperAdmin() {
  const role = getUserRole()
  return role && role.id === 1
}
