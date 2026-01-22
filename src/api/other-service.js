/**
 * 其他服务管理接口
 */
import request from '@/utils/request'

// ========== 其他服务管理 ==========

/**
 * 获取其他服务列表
 * @param {Object} params - 查询参数
 */
export function getOtherServiceList(params) {
  return request({
    url: '/support/other-services',
    method: 'GET',
    params
  })
}

/**
 * 获取其他服务详情
 * @param {number} id - 其他服务ID
 */
export function getOtherServiceDetail(id) {
  return request({
    url: `/support/other-services/${id}`,
    method: 'GET'
  })
}

/**
 * 创建其他服务
 * @param {Object} data - 其他服务信息
 */
export function createOtherService(data) {
  return request({
    url: '/support/other-services',
    method: 'POST',
    data
  })
}

/**
 * 更新其他服务
 * @param {number} id - 其他服务ID
 * @param {Object} data - 其他服务信息
 */
export function updateOtherService(id, data) {
  return request({
    url: `/support/other-services/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除其他服务
 * @param {number} id - 其他服务ID
 */
export function deleteOtherService(id) {
  return request({
    url: `/support/other-services/${id}`,
    method: 'DELETE'
  })
}
