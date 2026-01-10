<template>
  <div class="research-group-container">
    <!-- 搜索表单 -->
    <a-card class="search-form" :bodyStyle="{ paddingBottom: 0 }">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="组织机构">
          <a-select
            v-model:value="searchForm.organizationId"
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
    </a-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增课题组
      </a-button>
    </div>

    <!-- 数据表格 -->
    <a-card>
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
    </a-card>

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
        <a-form-item label="组织机构" name="organizationId">
          <a-select
            v-model:value="formData.organizationId"
            placeholder="请选择组织机构"
            :options="organizationOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="课题组名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入课题组名称" />
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
  getOrganizationOptions
} from '@/api/organization'

// ========== 搜索表单 ==========

const searchForm = reactive({
  organizationId: undefined
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
  searchForm.organizationId = undefined
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

/**
 * 表格列配置
 */
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '课题组名称', dataIndex: 'name' },
  {
    title: '组织机构',
    dataIndex: ['organization', 'name'],
    customRender: ({ record }) => record.organization?.name || '-'
  },
  { title: '创建时间', dataIndex: 'createdAt', width: 200 },
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
      pageSize: pagination.pageSize,
      ...searchForm
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
  organizationId: undefined
})

const formRules = {
  name: [{ required: true, message: '请输入课题组名称', trigger: 'blur' }],
  organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }]
}

const organizationOptions = ref([])

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
    organizationId: undefined
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑课题组'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    organizationId: record.organization?.id
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
      organizationId: formData.organizationId
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
.research-group-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
