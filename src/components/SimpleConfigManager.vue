<template>
  <div class="simple-config-manager">
    <!-- 搜索表单 -->
    <div v-if="showSearch" class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item :label="`${title}名称`">
          <a-input
            v-model:value="searchForm.name"
            :placeholder="`请输入${title}名称`"
            allow-clear
            style="width: 200px"
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

    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增{{ title }}
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
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              :title="`确定删除该${title}吗？`"
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

    <!-- 新增/编辑对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item :label="`${title}名称`" name="name">
          <a-input v-model:value="formData.name" :placeholder="`请输入${title}名称`" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'

/**
 * 组件属性
 */
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  api: {
    type: Object,
    required: true
  },
  showSearch: {
    type: Boolean,
    default: false
  }
})

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`
})

// ========== 搜索表单 ==========

const searchForm = reactive({
  name: ''
})

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
  searchForm.name = ''
  handleSearch()
}

/**
 * 表格列配置
 */
const columns = [
  { title: '名称', dataIndex: 'name' },
  { title: '创建时间', dataIndex: 'created_at', width: 200 },
  { title: '更新时间', dataIndex: 'updated_at', width: 200 },
  { title: '操作', key: 'action', fixed: 'right', width: 150 }
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
    // 如果有搜索条件，添加到参数中
    if (props.showSearch && searchForm.name) {
      params.name = searchForm.name
    }
    const res = await props.api.list(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error(`获取${props.title}列表失败：`, error)
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

// ========== 新增/编辑 ==========

const modalVisible = ref(false)
const modalTitle = ref(`新增${props.title}`)
const formRef = ref()
const formData = reactive({
  id: null,
  name: ''
})

const formRules = {
  name: [{ required: true, message: `请输入${props.title}名称`, trigger: 'blur' }]
}

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = `新增${props.title}`
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: ''
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = `编辑${props.title}`
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name
  })
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = { name: formData.name }
    
    if (formData.id) {
      await props.api.update(formData.id, data)
      message.success('更新成功')
    } else {
      await props.api.create(data)
      message.success('创建成功')
    }
    
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('提交失败：', error)
  }
}

/**
 * 取消
 */
const handleCancel = () => {
  formRef.value?.resetFields()
}

/**
 * 删除
 */
const handleDelete = async (record) => {
  try {
    await props.api.delete(record.id)
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
.simple-config-manager {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
