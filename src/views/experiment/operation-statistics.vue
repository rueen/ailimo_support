<template>
  <div class="operation-statistics-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline">
        <a-form-item label="时间范围">
          <a-space>
            <a-select
              v-model:value="quickSelect"
              placeholder="快捷选择"
              style="width: 120px"
              @change="handleQuickSelect"
            >
              <a-select-option value="current_month">本月</a-select-option>
              <a-select-option value="last_month">上月</a-select-option>
              <a-select-option value="current_quarter">本季度</a-select-option>
              <a-select-option value="last_quarter">上季度</a-select-option>
              <a-select-option value="custom">自定义</a-select-option>
            </a-select>
            <a-range-picker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              :value-format="'YYYY-MM-DD'"
              :disabled="quickSelect !== 'custom'"
              style="width: 240px"
            />
          </a-space>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="handleReset">
              <ReloadOutlined />
              重置
            </a-button>
            <a-button @click="handleExport" :loading="exportLoading">
              <DownloadOutlined />
              导出Excel
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 统计表格 -->
    <div class="statistics-table-wrapper">
      <a-spin :spinning="loading">
        <div class="table-container" ref="tableContainer">
          <table class="statistics-table" v-if="statisticsData.dates.length > 0">
            <thead>
              <tr>
                <th rowspan="2" class="date-column">日期</th>
                <th
                  v-for="user in statisticsData.users"
                  :key="user.id"
                  :colspan="user.operations.length"
                  class="user-header"
                >
                  {{ getUserDisplayName(user) }}
                </th>
                <th rowspan="2" class="total-column">合计</th>
              </tr>
              <tr>
                <template v-for="user in statisticsData.users" :key="`ops-${user.id}`">
                  <th
                    v-for="operation in user.operations"
                    :key="`${user.id}-${operation.id}`"
                    class="operation-header"
                  >
                    {{ operation.name }}
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(date, index) in statisticsData.dates"
                :key="date"
                :class="{ 'weekend-row': isWeekend(date) }"
              >
                <td class="date-cell">{{ formatDate(date) }}</td>
                <template v-for="user in statisticsData.users" :key="`data-${user.id}`">
                  <td
                    v-for="operation in user.operations"
                    :key="`${user.id}-${operation.id}-${date}`"
                    class="data-cell"
                  >
                    {{ getStatValue(date, user.id, operation.id) }}
                  </td>
                </template>
                <td class="total-cell">{{ getDayTotal(date) }}</td>
              </tr>
              <!-- 小计行 -->
              <tr class="subtotal-row">
                <td class="date-cell">小计</td>
                <template v-for="user in statisticsData.users" :key="`subtotal-${user.id}`">
                  <td
                    v-for="operation in user.operations"
                    :key="`subtotal-${user.id}-${operation.id}`"
                    class="subtotal-cell"
                  >
                    {{ getUserOperationTotal(user.id, operation.id) }}
                  </td>
                </template>
                <td class="total-cell">{{ getGrandTotal() }}</td>
              </tr>
            </tbody>
          </table>
          <a-empty v-else description="暂无数据" />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { getExperimentOperationStatistics } from '@/api/experiment'

dayjs.extend(quarterOfYear)

// ========== 搜索表单 ==========

const quickSelect = ref('current_month')
const dateRange = ref([])

/**
 * 处理快捷选择
 */
const handleQuickSelect = (value) => {
  const today = dayjs()
  
  switch (value) {
    case 'current_month':
      dateRange.value = [
        today.startOf('month').format('YYYY-MM-DD'),
        today.endOf('month').format('YYYY-MM-DD')
      ]
      break
    case 'last_month':
      dateRange.value = [
        today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      ]
      break
    case 'current_quarter':
      dateRange.value = [
        today.startOf('quarter').format('YYYY-MM-DD'),
        today.endOf('quarter').format('YYYY-MM-DD')
      ]
      break
    case 'last_quarter':
      dateRange.value = [
        today.subtract(1, 'quarter').startOf('quarter').format('YYYY-MM-DD'),
        today.subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD')
      ]
      break
    case 'custom':
      // 自定义时保持当前日期范围
      break
  }
}

/**
 * 查询
 */
const handleSearch = () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    message.warning('请选择时间范围')
    return
  }
  fetchStatisticsData()
}

/**
 * 重置
 */
const handleReset = () => {
  quickSelect.value = 'current_month'
  handleQuickSelect('current_month')
  fetchStatisticsData()
}

// ========== 统计数据 ==========

const loading = ref(false)
const statisticsData = ref({
  dates: [],
  users: [],
  data: {}
})

/**
 * 获取统计数据
 */
const fetchStatisticsData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return
  }
  
  try {
    loading.value = true
    const params = {
      start_date: dateRange.value[0],
      end_date: dateRange.value[1]
    }
    
    const res = await getExperimentOperationStatistics(params)
    statisticsData.value = res.data
  } catch (error) {
    console.error('获取统计数据失败：', error)
    message.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 格式化用户显示名称
 * @param {Object} user - 用户对象
 * @returns {string} 格式化后的用户名称
 */
const getUserDisplayName = (user) => {
  if (user.research_group && user.research_group.name) {
    return `${user.name}(${user.research_group.name})`
  }
  return user.name
}

/**
 * 格式化日期显示
 * @param {string} date - 日期字符串 YYYY-MM-DD
 */
const formatDate = (date) => {
  const d = dayjs(date)
  return `${d.month() + 1}.${d.date()}`
}

/**
 * 判断是否为周末
 * @param {string} date - 日期字符串 YYYY-MM-DD
 */
const isWeekend = (date) => {
  const day = dayjs(date).day()
  return day === 0 || day === 6
}

/**
 * 获取统计值
 * @param {string} date - 日期
 * @param {number} userId - 用户ID
 * @param {number} operationId - 操作类型ID
 */
const getStatValue = (date, userId, operationId) => {
  const key = `${date}_${userId}_${operationId}`
  const value = statisticsData.value.data[key]
  return value || ''
}

/**
 * 获取每日总计
 * @param {string} date - 日期
 */
const getDayTotal = (date) => {
  let total = 0
  statisticsData.value.users.forEach(user => {
    user.operations.forEach(operation => {
      const value = getStatValue(date, user.id, operation.id)
      if (value) {
        total += parseInt(value)
      }
    })
  })
  return total || ''
}

/**
 * 获取用户-操作类型小计
 * @param {number} userId - 用户ID
 * @param {number} operationId - 操作类型ID
 */
const getUserOperationTotal = (userId, operationId) => {
  let total = 0
  statisticsData.value.dates.forEach(date => {
    const value = getStatValue(date, userId, operationId)
    if (value) {
      total += parseInt(value)
    }
  })
  return total || ''
}

/**
 * 获取总计
 */
const getGrandTotal = () => {
  let total = 0
  statisticsData.value.dates.forEach(date => {
    const dayTotal = getDayTotal(date)
    if (dayTotal) {
      total += parseInt(dayTotal)
    }
  })
  return total || ''
}

// ========== 导出Excel ==========

const exportLoading = ref(false)

/**
 * 导出Excel
 */
const handleExport = async () => {
  if (!statisticsData.value.dates.length) {
    message.warning('暂无数据可导出')
    return
  }
  
  try {
    exportLoading.value = true
    
    // 动态导入xlsx库
    const XLSX = await import('xlsx')
    
    // 构建导出数据
    const exportData = []
    
    // 第一行：用户名（合并单元格）
    const headerRow1 = ['日期']
    statisticsData.value.users.forEach(user => {
      headerRow1.push(getUserDisplayName(user))
      // 填充空白列以实现合并效果
      for (let i = 1; i < user.operations.length; i++) {
        headerRow1.push('')
      }
    })
    headerRow1.push('合计')
    exportData.push(headerRow1)
    
    // 第二行：操作类型
    const headerRow2 = ['']
    statisticsData.value.users.forEach(user => {
      user.operations.forEach(operation => {
        headerRow2.push(operation.name)
      })
    })
    headerRow2.push('')
    exportData.push(headerRow2)
    
    // 数据行
    statisticsData.value.dates.forEach(date => {
      const row = [formatDate(date)]
      statisticsData.value.users.forEach(user => {
        user.operations.forEach(operation => {
          row.push(getStatValue(date, user.id, operation.id) || '')
        })
      })
      row.push(getDayTotal(date) || '')
      exportData.push(row)
    })
    
    // 小计行
    const subtotalRow = ['小计']
    statisticsData.value.users.forEach(user => {
      user.operations.forEach(operation => {
        subtotalRow.push(getUserOperationTotal(user.id, operation.id) || '')
      })
    })
    subtotalRow.push(getGrandTotal() || '')
    exportData.push(subtotalRow)
    
    // 创建工作簿
    const ws = XLSX.utils.aoa_to_sheet(exportData)
    
    // 设置列宽
    const colWidths = [{ wch: 10 }] // 日期列
    statisticsData.value.users.forEach(user => {
      user.operations.forEach(() => {
        colWidths.push({ wch: 12 })
      })
    })
    colWidths.push({ wch: 10 }) // 合计列
    ws['!cols'] = colWidths
    
    // 合并单元格（第一行用户名）
    const merges = []
    let colIndex = 1
    statisticsData.value.users.forEach(user => {
      if (user.operations.length > 1) {
        merges.push({
          s: { r: 0, c: colIndex },
          e: { r: 0, c: colIndex + user.operations.length - 1 }
        })
      }
      colIndex += user.operations.length
    })
    ws['!merges'] = merges
    
    // 创建工作簿并导出
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '代操作统计')
    
    // 生成文件名
    const filename = `实验代操作统计_${dateRange.value[0]}_${dateRange.value[1]}.xlsx`
    XLSX.writeFile(wb, filename)
    
    message.success('导出成功')
  } catch (error) {
    console.error('导出失败：', error)
    if (error.message && error.message.includes('Cannot find module')) {
      message.error('导出功能需要安装xlsx库，请联系管理员')
    } else {
      message.error('导出失败')
    }
  } finally {
    exportLoading.value = false
  }
}

// ========== 初始化 ==========

onMounted(() => {
  handleQuickSelect('current_month')
  fetchStatisticsData()
})
</script>

<style lang="less" scoped>
.operation-statistics-container {
  .search-form {
    margin-bottom: 16px;
  }

  .statistics-table-wrapper {
    background: #fff;
    padding: 16px;
    border-radius: 4px;
    
    .table-container {
      overflow-x: auto;
      max-width: 100%;
    }
  }
}

.statistics-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 800px;
  
  th,
  td {
    border: 1px solid #e8e8e8;
    padding: 8px 4px;
    text-align: center;
    white-space: nowrap;
  }
  
  thead {
    th {
      background: #fafafa;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .user-header {
      background: #e6f7ff;
      border-color: #91d5ff;
      color: #1890ff;
    }
    
    .operation-header {
      background: #f0f5ff;
      font-weight: 500;
      font-size: 12px;
    }
  }
  
  tbody {
    .date-cell {
      background: #fafafa;
      font-weight: 500;
      min-width: 60px;
    }
    
    .data-cell {
      min-width: 50px;
      
      &:hover {
        background: #f5f5f5;
      }
    }
    
    .total-cell {
      background: #fff7e6;
      font-weight: 600;
      color: #fa8c16;
      min-width: 60px;
    }
    
    // 周末行高亮
    &.weekend-row {
      background: #fffbe6;
      
      td {
        background: inherit;
      }
      
      .date-cell {
        background: #fff1b8;
      }
      
      .total-cell {
        background: #ffe58f;
      }
    }
    
    // 小计行
    .subtotal-row {
      background: #f0f5ff;
      font-weight: 600;
      
      td {
        background: inherit;
        border-top: 2px solid #1890ff;
      }
      
      .date-cell {
        background: #d6e4ff;
      }
      
      .subtotal-cell {
        background: #f0f5ff;
        color: #1890ff;
      }
      
      .total-cell {
        background: #bae7ff;
        color: #0050b3;
      }
    }
  }
  
  .date-column,
  .total-column {
    min-width: 80px;
  }
}
</style>
