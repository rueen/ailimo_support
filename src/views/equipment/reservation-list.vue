<template>
  <div class="reservation-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="设备名称">
          <a-input
            v-model:value="searchForm.equipmentName"
            placeholder="请输入设备名称"
            allow-clear
            style="width: 180px"
          />
        </a-form-item>
        <a-form-item label="用户姓名">
          <a-input
            v-model:value="searchForm.userName"
            placeholder="请输入用户姓名"
            allow-clear
            style="width: 180px"
          />
        </a-form-item>
        <a-form-item label="预约日期">
          <a-date-picker
            v-model:value="searchForm.reservationDate"
            placeholder="请选择预约日期"
            style="width: 180px"
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
        <template v-if="column.key === 'timeSlots'">
          <a-tag
            v-for="(slot, index) in record.timeSlots"
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
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('equipment_reservation:detail')"
              type="link"
              size="small"
              @click="handleView(record)"
            >
              查看
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
            <a-button
              v-if="record.status === 1 && userStore.hasPermission('equipment_reservation:complete')"
              type="link"
              size="small"
              @click="handleComplete(record)"
            >
              完成
            </a-button>
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

    <!-- 新增订单对话框 -->
    <a-modal
      v-model:open="modalVisible"
      title="新增设备租赁订单"
      :width="700"
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
        <a-form-item label="设备" name="equipmentId">
          <a-select
            v-model:value="formData.equipmentId"
            placeholder="请选择设备"
            :options="equipmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleEquipmentChange"
          />
        </a-form-item>
        <a-form-item label="用户" name="userId">
          <a-select
            v-model:value="formData.userId"
            placeholder="请输入用户手机号搜索"
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
        <a-form-item label="预约日期" name="reservationDate">
          <a-date-picker
            v-model:value="formData.reservationDate"
            :disabled-date="disabledDate"
            style="width: 100%"
            @change="handleDateChange"
          />
        </a-form-item>
        <a-form-item label="预约时间段" name="timeSlots">
          <a-checkbox-group v-model:value="formData.timeSlots">
            <a-checkbox
              v-for="slot in availableTimeSlots"
              :key="slot"
              :value="slot"
              :disabled="bookedTimeSlots.includes(slot)"
            >
              {{ slot }}
              <span v-if="bookedTimeSlots.includes(slot)" style="color: #999">
                (已预约)
              </span>
            </a-checkbox>
          </a-checkbox-group>
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
      <a-form-item label="负责人" name="handlerId">
        <a-select
          v-model:value="handlerId"
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
import dayjs from 'dayjs'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import {
  getEquipmentReservationList,
  createEquipmentReservation,
  auditEquipmentReservation,
  completeEquipmentReservation,
  cancelEquipmentReservation,
  getEquipmentOptions,
  getEquipmentAvailableSlots
} from '@/api/equipment'
import { getUserList } from '@/api/user'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  equipmentName: '',
  userName: '',
  reservationDate: null,
  status: undefined
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
    equipmentName: '',
    userName: '',
    reservationDate: null,
    status: undefined
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
    title: '设备名称',
    dataIndex: ['equipment', 'name'],
    width: 150,
    customRender: ({ record }) => record.equipment?.name || '-'
  },
  {
    title: '用户',
    width: 120,
    customRender: ({ record }) => record.user?.name || '-'
  },
  {
    title: '手机号',
    dataIndex: ['user', 'phone'],
    width: 120
  },
  { title: '预约日期', dataIndex: 'reservationDate', width: 120 },
  { title: '预约时间段', key: 'timeSlots', width: 200 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'created_at', width: 160 },
  { title: '操作', key: 'action', fixed: 'right', width: 250 }
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
      ...searchForm,
      reservationDate: searchForm.reservationDate
        ? dayjs(searchForm.reservationDate).format('YYYY-MM-DD')
        : undefined
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

// ========== 新增订单 ==========

const modalVisible = ref(false)
const formRef = ref()
const formData = reactive({
  equipmentId: undefined,
  userId: undefined,
  reservationDate: null,
  timeSlots: [],
  remark: ''
})

const formRules = {
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  reservationDate: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  timeSlots: [{ required: true, message: '请选择预约时间段', trigger: 'change' }]
}

const equipmentOptions = ref([])
const userOptions = ref([])
const availableTimeSlots = ref([])
const bookedTimeSlots = ref([])

/**
 * 新增
 */
const handleAdd = () => {
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    equipmentId: undefined,
    userId: undefined,
    reservationDate: null,
    timeSlots: [],
    remark: ''
  })
  availableTimeSlots.value = []
  bookedTimeSlots.value = []
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      ...formData,
      reservationDate: dayjs(formData.reservationDate).format('YYYY-MM-DD')
    }
    
    await createEquipmentReservation(data)
    message.success('创建成功')
    
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('提交失败：', error)
  }
}

/**
 * 禁用日期（不能选择过去的日期）
 */
const disabledDate = (current) => {
  return current && current < dayjs().startOf('day')
}

/**
 * 设备变化
 */
const handleEquipmentChange = () => {
  formData.timeSlots = []
  if (formData.equipmentId && formData.reservationDate) {
    loadAvailableSlots()
  }
}

/**
 * 日期变化
 */
const handleDateChange = () => {
  formData.timeSlots = []
  if (formData.equipmentId && formData.reservationDate) {
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
    const res = await getUserList({ phone: value, pageSize: 20 })
    userOptions.value = res.data.list
  } catch (error) {
    console.error('搜索用户失败：', error)
  }
}

/**
 * 加载设备选项
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
 * 加载可用时间段
 */
const loadAvailableSlots = async () => {
  try {
    const res = await getEquipmentAvailableSlots(formData.equipmentId, {
      date: dayjs(formData.reservationDate).format('YYYY-MM-DD')
    })
    availableTimeSlots.value = res.data.allSlots
    bookedTimeSlots.value = res.data.bookedSlots
  } catch (error) {
    console.error('获取可用时间段失败：', error)
  }
}

// ========== 审核 ==========

const approveModalVisible = ref(false)
const handlerId = ref(undefined)
const handlerOptions = ref([])
const currentRecord = ref(null)

/**
 * 审核通过
 */
const handleApprove = (record) => {
  currentRecord.value = record
  handlerId.value = undefined
  approveModalVisible.value = true
}

/**
 * 提交审核通过
 */
const handleApproveSubmit = async () => {
  if (!handlerId.value) {
    message.warning('请选择负责人')
    return
  }
  try {
    await auditEquipmentReservation(currentRecord.value.id, {
      status: 1,
      handlerId: handlerId.value
    })
    message.success('审核通过')
    approveModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('审核失败：', error)
  }
}

const rejectModalVisible = ref(false)
const rejectReason = ref('')

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
    await auditEquipmentReservation(currentRecord.value.id, {
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

/**
 * 查看详情
 */
const handleView = (record) => {
  // TODO: 实现查看详情
  message.info('查看详情功能待实现')
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadEquipmentOptions()
  // TODO: 加载负责人选项
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
