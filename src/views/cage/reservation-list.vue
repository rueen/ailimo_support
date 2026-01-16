<template>
  <div class="cage-reservation-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="订单号">
          <a-input
            v-model:value="searchForm.order_sn"
            placeholder="输入订单号"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="用户姓名">
          <a-input
            v-model:value="searchForm.user_name"
            placeholder="请输入用户姓名"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="用户手机号">
          <a-input
            v-model:value="searchForm.user_phone"
            placeholder="请输入手机号"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="动物类型">
          <a-select
            v-model:value="searchForm.animal_type_id"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
            :options="animalTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="环境类型">
          <a-select
            v-model:value="searchForm.environment_id"
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
      <a-button
        v-if="userStore.hasPermission('cage_reservation:create')"
        type="primary"
        @click="handleAdd"
      >
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
        <template v-if="column.key === 'user_info'">
          <div>{{ record.user?.name }}</div>
          <div>{{ record.user?.phone }}</div>
        </template>
        <template v-if="column.key === 'cage_info'">
          <div>动物类型：{{ record.animal_type?.name }}</div>
          <div>环境类型：{{ record.environment?.name }}</div>
          <div>笼位数量：{{ record.quantity }}</div>
        </template>
        <template v-if="column.key === 'time_slots'">
          <div>{{ record.reservation_date }}</div>
          <a-tag
            v-for="(slot, index) in record.time_slots"
            :key="index"
            color="blue"
            style="margin-bottom: 4px"
          >
            {{ slot }}
          </a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('cage_reservation:detail')"
              type="link"
              size="small"
              @click="handleView(record)"
            >
              详情
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('cage_reservation:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('cage_reservation:audit')"
              type="link"
              size="small"
              @click="handleApprove(record)"
            >
              审核通过
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('cage_reservation:audit')"
              type="link"
              danger
              size="small"
              @click="handleReject(record)"
            >
              审核拒绝
            </a-button>
            <a-popconfirm
              v-if="record.status === 1 && userStore.hasPermission('cage_reservation:complete')"
              title="确定完成该订单吗？"
              @confirm="handleComplete(record)"
            >
              <a-button type="link" size="small">
                完成
              </a-button>
            </a-popconfirm>
            <a-popconfirm
              v-if="record.status === 1 && userStore.hasPermission('cage_reservation:cancel')"
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
        <a-form-item label="用户" name="user_id">
          <a-select
            v-model:value="formData.user_id"
            placeholder="请输入用户姓名/手机号搜索"
            show-search
            :filter-option="false"
            :not-found-content="null"
            @search="handleUserSearch"
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
        <a-form-item label="动物类型" name="animal_type_id">
          <a-select
            v-model:value="formData.animal_type_id"
            placeholder="请选择动物类型"
            :options="animalTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleAnimalTypeChange"
          />
        </a-form-item>
        <a-form-item label="环境类型" name="environment_id">
          <a-select
            v-model:value="formData.environment_id"
            placeholder="请选择环境类型"
            :options="dynamicEnvironmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="!formData.animal_type_id"
            :not-found-content="formData.animal_type_id ? '该动物类型暂无可用笼位' : '请先选择动物类型'"
            @change="handleEnvironmentChange"
          />
        </a-form-item>
        <a-form-item label="笼位数量" name="quantity">
          <a-input-number
            v-model:value="formData.quantity"
            :min="1"
            placeholder="请输入数量"
            style="width: 100%"
            @change="handleQuantityChange"
          />
          <div v-if="formData.id === null && getMinAvailableQuantity() !== null" style="color: #999; margin-top: 4px">
            所选时段剩余笼位：{{ getMinAvailableQuantity() }}
          </div>
        </a-form-item>
        <a-form-item label="用途" name="purpose_id">
          <a-select
            v-model:value="formData.purpose_id"
            placeholder="请选择用途"
            :options="purposeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="预约日期" name="reservation_date">
          <a-date-picker
            v-model:value="formData.reservation_date"
            format="YYYY-MM-DD"
            :value-format="'YYYY-MM-DD'"
            :disabled-date="disabledDate"
            placeholder="请选择日期"
            style="width: 100%"
            @change="handleDateChange"
          />
        </a-form-item>
        <a-form-item label="预约时段" name="time_slots">
          <a-select
            v-model:value="formData.time_slots"
            mode="multiple"
            placeholder="请选择时间段"
            :disabled="!formData.environment_id || !formData.reservation_date"
            :not-found-content="formData.environment_id && formData.reservation_date ? '暂无可用时段' : '请先选择环境类型和日期'"
            @change="handleTimeSlotsChange"
          >
            <a-select-option
              v-for="slot in timeSlotOptions"
              :key="slot.display_time"
              :value="slot.display_time"
              :disabled="slot.available_quantity <= 0"
            >
              {{ slot.display_time }} (可用:{{ slot.available_quantity }})
            </a-select-option>
          </a-select>
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

    <!-- 审核通过对话框 -->
    <a-modal
      v-model:open="approveModalVisible"
      title="审核通过"
      @ok="handleApproveSubmit"
    >
      <a-form-item label="负责人" name="handler_id">
        <a-select
          v-model:value="handler_id"
          placeholder="请选择负责人"
          :options="handlerOptions"
          :field-names="{ label: 'name', value: 'id' }"
        />
      </a-form-item>
    </a-modal>

    <!-- 审核拒绝对话框 -->
    <a-modal
      v-model:open="rejectModalVisible"
      title="审核拒绝"
      @ok="handleRejectSubmit"
    >
      <a-form-item label="拒绝原因">
        <a-textarea
          v-model:value="reject_reason"
          :rows="4"
          placeholder="请输入拒绝原因"
        />
      </a-form-item>
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
          {{ detailData.animal_type?.name || '-' }}
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
          {{ detailData.reservation_date || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="预约时段" :span="2">
          {{ detailData.time_slots?.join(', ') || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ detailData.handler?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="审核人">
          {{ detailData.audit_by?.username || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="审核时间">
          {{ detailData.audit_time || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="完成时间">
          {{ detailData.completed_time || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.reject_reason" label="拒绝原因" :span="2">
          {{ detailData.reject_reason }}
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
import dayjs from 'dayjs'
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
  getEnvironmentsByAnimalType,
  getCageAvailableTimeSlots
} from '@/api/cage'
import { getAnimalTypeOptions, getEnvironmentTypeOptions, getHandlerOptions } from '@/api/config'
import { getUserList } from '@/api/user'
import { getAdvanceDays } from '@/api/content'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  order_sn: '',
  user_name: '',
  user_phone: '',
  animal_type_id: undefined,
  environment_id: undefined,
  status: undefined
})

const dateRange = ref([])

const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    order_sn: '',
    user_name: '',
    user_phone: '',
    animal_type_id: undefined,
    environment_id: undefined,
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
  { title: '订单号', dataIndex: 'order_sn', width: 150 },
  { title: '用户信息', key: 'user_info', width: 120 },
  { title: '笼位信息', key: 'cage_info', width: 120 },
  { title: '用途', dataIndex: ['purpose', 'name'], width: 100 },
  { title: '预约时间', key: 'time_slots', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'created_at', width: 150 },
  { title: '更新时间', dataIndex: 'updated_at', width: 150 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
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
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
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
  user_id: undefined,
  animal_type_id: undefined,
  environment_id: undefined,
  quantity: 1,
  purpose_id: undefined,
  reservation_date: null,
  time_slots: [],
  remark: ''
})

const formRules = {
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  animal_type_id: [{ required: true, message: '请选择动物类型', trigger: 'change' }],
  environment_id: [{ required: true, message: '请选择环境类型', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { 
      validator: (rule, value) => {
        // 编辑模式下不校验数量（已锁定的订单由接口端校验）
        if (formData.id !== null) {
          return Promise.resolve()
        }
        const maxQty = getMaxQuantity()
        if (value > maxQty) {
          return Promise.reject(`数量不能超过 ${maxQty}`)
        }
        return Promise.resolve()
      }, 
      trigger: 'change' 
    }
  ],
  purpose_id: [{ required: true, message: '请选择用途', trigger: 'change' }],
  reservation_date: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  time_slots: [{ required: true, message: '请选择预约时段', trigger: 'change', type: 'array', min: 1 }]
}

// 选项数据
const animalTypeOptions = ref([])
const environmentTypeOptions = ref([]) // 所有环境类型（用于搜索）
const dynamicEnvironmentOptions = ref([]) // 动态环境类型（根据动物类型筛选）
const purposeOptions = ref([])
const timeSlotOptions = ref([])
const timeSlotQuantityMap = ref({}) // 时间段可用数量映射
const totalCageQuantity = ref(0) // 总笼位数量
const userOptions = ref([])

const handleAdd = () => {
  modalTitle.value = '新增订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    user_id: undefined,
    animal_type_id: undefined,
    environment_id: undefined,
    quantity: 1,
    purpose_id: undefined,
    reservation_date: null,
    time_slots: [],
    remark: ''
  })
  // 重置动态数据
  userOptions.value = []
  dynamicEnvironmentOptions.value = []
  timeSlotOptions.value = []
  timeSlotQuantityMap.value = {}
  totalCageQuantity.value = 0
}

const handleEdit = async (record) => {
  modalTitle.value = '编辑订单'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    user_id: record.user?.id,
    animal_type_id: record.animal_type?.id,
    environment_id: record.environment?.id,
    quantity: record.quantity,
    purpose_id: record.purpose?.id,
    reservation_date: record.reservation_date,
    time_slots: record.time_slots || [],
    remark: record.remark
  })
  // 设置用户选项（用于显示）
  if (record.user) {
    userOptions.value = [record.user]
  }
  
  // 加载动物类型对应的环境类型
  if (formData.animal_type_id) {
    await loadEnvironmentsByAnimalType()
  }
  
  // 加载可用时间段
  if (formData.environment_id && formData.reservation_date) {
    await loadAvailableTimeSlots()
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      user_id: formData.user_id,
      animal_type_id: formData.animal_type_id,
      environment_id: formData.environment_id,
      quantity: formData.quantity,
      purpose_id: formData.purpose_id,
      reservation_date: formData.reservation_date,
      time_slots: formData.time_slots,
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
  if (!value) {
    userOptions.value = []
    return
  }
  try {
    const res = await getUserList({ keyword: value, pageSize: 20 })
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
const handleAnimalTypeChange = async () => {
  // 重置环境类型和时间段
  formData.environment_id = undefined
  formData.time_slots = []
  dynamicEnvironmentOptions.value = []
  timeSlotOptions.value = []
  timeSlotQuantityMap.value = {}
  totalCageQuantity.value = 0
  
  // 加载对应的环境类型
  if (formData.animal_type_id) {
    await loadEnvironmentsByAnimalType()
  }
}

/**
 * 环境类型改变
 */
const handleEnvironmentChange = async () => {
  // 重置时间段
  formData.time_slots = []
  timeSlotOptions.value = []
  timeSlotQuantityMap.value = {}
  totalCageQuantity.value = 0
  
  // 如果环境和日期都已选择，加载可用时间段
  if (formData.environment_id && formData.reservation_date) {
    await loadAvailableTimeSlots()
  }
}

/**
 * 日期改变
 */
const handleDateChange = async () => {
  // 重置时间段
  formData.time_slots = []
  timeSlotOptions.value = []
  timeSlotQuantityMap.value = {}
  totalCageQuantity.value = 0
  
  // 如果环境和日期都已选择，加载可用时间段
  if (formData.environment_id && formData.reservation_date) {
    await loadAvailableTimeSlots()
  }
}

/**
 * 时间段改变
 */
const handleTimeSlotsChange = () => {
  // 编辑模式下不校验数量（已锁定的订单由接口端校验）
  if (formData.id !== null) {
    return
  }
  // 校验数量是否超过最小可用数量
  const minQty = getMinAvailableQuantity()
  if (minQty !== null && formData.quantity > minQty) {
    formData.quantity = minQty
    message.warning(`笼位数量已自动调整为最大可用数量：${minQty}`)
  }
}

/**
 * 数量改变
 */
const handleQuantityChange = (value) => {
  // 编辑模式下不校验数量（已锁定的订单由接口端校验）
  if (formData.id !== null) {
    return
  }
  const minQty = getMinAvailableQuantity()
  if (minQty !== null && value > minQty) {
    formData.quantity = minQty
    message.warning(`笼位数量不能超过所选时段的剩余数量：${minQty}`)
  }
}

/**
 * 获取所选时段的最小可用数量
 */
const getMinAvailableQuantity = () => {
  if (!formData.time_slots || formData.time_slots.length === 0) {
    return null
  }
  
  const quantities = formData.time_slots.map(slot => timeSlotQuantityMap.value[slot] || 0)
  return Math.min(...quantities)
}

/**
 * 获取最大可输入数量
 */
const getMaxQuantity = () => {
  const minQty = getMinAvailableQuantity()
  return minQty !== null ? minQty : 1000
}

/**
 * 禁用日期（根据系统配置的提前预约天数）
 */
 const disabledDate = (current) => {
  if (!current) return false
  
  const today = dayjs().startOf('day')
  const maxDate = today.add(advanceDays.value.cage_advance_days, 'day')
  
  // 不能选择今天之前的日期，也不能选择超过最大提前预约天数的日期
  return current < today || current > maxDate
}

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

const advanceDays = ref({
  cage_advance_days: 7  // 笼位默认提前7天
})
/**
 * 加载提前预约天数配置
 */
 const loadAdvanceDays = async () => {
  try {
    const res = await getAdvanceDays()
    if (res.data) {
      advanceDays.value = res.data
    }
  } catch (error) {
    console.error('获取提前预约天数配置失败：', error)
  }
}

// ========== 审核 ==========

const approveModalVisible = ref(false)
const handler_id = ref(undefined)
const handlerOptions = ref([])
const currentRecord = ref(null)

/**
 * 审核通过
 */
const handleApprove = (record) => {
  currentRecord.value = record
  handler_id.value = undefined
  approveModalVisible.value = true
  // 加载负责人选项
  loadHandlerOptions()
}

/**
 * 提交审核通过
 */
const handleApproveSubmit = async () => {
  if (!handler_id.value) {
    message.warning('请选择负责人')
    return
  }
  try {
    await auditCageReservation(currentRecord.value.id, {
      status: 1,
      handler_id: handler_id.value
    })
    message.success('审核通过')
    approveModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('审核失败：', error)
  }
}

const rejectModalVisible = ref(false)
const reject_reason = ref('')

/**
 * 审核拒绝
 */
const handleReject = (record) => {
  currentRecord.value = record
  reject_reason.value = ''
  rejectModalVisible.value = true
}

/**
 * 提交审核拒绝
 */
const handleRejectSubmit = async () => {
  if (!reject_reason.value) {
    message.warning('请输入拒绝原因')
    return
  }
  try {
    await auditCageReservation(currentRecord.value.id, {
      status: 2,
      reject_reason: reject_reason.value
    })
    message.success('已拒绝')
    rejectModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('拒绝失败：', error)
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
    const [animalTypes, environmentTypes, purposes, handlers] = await Promise.all([
      getAnimalTypeOptions(),
      getEnvironmentTypeOptions(),
      getCagePurposeOptions(),
      getHandlerOptions()
    ])
    
    animalTypeOptions.value = animalTypes.data
    environmentTypeOptions.value = environmentTypes.data // 用于搜索筛选
    purposeOptions.value = purposes.data
    handlerOptions.value = handlers.data
  } catch (error) {
    console.error('加载选项数据失败：', error)
  }
}

/**
 * 根据动物类型加载环境类型
 */
const loadEnvironmentsByAnimalType = async () => {
  if (!formData.animal_type_id) {
    dynamicEnvironmentOptions.value = []
    return
  }
  
  try {
    const res = await getEnvironmentsByAnimalType({
      animal_type_id: formData.animal_type_id
    })
    dynamicEnvironmentOptions.value = res.data || []
    
    if (dynamicEnvironmentOptions.value.length === 0) {
      message.warning('该动物类型暂无可用笼位')
    }
  } catch (error) {
    console.error('获取环境类型失败：', error)
    dynamicEnvironmentOptions.value = []
  }
}

/**
 * 加载可用时间段
 */
const loadAvailableTimeSlots = async () => {
  if (!formData.animal_type_id || !formData.environment_id || !formData.reservation_date) {
    timeSlotOptions.value = []
    return
  }
  
  try {
    const res = await getCageAvailableTimeSlots({
      animal_type_id: formData.animal_type_id,
      environment_id: formData.environment_id,
      date: formData.reservation_date
    })
    
    if (res.data) {
      totalCageQuantity.value = res.data.total_quantity || 0
      timeSlotOptions.value = res.data.time_slots || []
      
      // 构建时间段可用数量映射
      timeSlotQuantityMap.value = {}
      timeSlotOptions.value.forEach(slot => {
        timeSlotQuantityMap.value[slot.display_time] = slot.available_quantity
      })
      
      if (timeSlotOptions.value.length === 0) {
        message.warning('该日期暂无可用时段')
      }
    }
  } catch (error) {
    console.error('获取可用时间段失败：', error)
    timeSlotOptions.value = []
    timeSlotQuantityMap.value = {}
    totalCageQuantity.value = 0
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadOptions()
  loadAdvanceDays()
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
