<template>
  <div class="cage-reservation-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="用户姓名">
          <a-input
            v-model:value="searchForm.userName"
            placeholder="请输入用户姓名"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="用户手机号">
          <a-input
            v-model:value="searchForm.userPhone"
            placeholder="请输入手机号"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="动物类型">
          <a-select
            v-model:value="searchForm.animalTypeId"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
            :options="animalTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="环境类型">
          <a-select
            v-model:value="searchForm.environmentId"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
            :options="environmentTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已拒绝</a-select-option>
            <a-select-option :value="3">已完成</a-select-option>
            <a-select-option :value="4">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="预约日期">
          <a-range-picker
            v-model:value="dateRange"
            format="YYYY-MM-DD"
            :value-format="'YYYY-MM-DD'"
            allow-clear
            style="width: 240px"
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
        新增订单
      </a-button>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 1500 }"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'timeSlots'">
          {{ record.timeSlots?.join(', ') || '-' }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleView(record)">
              详情
            </a-button>
            <a-button
              v-if="record.status === 0"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status === 0"
              type="link"
              size="small"
              @click="handleApprove(record)"
            >
              审核
            </a-button>
            <a-button
              v-if="record.status === 1"
              type="link"
              size="small"
              @click="handleComplete(record)"
            >
              完成
            </a-button>
            <a-popconfirm
              v-if="record.status === 1"
              title="确定取消该订单吗？"
              @confirm="handleCancel(record)"
            >
              <a-button type="link" danger size="small">
                取消
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑订单对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="800"
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="预约用户" name="userId">
          <a-select
            v-model:value="formData.userId"
            placeholder="请选择用户"
            show-search
            :filter-option="false"
            @search="handleUserSearch"
            @change="handleUserChange"
          >
            <a-select-option
              v-for="user in userOptions"
              :key="user.id"
              :value="user.id"
            >
              {{ user.name }} - {{ user.phone }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="动物类型" name="animalTypeId">
          <a-select
            v-model:value="formData.animalTypeId"
            placeholder="请选择动物类型"
            :options="animalTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleAnimalTypeChange"
          />
        </a-form-item>
        <a-form-item label="环境类型" name="environmentId">
          <a-select
            v-model:value="formData.environmentId"
            placeholder="请选择环境类型"
            :options="environmentTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleEnvironmentChange"
          />
        </a-form-item>
        <a-form-item label="笼位数量" name="quantity">
          <a-input-number
            v-model:value="formData.quantity"
            :min="1"
            :max="1000"
            placeholder="请输入数量"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="用途" name="purposeId">
          <a-select
            v-model:value="formData.purposeId"
            placeholder="请选择用途"
            :options="purposeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="预约日期" name="reservationDate">
          <a-date-picker
            v-model:value="formData.reservationDate"
            format="YYYY-MM-DD"
            :value-format="'YYYY-MM-DD'"
            :disabled-date="disabledDate"
            placeholder="请选择日期"
            style="width: 100%"
            @change="handleDateChange"
          />
        </a-form-item>
        <a-form-item label="预约时段" name="timeSlots">
          <a-select
            v-model:value="formData.timeSlots"
            mode="multiple"
            placeholder="请选择时间段"
            :options="timeSlotOptions"
            :field-names="{ label: 'display_time', value: 'display_time' }"
          />
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

    <!-- 审核对话框 -->
    <a-modal
      v-model:open="approveModalVisible"
      title="审核订单"
      :width="600"
      @ok="handleApproveSubmit"
    >
      <a-form
        ref="approveFormRef"
        :model="approveFormData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="审核结果">
          <a-radio-group v-model:value="approveFormData.result">
            <a-radio :value="'approve'">通过</a-radio>
            <a-radio :value="'reject'">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="approveFormData.result === 'approve'"
          label="负责人"
          name="handlerId"
          :rules="[{ required: true, message: '请选择负责人' }]"
        >
          <a-select
            v-model:value="approveFormData.handlerId"
            placeholder="请选择负责人"
            :options="handlerOptions"
            :field-names="{ label: 'username', value: 'id' }"
          />
        </a-form-item>
        <a-form-item
          v-if="approveFormData.result === 'reject'"
          label="拒绝原因"
          name="rejectReason"
          :rules="[{ required: true, message: '请输入拒绝原因' }]"
        >
          <a-textarea
            v-model:value="approveFormData.rejectReason"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 详情对话框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="订单详情"
      :width="800"
      :footer="null"
    >
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="订单ID">
          {{ detailData.id }}
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="用户姓名">
          {{ detailData.user?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="联系电话">
          {{ detailData.user?.phone || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="所属机构">
          {{ detailData.user?.organization?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="动物类型">
          {{ detailData.animalType?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="环境类型">
          {{ detailData.environment?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="笼位数量">
          {{ detailData.quantity }}
        </a-descriptions-item>
        <a-descriptions-item label="用途">
          {{ detailData.purpose?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="预约日期">
          {{ detailData.reservationDate || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="预约时段" :span="2">
          {{ detailData.timeSlots?.join(', ') || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ detailData.handler?.username || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="审核人">
          {{ detailData.auditBy?.username || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="审核时间">
          {{ detailData.auditTime || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="完成时间">
          {{ detailData.completedTime || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.rejectReason" label="拒绝原因" :span="2">
          {{ detailData.rejectReason }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">
          {{ detailData.remark || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ detailData.created_at }}
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{ detailData.updated_at }}
        </a-descriptions-item>
      </a-descriptions>
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
  getCageReservationList,
  getCageReservationDetail,
  createCageReservation,
  updateCageReservation,
  auditCageReservation,
  completeCageReservation,
  cancelCageReservation,
  getCagePurposeOptions,
  getCageTimeSlotOptions
} from '@/api/cage'
import { getAnimalTypeOptions, getEnvironmentTypeOptions, getHandlerOptions } from '@/api/config'
import { getUserList } from '@/api/user'

// ========== 搜索表单 ==========

const searchForm = reactive({
  userName: '',
  userPhone: '',
  animalTypeId: undefined,
  environmentId: undefined,
  status: undefined
})

const dateRange = ref([])

const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    userName: '',
    userPhone: '',
    animalTypeId: undefined,
    environmentId: undefined,
    status: undefined
  })
  dateRange.value = []
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
  { title: '用户姓名', dataIndex: ['user', 'name'], width: 120 },
  { title: '联系电话', dataIndex: ['user', 'phone'], width: 130 },
  { title: '动物类型', dataIndex: ['animalType', 'name'], width: 100 },
  { title: '环境类型', dataIndex: ['environment', 'name'], width: 100 },
  { title: '笼位数量', dataIndex: 'quantity', width: 100 },
  { title: '用途', dataIndex: ['purpose', 'name'], width: 100 },
  { title: '预约日期', dataIndex: 'reservationDate', width: 120 },
  { title: '预约时段', key: 'timeSlots', width: 180 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'created_at', width: 170 },
  { title: '操作', key: 'action', fixed: 'right', width: 240 }
]

const fetchTableData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const res = await getCageReservationList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取订单列表失败：', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchTableData()
}

/**
 * 获取状态文本
 */
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '进行中',
    2: '已拒绝',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status) => {
  const colorMap = {
    0: 'orange',
    1: 'blue',
    2: 'red',
    3: 'green',
    4: 'default'
  }
  return colorMap[status] || 'default'
}

// ========== 新增/编辑订单 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增订单')
const formRef = ref()
const formData = reactive({
  id: null,
  userId: undefined,
  animalTypeId: undefined,
  environmentId: undefined,
  quantity: 1,
  purposeId: undefined,
  reservationDate: null,
  timeSlots: [],
  remark: ''
})

const formRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  animalTypeId: [{ required: true, message: '请选择动物类型', trigger: 'change' }],
  environmentId: [{ required: true, message: '请选择环境类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  purposeId: [{ required: true, message: '请选择用途', trigger: 'change' }],
  reservationDate: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  timeSlots: [{ required: true, message: '请选择预约时段', trigger: 'change', type: 'array', min: 1 }]
}

// 选项数据
const animalTypeOptions = ref([])
const environmentTypeOptions = ref([])
const purposeOptions = ref([])
const timeSlotOptions = ref([])
const userOptions = ref([])
const handlerOptions = ref([])

const handleAdd = () => {
  modalTitle.value = '新增订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    userId: undefined,
    animalTypeId: undefined,
    environmentId: undefined,
    quantity: 1,
    purposeId: undefined,
    reservationDate: null,
    timeSlots: [],
    remark: ''
  })
}

const handleEdit = (record) => {
  modalTitle.value = '编辑订单'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    userId: record.user?.id,
    animalTypeId: record.animalType?.id,
    environmentId: record.environment?.id,
    quantity: record.quantity,
    purposeId: record.purpose?.id,
    reservationDate: record.reservationDate,
    timeSlots: record.timeSlots || [],
    remark: record.remark
  })
  // 设置用户选项
  if (record.user) {
    userOptions.value = [record.user]
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      userId: formData.userId,
      animalTypeId: formData.animalTypeId,
      environmentId: formData.environmentId,
      quantity: formData.quantity,
      purposeId: formData.purposeId,
      reservationDate: formData.reservationDate,
      timeSlots: formData.timeSlots,
      remark: formData.remark
    }
    
    if (formData.id) {
      await updateCageReservation(formData.id, data)
      message.success('更新成功')
    } else {
      await createCageReservation(data)
      message.success('创建成功')
    }
    
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('提交失败：', error)
  }
}

const handleModalCancel = () => {
  formRef.value?.resetFields()
}

/**
 * 用户搜索
 */
const handleUserSearch = async (value) => {
  if (!value) return
  try {
    const res = await getUserList({ name: value, page: 1, pageSize: 20 })
    userOptions.value = res.data.list
  } catch (error) {
    console.error('搜索用户失败：', error)
  }
}

/**
 * 用户改变
 */
const handleUserChange = () => {
  // 可以在这里处理用户改变的逻辑
}

/**
 * 动物类型改变
 */
const handleAnimalTypeChange = () => {
  // 可以在这里处理动物类型改变的逻辑
}

/**
 * 环境类型改变
 */
const handleEnvironmentChange = () => {
  // 可以在这里处理环境类型改变的逻辑
}

/**
 * 日期改变
 */
const handleDateChange = () => {
  // 可以在这里处理日期改变的逻辑
}

/**
 * 禁用日期
 */
const disabledDate = (current) => {
  // 禁用今天之前的日期
  return current && current < new Date().setHours(0, 0, 0, 0)
}

// ========== 审核订单 ==========

const approveModalVisible = ref(false)
const approveFormRef = ref()
const approveFormData = reactive({
  id: null,
  result: 'approve',
  handlerId: undefined,
  rejectReason: ''
})

const handleApprove = (record) => {
  approveModalVisible.value = true
  Object.assign(approveFormData, {
    id: record.id,
    result: 'approve',
    handlerId: undefined,
    rejectReason: ''
  })
}

const handleApproveSubmit = async () => {
  try {
    await approveFormRef.value?.validate()
    
    if (approveFormData.result === 'approve') {
      await auditCageReservation(approveFormData.id, {
        status: 1,
        handlerId: approveFormData.handlerId
      })
      message.success('审核通过')
    } else {
      await auditCageReservation(approveFormData.id, {
        status: 2,
        rejectReason: approveFormData.rejectReason
      })
      message.success('已拒绝')
    }
    
    approveModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('审核失败：', error)
  }
}

// ========== 完成/取消订单 ==========

const handleComplete = async (record) => {
  try {
    await completeCageReservation(record.id)
    message.success('订单已完成')
    fetchTableData()
  } catch (error) {
    console.error('完成订单失败：', error)
  }
}

const handleCancel = async (record) => {
  try {
    await cancelCageReservation(record.id)
    message.success('订单已取消')
    fetchTableData()
  } catch (error) {
    console.error('取消订单失败：', error)
  }
}

// ========== 查看详情 ==========

const detailModalVisible = ref(false)
const detailData = ref({})

const handleView = async (record) => {
  try {
    const res = await getCageReservationDetail(record.id)
    detailData.value = res.data
    detailModalVisible.value = true
  } catch (error) {
    console.error('获取详情失败：', error)
  }
}

// ========== 加载选项数据 ==========

const loadOptions = async () => {
  try {
    const [animalTypes, environmentTypes, purposes, timeSlots, handlers] = await Promise.all([
      getAnimalTypeOptions(),
      getEnvironmentTypeOptions(),
      getCagePurposeOptions(),
      getCageTimeSlotOptions(),
      getHandlerOptions()
    ])
    
    animalTypeOptions.value = animalTypes.data
    environmentTypeOptions.value = environmentTypes.data
    purposeOptions.value = purposes.data
    timeSlotOptions.value = timeSlots.data
    handlerOptions.value = handlers.data
  } catch (error) {
    console.error('加载选项数据失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadOptions()
})
</script>

<style lang="less" scoped>
.cage-reservation-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
