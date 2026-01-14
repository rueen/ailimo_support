/**
 * 地区管理接口
 */
import request from '@/utils/request'

/**
 * 获取地区列表
 * @param {Object} params - 查询参数
 * @param {number} params.parent_id - 父级地区ID，0或不传表示获取省级列表
 * @param {number} params.level - 地区层级：1=省，2=市，3=区
 * @returns {Promise}
 */
export function getRegionList(params) {
  return request({
    url: '/support/regions',
    method: 'GET',
    params
  })
}

/**
 * 获取单个地区详情
 * @param {number} id - 地区ID（国标区划代码）
 * @returns {Promise}
 */
export function getRegionDetail(id) {
  return request({
    url: `/support/regions/${id}`,
    method: 'GET'
  })
}

/**
 * 根据地区ID批量获取地区名称
 * @param {Array<number>} ids - 地区ID数组
 * @returns {Promise}
 */
export function getRegionNames(ids) {
  return Promise.all(ids.map(id => getRegionDetail(id)))
}
