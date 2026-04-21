/*
 * @Author: diaochan diaochan@seatent.com
 * @Date: 2026-01-11 16:51:22
 * @LastEditors: diaochan diaochan@seatent.com
 * @LastEditTime: 2026-01-25 20:21:06
 * @FilePath: /ailimo_support/src/api/reagent.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
 * 批量审核试剂耗材订购订单
 * @param {Object} data - 批量审核信息
 * @param {number[]} data.ids - 订单ID列表
 * @param {number} data.status - 审核状态（1-通过 2-拒绝）
 * @param {number} [data.handler_id] - 负责人ID（审核通过时必须）
 * @param {string} [data.reject_reason] - 拒绝原因（审核拒绝时必须）
 */
export function batchAuditReagentOrder(data) {
  return request({
    url: '/support/reagent-orders/batch-audit',
    method: 'POST',
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

// ========== 导出接口 ==========

/**
 * 导出试剂耗材订购订单
 * @param {Object} params - 与列表相同的查询参数（无需传 page/pageSize）
 */
export function exportReagentOrders(params) {
  return request({
    url: '/support/reagent-orders/export',
    method: 'GET',
    params
  })
}
