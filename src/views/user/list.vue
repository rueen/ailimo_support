<template>
  <div class="user-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="姓名">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入姓名"
            allow-clear
            style="width: 180px"
          />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input
            v-model:value="searchForm.phone"
            placeholder="请输入手机号"
            allow-clear
            style="width: 180px"
          />
        </a-form-item>
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
        <a-form-item label="审核状态">
          <a-select
            v-model:value="searchForm.auditStatus"
            placeholder="请选择审核状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">审核通过</a-select-option>
            <a-select-option :value="2">审核拒绝</a-select-option>
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
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增用户
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
        <template v-if="column.key === 'auditStatus'">
          <a-tag v-if="record.auditStatus === 0" color="orange">待审核</a-tag>
          <a-tag v-else-if="record.auditStatus === 1" color="green">审核通过</a-tag>
          <a-tag v-else-if="record.auditStatus === 2" color="red">审核拒绝</a-tag>
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
              v-if="record.auditStatus === 0"
              type="link"
              size="small"
              @click="handleApprove(record)"
            >
              审核通过
            </a-button>
            <a-button
              v-if="record.auditStatus === 0"
              type="link"
              danger
              size="small"
              @click="handleReject(record)"
            >
              审核拒绝
            </a-button>
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定删除该用户吗？"
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

    <!-- 新增/编辑用户对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="600"
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
        <a-form-item label="姓名" name="name">
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formData.phone" />
        </a-form-item>
        <a-form-item label="省份" name="province">
          <a-input v-model:value="formData.province" />
        </a-form-item>
        <a-form-item label="城市" name="city">
          <a-input v-model:value="formData.city" />
        </a-form-item>
        <a-form-item label="区县" name="district">
          <a-input v-model:value="formData.district" />
        </a-form-item>
        <a-form-item label="详细地址" name="address">
          <a-textarea v-model:value="formData.address" :rows="2" />
        </a-form-item>
        <a-form-item label="组织机构" name="organizationId">
          <a-select
            v-model:value="formData.organizationId"
            :options="organizationOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleOrganizationChange"
          />
        </a-form-item>
        <a-form-item label="课题组" name="researchGroupId">
          <a-select
            v-model:value="formData.researchGroupId"
            :options="researchGroupOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="审核状态" name="auditStatus">
          <a-radio-group v-model:value="formData.auditStatus">
            <a-radio :value="0">待审核</a-radio>
            <a-radio :value="1">审核通过</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 审核拒绝对话框 -->
    <a-modal
      v-model:open="rejectModalVisible"
      title="审核拒绝"
      @ok="handleRejectSubmit"
    >
      <a-form-item label="拒绝原因">
        <a-textarea
          v-model:value="rejectReason"
          :rows="4"
          placeholder="请输入拒绝原因"
        />
      </a-form-item>
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
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  auditUser
} from '@/api/user'
import { getOrganizationOptions, getResearchGroupOptions } from '@/api/organization'

// ========== 搜索表单 ==========

const searchForm = reactive({
  name: '',
  phone: '',
  organizationId: undefined,
  auditStatus: undefined
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
  Object.assign(searchForm, {
    name: '',
    phone: '',
    organizationId: undefined,
    auditStatus: undefined
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

/**
 * 表格列配置
 */
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', width: 100 },
  { title: '手机号', dataIndex: 'phone', width: 120 },
  {
    title: '组织机构',
    dataIndex: ['organization', 'name'],
    width: 150,
    customRender: ({ record }) => record.organization?.name || '-'
  },
  {
    title: '课题组',
    dataIndex: ['researchGroup', 'name'],
    width: 150,
    customRender: ({ record }) => record.researchGroup?.name || '-'
  },
  { title: '审核状态', key: 'auditStatus', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'created_at', width: 160 },
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
    const res = await getUserList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取用户列表失败：', error)
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

// ========== 新增/编辑用户 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增用户')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  organizationId: undefined,
  researchGroupId: undefined,
  auditStatus: 1
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
  researchGroupId: [{ required: true, message: '请选择课题组', trigger: 'change' }]
}

const organizationOptions = ref([])
const researchGroupOptions = ref([])

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增用户'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    organizationId: undefined,
    researchGroupId: undefined,
    auditStatus: 1
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑用户'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    phone: record.phone,
    province: record.province,
    city: record.city,
    district: record.district,
    address: record.address,
    organizationId: record.organization?.id,
    researchGroupId: record.researchGroup?.id,
    auditStatus: record.auditStatus
  })
  // 加载课题组选项
  if (record.organization?.id) {
    loadResearchGroupOptions(record.organization.id)
  }
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = { ...formData }
    delete data.id
    
    if (formData.id) {
      await updateUser(formData.id, data)
      message.success('更新成功')
    } else {
      await createUser(data)
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
 * 组织机构变化
 */
const handleOrganizationChange = (value) => {
  formData.researchGroupId = undefined
  if (value) {
    loadResearchGroupOptions(value)
  } else {
    researchGroupOptions.value = []
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
 * 加载课题组选项
 */
const loadResearchGroupOptions = async (organizationId) => {
  try {
    const res = await getResearchGroupOptions({ organizationId })
    researchGroupOptions.value = res.data
  } catch (error) {
    console.error('获取课题组选项失败：', error)
  }
}

// ========== 审核 ==========

const rejectModalVisible = ref(false)
const rejectReason = ref('')
const currentRecord = ref(null)

/**
 * 审核通过
 */
const handleApprove = async (record) => {
  try {
    await auditUser(record.id, { status: 1 })
    message.success('审核通过')
    fetchTableData()
  } catch (error) {
    console.error('审核失败：', error)
  }
}

/**
 * 审核拒绝
 */
const handleReject = (record) => {
  currentRecord.value = record
  rejectReason.value = ''
  rejectModalVisible.value = true
}

/**
 * 提交审核拒绝
 */
const handleRejectSubmit = async () => {
  if (!rejectReason.value) {
    message.warning('请输入拒绝原因')
    return
  }
  try {
    await auditUser(currentRecord.value.id, {
      status: 2,
      rejectReason: rejectReason.value
    })
    message.success('已拒绝')
    rejectModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('拒绝失败：', error)
  }
}

/**
 * 删除
 */
const handleDelete = async (record) => {
  try {
    await deleteUser(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadOrganizationOptions()
})
</script>

<style lang="less" scoped>
.user-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
