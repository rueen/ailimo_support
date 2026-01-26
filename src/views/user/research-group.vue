<template>
  <div>
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="课题组名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入课题组名称"
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
            @change="handleSearchOrganizationChange"
          />
        </a-form-item>
        <a-form-item label="学院">
          <a-select
            v-model:value="searchForm.department_id"
            placeholder="请选择学院"
            allow-clear
            style="width: 200px"
            :options="searchDepartmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="!searchForm.organization_id"
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
        v-if="userStore.hasPermission('research_group:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增课题组
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
            <a-button
              v-if="userStore.hasPermission('research_group:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('research_group:delete')"
              title="确定删除该课题组吗？"
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
            @change="handleOrganizationChange"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="学院" name="department_id">
          <a-select
            v-model:value="formData.department_id"
            placeholder="请选择学院"
            :options="departmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="!formData.organization_id"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="课题组名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入课题组名称" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import {
  getResearchGroupList,
  createResearchGroup,
  updateResearchGroup,
  deleteResearchGroup,
  getOrganizationOptions,
  getDepartmentOptions
} from '@/api/organization'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  organization_id: undefined,
  department_id: undefined,
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
  searchForm.organization_id = undefined
  searchForm.department_id = undefined
  searchForm.name = ''
  searchDepartmentOptions.value = []
  handleSearch()
}

/**
 * 搜索表单组织机构变化
 */
const handleSearchOrganizationChange = (value) => {
  searchForm.department_id = undefined
  searchDepartmentOptions.value = []
  if (value) {
    loadSearchDepartmentOptions(value)
  }
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
  { title: '课题组名称', dataIndex: 'name' },
  { title: '备注', dataIndex: 'remark' },
  {
    title: '学院',
    dataIndex: ['department', 'name'],
    customRender: ({ record }) => record.department?.name || '-'
  },
  {
    title: '组织机构',
    dataIndex: ['organization', 'name'],
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
      pageSize: pagination.pageSize,
      ...searchForm
    }
    if (searchForm.name) {
      params.name = searchForm.name
    }
    if (searchForm.department_id) {
      params.department_id = searchForm.department_id
    }
    const res = await getResearchGroupList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取课题组列表失败：', error)
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
const modalTitle = ref('新增课题组')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  organization_id: undefined,
  department_id: undefined,
  remark: ''
})

const formRules = {
  name: [{ required: true, message: '请输入课题组名称', trigger: 'blur' }],
  organization_id: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
  department_id: [{ required: true, message: '请选择学院', trigger: 'change' }]
}

const organizationOptions = ref([])
const searchDepartmentOptions = ref([])
const departmentOptions = ref([])

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增课题组'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    organization_id: undefined,
    department_id: undefined,
    remark: ''
  })
  // 清空选项列表
  departmentOptions.value = []
}

/**
 * 编辑
 */
const handleEdit = async (record) => {
  modalTitle.value = '编辑课题组'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    organization_id: record.organization?.id,
    department_id: record.department?.id,
    remark: record.remark
  })
  // 加载学院选项
  if (record.organization?.id) {
    await loadDepartmentOptions(record.organization.id)
  }
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      name: formData.name,
      department_id: formData.department_id,
      remark: formData.remark
    }
    
    if (formData.id) {
      await updateResearchGroup(formData.id, data)
      message.success('更新成功')
    } else {
      await createResearchGroup(data)
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
    await deleteResearchGroup(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

/**
 * 组织机构变化（表单）
 */
const handleOrganizationChange = (value) => {
  formData.department_id = undefined
  departmentOptions.value = []
  if (value) {
    loadDepartmentOptions(value)
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

/**
 * 加载搜索表单的学院选项
 */
const loadSearchDepartmentOptions = async (organizationId) => {
  try {
    const res = await getDepartmentOptions({ organization_id: organizationId })
    searchDepartmentOptions.value = res.data
  } catch (error) {
    console.error('获取学院选项失败：', error)
  }
}

/**
 * 加载表单的学院选项
 */
const loadDepartmentOptions = async (organizationId) => {
  try {
    const res = await getDepartmentOptions({ organization_id: organizationId })
    departmentOptions.value = res.data
  } catch (error) {
    console.error('获取学院选项失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadOrganizationOptions()
})
</script>
