<template>
  <div class="experiment-operation-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
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
        <a-form-item label="操作内容">
          <a-select
            v-model:value="searchForm.operation_content_id"
            placeholder="请选择"
            allow-clear
            style="width: 150px"
            :options="operationContentOptions"
            :field-names="{ label: 'name', value: 'id' }"
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
        v-if="userStore.hasPermission('experiment_operation:create')"
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
        <template v-if="column.key === 'animal_info'">
          <div>动物类型：{{ record.animal_type?.name }}</div>
          <div>动物数量：{{ record.quantity }}</div>
          <div>操作内容：{{ record.operation_content?.name }}</div>
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
              v-if="userStore.hasPermission('experiment_operation:detail')"
              type="link"
              size="small"
              @click="handleView(record)"
            >
              详情
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('experiment_operation:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('experiment_operation:audit')"
              type="link"
              size="small"
              @click="handleApprove(record)"
            >
              审核通过
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('experiment_operation:audit')"
              type="link"
              danger
              size="small"
              @click="handleReject(record)"
            >
              审核拒绝
            </a-button>
            <a-button
              v-if="record.status === 1 && userStore.hasPermission('experiment_operation:complete')"
              type="link"
              size="small"
              @click="handleComplete(record)"
            >
              完成
            </a-button>
            <a-popconfirm
              v-if="record.status === 1 && userStore.hasPermission('experiment_operation:cancel')"
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
        <a-form-item label="操作内容" name="operation_content_id">
          <a-select
            v-model:value="formData.operation_content_id"
            placeholder="请选择操作内容"
            :options="operationContentOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="动物类型" name="animal_type_id">
          <a-select
            v-model:value="formData.animal_type_id"
            placeholder="请选择动物类型"
            :options="animalTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="动物数量" name="quantity">
          <a-input-number
            v-model:value="formData.quantity"
            :min="1"
            :max="10000"
            placeholder="请输入动物数量"
            style="width: 100%"
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
          />
        </a-form-item>
        <a-form-item label="预约时段" name="time_slots">
          <a-select
            v-model:value="formData.time_slots"
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
        <a-descriptions-item label="操作内容">
          {{ detailData.operation_content?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="动物类型">
          {{ detailData.animal_type?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="动物数量">
          {{ detailData.quantity }}
        </a-descriptions-item>
        <a-descriptions-item label="预约日期">
          {{ detailData.reservation_date || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="预约时段" :span="2">
          {{ detailData.time_slots?.join(', ') || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="负责人">
          {{ detailData.handler?.username || '-' }}
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
  getExperimentOperationList,
  getExperimentOperationDetail,
  createExperimentOperation,
  updateExperimentOperation,
  auditExperimentOperation,
  completeExperimentOperation,
  cancelExperimentOperation,
  getOperationContentOptions,
  getExperimentTimeSlotOptions
} from '@/api/experiment'
import { getAnimalTypeOptions, getHandlerOptions } from '@/api/config'
import { getUserList } from '@/api/user'
import { getAdvanceDays } from '@/api/content'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  user_name: '',
  user_phone: '',
  operation_content_id: undefined,
  animal_type_id: undefined,
  status: undefined
})

const dateRange = ref([])
const advanceDays = ref({
  experiment_advance_days: 7  // 实验操作默认提前7天
})

const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    userName: '',
    user_phone: '',
    operation_content_id: undefined,
    animal_type_id: undefined,
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
  {
    title: '用户信息',
    key: 'user_info',
    width: 120,
  },
  {
    title: '动物信息',
    key: 'animal_info',
    width: 120,
  },
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
    
    const res = await getExperimentOperationList(params)
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
  operation_content_id: undefined,
  animal_type_id: undefined,
  quantity: 1,
  reservation_date: null,
  time_slots: [],
  remark: ''
})

const formRules = {
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  operation_content_id: [{ required: true, message: '请选择操作内容', trigger: 'change' }],
  animal_type_id: [{ required: true, message: '请选择动物类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入动物数量', trigger: 'blur' }],
  reservation_date: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  time_slots: [{ required: true, message: '请选择预约时段', trigger: 'change', type: 'array', min: 1 }]
}

// 选项数据
const animalTypeOptions = ref([])
const operationContentOptions = ref([])
const timeSlotOptions = ref([])
const userOptions = ref([])

const handleAdd = () => {
  modalTitle.value = '新增订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    user_id: undefined,
    operation_content_id: undefined,
    animal_type_id: undefined,
    quantity: 1,
    reservation_date: null,
    time_slots: [],
    remark: ''
  })
}

const handleEdit = (record) => {
  modalTitle.value = '编辑订单'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    user_id: record.user?.id,
    operation_content_id: record.operation_content?.id,
    animal_type_id: record.animal_type?.id,
    quantity: record.quantity,
    reservation_date: record.reservation_date,
    time_slots: record.time_slots || [],
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
      user_id: formData.user_id,
      operation_content_id: formData.operation_content_id,
      animal_type_id: formData.animal_type_id,
      quantity: formData.quantity,
      reservation_date: formData.reservation_date,
      time_slots: formData.time_slots,
      remark: formData.remark
    }
    
    if (formData.id) {
      await updateExperimentOperation(formData.id, data)
      message.success('更新成功')
    } else {
      await createExperimentOperation(data)
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
 * 禁用日期（根据系统配置的提前预约天数）
 */
const disabledDate = (current) => {
  if (!current) return false
  
  const today = dayjs().startOf('day')
  const maxDate = today.add(advanceDays.value.experiment_advance_days, 'day')
  
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
    await auditExperimentOperation(currentRecord.value.id, {
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
    await auditExperimentOperation(currentRecord.value.id, {
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
    await completeExperimentOperation(record.id)
    message.success('订单已完成')
    fetchTableData()
  } catch (error) {
    console.error('完成订单失败：', error)
  }
}

const handleCancel = async (record) => {
  try {
    await cancelExperimentOperation(record.id)
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
    const res = await getExperimentOperationDetail(record.id)
    detailData.value = res.data
    detailModalVisible.value = true
  } catch (error) {
    console.error('获取详情失败：', error)
  }
}

// ========== 加载选项数据 ==========

const loadOptions = async () => {
  try {
    const [animalTypes, operationContents, timeSlots, handlers] = await Promise.all([
      getAnimalTypeOptions(),
      getOperationContentOptions(),
      getExperimentTimeSlotOptions(),
      getHandlerOptions()
    ])
    
    animalTypeOptions.value = animalTypes.data
    operationContentOptions.value = operationContents.data
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
  loadAdvanceDays()
})
</script>

<style lang="less" scoped>
.experiment-operation-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
