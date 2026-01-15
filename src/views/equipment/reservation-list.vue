<template>
  <div class="reservation-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="设备">
          <a-select
            v-model:value="searchForm.equipment_id"
            placeholder="请选择设备"
            :options="equipmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
            allow-clear
            show-search
            :filter-option="filterEquipmentOption"
            @change="handleEquipmentChange"
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
            placeholder="请输入用户手机号"
            allow-clear
            style="width: 150px"
          />
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
        <a-form-item label="订单状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择订单状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已拒绝</a-select-option>
            <a-select-option :value="3">已完成</a-select-option>
            <a-select-option :value="4">已取消</a-select-option>
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
        v-if="userStore.hasPermission('equipment_reservation:create')"
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
        <template v-else-if="column.key === 'status'">
          <a-tag v-if="record.status === 0" color="orange">待审核</a-tag>
          <a-tag v-else-if="record.status === 1" color="blue">进行中</a-tag>
          <a-tag v-else-if="record.status === 2" color="red">已拒绝</a-tag>
          <a-tag v-else-if="record.status === 3" color="green">已完成</a-tag>
          <a-tag v-else-if="record.status === 4" color="default">已取消</a-tag>
          <div v-if="record.reject_reason">拒绝原因：{{ record.reject_reason }}</div>
          <div v-if="record.audit_time">审核时间：{{ record.audit_time }}</div>
          <div v-if="record.audit_by">审核人：{{ record.audit_by?.username }}</div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="(record.status === 0 || record.status === 1) && userStore.hasPermission('equipment_reservation:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('equipment_reservation:audit')"
              type="link"
              size="small"
              @click="handleApprove(record)"
            >
              审核通过
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('equipment_reservation:audit')"
              type="link"
              danger
              size="small"
              @click="handleReject(record)"
            >
              审核拒绝
            </a-button>
            <a-popconfirm
              v-if="record.status === 1 && userStore.hasPermission('equipment_reservation:complete')"
              title="确定完成该订单吗？"
              @confirm="handleComplete(record)"
            >
              <a-button type="link" size="small">
                完成
              </a-button>
            </a-popconfirm>
            <a-popconfirm
              v-if="record.status === 1 && userStore.hasPermission('equipment_reservation:cancel')"
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
      :width="700"
      @ok="handleSubmit"
      @cancel="handleCancelModal"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="设备" name="equipment_id">
          <a-select
            v-model:value="formData.equipment_id"
            placeholder="请选择设备"
            :options="equipmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
            allow-clear
            show-search
            :filter-option="filterEquipmentOption"
            @change="handleEquipmentChange"
          />
        </a-form-item>
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
        <a-form-item label="预约日期" name="reservation_date">
          <a-date-picker
            v-model:value="formData.reservation_date"
            :disabled-date="disabledDate"
            style="width: 100%"
            @change="handleDateChange"
          />
        </a-form-item>
        <a-form-item label="预约时段" name="time_slots">
          <a-select
            v-model:value="formData.time_slots"
            mode="multiple"
            placeholder="请先选择设备和日期"
            :options="timeSlotOptions"
            :disabled="!formData.equipment_id || !formData.reservation_date"
            :not-found-content="formData.equipment_id && formData.reservation_date ? '暂无可用时段' : '请先选择设备和日期'"
          >
            <template #notFoundContent>
              <a-empty :description="formData.equipment_id && formData.reservation_date ? '暂无可用时段' : '请先选择设备和日期'" />
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" :rows="3" />
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import {
  getEquipmentReservationList,
  createEquipmentReservation,
  updateEquipmentReservation,
  auditEquipmentReservation,
  completeEquipmentReservation,
  cancelEquipmentReservation,
  getEquipmentOptions,
  getEquipmentAvailableSlots
} from '@/api/equipment'
import { getUserList } from '@/api/user'
import { getHandlerOptions } from '@/api/config'
import { getAdvanceDays } from '@/api/content'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  equipment_id: undefined,
  user_name: '',
  user_phone: '',
  status: undefined
})

const dateRange = ref([])

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
    equipment_id: undefined,
    user_name: '',
    user_phone: '',
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

/**
 * 表格列配置
 */
const columns = [
  {
    title: '设备名称',
    dataIndex: ['equipment', 'name'],
    width: 120,
    customRender: ({ record }) => record.equipment?.name || '-'
  },
  {
    title: '用户信息',
    key: 'user_info',
    width: 120,
  },
  { title: '预约时间', key: 'time_slots', width: 100 },
  { title: '备注', dataIndex: 'remark', width: 150 },
  { title: '状态', key: 'status', width: 200 },
  { 
    title: '负责人', key: 'handler', width: 80,
    customRender: ({ record }) => record.handler?.name || '-'
  },
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
      equipment_id: searchForm.equipment_id,
      user_name: searchForm.user_name,
      user_phone: searchForm.user_phone,
      status: searchForm.status
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const res = await getEquipmentReservationList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取订单列表失败：', error)
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

// ========== 新增/编辑订单 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增设备租赁订单')
const formRef = ref()
const formData = reactive({
  id: null,
  equipment_id: undefined,
  user_id: undefined,
  time_slots: [],
  remark: ''
})

const formRules = {
  equipment_id: [{ required: true, message: '请选择设备', trigger: 'change' }],
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  reservation_date: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  time_slots: [{ required: true, message: '请选择预约时间段', trigger: 'change' }]
}

const equipmentOptions = ref([])
const userOptions = ref([])
const availableTimeSlots = ref([])
const bookedTimeSlots = ref([])
const advanceDays = ref({
  equipment_advance_days: 7  // 设备租赁默认提前7天
})

/**
 * 时段选项（计算属性）
 * 标记已被预订的时段为禁用状态
 * 编辑时，当前订单已选择的时段不会被禁用
 */
const timeSlotOptions = computed(() => {
  // 安全检查：确保 availableTimeSlots 是数组
  if (!Array.isArray(availableTimeSlots.value)) {
    return []
  }
  
  // 编辑时，当前订单已选择的时段列表
  const currentSelectedSlots = formData.id ? (formData.time_slots || []) : []
  
  return availableTimeSlots.value.map(slot => {
    // 如果是编辑模式且该时段已被当前订单选择，则不禁用
    const isCurrentSelected = formData.id && currentSelectedSlots.includes(slot.display_time)
    // 检查是否被其他订单预订
    const isBooked = !isCurrentSelected && (bookedTimeSlots.value?.some(booked => booked === slot.display_time) || false)
    
    return {
      label: isBooked ? `${slot.display_time} (已预订)` : slot.display_time,
      value: slot.display_time,
      disabled: isBooked
    }
  })
})

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增设备租赁订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    equipment_id: undefined,
    user_id: undefined,
    reservation_date: null,
    time_slots: [],
    remark: ''
  })
  availableTimeSlots.value = []
  bookedTimeSlots.value = []
  userOptions.value = []
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑设备租赁订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  
  // 填充表单数据
  Object.assign(formData, {
    id: record.id,
    equipment_id: record.equipment?.id,
    user_id: record.user?.id,
    reservation_date: record.reservation_date ? dayjs(record.reservation_date) : null,
    time_slots: record.time_slots || [],
    remark: record.remark || ''
  })
  
  // 设置用户选项（用于显示）
  if (record.user) {
    userOptions.value = [record.user]
  }
  
  // 如果有设备和日期，加载可用时段
  if (formData.equipment_id && formData.reservation_date) {
    loadAvailableSlots()
  } else {
    availableTimeSlots.value = []
    bookedTimeSlots.value = []
  }
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      equipment_id: formData.equipment_id,
      user_id: formData.user_id,
      reservation_date: dayjs(formData.reservation_date).format('YYYY-MM-DD'),
      time_slots: formData.time_slots,
      remark: formData.remark
    }
    
    if (formData.id) {
      // 编辑
      await updateEquipmentReservation(formData.id, data)
      message.success('更新成功')
    } else {
      // 新增
      await createEquipmentReservation(data)
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
const handleCancelModal = () => {
  formRef.value?.resetFields()
}

/**
 * 禁用日期（根据系统配置的提前预约天数）
 */
const disabledDate = (current) => {
  if (!current) return false
  
  const today = dayjs().startOf('day')
  const maxDate = today.add(advanceDays.value.equipment_advance_days, 'day')
  
  // 不能选择今天之前的日期，也不能选择超过最大提前预约天数的日期
  return current < today || current > maxDate
}

/**
 * 设备变化
 */
const handleEquipmentChange = () => {
  formData.time_slots = []
  if (formData.equipment_id && formData.reservation_date) {
    loadAvailableSlots()
  }
}

/**
 * 日期变化
 */
const handleDateChange = () => {
  formData.time_slots = []
  if (formData.equipment_id && formData.reservation_date) {
    loadAvailableSlots()
  }
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
 * 加载设备选项（用于表单）
 */
const loadEquipmentOptions = async () => {
  try {
    const res = await getEquipmentOptions()
    equipmentOptions.value = res.data
  } catch (error) {
    console.error('获取设备选项失败：', error)
  }
}

/**
 * 设备筛选（支持搜索）
 */
const filterEquipmentOption = (input, option) => {
  const name = option.name || ''
  return name.toLowerCase().includes(input.toLowerCase())
}

/**
 * 加载可用时间段
 */
const loadAvailableSlots = async () => {
  try {
    const params = {
      date: dayjs(formData.reservation_date).format('YYYY-MM-DD')
    }
    
    // 编辑时，排除当前订单的时段（避免自己的时段被标记为已预订）
    if (formData.id) {
      params.exclude_reservation_id = formData.id
    }
    
    const res = await getEquipmentAvailableSlots(formData.equipment_id, params)
    console.log('时段数据响应：', res.data)
    
    // 根据实际API返回的数据结构调整
    availableTimeSlots.value = res.data.allSlots || res.data.available_slots || res.data || []
    bookedTimeSlots.value = res.data.bookedSlots || res.data.booked_slots || []
    
    console.log('可用时段：', availableTimeSlots.value)
    console.log('已预订时段：', bookedTimeSlots.value)
  } catch (error) {
    console.error('获取可用时间段失败：', error)
    availableTimeSlots.value = []
    bookedTimeSlots.value = []
  }
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
    await auditEquipmentReservation(currentRecord.value.id, {
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
    await auditEquipmentReservation(currentRecord.value.id, {
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

/**
 * 完成订单
 */
const handleComplete = async (record) => {
  try {
    await completeEquipmentReservation(record.id)
    message.success('订单已完成')
    fetchTableData()
  } catch (error) {
    console.error('完成失败：', error)
  }
}

/**
 * 取消订单
 */
const handleCancel = async (record) => {
  try {
    await cancelEquipmentReservation(record.id)
    message.success('订单已取消')
    fetchTableData()
  } catch (error) {
    console.error('取消失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadEquipmentOptions()
  loadAdvanceDays()
})
</script>

<style lang="less" scoped>
.reservation-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
