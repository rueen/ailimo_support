/**
 * 实验代操作管理接口
 */
import request from '@/utils/request'

// ========== 实验代操作订单管理 ==========

/**
 * 获取实验代操作订单列表
 * @param {Object} params - 查询参数
 */
export function getExperimentOperationList(params) {
  return request({
    url: '/support/experiment-operations',
    method: 'GET',
    params
  })
}

/**
 * 获取实验代操作订单详情
 * @param {number} id - 订单ID
 */
export function getExperimentOperationDetail(id) {
  return request({
    url: `/support/experiment-operations/${id}`,
    method: 'GET'
  })
}

/**
 * 创建实验代操作订单
 * @param {Object} data - 订单信息
 */
export function createExperimentOperation(data) {
  return request({
    url: '/support/experiment-operations',
    method: 'POST',
    data
  })
}

/**
 * 更新实验代操作订单
 * @param {number} id - 订单ID
 * @param {Object} data - 订单信息
 */
export function updateExperimentOperation(id, data) {
  return request({
    url: `/support/experiment-operations/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 审核实验代操作订单
 * @param {number} id - 订单ID
 * @param {Object} data - 审核信息（status: 1-通过 2-拒绝, handlerId/rejectReason）
 */
export function auditExperimentOperation(id, data) {
  return request({
    url: `/support/experiment-operations/${id}/audit`,
    method: 'PUT',
    data
  })
}

/**
 * 批量审核实验代操作订单
 * @param {Object} data - 批量审核信息
 * @param {number[]} data.ids - 订单ID列表
 * @param {number} data.status - 审核状态（1-通过 2-拒绝）
 * @param {number} [data.handler_id] - 负责人ID（审核通过时必须）
 * @param {string} [data.reject_reason] - 拒绝原因（审核拒绝时必须）
 */
export function batchAuditExperimentOperation(data) {
  return request({
    url: '/support/experiment-operations/batch-audit',
    method: 'POST',
    data
  })
}

/**
 * 完成实验代操作订单
 * @param {number} id - 订单ID
 */
export function completeExperimentOperation(id) {
  return request({
    url: `/support/experiment-operations/${id}/complete`,
    method: 'PUT'
  })
}

/**
 * 取消实验代操作订单
 * @param {number} id - 订单ID
 */
export function cancelExperimentOperation(id) {
  return request({
    url: `/support/experiment-operations/${id}/cancel`,
    method: 'PUT'
  })
}

/**
 * 获取实验代操作统计
 * @param {Object} params - 查询参数
 */
export function getExperimentOperationStatistics(params) {
  return request({
    url: '/support/experiment-operations/statistics',
    method: 'GET',
    params
  })
}

// ========== 操作内容管理 ==========

/**
 * 获取操作内容列表
 * @param {Object} params - 查询参数
 */
export function getOperationContentList(params) {
  return request({
    url: '/support/operation-contents',
    method: 'GET',
    params
  })
}

/**
 * 获取操作内容选项列表
 */
export function getOperationContentOptions() {
  return request({
    url: '/support/operation-contents/options',
    method: 'GET'
  })
}

/**
 * 获取操作内容详情
 * @param {number} id - 操作内容ID
 */
export function getOperationContentDetail(id) {
  return request({
    url: `/support/operation-contents/${id}`,
    method: 'GET'
  })
}

/**
 * 创建操作内容
 * @param {Object} data - 操作内容信息
 */
export function createOperationContent(data) {
  return request({
    url: '/support/operation-contents',
    method: 'POST',
    data
  })
}

/**
 * 更新操作内容
 * @param {number} id - 操作内容ID
 * @param {Object} data - 操作内容信息
 */
export function updateOperationContent(id, data) {
  return request({
    url: `/support/operation-contents/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除操作内容
 * @param {number} id - 操作内容ID
 */
export function deleteOperationContent(id) {
  return request({
    url: `/support/operation-contents/${id}`,
    method: 'DELETE'
  })
}

// ========== 实验时间段管理 ==========

/**
 * 获取实验时间段列表
 */
export function getExperimentTimeSlotList() {
  return request({
    url: '/support/experiment-time-slots',
    method: 'GET'
  })
}

/**
 * 获取实验时间段选项列表
 */
export function getExperimentTimeSlotOptions() {
  return request({
    url: '/support/experiment-time-slots/options',
    method: 'GET'
  })
}

/**
 * 获取实验时间段详情
 * @param {number} id - 时间段ID
 */
export function getExperimentTimeSlotDetail(id) {
  return request({
    url: `/support/experiment-time-slots/${id}`,
    method: 'GET'
  })
}

/**
 * 创建实验时间段
 * @param {Object} data - 时间段信息
 */
export function createExperimentTimeSlot(data) {
  return request({
    url: '/support/experiment-time-slots',
    method: 'POST',
    data
  })
}

/**
 * 更新实验时间段
 * @param {number} id - 时间段ID
 * @param {Object} data - 时间段信息
 */
export function updateExperimentTimeSlot(id, data) {
  return request({
    url: `/support/experiment-time-slots/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除实验时间段
 * @param {number} id - 时间段ID
 */
export function deleteExperimentTimeSlot(id) {
  return request({
    url: `/support/experiment-time-slots/${id}`,
    method: 'DELETE'
  })
}

// ========== 导出接口 ==========

/**
 * 导出实验代操作订单
 * @param {Object} params - 与列表相同的查询参数（无需传 page/pageSize）
 */
export function exportExperimentOperations(params) {
  return request({
    url: '/support/experiment-operations/export',
    method: 'GET',
    params
  })
}

