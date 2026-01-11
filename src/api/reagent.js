/**
 * 试剂耗材管理接口
 */
import request from '@/utils/request'

// ========== 试剂耗材订购订单管理 ==========

/**
 * 获取试剂耗材订购订单列表
 * @param {Object} params - 查询参数
 */
export function getReagentOrderList(params) {
  return request({
    url: '/support/reagent-orders',
    method: 'GET',
    params
  })
}

/**
 * 获取试剂耗材订购订单详情
 * @param {number} id - 订单ID
 */
export function getReagentOrderDetail(id) {
  return request({
    url: `/support/reagent-orders/${id}`,
    method: 'GET'
  })
}

/**
 * 创建试剂耗材订购订单
 * @param {Object} data - 订单信息
 */
export function createReagentOrder(data) {
  return request({
    url: '/support/reagent-orders',
    method: 'POST',
    data
  })
}

/**
 * 更新试剂耗材订购订单
 * @param {number} id - 订单ID
 * @param {Object} data - 订单信息
 */
export function updateReagentOrder(id, data) {
  return request({
    url: `/support/reagent-orders/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 审核试剂耗材订购订单
 * @param {number} id - 订单ID
 * @param {Object} data - 审核信息（status: 1-通过 2-拒绝, handlerId/rejectReason）
 */
export function auditReagentOrder(id, data) {
  return request({
    url: `/support/reagent-orders/${id}/audit`,
    method: 'PUT',
    data
  })
}

/**
 * 完成试剂耗材订购订单
 * @param {number} id - 订单ID
 */
export function completeReagentOrder(id) {
  return request({
    url: `/support/reagent-orders/${id}/complete`,
    method: 'PUT'
  })
}

/**
 * 取消试剂耗材订购订单
 * @param {number} id - 订单ID
 */
export function cancelReagentOrder(id) {
  return request({
    url: `/support/reagent-orders/${id}/cancel`,
    method: 'PUT'
  })
}

// ========== 试剂耗材品牌管理 ==========

/**
 * 获取品牌列表
 * @param {Object} params - 查询参数
 */
export function getReagentBrandList(params) {
  return request({
    url: '/support/reagent-brands',
    method: 'GET',
    params
  })
}

/**
 * 获取品牌详情
 * @param {number} id - 品牌ID
 */
export function getReagentBrandDetail(id) {
  return request({
    url: `/support/reagent-brands/${id}`,
    method: 'GET'
  })
}

/**
 * 创建品牌
 * @param {Object} data - 品牌信息
 */
export function createReagentBrand(data) {
  return request({
    url: '/support/reagent-brands',
    method: 'POST',
    data
  })
}

/**
 * 更新品牌
 * @param {number} id - 品牌ID
 * @param {Object} data - 品牌信息
 */
export function updateReagentBrand(id, data) {
  return request({
    url: `/support/reagent-brands/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除品牌
 * @param {number} id - 品牌ID
 */
export function deleteReagentBrand(id) {
  return request({
    url: `/support/reagent-brands/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取品牌选项列表
 */
export function getReagentBrandOptions() {
  return request({
    url: '/support/reagent-brands/options',
    method: 'GET'
  })
}

// ========== 试剂耗材规格管理 ==========

/**
 * 获取规格列表
 * @param {Object} params - 查询参数
 */
export function getReagentSpecificationList(params) {
  return request({
    url: '/support/reagent-specifications',
    method: 'GET',
    params
  })
}

/**
 * 获取规格详情
 * @param {number} id - 规格ID
 */
export function getReagentSpecificationDetail(id) {
  return request({
    url: `/support/reagent-specifications/${id}`,
    method: 'GET'
  })
}

/**
 * 创建规格
 * @param {Object} data - 规格信息
 */
export function createReagentSpecification(data) {
  return request({
    url: '/support/reagent-specifications',
    method: 'POST',
    data
  })
}

/**
 * 更新规格
 * @param {number} id - 规格ID
 * @param {Object} data - 规格信息
 */
export function updateReagentSpecification(id, data) {
  return request({
    url: `/support/reagent-specifications/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除规格
 * @param {number} id - 规格ID
 */
export function deleteReagentSpecification(id) {
  return request({
    url: `/support/reagent-specifications/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取规格选项列表
 */
export function getReagentSpecificationOptions() {
  return request({
    url: '/support/reagent-specifications/options',
    method: 'GET'
  })
}
