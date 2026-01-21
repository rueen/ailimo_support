/**
 * 笼位预约管理接口
 */
import request from '@/utils/request'

// ========== 笼位预约订单管理 ==========

/**
 * 获取笼位预约订单列表
 * @param {Object} params - 查询参数
 */
export function getCageReservationList(params) {
  return request({
    url: '/support/cage-reservations',
    method: 'GET',
    params
  })
}

/**
 * 获取笼位预约订单详情
 * @param {number} id - 订单ID
 */
export function getCageReservationDetail(id) {
  return request({
    url: `/support/cage-reservations/${id}`,
    method: 'GET'
  })
}

/**
 * 创建笼位预约订单
 * @param {Object} data - 订单信息
 */
export function createCageReservation(data) {
  return request({
    url: '/support/cage-reservations',
    method: 'POST',
    data
  })
}

/**
 * 更新笼位预约订单
 * @param {number} id - 订单ID
 * @param {Object} data - 订单信息
 */
export function updateCageReservation(id, data) {
  return request({
    url: `/support/cage-reservations/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 审核笼位预约订单
 * @param {number} id - 订单ID
 * @param {Object} data - 审核信息（status: 1-通过 2-拒绝, handlerId/rejectReason）
 */
export function auditCageReservation(id, data) {
  return request({
    url: `/support/cage-reservations/${id}/audit`,
    method: 'PUT',
    data
  })
}

/**
 * 完成笼位预约订单
 * @param {number} id - 订单ID
 */
export function completeCageReservation(id) {
  return request({
    url: `/support/cage-reservations/${id}/complete`,
    method: 'PUT'
  })
}

/**
 * 取消笼位预约订单
 * @param {number} id - 订单ID
 */
export function cancelCageReservation(id) {
  return request({
    url: `/support/cage-reservations/${id}/cancel`,
    method: 'PUT'
  })
}

/**
 * 获取笼位预约统计
 * @param {Object} params - 查询参数
 */
export function getCageReservationStatistics(params) {
  return request({
    url: '/support/cage-reservations/statistics',
    method: 'GET',
    params
  })
}

// ========== 笼位管理 ==========

/**
 * 获取笼位列表
 * @param {Object} params - 查询参数
 */
export function getCageList(params) {
  return request({
    url: '/support/cages',
    method: 'GET',
    params
  })
}

/**
 * 获取笼位详情
 * @param {number} id - 笼位ID
 */
export function getCageDetail(id) {
  return request({
    url: `/support/cages/${id}`,
    method: 'GET'
  })
}

/**
 * 创建笼位
 * @param {Object} data - 笼位信息
 */
export function createCage(data) {
  return request({
    url: '/support/cages',
    method: 'POST',
    data
  })
}

/**
 * 更新笼位
 * @param {number} id - 笼位ID
 * @param {Object} data - 笼位信息
 */
export function updateCage(id, data) {
  return request({
    url: `/support/cages/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除笼位
 * @param {number} id - 笼位ID
 */
export function deleteCage(id) {
  return request({
    url: `/support/cages/${id}`,
    method: 'DELETE'
  })
}

/**
 * 查询笼位可用数量
 * @param {Object} params - 查询参数
 */
export function getCageAvailableQuantity(params) {
  return request({
    url: '/support/cages/available-quantity',
    method: 'GET',
    params
  })
}

/**
 * 根据动物类型获取环境类型选项
 * @param {Object} params - 查询参数 { animal_type_id: number }
 */
export function getEnvironmentsByAnimalType(params) {
  return request({
    url: '/support/cages/environments-by-animal-type',
    method: 'GET',
    params
  })
}

// ========== 笼位用途管理 ==========

/**
 * 获取笼位用途列表
 * @param {Object} params - 查询参数
 */
export function getCagePurposeList(params) {
  return request({
    url: '/support/cage-purposes',
    method: 'GET',
    params
  })
}

/**
 * 获取笼位用途选项列表
 */
export function getCagePurposeOptions() {
  return request({
    url: '/support/cage-purposes/options',
    method: 'GET'
  })
}

/**
 * 获取笼位用途详情
 * @param {number} id - 用途ID
 */
export function getCagePurposeDetail(id) {
  return request({
    url: `/support/cage-purposes/${id}`,
    method: 'GET'
  })
}

/**
 * 创建笼位用途
 * @param {Object} data - 用途信息
 */
export function createCagePurpose(data) {
  return request({
    url: '/support/cage-purposes',
    method: 'POST',
    data
  })
}

/**
 * 更新笼位用途
 * @param {number} id - 用途ID
 * @param {Object} data - 用途信息
 */
export function updateCagePurpose(id, data) {
  return request({
    url: `/support/cage-purposes/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除笼位用途
 * @param {number} id - 用途ID
 */
export function deleteCagePurpose(id) {
  return request({
    url: `/support/cage-purposes/${id}`,
    method: 'DELETE'
  })
}
