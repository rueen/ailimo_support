/**
 * 组织机构管理接口
 */
import request from '@/utils/request'

/**
 * 获取组织机构列表
 * @param {Object} params - 查询参数
 */
export function getOrganizationList(params) {
  return request({
    url: '/support/organizations',
    method: 'GET',
    params
  })
}

/**
 * 获取组织机构选项列表
 */
export function getOrganizationOptions() {
  return request({
    url: '/support/organizations/options',
    method: 'GET'
  })
}

/**
 * 创建组织机构
 * @param {Object} data - 组织机构信息
 */
export function createOrganization(data) {
  return request({
    url: '/support/organizations',
    method: 'POST',
    data
  })
}

/**
 * 更新组织机构
 * @param {number} id - 组织机构ID
 * @param {Object} data - 组织机构信息
 */
export function updateOrganization(id, data) {
  return request({
    url: `/support/organizations/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除组织机构
 * @param {number} id - 组织机构ID
 */
export function deleteOrganization(id) {
  return request({
    url: `/support/organizations/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取课题组列表
 * @param {Object} params - 查询参数
 */
export function getResearchGroupList(params) {
  return request({
    url: '/support/research-groups',
    method: 'GET',
    params
  })
}

/**
 * 根据组织机构获取课题组选项列表
 * @param {Object} params - 查询参数
 */
export function getResearchGroupOptions(params) {
  return request({
    url: '/support/research-groups/options',
    method: 'GET',
    params
  })
}

/**
 * 创建课题组
 * @param {Object} data - 课题组信息
 */
export function createResearchGroup(data) {
  return request({
    url: '/support/research-groups',
    method: 'POST',
    data
  })
}

/**
 * 更新课题组
 * @param {number} id - 课题组ID
 * @param {Object} data - 课题组信息
 */
export function updateResearchGroup(id, data) {
  return request({
    url: `/support/research-groups/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除课题组
 * @param {number} id - 课题组ID
 */
export function deleteResearchGroup(id) {
  return request({
    url: `/support/research-groups/${id}`,
    method: 'DELETE'
  })
}
