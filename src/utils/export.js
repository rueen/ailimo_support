/**
 * 订单导出工具函数
 */

/** 订单状态文本映射 */
export const ORDER_STATUS_MAP = {
  0: '待审核',
  1: '进行中',
  2: '已拒绝',
  3: '已完成',
  4: '已取消'
}

/** 性别文本映射 */
export const GENDER_MAP = {
  0: '雌性',
  1: '雄性',
  2: '不限'
}

/**
 * 将数据导出为 Excel 文件（.xlsx）
 * @param {Array} data - 数据数组
 * @param {Array<{header: string, key?: string, render?: Function, width?: number}>} columns - 列定义
 * @param {string} filename - 文件名（不含扩展名）
 * @returns {Promise<boolean>} 导出成功返回 true，无数据返回 false
 */
export async function exportToExcel(data, columns, filename) {
  if (!data || data.length === 0) {
    return false
  }

  const XLSX = await import('xlsx')

  const headers = columns.map((col) => col.header)
  const rows = data.map((record) =>
    columns.map((col) => {
      if (col.render) {
        const val = col.render(record)
        return val === null || val === undefined ? '' : val
      }
      const val = record[col.key]
      return val === null || val === undefined ? '' : val
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws['!cols'] = columns.map((col) => ({ wch: col.width || 15 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '订单数据')
  XLSX.writeFile(wb, `${filename}.xlsx`)
  return true
}
