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
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input
            v-model:value="searchForm.phone"
            placeholder="请输入手机号"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="组织机构">
          <a-select
            v-model:value="searchForm.organization_id"
            placeholder="请选择组织机构"
            allow-clear
            style="width: 150px"
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
        <template v-if="column.key === 'base_info'">
          <div>{{ record.name }}</div>
          <div>{{ record.phone }}</div>
          <div>{{ record.province?.name }} {{ record.city?.name }} {{ record.district?.name }}</div>
          <div>{{ record.address }}</div>
        </template>
        <template v-if="column.key === 'organization_info'">
          <div>{{ record.organization?.name }}</div>
          <div>{{ record.research_group?.name }}</div>
        </template>
        <template v-if="column.key === 'audit_info'">
          <a-tag v-if="record.audit_status === 0" color="orange">待审核</a-tag>
          <a-tag v-else-if="record.audit_status === 1" color="green">审核通过</a-tag>
          <a-tag v-else-if="record.audit_status === 2" color="red">审核拒绝</a-tag>
          <div v-if="record.audit_status === 2">拒绝原因：{{ record.reject_reason }}</div>
          <div v-if="record.audit_status !== 0">审核时间：{{ record.audit_time }}</div>
          <div v-if="record.audit_status !== 0">审核人：{{ record.audit_by?.username }}</div>
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
              v-if="userStore.hasPermission('user:detail')"
              type="link"
              size="small"
              @click="handleView(record)"
            >
              详情
            </a-button>
            <a-popconfirm
              v-if="record.audit_status === 0 && userStore.hasPermission('user:audit')"
              title="确定审核通过吗？"
              @confirm="handleApprove(record)"
            >
              <a-button type="link" size="small">
                审核通过
              </a-button>
            </a-popconfirm>

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
            v-model:province-id="formData.province_id"
            v-model:city-id="formData.city_id"
            v-model:district-id="formData.district_id"
            select-width="116px"
            @change="handleRegionChange"
          />
        </a-form-item>
        <a-form-item label="详细地址">
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
        <!-- 新增用户时显示审核状态 -->
        <a-form-item v-if="!formData.id" label="审核状态" name="audit_status">
          <a-radio-group v-model:value="formData.audit_status">
            <a-radio :value="0">待审核</a-radio>
            <a-radio :value="1">审核通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <!-- 编辑用户时显示启用状态 -->
        <a-form-item v-else label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="0">禁用</a-radio>
            <a-radio :value="1">启用</a-radio>
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

    <!-- 用户详情对话框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="用户详情"
      :width="700"
      :footer="null"
    >
      <a-spin :spinning="detailLoading">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="用户ID">{{ userDetail.id || '-' }}</a-descriptions-item>
          <a-descriptions-item label="姓名">{{ userDetail.name || '-' }}</a-descriptions-item>
          <a-descriptions-item label="手机号">{{ userDetail.phone || '-' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-badge
              :status="userDetail.status === 1 ? 'success' : 'default'"
              :text="userDetail.status === 1 ? '启用' : '禁用'"
            />
          </a-descriptions-item>
          <a-descriptions-item label="省份">
            {{ userDetail.province?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="城市">
            {{ userDetail.city?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="区县">
            {{ userDetail.district?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="详细地址">
            {{ userDetail.address || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="组织机构">
            {{ userDetail.organization?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="课题组">
            {{ userDetail.research_group?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="审核状态">
            <a-tag v-if="userDetail.audit_status === 0" color="orange">待审核</a-tag>
            <a-tag v-else-if="userDetail.audit_status === 1" color="green">审核通过</a-tag>
            <a-tag v-else-if="userDetail.audit_status === 2" color="red">审核拒绝</a-tag>
            <span v-else>-</span>
          </a-descriptions-item>
          <a-descriptions-item
            v-if="userDetail.audit_status === 2"
            label="拒绝原因"
            :span="2"
          >
            {{ userDetail.reject_reason || '-' }}
          </a-descriptions-item>
          <template v-if="userDetail.audit_status !== 0">
            <a-descriptions-item label="审核时间">
              {{ userDetail.audit_time || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="审核人">
              {{ userDetail.audit_by?.username || '-' }}
            </a-descriptions-item>
          </template>
          <a-descriptions-item label="创建时间">
            {{ userDetail.created_at || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ userDetail.updated_at || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-spin>
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
  getUserDetail,
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
  { 
    title: '基本信息', 
    dataIndex: 'base_info', 
    key: 'base_info',
    width: 150,
  },
  { 
    title: '组织机构', 
    dataIndex: 'organization_info', 
    key: 'organization_info', 
    width: 150
  },
  { 
    title: '审核信息', 
    dataIndex: 'audit_info', 
    key: 'audit_info', 
    width: 200
  },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'created_at', width: 150 },
  { title: '更新时间', dataIndex: 'updated_at', width: 150 },
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
  // 省市区ID（用于RegionCascader组件绑定和提交到后端）
  province_id: undefined,
  city_id: undefined,
  district_id: undefined,
  address: '',
  organization_id: undefined,
  research_group_id: undefined,
  // 新增用户时的审核状态
  audit_status: 1,
  // 编辑用户时的启用状态
  status: 1
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
        // 省市区是可选的，但必须同时提供或同时不提供
        const hasProvince = !!formData.province_id
        const hasCity = !!formData.city_id
        const hasDistrict = !!formData.district_id
        
        // 如果都没有，则通过验证
        if (!hasProvince && !hasCity && !hasDistrict) {
          return Promise.resolve()
        }
        
        // 如果有部分填写，必须全部填写
        if (!hasProvince || !hasCity || !hasDistrict) {
          return Promise.reject('请选择完整的省市区信息，或全部不选')
        }
        
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ],
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
    province_id: undefined,
    city_id: undefined,
    district_id: undefined,
    address: '',
    organization_id: undefined,
    research_group_id: undefined,
    audit_status: 1,  // 新增时默认审核通过
    status: 1
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
    // 从响应数据中获取省市区ID
    province_id: record.province_id,
    city_id: record.city_id,
    district_id: record.district_id,
    address: record.address,
    organization_id: record.organization?.id,
    research_group_id: record.research_group?.id,
    audit_status: record.audit_status,  // 仅用于显示，不会提交
    status: record.status  // 编辑时可以修改状态
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
    
    // 基础数据
    const data = {
      name: formData.name,
      phone: formData.phone,
      organization_id: formData.organization_id,
      research_group_id: formData.research_group_id
    }
    
    // 省市区ID（可选，但必须同时提供或不提供）
    if (formData.province_id && formData.city_id && formData.district_id) {
      data.province_id = formData.province_id
      data.city_id = formData.city_id
      data.district_id = formData.district_id
    }
    
    // 地址（可选）
    if (formData.address) {
      data.address = formData.address
    }
    
    if (formData.id) {
      // 编辑用户：包含 status，不包含 audit_status
      data.status = formData.status
      await updateUser(formData.id, data)
      message.success('更新成功')
    } else {
      // 新增用户：包含 audit_status
      data.audit_status = formData.audit_status
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
const handleRegionChange = () => {
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

// ========== 详情 ==========

const detailModalVisible = ref(false)
const detailLoading = ref(false)
const userDetail = ref({})

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
 * 查看详情
 */
const handleView = async (record) => {
  try {
    detailModalVisible.value = true
    detailLoading.value = true
    const res = await getUserDetail(record.id)
    userDetail.value = res.data
  } catch (error) {
    console.error('获取用户详情失败：', error)
    message.error('获取用户详情失败')
    detailModalVisible.value = false
  } finally {
    detailLoading.value = false
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
