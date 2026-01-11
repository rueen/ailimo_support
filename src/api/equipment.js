/**
 * 设备租赁管理接口
 */
import request from '@/utils/request'

// ========== 设备租赁订单接口 ==========

/**
 * 获取设备租赁订单列表
 * @param {Object} params - 查询参数
 */
export function getEquipmentReservationList(params) {
  return request({
    url: '/support/equipment-reservations',
    method: 'GET',
    params
  })
}

/**
 * 获取设备租赁订单详情
 * @param {number} id - 订单ID
 */
export function getEquipmentReservationDetail(id) {
  return request({
    url: `/support/equipment-reservations/${id}`,
    method: 'GET'
  })
}

/**
 * 创建设备租赁订单
 * @param {Object} data - 订单信息
 */
export function createEquipmentReservation(data) {
  return request({
    url: '/support/equipment-reservations',
    method: 'POST',
    data
  })
}

/**
 * 更新设备租赁订单
 * @param {number} id - 订单ID
 * @param {Object} data - 订单信息
 */
export function updateEquipmentReservation(id, data) {
  return request({
    url: `/support/equipment-reservations/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 审核设备租赁订单
 * @param {number} id - 订单ID
 * @param {Object} data - 审核信息（status: 1-通过 2-拒绝, handlerId/rejectReason）
 */
export function auditEquipmentReservation(id, data) {
  return request({
    url: `/support/equipment-reservations/${id}/audit`,
    method: 'PUT',
    data
  })
}

/**
 * 完成设备租赁订单
 * @param {number} id - 订单ID
 */
export function completeEquipmentReservation(id) {
  return request({
    url: `/support/equipment-reservations/${id}/complete`,
    method: 'PUT'
  })
}

/**
 * 取消设备租赁订单
 * @param {number} id - 订单ID
 */
export function cancelEquipmentReservation(id) {
  return request({
    url: `/support/equipment-reservations/${id}/cancel`,
    method: 'PUT'
  })
}

// ========== 设备管理接口 ==========

/**
 * 获取设备列表
 * @param {Object} params - 查询参数
 */
export function getEquipmentList(params) {
  return request({
    url: '/support/equipment',
    method: 'GET',
    params
  })
}

/**
 * 获取设备选项列表
 */
export function getEquipmentOptions() {
  return request({
    url: '/support/equipment/options',
    method: 'GET'
  })
}

/**
 * 获取设备详情
 * @param {number} id - 设备ID
 */
export function getEquipmentDetail(id) {
  return request({
    url: `/support/equipment/${id}`,
    method: 'GET'
  })
}

/**
 * 创建设备
 * @param {Object} data - 设备信息
 */
export function createEquipment(data) {
  return request({
    url: '/support/equipment',
    method: 'POST',
    data
  })
}

/**
 * 更新设备
 * @param {number} id - 设备ID
 * @param {Object} data - 设备信息
 */
export function updateEquipment(id, data) {
  return request({
    url: `/support/equipment/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除设备
 * @param {number} id - 设备ID
 */
export function deleteEquipment(id) {
  return request({
    url: `/support/equipment/${id}`,
    method: 'DELETE'
  })
}

/**
 * 查询设备可用时间段
 * @param {number} id - 设备ID
 * @param {Object} params - 查询参数（包含日期）
 */
export function getEquipmentAvailableSlots(id, params) {
  return request({
    url: `/support/equipment/${id}/available-slots`,
    method: 'GET',
    params
  })
}

// ========== 时间段管理接口 ==========

/**
 * 获取时间段列表
 */
export function getTimeSlotList() {
  return request({
    url: '/support/equipment-time-slots',
    method: 'GET'
  })
}

/**
 * 获取时间段选项列表
 */
export function getTimeSlotOptions() {
  return request({
    url: '/support/equipment-time-slots/options',
    method: 'GET'
  })
}

/**
 * 获取时间段详情
 * @param {number} id - 时间段ID
 */
export function getTimeSlotDetail(id) {
  return request({
    url: `/support/equipment-time-slots/${id}`,
    method: 'GET'
  })
}

/**
 * 创建时间段
 * @param {Object} data - 时间段信息
 */
export function createTimeSlot(data) {
  return request({
    url: '/support/equipment-time-slots',
    method: 'POST',
    data
  })
}

/**
 * 更新时间段
 * @param {number} id - 时间段ID
 * @param {Object} data - 时间段信息
 */
export function updateTimeSlot(id, data) {
  return request({
    url: `/support/equipment-time-slots/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除时间段
 * @param {number} id - 时间段ID
 */
export function deleteTimeSlot(id) {
  return request({
    url: `/support/equipment-time-slots/${id}`,
    method: 'DELETE'
  })
}
