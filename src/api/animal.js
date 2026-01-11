/**
 * 动物订购管理接口
 */
import request from '@/utils/request'

// ========== 动物订购订单管理 ==========

/**
 * 获取动物订购订单列表
 * @param {Object} params - 查询参数
 */
export function getAnimalOrderList(params) {
  return request({
    url: '/support/animal-orders',
    method: 'GET',
    params
  })
}

/**
 * 获取动物订购订单详情
 * @param {number} id - 订单ID
 */
export function getAnimalOrderDetail(id) {
  return request({
    url: `/support/animal-orders/${id}`,
    method: 'GET'
  })
}

/**
 * 创建动物订购订单
 * @param {Object} data - 订单信息
 */
export function createAnimalOrder(data) {
  return request({
    url: '/support/animal-orders',
    method: 'POST',
    data
  })
}

/**
 * 更新动物订购订单
 * @param {number} id - 订单ID
 * @param {Object} data - 订单信息
 */
export function updateAnimalOrder(id, data) {
  return request({
    url: `/support/animal-orders/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 审核动物订购订单
 * @param {number} id - 订单ID
 * @param {Object} data - 审核信息（status: 1-通过 2-拒绝, handlerId/rejectReason）
 */
export function auditAnimalOrder(id, data) {
  return request({
    url: `/support/animal-orders/${id}/audit`,
    method: 'PUT',
    data
  })
}

/**
 * 完成动物订购订单
 * @param {number} id - 订单ID
 */
export function completeAnimalOrder(id) {
  return request({
    url: `/support/animal-orders/${id}/complete`,
    method: 'PUT'
  })
}

/**
 * 取消动物订购订单
 * @param {number} id - 订单ID
 */
export function cancelAnimalOrder(id) {
  return request({
    url: `/support/animal-orders/${id}/cancel`,
    method: 'PUT'
  })
}

// ========== 基础配置管理 ==========

/**
 * 获取品牌列表
 */
export function getAnimalBrandList(params) {
  return request({
    url: '/support/animal-brands',
    method: 'GET',
    params
  })
}

/**
 * 创建品牌
 */
export function createAnimalBrand(data) {
  return request({
    url: '/support/animal-brands',
    method: 'POST',
    data
  })
}

/**
 * 更新品牌
 */
export function updateAnimalBrand(id, data) {
  return request({
    url: `/support/animal-brands/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除品牌
 */
export function deleteAnimalBrand(id) {
  return request({
    url: `/support/animal-brands/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取品牌详情
 * @param {number} id - 品牌ID
 */
export function getAnimalBrandDetail(id) {
  return request({
    url: `/support/animal-brands/${id}`,
    method: 'GET'
  })
}

/**
 * 获取品牌选项列表
 */
export function getAnimalBrandOptions() {
  return request({
    url: '/support/animal-brands/options',
    method: 'GET'
  })
}

/**
 * 获取品系列表
 */
export function getAnimalVarietyList(params) {
  return request({
    url: '/support/animal-varieties',
    method: 'GET',
    params
  })
}

/**
 * 创建品系
 */
export function createAnimalVariety(data) {
  return request({
    url: '/support/animal-varieties',
    method: 'POST',
    data
  })
}

/**
 * 更新品系
 */
export function updateAnimalVariety(id, data) {
  return request({
    url: `/support/animal-varieties/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除品系
 */
export function deleteAnimalVariety(id) {
  return request({
    url: `/support/animal-varieties/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取品系详情
 * @param {number} id - 品系ID
 */
export function getAnimalVarietyDetail(id) {
  return request({
    url: `/support/animal-varieties/${id}`,
    method: 'GET'
  })
}

/**
 * 获取品系选项列表
 * @param {Object} params - 查询参数（brandId: 必填，品牌ID）
 */
export function getAnimalVarietyOptions(params) {
  return request({
    url: '/support/animal-varieties/options',
    method: 'GET',
    params
  })
}

/**
 * 获取规格列表
 */
export function getAnimalSpecificationList(params) {
  return request({
    url: '/support/animal-specifications',
    method: 'GET',
    params
  })
}

/**
 * 创建规格
 */
export function createAnimalSpecification(data) {
  return request({
    url: '/support/animal-specifications',
    method: 'POST',
    data
  })
}

/**
 * 更新规格
 */
export function updateAnimalSpecification(id, data) {
  return request({
    url: `/support/animal-specifications/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除规格
 */
export function deleteAnimalSpecification(id) {
  return request({
    url: `/support/animal-specifications/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取规格详情
 * @param {number} id - 规格ID
 */
export function getAnimalSpecificationDetail(id) {
  return request({
    url: `/support/animal-specifications/${id}`,
    method: 'GET'
  })
}

/**
 * 获取规格选项列表
 */
export function getAnimalSpecificationOptions() {
  return request({
    url: '/support/animal-specifications/options',
    method: 'GET'
  })
}

/**
 * 获取要求列表
 */
export function getAnimalRequirementList(params) {
  return request({
    url: '/support/animal-requirements',
    method: 'GET',
    params
  })
}

/**
 * 创建要求
 */
export function createAnimalRequirement(data) {
  return request({
    url: '/support/animal-requirements',
    method: 'POST',
    data
  })
}

/**
 * 更新要求
 */
export function updateAnimalRequirement(id, data) {
  return request({
    url: `/support/animal-requirements/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除要求
 */
export function deleteAnimalRequirement(id) {
  return request({
    url: `/support/animal-requirements/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取要求详情
 * @param {number} id - 要求ID
 */
export function getAnimalRequirementDetail(id) {
  return request({
    url: `/support/animal-requirements/${id}`,
    method: 'GET'
  })
}

/**
 * 获取要求选项列表
 */
export function getAnimalRequirementOptions() {
  return request({
    url: '/support/animal-requirements/options',
    method: 'GET'
  })
}

// ========== 统计接口 ==========

/**
 * 获取动物订购统计
 * @param {Object} params - 查询参数（startDate, endDate）
 */
export function getAnimalOrderStatistics(params) {
  return request({
    url: '/support/animal-orders/statistics',
    method: 'GET',
    params
  })
}
