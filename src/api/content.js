/**
 * 内容管理接口
 */
import request from '@/utils/request'

// ========== 案例管理 ==========

/**
 * 获取案例列表
 * @param {Object} params - 查询参数
 */
export function getCaseList(params) {
  return request({
    url: '/support/cases',
    method: 'GET',
    params
  })
}

/**
 * 获取案例详情
 * @param {number} id - 案例ID
 */
export function getCaseDetail(id) {
  return request({
    url: `/support/cases/${id}`,
    method: 'GET'
  })
}

/**
 * 创建案例
 * @param {Object} data - 案例信息
 */
export function createCase(data) {
  return request({
    url: '/support/cases',
    method: 'POST',
    data
  })
}

/**
 * 更新案例
 * @param {number} id - 案例ID
 * @param {Object} data - 案例信息
 */
export function updateCase(id, data) {
  return request({
    url: `/support/cases/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除案例
 * @param {number} id - 案例ID
 */
export function deleteCase(id) {
  return request({
    url: `/support/cases/${id}`,
    method: 'DELETE'
  })
}

// ========== 公司信息管理 ==========

/**
 * 获取公司信息
 */
export function getCompanyInfo() {
  return request({
    url: '/support/company-info',
    method: 'GET'
  })
}

/**
 * 更新公司信息
 * @param {Object} data - 公司信息
 */
export function updateCompanyInfo(data) {
  return request({
    url: '/support/company-info',
    method: 'PUT',
    data
  })
}

// ========== 文件上传 ==========

/**
 * 上传图片
 * @param {FormData} formData - 表单数据
 */
export function uploadImage(formData) {
  return request({
    url: '/support/upload/image',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ========== 统计数据 ==========

/**
 * 获取综合统计数据
 * @param {Object} params - 查询参数
 */
export function getStatisticsOverview(params) {
  return request({
    url: '/support/statistics/overview',
    method: 'GET',
    params
  })
}

// ========== 系统配置管理 ==========

/**
 * 获取系统配置
 * @param {string} key - 配置键
 */
export function getSystemConfig(key) {
  return request({
    url: `/support/system-configs/${key}`,
    method: 'GET'
  })
}

/**
 * 更新系统配置
 * @param {string} key - 配置键
 * @param {Object} data - 配置信息（configValue, description）
 */
export function updateSystemConfig(key, data) {
  return request({
    url: `/support/system-configs/${key}`,
    method: 'PUT',
    data
  })
}

/**
 * 获取所有系统配置列表
 */
export function getSystemConfigList() {
  return request({
    url: '/support/system-configs',
    method: 'GET'
  })
}

/**
 * 获取提前预约天数配置（统一接口）
 */
export function getAdvanceDays() {
  return request({
    url: '/support/advance-days',
    method: 'GET'
  })
}
