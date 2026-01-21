<template>
  <div class="reservation-list-container">
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
          <div v-for="(slots, date) in groupTimeSlotsByDate(record.time_slots)" :key="date">
            <div style="font-weight: 500; margin-bottom: 4px">{{ date }}</div>
            <a-tag
              v-for="(slot, index) in slots"
              :key="index"
              color="blue"
              style="margin-right: 4px; margin-bottom: 4px"
            >
              {{ slot }}
            </a-tag>
          </div>
          <span v-if="!record.time_slots || record.time_slots.length === 0">-</span>
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
              v-if="userStore.hasPermission('equipment_reservation:detail')"
              type="link"
              size="small"
              @click="handleView(record)"
            >
              详情
            </a-button>
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
      :width="800"
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
        
        <!-- 多日期预约表单 -->
        <a-form-item label="预约时段" name="selectedDates" required>
          <div class="date-slots-container">
            <div
              v-for="(dateItem, index) in formData.selectedDates"
              :key="index"
              class="date-slot-item"
            >
              <a-card size="small" :title="`日期 ${index + 1}`" class="date-card">
                <template #extra>
                  <a-button
                    type="link"
                    danger
                    size="small"
                    @click="handleRemoveDate(index)"
                  >
                    删除
                  </a-button>
                </template>
                
                <a-form-item label="日期" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                  <a-date-picker
                    v-model:value="dateItem.date"
                    :disabled-date="disabledDate"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择日期"
                    style="width: 100%"
                    @change="() => handleDateChangeNew(index)"
                  />
                </a-form-item>
                
                <a-form-item label="时间段" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                  <a-select
                    v-model:value="dateItem.slots"
                    mode="multiple"
                    placeholder="请先选择设备和日期"
                    :options="dateItem.availableSlots"
                    :disabled="!formData.equipment_id || !dateItem.date"
                    :not-found-content="formData.equipment_id && dateItem.date ? '暂无可用时段' : '请先选择设备和日期'"
                  >
                    <template #notFoundContent>
                      <a-empty :description="formData.equipment_id && dateItem.date ? '暂无可用时段' : '请先选择设备和日期'" />
                    </template>
                  </a-select>
                </a-form-item>
              </a-card>
            </div>
            
            <a-button
              type="dashed"
              block
              @click="handleAddDate"
              style="margin-top: 8px"
            >
              <PlusOutlined />
              添加日期
            </a-button>
          </div>
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

    <!-- 订单详情对话框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="订单详情"
      :width="700"
      :footer="null"
    >
      <a-spin :spinning="detailLoading">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="订单号">{{ orderDetail.order_sn || '-' }}</a-descriptions-item>
          <a-descriptions-item label="订单状态">
            <a-tag v-if="orderDetail.status === 0" color="orange">待审核</a-tag>
            <a-tag v-else-if="orderDetail.status === 1" color="blue">进行中</a-tag>
            <a-tag v-else-if="orderDetail.status === 2" color="red">已拒绝</a-tag>
            <a-tag v-else-if="orderDetail.status === 3" color="green">已完成</a-tag>
            <a-tag v-else-if="orderDetail.status === 4" color="default">已取消</a-tag>
            <span v-else>-</span>
          </a-descriptions-item>
          <a-descriptions-item label="设备名称" :span="2">
            {{ orderDetail.equipment?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="预约时段" :span="2">
            <div v-if="orderDetail.time_slots && orderDetail.time_slots.length > 0">
              <div
                v-for="(slots, date) in groupTimeSlotsByDate(orderDetail.time_slots)"
                :key="date"
                style="margin-bottom: 8px"
              >
                <div style="font-weight: 500; margin-bottom: 4px">{{ date }}:</div>
                <a-tag
                  v-for="(slot, index) in slots"
                  :key="index"
                  color="blue"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ slot }}
                </a-tag>
              </div>
            </div>
            <span v-else>-</span>
          </a-descriptions-item>
          <a-descriptions-item label="用户姓名">
            {{ orderDetail.user?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="用户手机号">
            {{ orderDetail.user?.phone || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="所属机构">
            {{ orderDetail.user?.organization?.name || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ orderDetail.handler?.name || orderDetail.handler?.username || '-' }}
          </a-descriptions-item>
          <a-descriptions-item
            v-if="orderDetail.reject_reason"
            label="拒绝原因"
            :span="2"
          >
            {{ orderDetail.reject_reason || '-' }}
          </a-descriptions-item>
          <a-descriptions-item
            v-if="orderDetail.audit_time"
            label="审核时间"
          >
            {{ orderDetail.audit_time || '-' }}
          </a-descriptions-item>
          <a-descriptions-item
            v-if="orderDetail.audit_by"
            label="审核人"
          >
            {{ orderDetail.audit_by?.username || '-' }}
          </a-descriptions-item>
          <a-descriptions-item
            v-if="orderDetail.completed_time"
            label="完成时间"
          >
            {{ orderDetail.completed_time || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">
            {{ orderDetail.remark || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ orderDetail.created_at || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ orderDetail.updated_at || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import {
  getEquipmentReservationList,
  getEquipmentReservationDetail,
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
import {
  groupTimeSlotsByDate,
  flattenTimeSlots,
  extractDatesFromSlots
} from '@/utils/timeSlot'

const userStore = useUserStore()
const route = useRoute()

// ========== 搜索表单 ==========

const searchForm = reactive({
  order_sn: '',
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
    order_sn: '',
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
  { title: '订单号', dataIndex: 'order_sn', width: 150 },
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
      order_sn: searchForm.order_sn,
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
const modalTitle = ref('新增设备预约订单')
const formRef = ref()
const formData = reactive({
  id: null,
  equipment_id: undefined,
  user_id: undefined,
  selectedDates: [
    {
      date: null,
      slots: [],
      availableSlots: []
    }
  ],
  remark: ''
})

const formRules = {
  equipment_id: [{ required: true, message: '请选择设备', trigger: 'change' }],
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  selectedDates: [
    {
      required: true,
      validator: (rule, value) => {
        if (!value || value.length === 0) {
          return Promise.reject('请至少添加一个预约日期')
        }
        
        for (let i = 0; i < value.length; i++) {
          const item = value[i]
          if (!item.date) {
            return Promise.reject(`请选择日期 ${i + 1}`)
          }
          if (!item.slots || item.slots.length === 0) {
            return Promise.reject(`请选择日期 ${i + 1} 的时间段`)
          }
        }
        
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ]
}

const equipmentOptions = ref([])
const userOptions = ref([])
const advanceDays = ref({
  equipment_advance_days: 7  // 设备预约默认提前7天
})

/**
 * 添加日期
 */
const handleAddDate = () => {
  formData.selectedDates.push({
    date: null,
    slots: [],
    availableSlots: []
  })
}

/**
 * 删除日期
 */
const handleRemoveDate = (index) => {
  if (formData.selectedDates.length === 1) {
    message.warning('至少保留一个日期')
    return
  }
  formData.selectedDates.splice(index, 1)
}

/**
 * 日期变化 - 加载可用时间段
 */
const handleDateChangeNew = async (index) => {
  const dateItem = formData.selectedDates[index]
  dateItem.slots = []
  
  if (!formData.equipment_id || !dateItem.date) {
    dateItem.availableSlots = []
    return
  }
  
  try {
    const params = {
      date: dateItem.date
    }
    
    // 编辑时，排除当前订单的时段
    if (formData.id) {
      params.exclude_reservation_id = formData.id
    }
    
    const res = await getEquipmentAvailableSlots(formData.equipment_id, params)
    
    // 根据实际API返回的数据结构调整
    const allSlots = res.data.allSlots || res.data.available_slots || res.data || []
    const bookedSlots = res.data.bookedSlots || res.data.booked_slots || []
    
    // 编辑时，当前订单在该日期下已选择的时段不应被标记为已预订
    let currentDateSlots = []
    if (formData.id && formData.originalTimeSlots) {
      currentDateSlots = formData.originalTimeSlots
        .filter(slot => slot.startsWith(dateItem.date))
        .map(slot => slot.split(' ')[1])
    }
    
    dateItem.availableSlots = allSlots.map(slot => {
      // 获取时间段值
      const timeValue = slot.display_time || slot.value || slot
      
      // 判断是否为当前订单已选择的时段
      const isCurrentSelected = currentDateSlots.includes(timeValue)
      
      // 判断是否已被预订（三种判断方式）
      // 1. 通过 available 字段判断
      // 2. 通过 bookedSlots 数组判断
      // 3. 通过 slot.booked 字段判断
      const isBooked = !isCurrentSelected && (
        slot.available === false || 
        bookedSlots.includes(timeValue) || 
        slot.booked === true
      )
      
      return {
        label: isBooked ? `${timeValue} (已预约)` : timeValue,
        value: timeValue,
        disabled: isBooked
      }
    })
  } catch (error) {
    console.error('获取可用时间段失败：', error)
    dateItem.availableSlots = []
  }
}

/**
 * 设备变化 - 清空所有日期的时间段
 */
const handleEquipmentChange = () => {
  formData.selectedDates.forEach(dateItem => {
    dateItem.slots = []
    dateItem.availableSlots = []
  })
  
  // 重新加载已选日期的可用时间段
  formData.selectedDates.forEach((dateItem, index) => {
    if (dateItem.date) {
      handleDateChangeNew(index)
    }
  })
}

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增设备预约订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    equipment_id: undefined,
    user_id: undefined,
    selectedDates: [
      {
        date: null,
        slots: [],
        availableSlots: []
      }
    ],
    remark: '',
    originalTimeSlots: null
  })
  userOptions.value = []
}

/**
 * 编辑
 */
const handleEdit = async (record) => {
  modalTitle.value = '编辑设备预约订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  
  // 保存原始时间段数据，用于编辑时排除已预订判断
  const originalTimeSlots = record.time_slots || []
  
  // 将 time_slots 解析成 selectedDates 格式
  const grouped = groupTimeSlotsByDate(originalTimeSlots)
  const selectedDates = []
  
  for (const date of Object.keys(grouped).sort()) {
    selectedDates.push({
      date: date,
      slots: grouped[date],
      availableSlots: []
    })
  }
  
  // 如果没有时间段，初始化一个空的日期项
  if (selectedDates.length === 0) {
    selectedDates.push({
      date: null,
      slots: [],
      availableSlots: []
    })
  }
  
  // 填充表单数据
  Object.assign(formData, {
    id: record.id,
    equipment_id: record.equipment?.id,
    user_id: record.user?.id,
    selectedDates: selectedDates,
    remark: record.remark || '',
    originalTimeSlots: originalTimeSlots
  })
  
  // 设置用户选项（用于显示）
  if (record.user) {
    userOptions.value = [record.user]
  }
  
  // 加载每个日期的可用时间段
  for (let i = 0; i < formData.selectedDates.length; i++) {
    await handleDateChangeNew(i)
  }
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 将 selectedDates 转换成 time_slots 格式
    const timeSlots = []
    formData.selectedDates.forEach(dateItem => {
      if (dateItem.date && dateItem.slots && dateItem.slots.length > 0) {
        dateItem.slots.forEach(slot => {
          timeSlots.push(`${dateItem.date} ${slot}`)
        })
      }
    })
    
    const data = {
      equipment_id: formData.equipment_id,
      user_id: formData.user_id,
      time_slots: timeSlots,
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

// ========== 详情 ==========

const detailModalVisible = ref(false)
const detailLoading = ref(false)
const orderDetail = ref({})

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

/**
 * 查看详情
 */
const handleView = async (record) => {
  try {
    detailModalVisible.value = true
    detailLoading.value = true
    const res = await getEquipmentReservationDetail(record.id)
    orderDetail.value = res.data
  } catch (error) {
    console.error('获取订单详情失败：', error)
    message.error('获取订单详情失败')
    detailModalVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// ========== 初始化 ==========

onMounted(() => {
  // 检查路由参数，如果有 status 参数则自动筛选
  if (route.query.status !== undefined) {
    searchForm.status = Number(route.query.status)
  }
  
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

.date-slots-container {
  .date-slot-item {
    margin-bottom: 16px;
    
    .date-card {
      :deep(.ant-card-head) {
        min-height: 40px;
        padding: 0 12px;
        
        .ant-card-head-title {
          padding: 8px 0;
          font-size: 14px;
        }
      }
      
      :deep(.ant-card-body) {
        padding: 12px;
      }
      
      :deep(.ant-form-item) {
        margin-bottom: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
