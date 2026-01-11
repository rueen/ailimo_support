<template>
  <div class="reagent-order-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="试剂名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入试剂名称"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="品牌">
          <a-select
            v-model:value="searchForm.brandId"
            placeholder="请选择"
            allow-clear
            style="width: 150px"
            :options="brandOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="规格">
          <a-select
            v-model:value="searchForm.specificationId"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
            :options="specificationOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="订购人">
          <a-input
            v-model:value="searchForm.ordererName"
            placeholder="请输入订购人姓名"
            allow-clear
            style="width: 120px"
          />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input
            v-model:value="searchForm.contactPhone"
            placeholder="请输入联系电话"
            allow-clear
            style="width: 120px"
          />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="0">待处理</a-select-option>
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已拒绝</a-select-option>
            <a-select-option :value="3">已完成</a-select-option>
            <a-select-option :value="4">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="到货日期">
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
      :scroll="{ x: 1600 }"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
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
        <a-form-item label="试剂名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入试剂耗材名称"
          />
        </a-form-item>
        <a-form-item label="品牌" name="brandId">
          <a-select
            v-model:value="formData.brandId"
            placeholder="请选择品牌"
            :options="brandOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="规格" name="specificationId">
          <a-select
            v-model:value="formData.specificationId"
            placeholder="请选择规格"
            :options="specificationOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="数量" name="quantity">
          <a-input-number
            v-model:value="formData.quantity"
            :min="1"
            placeholder="请输入数量"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="订购人姓名" name="ordererName">
          <a-input
            v-model:value="formData.ordererName"
            placeholder="请输入订购人姓名"
          />
        </a-form-item>
        <a-form-item label="联系电话" name="contactPhone">
          <a-input
            v-model:value="formData.contactPhone"
            placeholder="请输入联系电话（11位）"
            maxlength="11"
          />
        </a-form-item>
        <a-form-item label="到货日期" name="deliveryDate">
          <a-date-picker
            v-model:value="formData.deliveryDate"
            format="YYYY-MM-DD"
            :value-format="'YYYY-MM-DD'"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="省份" name="province">
          <a-input
            v-model:value="formData.province"
            placeholder="请输入省份"
          />
        </a-form-item>
        <a-form-item label="城市" name="city">
          <a-input
            v-model:value="formData.city"
            placeholder="请输入城市"
          />
        </a-form-item>
        <a-form-item label="区县" name="district">
          <a-input
            v-model:value="formData.district"
            placeholder="请输入区县"
          />
        </a-form-item>
        <a-form-item label="详细地址" name="address">
          <a-input
            v-model:value="formData.address"
            placeholder="请输入详细地址"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            placeholder="请输入备注"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 审核订单对话框 -->
    <a-modal
      v-model:open="approveModalVisible"
      title="审核订单"
      :width="500"
      @ok="handleApproveSubmit"
      @cancel="approveModalVisible = false"
    >
      <a-form
        ref="approveFormRef"
        :model="approveFormData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="审核结果" name="result">
          <a-radio-group v-model:value="approveFormData.result">
            <a-radio value="approve">通过</a-radio>
            <a-radio value="reject">拒绝</a-radio>
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
            :field-names="{ label: 'name', value: 'id' }"
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
            placeholder="请输入拒绝原因"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 订单详情对话框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="订单详情"
      :width="700"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="订单ID">{{ detailData.id }}</a-descriptions-item>
        <a-descriptions-item label="订单状态">
          <a-tag :color="getStatusColor(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="试剂名称">{{ detailData.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="品牌">{{ detailData.brand?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="规格">{{ detailData.specification?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="数量">{{ detailData.quantity || '-' }}</a-descriptions-item>
        <a-descriptions-item label="订购人">{{ detailData.ordererName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</a-descriptions-item>
        <a-descriptions-item label="到货日期">{{ detailData.deliveryDate || '-' }}</a-descriptions-item>
        <a-descriptions-item label="省份">{{ detailData.province || '-' }}</a-descriptions-item>
        <a-descriptions-item label="城市">{{ detailData.city || '-' }}</a-descriptions-item>
        <a-descriptions-item label="区县">{{ detailData.district || '-' }}</a-descriptions-item>
        <a-descriptions-item label="详细地址" :span="2">{{ detailData.address || '-' }}</a-descriptions-item>
        <a-descriptions-item label="用户">{{ detailData.user?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="用户手机号">{{ detailData.user?.phone || '-' }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ detailData.handler?.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item label="拒绝原因" :span="2">{{ detailData.rejectReason || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detailData.createdAt || '-' }}</a-descriptions-item>
        <a-descriptions-item label="审核时间">{{ detailData.auditTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ detailData.completedTime || '-' }}</a-descriptions-item>
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
  getReagentOrderList,
  getReagentOrderDetail,
  createReagentOrder,
  updateReagentOrder,
  auditReagentOrder,
  completeReagentOrder,
  cancelReagentOrder,
  getReagentBrandOptions,
  getReagentSpecificationOptions
} from '@/api/reagent'
import { getHandlerOptions } from '@/api/config'
import { getUserList } from '@/api/user'

// ========== 搜索表单 ==========

const searchForm = reactive({
  name: '',
  brandId: undefined,
  specificationId: undefined,
  ordererName: '',
  contactPhone: '',
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
    name: '',
    brandId: undefined,
    specificationId: undefined,
    ordererName: '',
    contactPhone: '',
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
  { title: 'ID', dataIndex: 'id', width: 80, fixed: 'left' },
  { title: '试剂名称', dataIndex: 'name', width: 150 },
  { title: '品牌', dataIndex: ['brand', 'name'], width: 120 },
  { title: '规格', dataIndex: ['specification', 'name'], width: 100 },
  { title: '数量', dataIndex: 'quantity', width: 80 },
  { title: '订购人', dataIndex: 'ordererName', width: 100 },
  { title: '联系电话', dataIndex: 'contactPhone', width: 120 },
  { title: '到货日期', dataIndex: 'deliveryDate', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 },
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
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const res = await getReagentOrderList(params)
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

/**
 * 获取状态文本
 */
const getStatusText = (status) => {
  const statusMap = {
    0: '待处理',
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
  name: '',
  brandId: undefined,
  specificationId: undefined,
  quantity: 1,
  ordererName: '',
  contactPhone: '',
  deliveryDate: null,
  province: '',
  city: '',
  district: '',
  address: '',
  remark: ''
})

const formRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  name: [{ required: true, message: '请输入试剂名称', trigger: 'blur' }],
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  specificationId: [{ required: true, message: '请选择规格', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  ordererName: [{ required: true, message: '请输入订购人姓名', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  deliveryDate: [{ required: true, message: '请选择到货日期', trigger: 'change' }],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 选项数据
const brandOptions = ref([])
const specificationOptions = ref([])
const handlerOptions = ref([])
const userOptions = ref([])

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增订单'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    userId: undefined,
    name: '',
    brandId: undefined,
    specificationId: undefined,
    quantity: 1,
    ordererName: '',
    contactPhone: '',
    deliveryDate: null,
    province: '',
    city: '',
    district: '',
    address: '',
    remark: ''
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑订单'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    userId: record.user?.id,
    name: record.name,
    brandId: record.brand?.id,
    specificationId: record.specification?.id,
    quantity: record.quantity,
    ordererName: record.ordererName,
    contactPhone: record.contactPhone,
    deliveryDate: record.deliveryDate,
    province: record.province,
    city: record.city,
    district: record.district,
    address: record.address,
    remark: record.remark
  })
  // 设置用户选项
  if (record.user) {
    userOptions.value = [record.user]
  }
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      userId: formData.userId,
      name: formData.name,
      brandId: formData.brandId,
      specificationId: formData.specificationId,
      quantity: formData.quantity,
      ordererName: formData.ordererName,
      contactPhone: formData.contactPhone,
      deliveryDate: formData.deliveryDate,
      province: formData.province,
      city: formData.city,
      district: formData.district,
      address: formData.address,
      remark: formData.remark
    }
    
    if (formData.id) {
      await updateReagentOrder(formData.id, data)
      message.success('更新成功')
    } else {
      await createReagentOrder(data)
      message.success('创建成功')
    }
    
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    if (error.errorFields) {
      return
    }
    console.error('提交失败：', error)
    message.error(error.message || '操作失败')
  }
}

/**
 * 取消
 */
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
    const res = await getUserList({ phone: value, pageSize: 20 })
    userOptions.value = res.data.list
  } catch (error) {
    console.error('搜索用户失败：', error)
  }
}

/**
 * 禁用日期（不能选择过去的日期）
 */
const disabledDate = (current) => {
  return current && current < dayjs().startOf('day')
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

/**
 * 审核
 */
const handleApprove = (record) => {
  approveModalVisible.value = true
  Object.assign(approveFormData, {
    id: record.id,
    result: 'approve',
    handlerId: undefined,
    rejectReason: ''
  })
}

/**
 * 提交审核
 */
const handleApproveSubmit = async () => {
  try {
    await approveFormRef.value?.validate()
    
    if (approveFormData.result === 'approve') {
      if (!approveFormData.handlerId) {
        message.warning('请选择负责人')
        return
      }
      await auditReagentOrder(approveFormData.id, {
        status: 1,
        handlerId: approveFormData.handlerId
      })
      message.success('审核通过')
    } else {
      if (!approveFormData.rejectReason) {
        message.warning('请输入拒绝原因')
        return
      }
      await auditReagentOrder(approveFormData.id, {
        status: 2,
        rejectReason: approveFormData.rejectReason
      })
      message.success('已拒绝')
    }
    
    approveModalVisible.value = false
    fetchTableData()
  } catch (error) {
    if (error.errorFields) {
      return
    }
    console.error('审核失败：', error)
    message.error(error.message || '审核失败')
  }
}

// ========== 完成/取消订单 ==========

/**
 * 完成订单
 */
const handleComplete = async (record) => {
  try {
    await completeReagentOrder(record.id)
    message.success('订单已完成')
    fetchTableData()
  } catch (error) {
    console.error('完成订单失败：', error)
    message.error(error.message || '完成订单失败')
  }
}

/**
 * 取消订单
 */
const handleCancel = async (record) => {
  try {
    await cancelReagentOrder(record.id)
    message.success('订单已取消')
    fetchTableData()
  } catch (error) {
    console.error('取消订单失败：', error)
    message.error(error.message || '取消订单失败')
  }
}

// ========== 查看详情 ==========

const detailModalVisible = ref(false)
const detailData = ref({})

/**
 * 查看详情
 */
const handleView = async (record) => {
  try {
    const res = await getReagentOrderDetail(record.id)
    detailData.value = res.data
    detailModalVisible.value = true
  } catch (error) {
    console.error('获取详情失败：', error)
    message.error('获取详情失败')
  }
}

// ========== 加载选项数据 ==========

/**
 * 加载所有选项数据
 */
const loadOptions = async () => {
  try {
    const [brands, specifications, handlers] = await Promise.all([
      getReagentBrandOptions(),
      getReagentSpecificationOptions(),
      getHandlerOptions()
    ])
    
    brandOptions.value = brands.data
    specificationOptions.value = specifications.data
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
.reagent-order-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
