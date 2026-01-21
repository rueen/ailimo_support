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

// ==================== 学院管理接口 ====================

/**
 * 获取学院列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.name] - 学院名称（模糊查询）
 * @param {number} [params.organization_id] - 所属组织机构ID
 */
export function getDepartmentList(params) {
  return request({
    url: '/support/departments',
    method: 'GET',
    params
  })
}

/**
 * 获取学院详情
 * @param {number} id - 学院ID
 */
export function getDepartmentDetail(id) {
  return request({
    url: `/support/departments/${id}`,
    method: 'GET'
  })
}

/**
 * 创建学院
 * @param {Object} data - 学院信息
 * @param {string} data.name - 学院名称
 * @param {number} data.organization_id - 所属组织机构ID
 */
export function createDepartment(data) {
  return request({
    url: '/support/departments',
    method: 'POST',
    data
  })
}

/**
 * 更新学院
 * @param {number} id - 学院ID
 * @param {Object} data - 学院信息
 * @param {string} data.name - 学院名称
 * @param {number} data.organization_id - 所属组织机构ID
 */
export function updateDepartment(id, data) {
  return request({
    url: `/support/departments/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除学院
 * @param {number} id - 学院ID
 */
export function deleteDepartment(id) {
  return request({
    url: `/support/departments/${id}`,
    method: 'DELETE'
  })
}

/**
 * 获取学院选项列表（用于下拉选择器）
 * @param {Object} params - 查询参数
 * @param {number} params.organization_id - 必填，组织机构ID
 */
export function getDepartmentOptions(params) {
  return request({
    url: '/support/departments/options',
    method: 'GET',
    params
  })
}

// ==================== 课题组管理接口 ====================

/**
 * 获取课题组列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.name] - 课题组名称（模糊查询）
 * @param {number} [params.department_id] - 所属学院ID（已从 organization_id 更改）
 */
export function getResearchGroupList(params) {
  return request({
    url: '/support/research-groups',
    method: 'GET',
    params
  })
}

/**
 * 获取课题组详情
 * @param {number} id - 课题组ID
 */
export function getResearchGroupDetail(id) {
  return request({
    url: `/support/research-groups/${id}`,
    method: 'GET'
  })
}

/**
 * 根据学院获取课题组选项列表（用于下拉选择器）
 * @param {Object} params - 查询参数
 * @param {number} params.department_id - 必填，学院ID（已从 organization_id 更改）
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
 * @param {string} data.name - 课题组名称
 * @param {number} data.department_id - 所属学院ID（已从 organization_id 更改）
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
 * @param {string} data.name - 课题组名称
 * @param {number} data.department_id - 所属学院ID（已从 organization_id 更改）
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
