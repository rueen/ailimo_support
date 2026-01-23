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
        <template v-if="column.key === 'date_range'">
          {{ formatDateRange(record.start_date, record.end_date) }}
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
        <a-form-item label="用途" name="purpose_id">
          <a-select
            v-model:value="formData.purpose_id"
            placeholder="请选择用途"
            :options="purposeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="预约开始日期" name="start_date">
          <a-date-picker
            v-model:value="formData.start_date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledStartDate"
            placeholder="请选择开始日期"
            style="width: 100%"
            @change="handleStartDateChange"
          />
        </a-form-item>
        <a-form-item label="预约结束日期" name="end_date">
          <div style="display: flex; align-items: center; gap: 12px;">
            <a-date-picker
              v-model:value="formData.end_date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledEndDate"
              :disabled="formData.is_long_term"
              placeholder="请选择结束日期"
              style="flex: 1;"
              @change="handleEndDateChange"
            />
            <a-form-item-rest>
              <a-checkbox
                v-model:checked="formData.is_long_term"
                @change="handleLongTermChange"
              >
                长期预约
              </a-checkbox>
            </a-form-item-rest>
          </div>
        </a-form-item>
        <a-form-item label="笼位数量" name="quantity">
          <a-input-number
            v-model:value="formData.quantity"
            :min="1"
            placeholder="请输入数量"
            style="width: 100%"
          />
          <div v-if="availableQuantityInfo.total !== null" style="margin-top: 4px">
            <a-spin v-if="availableQuantityLoading" size="small" />
            <span v-else style="color: #999">
              可用笼位：{{ availableQuantityInfo.available }} / {{ availableQuantityInfo.total }}
            </span>
          </div>
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
        <a-descriptions-item label="订单号">
          {{ detailData.order_sn }}
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="动物类型">
          {{ detailData.animal_type?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="环境">
          {{ detailData.environment?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="笼位数量">
          {{ detailData.quantity }}
        </a-descriptions-item>
        <a-descriptions-item label="用途">
          {{ detailData.purpose?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="预约日期" :span="2">
          {{ formatDateRange(detailData.start_date, detailData.end_date) }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">
          {{ detailData.remark || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="下单用户" :span="2">
          <div>{{ detailData.user?.name || '-' }}</div>
          <div>{{ detailData.user?.phone || '-' }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ detailData.handler?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.reject_reason" label="拒绝原因" :span="2">
          {{ detailData.reject_reason }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.audit_by" label="审核人">
          {{ detailData.audit_by?.username || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.audit_time" label="审核时间">
          {{ detailData.audit_time || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.completed_time" label="完成时间">
          {{ detailData.completed_time || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.cancel_time" label="取消时间">
          {{ detailData.cancel_time || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.created_at" label="创建时间">
          {{ detailData.created_at }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.updated_at" label="更新时间">
          {{ detailData.updated_at }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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
  getCageAvailableQuantity
} from '@/api/cage'
import { debounce } from 'lodash-es'
import { getAnimalTypeOptions, getEnvironmentTypeOptions, getHandlerOptions } from '@/api/config'
import { getUserList } from '@/api/user'
import { getAdvanceDays } from '@/api/content'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const route = useRoute()

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
  { title: '预约日期', key: 'date_range', width: 200 },
  { title: '状态', key: 'status', width: 100 },
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
  start_date: null,
  end_date: null,
  is_long_term: false,
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
        if (availableQuantityInfo.available !== null && value > availableQuantityInfo.available) {
          return Promise.reject(`可用笼位数量不足，当前可用：${availableQuantityInfo.available}`)
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  purpose_id: [{ required: true, message: '请选择用途', trigger: 'change' }],
  start_date: [{ required: true, message: '请选择预约开始日期', trigger: 'change' }],
  end_date: [
    {
      validator: (rule, value) => {
        if (formData.is_long_term) {
          return Promise.resolve()
        }
        if (!value) {
          return Promise.reject('请选择预约结束日期或勾选长期预约')
        }
        if (formData.start_date && value < formData.start_date) {
          return Promise.reject('结束日期不能早于开始日期')
        }
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ]
}

// 选项数据
const animalTypeOptions = ref([])
const environmentTypeOptions = ref([]) // 所有环境类型（用于搜索）
const dynamicEnvironmentOptions = ref([]) // 动态环境类型（根据动物类型筛选）
const purposeOptions = ref([])
const userOptions = ref([])

// 可用数量信息
const availableQuantityInfo = reactive({
  total: null,
  available: null
})
const availableQuantityLoading = ref(false)

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
    start_date: null,
    end_date: null,
    is_long_term: false,
    remark: ''
  })
  // 重置动态数据
  userOptions.value = []
  dynamicEnvironmentOptions.value = []
  availableQuantityInfo.total = null
  availableQuantityInfo.available = null
  availableQuantityLoading.value = false
}

const handleEdit = async (record) => {
  modalTitle.value = '编辑订单'
  modalVisible.value = true
  
  const isLongTerm = !record.end_date
  
  Object.assign(formData, {
    id: record.id,
    user_id: record.user?.id,
    animal_type_id: record.animal_type?.id,
    environment_id: record.environment?.id,
    quantity: record.quantity,
    purpose_id: record.purpose?.id,
    start_date: record.start_date,
    end_date: record.end_date,
    is_long_term: isLongTerm,
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
  
  // 查询可用数量
  if (formData.animal_type_id && formData.environment_id && formData.start_date) {
    await fetchAvailableQuantity()
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
      start_date: formData.start_date,
      end_date: formData.is_long_term ? null : formData.end_date,
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
  // 重置环境类型和可用数量
  formData.environment_id = undefined
  dynamicEnvironmentOptions.value = []
  availableQuantityInfo.total = null
  availableQuantityInfo.available = null
  
  // 加载对应的环境类型
  if (formData.animal_type_id) {
    await loadEnvironmentsByAnimalType()
  }
}

/**
 * 环境类型改变
 */
const handleEnvironmentChange = async () => {
  // 重置可用数量
  availableQuantityInfo.total = null
  availableQuantityInfo.available = null
  
  // 触发可用数量查询
  debouncedFetchAvailableQuantity()
}

/**
 * 开始日期改变
 */
const handleStartDateChange = () => {
  // 如果结束日期早于开始日期，清空结束日期
  if (formData.end_date && formData.end_date < formData.start_date) {
    formData.end_date = null
  }
  
  // 触发可用数量查询
  debouncedFetchAvailableQuantity()
}

/**
 * 结束日期改变
 */
const handleEndDateChange = () => {
  // 触发可用数量查询
  debouncedFetchAvailableQuantity()
}

/**
 * 长期预约改变
 */
const handleLongTermChange = (e) => {
  if (e.target.checked) {
    // 勾选长期预约，清空结束日期
    formData.end_date = null
  }
  
  // 触发可用数量查询
  debouncedFetchAvailableQuantity()
}

/**
 * 禁用开始日期（根据系统配置的提前预约天数）
 */
const disabledStartDate = (current) => {
  if (!current) return false
  
  const today = dayjs().startOf('day')
  const maxDate = today.add(advanceDays.value.cage_advance_days, 'day')
  
  // 不能选择今天之前的日期，也不能选择超过最大提前预约天数的日期
  return current < today || current > maxDate
}

/**
 * 禁用结束日期
 */
const disabledEndDate = (current) => {
  if (!current) return false
  
  const today = dayjs().startOf('day')
  const maxDate = today.add(advanceDays.value.cage_advance_days, 'day')
  
  // 不能选择今天之前的日期，不能选择早于开始日期的日期，也不能选择超过最大提前预约天数的日期
  const minDate = formData.start_date ? dayjs(formData.start_date).startOf('day') : today
  return current < minDate || current > maxDate
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
 * 查询可用数量
 */
const fetchAvailableQuantity = async () => {
  // 检查必要条件
  if (!formData.animal_type_id || !formData.environment_id || !formData.start_date) {
    availableQuantityInfo.total = null
    availableQuantityInfo.available = null
    return
  }
  
  // 如果未勾选长期预约且没有结束日期，不查询
  if (!formData.is_long_term && !formData.end_date) {
    availableQuantityInfo.total = null
    availableQuantityInfo.available = null
    return
  }
  
  try {
    availableQuantityLoading.value = true
    
    const params = {
      animal_type_id: formData.animal_type_id,
      environment_id: formData.environment_id,
      start_date: formData.start_date
    }
    
    // 如果不是长期预约，传递结束日期
    if (!formData.is_long_term && formData.end_date) {
      params.end_date = formData.end_date
    }
    
    // 编辑模式下，排除当前订单（避免自己占用的数量被计算为不可用）
    if (formData.id) {
      params.exclude_reservation_id = formData.id
    }
    
    const res = await getCageAvailableQuantity(params)
    
    if (res.data) {
      availableQuantityInfo.total = res.data.total_quantity
      availableQuantityInfo.available = res.data.available_quantity
    }
  } catch (error) {
    console.error('获取可用数量失败：', error)
    availableQuantityInfo.total = null
    availableQuantityInfo.available = null
  } finally {
    availableQuantityLoading.value = false
  }
}

/**
 * 防抖查询可用数量
 */
const debouncedFetchAvailableQuantity = debounce(fetchAvailableQuantity, 300)

/**
 * 格式化日期范围显示
 */
const formatDateRange = (startDate, endDate) => {
  if (!startDate) {
    return '-'
  }
  
  if (!endDate) {
    return `${startDate} 至 长期`
  }
  
  if (startDate === endDate) {
    return `${startDate} 至 ${endDate} (1天)`
  }
  
  // 计算天数
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const days = end.diff(start, 'day') + 1
  
  return `${startDate} 至 ${endDate} (${days}天)`
}

// ========== 初始化 ==========

onMounted(() => {
  // 检查路由参数，如果有 status 参数则自动筛选
  if (route.query.status !== undefined) {
    searchForm.status = Number(route.query.status)
  }
  
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
