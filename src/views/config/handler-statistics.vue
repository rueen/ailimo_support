<template>
  <div class="handler-statistics-container">
    <page-header title="负责人订单统计" @back="handleBack" />

    <!-- 筛选表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="负责人">
          <a-select
            v-model:value="searchForm.handler_id"
            placeholder="请选择负责人"
            allow-clear
            style="width: 200px"
            :options="handlerOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="dateRange"
            format="YYYY-MM-DD"
            :value-format="'YYYY-MM-DD'"
            allow-clear
            style="width: 280px"
          />
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
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 统计表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 1500 }"
      row-key="handler.id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'handler'">
          {{ record.handler_name || '-' }}
        </template>
        <template v-else-if="column.key === 'equipment'">
          <div>总数：{{ record.equipment?.total || 0 }}</div>
          <div style="color: #52c41a">完成：{{ record.equipment?.completed || 0 }}</div>
          <div style="color: #1890ff">进行中：{{ record.equipment?.in_progress || 0 }}</div>
        </template>
        <template v-else-if="column.key === 'cage'">
          <div>总数：{{ record.cage?.total || 0 }}</div>
          <div style="color: #52c41a">完成：{{ record.cage?.completed || 0 }}</div>
          <div style="color: #1890ff">进行中：{{ record.cage?.in_progress || 0 }}</div>
        </template>
        <template v-else-if="column.key === 'experiment'">
          <div>总数：{{ record.experiment?.total || 0 }}</div>
          <div style="color: #52c41a">完成：{{ record.experiment?.completed || 0 }}</div>
          <div style="color: #1890ff">进行中：{{ record.experiment?.in_progress || 0 }}</div>
        </template>
        <template v-else-if="column.key === 'animal'">
          <div>总数：{{ record.animal?.total || 0 }}</div>
          <div style="color: #52c41a">完成：{{ record.animal?.completed || 0 }}</div>
          <div style="color: #1890ff">进行中：{{ record.animal?.in_progress || 0 }}</div>
        </template>
        <template v-else-if="column.key === 'reagent'">
          <div>总数：{{ record.reagent?.total || 0 }}</div>
          <div style="color: #52c41a">完成：{{ record.reagent?.completed || 0 }}</div>
          <div style="color: #1890ff">进行中：{{ record.reagent?.in_progress || 0 }}</div>
        </template>
        <template v-else-if="column.key === 'summary'">
          <div><strong>总订单：{{ record.summary?.total_orders || 0 }}</strong></div>
          <div style="color: #52c41a"><strong>已完成：{{ record.summary?.completed_orders || 0 }}</strong></div>
          <div style="color: #1890ff"><strong>进行中：{{ record.summary?.in_progress_orders || 0 }}</strong></div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { getHandlerStatistics, getHandlerOptions } from '@/api/config'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()

// ========== 筛选表单 ==========

const searchForm = reactive({
  handler_id: undefined
})

const dateRange = ref([])

/**
 * 查询
 */
const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

/**
 * 重置
 */
const handleReset = () => {
  searchForm.handler_id = undefined
  dateRange.value = []
  handleSearch()
}

/**
 * 返回
 */
const handleBack = () => {
  router.back()
}

// ========== 数据表格 ==========

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`
})

/**
 * 表格列配置
 */
const columns = [
  { 
    title: '负责人', 
    key: 'handler', 
    width: 120,
    fixed: 'left'
  },
  { 
    title: '设备预约', 
    key: 'equipment', 
    width: 140
  },
  { 
    title: '笼位预约', 
    key: 'cage', 
    width: 140
  },
  { 
    title: '实验代操作', 
    key: 'experiment', 
    width: 140
  },
  { 
    title: '动物订单', 
    key: 'animal', 
    width: 140
  },
  { 
    title: '试剂耗材订单', 
    key: 'reagent', 
    width: 140
  },
  { 
    title: '汇总', 
    key: 'summary', 
    width: 150,
    fixed: 'right'
  }
]

/**
 * 获取表格数据
 */
const fetchTableData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    
    if (searchForm.handler_id) {
      params.handler_id = searchForm.handler_id
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    
    const res = await getHandlerStatistics(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取统计数据失败：', error)
    message.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 表格变化
 */
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchTableData()
}

// ========== 负责人选项 ==========

const handlerOptions = ref([])

/**
 * 加载负责人选项
 */
const loadHandlerOptions = async () => {
  try {
    const res = await getHandlerOptions()
    handlerOptions.value = res.data
  } catch (error) {
    console.error('获取负责人选项失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  loadHandlerOptions()
  fetchTableData()
})
</script>

<style lang="less" scoped>
.handler-statistics-container {
  .search-form {
    margin-bottom: 16px;
  }
}
</style>
