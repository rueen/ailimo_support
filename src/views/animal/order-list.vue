<template>
  <div class="animal-order-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="品牌">
          <a-select
            v-model:value="searchForm.brandId"
            placeholder="请选择"
            allow-clear
            style="width: 150px"
            :options="brandOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleBrandChange"
          />
        </a-form-item>
        <a-form-item label="品系">
          <a-select
            v-model:value="searchForm.varietyId"
            placeholder="请选择"
            allow-clear
            style="width: 150px"
            :options="varietyOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="!searchForm.brandId"
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
        <a-form-item label="性别">
          <a-select
            v-model:value="searchForm.gender"
            placeholder="请选择"
            allow-clear
            style="width: 100px"
          >
            <a-select-option :value="0">雌性</a-select-option>
            <a-select-option :value="1">雄性</a-select-option>
            <a-select-option :value="2">不限</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="导师姓名">
          <a-input
            v-model:value="searchForm.supervisorName"
            placeholder="请输入导师姓名"
            allow-clear
            style="width: 120px"
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
        <a-form-item label="环境">
          <a-select
            v-model:value="searchForm.environmentId"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
            :options="environmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="要求">
          <a-select
            v-model:value="searchForm.requirementId"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
            :options="requirementOptions"
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
      :scroll="{ x: 1800 }"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'gender'">
          <a-tag>{{ record.genderText || getGenderText(record.gender) }}</a-tag>
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
        <a-form-item label="品牌" name="brandId">
          <a-select
            v-model:value="formData.brandId"
            placeholder="请选择品牌"
            :options="brandOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleFormBrandChange"
          />
        </a-form-item>
        <a-form-item label="品系" name="varietyId">
          <a-select
            v-model:value="formData.varietyId"
            placeholder="请先选择品牌"
            :options="formVarietyOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="!formData.brandId"
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
        <a-form-item label="性别" name="gender">
          <a-select
            v-model:value="formData.gender"
            placeholder="请选择性别"
          >
            <a-select-option :value="0">雌性</a-select-option>
            <a-select-option :value="1">雄性</a-select-option>
            <a-select-option :value="2">不限</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="导师姓名" name="supervisorName">
          <a-input
            v-model:value="formData.supervisorName"
            placeholder="请输入导师姓名"
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
        <a-form-item label="环境" name="environmentId">
          <a-select
            v-model:value="formData.environmentId"
            placeholder="请选择环境"
            :options="environmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="要求" name="requirementId">
          <a-select
            v-model:value="formData.requirementId"
            placeholder="请选择要求"
            :options="requirementOptions"
            :field-names="{ label: 'name', value: 'id' }"
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
        <a-descriptions-item label="品牌">{{ detailData.brand?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="品系">{{ detailData.variety?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="规格">{{ detailData.specification?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="性别">
          {{ detailData.genderText || getGenderText(detailData.gender) }}
        </a-descriptions-item>
        <a-descriptions-item label="导师姓名">{{ detailData.supervisorName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="订购人">{{ detailData.ordererName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</a-descriptions-item>
        <a-descriptions-item label="到货日期">{{ detailData.deliveryDate || '-' }}</a-descriptions-item>
        <a-descriptions-item label="省份">{{ detailData.province || '-' }}</a-descriptions-item>
        <a-descriptions-item label="城市">{{ detailData.city || '-' }}</a-descriptions-item>
        <a-descriptions-item label="区县">{{ detailData.district || '-' }}</a-descriptions-item>
        <a-descriptions-item label="详细地址" :span="2">{{ detailData.address || '-' }}</a-descriptions-item>
        <a-descriptions-item label="环境">{{ detailData.environment?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="要求">{{ detailData.requirement?.name || '-' }}</a-descriptions-item>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import {
  getAnimalOrderList,
  getAnimalOrderDetail,
  createAnimalOrder,
  updateAnimalOrder,
  auditAnimalOrder,
  completeAnimalOrder,
  cancelAnimalOrder,
  getAnimalBrandOptions,
  getAnimalVarietyOptions,
  getAnimalSpecificationOptions,
  getAnimalRequirementOptions
} from '@/api/animal'
import { getEnvironmentTypeOptions, getHandlerOptions } from '@/api/config'
import { getUserList } from '@/api/user'

// ========== 搜索表单 ==========

const searchForm = reactive({
  brandId: undefined,
  varietyId: undefined,
  specificationId: undefined,
  gender: undefined,
  supervisorName: '',
  ordererName: '',
  contactPhone: '',
  environmentId: undefined,
  requirementId: undefined,
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
    brandId: undefined,
    varietyId: undefined,
    specificationId: undefined,
    gender: undefined,
    supervisorName: '',
    ordererName: '',
    contactPhone: '',
    environmentId: undefined,
    requirementId: undefined,
    status: undefined
  })
  dateRange.value = []
  handleSearch()
}

/**
 * 品牌变化
 */
const handleBrandChange = () => {
  searchForm.varietyId = undefined
  if (searchForm.brandId) {
    loadVarietyOptions(searchForm.brandId)
  } else {
    varietyOptions.value = []
  }
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
  { title: '品牌', dataIndex: ['brand', 'name'], width: 120 },
  { title: '品系', dataIndex: ['variety', 'name'], width: 120 },
  { title: '规格', dataIndex: ['specification', 'name'], width: 100 },
  { title: '性别', key: 'gender', width: 80 },
  { title: '导师姓名', dataIndex: 'supervisorName', width: 100 },
  { title: '订购人', dataIndex: 'ordererName', width: 100 },
  { title: '联系电话', dataIndex: 'contactPhone', width: 120 },
  { title: '到货日期', dataIndex: 'deliveryDate', width: 120 },
  { title: '环境', dataIndex: ['environment', 'name'], width: 100 },
  { title: '要求', dataIndex: ['requirement', 'name'], width: 100 },
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
    
    const res = await getAnimalOrderList(params)
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

/**
 * 获取性别文本
 */
const getGenderText = (gender) => {
  const genderMap = {
    0: '雌性',
    1: '雄性',
    2: '不限'
  }
  return genderMap[gender] || '-'
}

// ========== 新增/编辑订单 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增订单')
const formRef = ref()
const formData = reactive({
  id: null,
  userId: undefined,
  brandId: undefined,
  varietyId: undefined,
  specificationId: undefined,
  gender: undefined,
  supervisorName: '',
  ordererName: '',
  contactPhone: '',
  deliveryDate: null,
  province: '',
  city: '',
  district: '',
  address: '',
  environmentId: undefined,
  requirementId: undefined,
  remark: ''
})

const formRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  brandId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  varietyId: [{ required: true, message: '请选择品系', trigger: 'change' }],
  specificationId: [{ required: true, message: '请选择规格', trigger: 'change' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  supervisorName: [{ required: true, message: '请输入导师姓名', trigger: 'blur' }],
  ordererName: [{ required: true, message: '请输入订购人姓名', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  deliveryDate: [{ required: true, message: '请选择到货日期', trigger: 'change' }],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  environmentId: [{ required: true, message: '请选择环境', trigger: 'change' }],
  requirementId: [{ required: true, message: '请选择要求', trigger: 'change' }]
}

// 选项数据
const brandOptions = ref([])
const varietyOptions = ref([])
const specificationOptions = ref([])
const requirementOptions = ref([])
const environmentOptions = ref([])
const handlerOptions = ref([])
const userOptions = ref([])

/**
 * 表单中的品系选项（根据选择的品牌动态加载）
 */
const formVarietyOptions = computed(() => {
  return varietyOptions.value
})

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
    brandId: undefined,
    varietyId: undefined,
    specificationId: undefined,
    gender: undefined,
    supervisorName: '',
    ordererName: '',
    contactPhone: '',
    deliveryDate: null,
    province: '',
    city: '',
    district: '',
    address: '',
    environmentId: undefined,
    requirementId: undefined,
    remark: ''
  })
  varietyOptions.value = []
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
    brandId: record.brand?.id,
    varietyId: record.variety?.id,
    specificationId: record.specification?.id,
    gender: record.gender,
    supervisorName: record.supervisorName,
    ordererName: record.ordererName,
    contactPhone: record.contactPhone,
    deliveryDate: record.deliveryDate,
    province: record.province,
    city: record.city,
    district: record.district,
    address: record.address,
    environmentId: record.environment?.id,
    requirementId: record.requirement?.id,
    remark: record.remark
  })
  // 设置用户选项
  if (record.user) {
    userOptions.value = [record.user]
  }
  // 如果选择了品牌，加载对应的品系
  if (record.brand?.id) {
    loadVarietyOptions(record.brand.id)
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
      brandId: formData.brandId,
      varietyId: formData.varietyId,
      specificationId: formData.specificationId,
      gender: formData.gender,
      supervisorName: formData.supervisorName,
      ordererName: formData.ordererName,
      contactPhone: formData.contactPhone,
      deliveryDate: formData.deliveryDate,
      province: formData.province,
      city: formData.city,
      district: formData.district,
      address: formData.address,
      environmentId: formData.environmentId,
      requirementId: formData.requirementId,
      remark: formData.remark
    }
    
    if (formData.id) {
      await updateAnimalOrder(formData.id, data)
      message.success('更新成功')
    } else {
      await createAnimalOrder(data)
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
 * 表单中品牌变化
 */
const handleFormBrandChange = () => {
  formData.varietyId = undefined
  if (formData.brandId) {
    loadVarietyOptions(formData.brandId)
  } else {
    varietyOptions.value = []
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
      await auditAnimalOrder(approveFormData.id, {
        status: 1,
        handlerId: approveFormData.handlerId
      })
      message.success('审核通过')
    } else {
      if (!approveFormData.rejectReason) {
        message.warning('请输入拒绝原因')
        return
      }
      await auditAnimalOrder(approveFormData.id, {
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
    await completeAnimalOrder(record.id)
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
    await cancelAnimalOrder(record.id)
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
    const res = await getAnimalOrderDetail(record.id)
    detailData.value = res.data
    detailModalVisible.value = true
  } catch (error) {
    console.error('获取详情失败：', error)
    message.error('获取详情失败')
  }
}

// ========== 加载选项数据 ==========

/**
 * 加载品系选项（根据品牌）
 */
const loadVarietyOptions = async (brandId) => {
  if (!brandId) {
    varietyOptions.value = []
    return
  }
  try {
    const res = await getAnimalVarietyOptions({ brandId })
    varietyOptions.value = res.data
  } catch (error) {
    console.error('获取品系选项失败：', error)
    varietyOptions.value = []
  }
}

/**
 * 加载所有选项数据
 */
const loadOptions = async () => {
  try {
    const [brands, specifications, requirements, environments, handlers] = await Promise.all([
      getAnimalBrandOptions(),
      getAnimalSpecificationOptions(),
      getAnimalRequirementOptions(),
      getEnvironmentTypeOptions(),
      getHandlerOptions()
    ])
    
    brandOptions.value = brands.data
    specificationOptions.value = specifications.data
    requirementOptions.value = requirements.data
    environmentOptions.value = environments.data
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
.animal-order-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
