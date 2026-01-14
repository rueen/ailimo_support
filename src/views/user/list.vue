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
            v-model:value="searchForm.organization_id"
            placeholder="请选择组织机构"
            allow-clear
            style="width: 200px"
            :options="organizationOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="审核状态">
          <a-select
            v-model:value="searchForm.audit_status"
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
      <a-button
        v-if="userStore.hasPermission('user:create')"
        type="primary"
        @click="handleAdd"
      >
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
        <template v-if="column.key === 'audit_status'">
          <a-tag v-if="record.audit_status === 0" color="orange">待审核</a-tag>
          <a-tag v-else-if="record.audit_status === 1" color="green">审核通过</a-tag>
          <a-tag v-else-if="record.audit_status === 2" color="red">审核拒绝</a-tag>
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
              v-if="record.audit_status === 0 && userStore.hasPermission('user:audit')"
              type="link"
              size="small"
              @click="handleApprove(record)"
            >
              审核通过
            </a-button>
            <a-button
              v-if="record.audit_status === 0 && userStore.hasPermission('user:audit')"
              type="link"
              danger
              size="small"
              @click="handleReject(record)"
            >
              审核拒绝
            </a-button>
            <a-button
              v-if="userStore.hasPermission('user:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('user:delete')"
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
          <a-input v-model:value="formData.name" placeholder="请输入姓名" allow-clear />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formData.phone" placeholder="请输入手机号" allow-clear />
        </a-form-item>
        <a-form-item label="地区" name="region">
          <RegionCascader
            v-model:province-id="formData.provinceId"
            v-model:city-id="formData.cityId"
            v-model:district-id="formData.districtId"
            select-width="116px"
            @change="handleRegionChange"
          />
          <div v-if="formData.id && formData.province" style="margin-top: 4px; color: #666; font-size: 12px;">
            当前：{{ formData.province }} {{ formData.city }} {{ formData.district }}
          </div>
        </a-form-item>
        <a-form-item label="详细地址" name="address">
          <a-textarea v-model:value="formData.address" :rows="2" placeholder="请输入详细地址" allow-clear />
        </a-form-item>
        <a-form-item label="组织机构" name="organization_id">
          <a-select
            v-model:value="formData.organization_id"
            :options="organizationOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleOrganizationChange"
            placeholder="请选择组织机构"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="课题组" name="research_group_id">
          <a-select
            v-model:value="formData.research_group_id"
            :options="researchGroupOptions"
            :field-names="{ label: 'name', value: 'id' }"
            placeholder="请选择课题组"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="审核状态" name="audit_status">
          <a-radio-group v-model:value="formData.audit_status">
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
import { useUserStore } from '@/store'
import RegionCascader from '@/components/RegionCascader.vue'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  name: '',
  phone: '',
  organization_id: undefined,
  audit_status: undefined
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
    organization_id: undefined,
    audit_status: undefined
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
    dataIndex: ['research_group', 'name'],
    width: 150,
    customRender: ({ record }) => record.research_group?.name || '-'
  },
  { title: '审核状态', key: 'audit_status', width: 100 },
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
  // 省市区ID（用于RegionCascader组件绑定）
  provinceId: undefined,
  cityId: undefined,
  districtId: undefined,
  // 省市区名称（用于提交到后端）
  province: '',
  city: '',
  district: '',
  address: '',
  organization_id: undefined,
  research_group_id: undefined,
  audit_status: 1
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  region: [
    {
      validator: (rule, value) => {
        if (!formData.province || !formData.city || !formData.district) {
          return Promise.reject('请选择完整的省市区信息')
        }
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  organization_id: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
  research_group_id: [{ required: true, message: '请选择课题组', trigger: 'change' }]
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
    provinceId: undefined,
    cityId: undefined,
    districtId: undefined,
    province: '',
    city: '',
    district: '',
    address: '',
    organization_id: undefined,
    research_group_id: undefined,
    audit_status: 1
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
    // 清空省市区ID（编辑时需要用户重新选择）
    provinceId: undefined,
    cityId: undefined,
    districtId: undefined,
    // 从响应数据中获取省市区名称（保留原值，如果用户不重新选择则使用原值）
    province: record.province || '',
    city: record.city || '',
    district: record.district || '',
    address: record.address,
    organization_id: record.organization?.id,
    research_group_id: record.research_group?.id,
    audit_status: record.audit_status
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
    const data = {
      name: formData.name,
      phone: formData.phone,
      province: formData.province,
      city: formData.city,
      district: formData.district,
      address: formData.address,
      organization_id: formData.organization_id,
      research_group_id: formData.research_group_id,
      audit_status: formData.audit_status
    }
    
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
 * 地区变化
 */
const handleRegionChange = (regionData) => {
  // 保存省市区名称到 formData（用于提交到后端）
  formData.province = regionData.provinceName || ''
  formData.city = regionData.cityName || ''
  formData.district = regionData.districtName || ''
  // 手动触发表单验证
  formRef.value?.validateFields(['region']).catch(() => {})
}

/**
 * 组织机构变化
 */
const handleOrganizationChange = (value) => {
  formData.research_group_id = undefined
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
    const res = await getResearchGroupOptions({ organization_id: organizationId })
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
      reject_reason: rejectReason.value
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
