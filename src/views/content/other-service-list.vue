<template>
  <div class="other-service-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="标题">
          <a-input
            v-model:value="searchForm.title"
            placeholder="请输入标题"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
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

    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button
        v-if="userStore.hasPermission('other_service:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增其他服务
      </a-button>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'content'">
          <div class="content-preview" v-html="getContentPreview(record.content)"></div>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-badge
            :status="record.status === 1 ? 'success' : 'default'"
            :text="record.status === 1 ? '启用' : '禁用'"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('other_service:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('other_service:delete')"
              title="确定删除该其他服务吗？"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import {
  getOtherServiceList,
  deleteOtherService
} from '@/api/other-service'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  title: '',
  status: undefined
})

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    status: undefined
  })
  handleSearch()
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

const columns = [
  { title: '标题', dataIndex: 'title', width: 200 },
  { title: '内容', key: 'content', ellipsis: true, width: 300 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'created_at', width: 180 },
  { title: '更新时间', dataIndex: 'updated_at', width: 180 },
  { title: '操作', key: 'action', fixed: 'right', width: 150 }
]

/**
 * 获取内容预览（去除HTML标签）
 * @param {string} content - HTML内容
 * @returns {string} 纯文本预览
 */
const getContentPreview = (content) => {
  if (!content) return ''
  // 创建临时div来解析HTML
  const div = document.createElement('div')
  div.innerHTML = content
  const text = div.textContent || div.innerText || ''
  // 限制长度
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

/**
 * 获取数据列表
 */
const fetchTableData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      ...searchForm
    }
    const res = await getOtherServiceList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取其他服务列表失败：', error)
  } finally {
    loading.value = false
  }
}

/**
 * 表格改变事件
 * @param {Object} pag - 分页信息
 */
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchTableData()
}

// ========== 新增/编辑/删除 ==========

/**
 * 新增
 */
const handleAdd = () => {
  router.push('/content/other-service/form')
}

/**
 * 编辑
 * @param {Object} record - 记录数据
 */
const handleEdit = (record) => {
  router.push(`/content/other-service/form/${record.id}`)
}

/**
 * 删除
 * @param {Object} record - 记录数据
 */
const handleDelete = async (record) => {
  try {
    await deleteOtherService(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
})
</script>

<style lang="less" scoped>
.other-service-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }

  .content-preview {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
