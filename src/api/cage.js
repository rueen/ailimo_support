/**
 * 笼位租赁管理接口
 */
import request from '@/utils/request'

// ========== 笼位租赁订单管理 ==========

/**
 * 获取笼位租赁订单列表
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
 * 获取笼位租赁订单详情
 * @param {number} id - 订单ID
 */
export function getCageReservationDetail(id) {
  return request({
    url: `/support/cage-reservations/${id}`,
    method: 'GET'
  })
}

/**
 * 创建笼位租赁订单
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
 * 更新笼位租赁订单
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
 * 审核笼位租赁订单
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
 * 完成笼位租赁订单
 * @param {number} id - 订单ID
 */
export function completeCageReservation(id) {
  return request({
    url: `/support/cage-reservations/${id}/complete`,
    method: 'PUT'
  })
}

/**
 * 取消笼位租赁订单
 * @param {number} id - 订单ID
 */
export function cancelCageReservation(id) {
  return request({
    url: `/support/cage-reservations/${id}/cancel`,
    method: 'PUT'
  })
}

/**
 * 获取笼位租赁统计
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

/**
 * 查询笼位可用时间段
 * @param {Object} params - 查询参数 { animal_type_id, environment_id, date }
 */
export function getCageAvailableTimeSlots(params) {
  return request({
    url: '/support/cages/available-time-slots',
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

// ========== 笼位时间段管理 ==========

/**
 * 获取笼位时间段列表
 */
export function getCageTimeSlotList() {
  return request({
    url: '/support/cage-time-slots',
    method: 'GET'
  })
}

/**
 * 获取笼位时间段选项列表
 */
export function getCageTimeSlotOptions() {
  return request({
    url: '/support/cage-time-slots/options',
    method: 'GET'
  })
}

/**
 * 获取笼位时间段详情
 * @param {number} id - 时间段ID
 */
export function getCageTimeSlotDetail(id) {
  return request({
    url: `/support/cage-time-slots/${id}`,
    method: 'GET'
  })
}

/**
 * 创建笼位时间段
 * @param {Object} data - 时间段信息
 */
export function createCageTimeSlot(data) {
  return request({
    url: '/support/cage-time-slots',
    method: 'POST',
    data
  })
}

/**
 * 更新笼位时间段
 * @param {number} id - 时间段ID
 * @param {Object} data - 时间段信息
 */
export function updateCageTimeSlot(id, data) {
  return request({
    url: `/support/cage-time-slots/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除笼位时间段
 * @param {number} id - 时间段ID
 */
export function deleteCageTimeSlot(id) {
  return request({
    url: `/support/cage-time-slots/${id}`,
    method: 'DELETE'
  })
}

