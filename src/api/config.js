/**
 * 通用配置管理接口
 */
import request from '@/utils/request'

// ========== 负责人管理 ==========

/**
 * 获取负责人列表
 * @param {Object} params - 查询参数
 */
export function getHandlerList(params) {
  return request({
    url: '/support/handlers',
    method: 'GET',
    params
  })
}

/**
 * 获取负责人选项列表
 */
export function getHandlerOptions() {
  return request({
    url: '/support/handlers/options',
    method: 'GET'
  })
}

/**
 * 创建负责人
 * @param {Object} data - 负责人信息
 */
export function createHandler(data) {
  return request({
    url: '/support/handlers',
    method: 'POST',
    data
  })
}

/**
 * 更新负责人
 * @param {number} id - 负责人ID
 * @param {Object} data - 负责人信息
 */
export function updateHandler(id, data) {
  return request({
    url: `/support/handlers/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除负责人
 * @param {number} id - 负责人ID
 */
export function deleteHandler(id) {
  return request({
    url: `/support/handlers/${id}`,
    method: 'DELETE'
  })
}

// ========== 环境类型管理 ==========

/**
 * 获取环境类型列表
 * @param {Object} params - 查询参数
 */
export function getEnvironmentTypeList(params) {
  return request({
    url: '/support/environment-types',
    method: 'GET',
    params
  })
}

/**
 * 获取环境类型选项列表
 */
export function getEnvironmentTypeOptions() {
  return request({
    url: '/support/environment-types/options',
    method: 'GET'
  })
}

/**
 * 创建环境类型
 * @param {Object} data - 环境类型信息
 */
export function createEnvironmentType(data) {
  return request({
    url: '/support/environment-types',
    method: 'POST',
    data
  })
}

/**
 * 更新环境类型
 * @param {number} id - 环境类型ID
 * @param {Object} data - 环境类型信息
 */
export function updateEnvironmentType(id, data) {
  return request({
    url: `/support/environment-types/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除环境类型
 * @param {number} id - 环境类型ID
 */
export function deleteEnvironmentType(id) {
  return request({
    url: `/support/environment-types/${id}`,
    method: 'DELETE'
  })
}

// ========== 动物类型管理 ==========

/**
 * 获取动物类型列表
 * @param {Object} params - 查询参数
 */
export function getAnimalTypeList(params) {
  return request({
    url: '/support/animal-types',
    method: 'GET',
    params
  })
}

/**
 * 获取动物类型选项列表
 */
export function getAnimalTypeOptions() {
  return request({
    url: '/support/animal-types/options',
    method: 'GET'
  })
}

/**
 * 创建动物类型
 * @param {Object} data - 动物类型信息
 */
export function createAnimalType(data) {
  return request({
    url: '/support/animal-types',
    method: 'POST',
    data
  })
}

/**
 * 更新动物类型
 * @param {number} id - 动物类型ID
 * @param {Object} data - 动物类型信息
 */
export function updateAnimalType(id, data) {
  return request({
    url: `/support/animal-types/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除动物类型
 * @param {number} id - 动物类型ID
 */
export function deleteAnimalType(id) {
  return request({
    url: `/support/animal-types/${id}`,
    method: 'DELETE'
  })
}
