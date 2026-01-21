<template>
  <div>
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="学院名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入学院名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="组织机构">
          <a-select
            v-model:value="searchForm.organization_id"
            placeholder="请选择组织机构"
            allow-clear
            style="width: 200px"
            :options="organizationOptions"
            :field-names="{ label: 'name', value: 'id' }"
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
      <a-button
        v-if="userStore.hasPermission('department:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增学院
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
        <template v-if="column.key === 'organization'">
          {{ record.organization?.name || '-' }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('department:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('department:delete')"
              title="确定删除该学院吗？"
              ok-text="确定"
              cancel-text="取消"
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
        <a-form-item label="组织机构" name="organization_id">
          <a-select
            v-model:value="formData.organization_id"
            placeholder="请选择组织机构"
            :options="organizationOptions"
            :field-names="{ label: 'name', value: 'id' }"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="学院名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入学院名称" allow-clear />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import {
  getDepartmentList,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getOrganizationOptions
} from '@/api/organization'
import { useUserStore } from '@/store'

const userStore = useUserStore()

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
  name: '',
  organization_id: undefined
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
  searchForm.organization_id = undefined
  handleSearch()
}

/**
 * 表格列配置
 */
const columns = [
  { title: '学院名称', dataIndex: 'name' },
  { 
    title: '组织机构', 
    key: 'organization',
    customRender: ({ record }) => record.organization?.name || '-'
  },
  { title: '创建时间', dataIndex: 'created_at' },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
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
    if (searchForm.name) {
      params.name = searchForm.name
    }
    if (searchForm.organization_id) {
      params.organization_id = searchForm.organization_id
    }
    const res = await getDepartmentList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取学院列表失败：', error)
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
const modalTitle = ref('新增学院')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  organization_id: undefined
})

const formRules = {
  name: [{ required: true, message: '请输入学院名称', trigger: 'blur' }],
  organization_id: [{ required: true, message: '请选择组织机构', trigger: 'change' }]
}

const organizationOptions = ref([])

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增学院'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    organization_id: undefined
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑学院'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    organization_id: record.organization?.id
  })
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      name: formData.name,
      organization_id: formData.organization_id
    }
    
    if (formData.id) {
      await updateDepartment(formData.id, data)
      message.success('更新成功')
    } else {
      await createDepartment(data)
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
    await deleteDepartment(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

/**
 * 加载组织机构选项
 */
const loadOrganizationOptions = async () => {
  try {
    const res = await getOrganizationOptions()
    organizationOptions.value = res.data
  } catch (error) {
    console.error('获取组织机构选项失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadOrganizationOptions()
})
</script>

<style lang="less" scoped>
.search-form {
  margin-bottom: 16px;
}

.action-bar {
  margin-bottom: 16px;
}
</style>
