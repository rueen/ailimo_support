<template>
  <div class="animal-order-list-container">
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
        <a-form-item label="品牌">
          <a-select
            v-model:value="searchForm.brand_id"
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
            v-model:value="searchForm.variety_id"
            placeholder="请选择"
            allow-clear
            style="width: 150px"
            :options="varietyOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="!searchForm.brand_id"
          />
        </a-form-item>
        <a-form-item label="规格">
          <a-select
            v-model:value="searchForm.specification_id"
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
            v-model:value="searchForm.supervisor_name"
            placeholder="请输入导师姓名"
            allow-clear
            style="width: 120px"
          />
        </a-form-item>
        <a-form-item label="订购人">
          <a-input
            v-model:value="searchForm.orderer_name"
            placeholder="请输入订购人姓名"
            allow-clear
            style="width: 120px"
          />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input
            v-model:value="searchForm.contact_phone"
            placeholder="请输入联系电话"
            allow-clear
            style="width: 120px"
          />
        </a-form-item>
        <a-form-item label="环境">
          <a-select
            v-model:value="searchForm.environment_id"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
            :options="environmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="要求">
          <a-select
            v-model:value="searchForm.requirement_id"
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
      <a-button
        v-if="userStore.hasPermission('animal_order:create')"
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
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'animal_info'">
          <div>品牌：{{ record.brand?.name }}</div>
          <div>品系：{{ record.variety?.name }}</div>
          <div>规格：{{ record.specification?.name }}</div>
          <div>性别：{{ record.genderText || getGenderText(record.gender) }}</div>
          <div>是否打耳标：{{ record.need_ear_tag ? '是' : '否' }}</div>
        </template>
        <template v-if="column.key === 'orderer_info'">
          <div>导师姓名：{{ record.supervisor_name }}</div>
          <div>订购人：{{ record.orderer_name }}</div>
          <div>联系电话：{{ record.contact_phone }}</div>
          <div>地址：{{ record.province?.name }} {{ record.city?.name }} {{ record.district?.name }} {{ record.address }}</div>
        </template>
        <template v-if="column.key === 'requirement_info'">
          <div>环境：{{ record.environment?.name }}</div>
          <div>要求：{{ record.requirement?.name }}</div>
          <div>到货日期：{{ record.delivery_date }}</div>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('animal_order:detail')"
              type="link"
              size="small"
              @click="handleView(record)"
            >
              详情
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('animal_order:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('animal_order:audit')"
              type="link"
              size="small"
              @click="handleApprove(record)"
            >
              审核通过
            </a-button>
            <a-button
              v-if="record.status === 0 && userStore.hasPermission('animal_order:audit')"
              type="link"
              danger
              size="small"
              @click="handleReject(record)"
            >
              审核拒绝
            </a-button>
            <a-popconfirm
              v-if="record.status === 1 && userStore.hasPermission('animal_order:complete')"
              title="确定完成该订单吗？"
              @confirm="handleComplete(record)"
            >
              <a-button type="link" danger size="small">
                完成
              </a-button>
            </a-popconfirm>
            <a-popconfirm
              v-if="record.status === 1 && userStore.hasPermission('animal_order:cancel')"
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
        <a-form-item label="品牌" name="brand_id">
          <a-select
            v-model:value="formData.brand_id"
            placeholder="请选择品牌"
            :options="brandOptions"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleFormBrandChange"
          />
        </a-form-item>
        <a-form-item label="品系" name="variety_id">
          <a-select
            v-model:value="formData.variety_id"
            placeholder="请先选择品牌"
            :options="formVarietyOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="!formData.brand_id"
          />
        </a-form-item>
        <a-form-item label="规格" name="specification_id">
          <a-select
            v-model:value="formData.specification_id"
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
        <a-form-item label="环境" name="environment_id">
          <a-select
            v-model:value="formData.environment_id"
            placeholder="请选择环境"
            :options="environmentOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="要求" name="requirement_id">
          <a-select
            v-model:value="formData.requirement_id"
            placeholder="请选择要求"
            :options="requirementOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="是否打耳标" name="need_ear_tag">
          <a-radio-group v-model:value="formData.need_ear_tag">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="导师姓名" name="supervisor_name">
          <a-input
            v-model:value="formData.supervisor_name"
            placeholder="请输入导师姓名"
          />
        </a-form-item>
        <a-form-item label="订购人姓名" name="orderer_name">
          <a-input
            v-model:value="formData.orderer_name"
            placeholder="请输入订购人姓名"
          />
        </a-form-item>
        <a-form-item label="联系电话" name="contact_phone">
          <a-input
            v-model:value="formData.contact_phone"
            placeholder="请输入联系电话（11位）"
            :maxlength="11"
          />
        </a-form-item>
        <a-form-item label="到货日期" name="delivery_date">
          <a-date-picker
            v-model:value="formData.delivery_date"
            format="YYYY-MM-DD"
            :value-format="'YYYY-MM-DD'"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="收货地址" name="region">
          <RegionCascader
            v-model:province-id="formData.province_id"
            v-model:city-id="formData.city_id"
            v-model:district-id="formData.district_id"
            select-width="162px"
            @change="handleRegionChange"
          />
        </a-form-item>
        <a-form-item label="详细地址">
          <a-textarea v-model:value="formData.address" :rows="2" placeholder="请输入详细地址" allow-clear />
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
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="订单号">{{ detailData.order_sn }}</a-descriptions-item>
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
        <a-descriptions-item label="是否打耳标">
          {{ detailData.need_ear_tag ? '是' : '否' }}
        </a-descriptions-item>
        <a-descriptions-item label="环境">{{ detailData.environment?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="要求">{{ detailData.requirement?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</a-descriptions-item>
        <a-descriptions-item label="到货日期">{{ detailData.delivery_date || '-' }}</a-descriptions-item>
        <a-descriptions-item label="导师姓名">{{ detailData.supervisor_name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="订购人" :span="2">
          <div>{{ detailData.orderer_name || '-' }}</div>
          <div>{{ detailData.contact_phone || '-' }}</div>
          <div>{{ detailData.province?.name }} {{ detailData.city?.name }} {{ detailData.district?.name }} {{ detailData.address || '-' }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="下单用户" :span="2">
          <div>{{ detailData.user?.name || '-' }}</div>
          <div>{{ detailData.user?.phone || '-' }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="负责人">{{ detailData.handler?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="detailData.reject_reason" label="拒绝原因" :span="2">{{ detailData.reject_reason || '-' }}</a-descriptions-item>
        
        <a-descriptions-item v-if="detailData.audit_by" label="审核人">
          {{ detailData.audit_by?.username || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.audit_time" label="审核时间">{{ detailData.audit_time || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="detailData.completed_time" label="完成时间">{{ detailData.completed_time || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="detailData.cancel_time" label="取消时间">
          {{ detailData.cancel_time || '-' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="detailData.created_at" label="创建时间">{{ detailData.created_at || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="detailData.updated_at" label="更新时间">{{ detailData.updated_at || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
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
import { useUserStore } from '@/store'
import RegionCascader from '@/components/RegionCascader.vue'

const userStore = useUserStore()
const route = useRoute()

// ========== 搜索表单 ==========

const searchForm = reactive({
  order_sn: '',
  brand_id: undefined,
  variety_id: undefined,
  specification_id: undefined,
  gender: undefined,
  supervisor_name: '',
  orderer_name: '',
  contact_phone: '',
  environment_id: undefined,
  requirement_id: undefined,
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
    brand_id: undefined,
    variety_id: undefined,
    specification_id: undefined,
    gender: undefined,
    supervisor_name: '',
    orderer_name: '',
    contact_phone: '',
    environment_id: undefined,
    requirement_id: undefined,
    status: undefined
  })
  dateRange.value = []
  handleSearch()
}

/**
 * 品牌变化
 */
const handleBrandChange = () => {
  searchForm.variety_id = undefined
  if (searchForm.brand_id) {
    loadVarietyOptions(searchForm.brand_id)
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
  { title: '订单号', dataIndex: 'order_sn', width: 150 },
  { title: '动物信息', key: 'animal_info', width: 100 },
  { title: '订购人信息', key: 'orderer_info', width: 100 },
  { title: '要求信息', key: 'requirement_info', width: 100 },
  { title: '状态', key: 'status', width: 100 },
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
  user_id: undefined,
  brand_id: undefined,
  variety_id: undefined,
  specification_id: undefined,
  gender: undefined,
  need_ear_tag: false,
  supervisor_name: '',
  orderer_name: '',
  contact_phone: '',
  delivery_date: null,
  // 省市区ID（用于RegionCascader组件绑定和提交到后端）
  province_id: undefined,
  city_id: undefined,
  district_id: undefined,
  address: '',
  environment_id: undefined,
  requirement_id: undefined,
  remark: ''
})

const formRules = {
  user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
  brand_id: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  variety_id: [{ required: true, message: '请选择品系', trigger: 'change' }],
  specification_id: [{ required: true, message: '请选择规格', trigger: 'change' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  supervisor_name: [{ required: true, message: '请输入导师姓名', trigger: 'blur' }],
  orderer_name: [{ required: true, message: '请输入订购人姓名', trigger: 'blur' }],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  delivery_date: [{ required: true, message: '请选择到货日期', trigger: 'change' }],
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
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  environment_id: [{ required: true, message: '请选择环境', trigger: 'change' }],
  requirement_id: [{ required: true, message: '请选择要求', trigger: 'change' }]
}

// 选项数据
const brandOptions = ref([])
const varietyOptions = ref([])
const specificationOptions = ref([])
const requirementOptions = ref([])
const environmentOptions = ref([])
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
    user_id: undefined,
    brand_id: undefined,
    variety_id: undefined,
    specification_id: undefined,
    gender: undefined,
    need_ear_tag: false,
    supervisor_name: '',
    orderer_name: '',
    contact_phone: '',
    delivery_date: null,
    province_id: undefined,
    city_id: undefined,
    district_id: undefined,
    address: '',
    environment_id: undefined,
    requirement_id: undefined,
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
    user_id: record.user?.id,
    brand_id: record.brand?.id,
    variety_id: record.variety?.id,
    specification_id: record.specification?.id,
    gender: record.gender,
    need_ear_tag: !!record.need_ear_tag,
    supervisor_name: record.supervisor_name,
    orderer_name: record.orderer_name,
    contact_phone: record.contact_phone,
    delivery_date: record.delivery_date,
    // 从响应数据中获取省市区ID
    province_id: record.province_id,
    city_id: record.city_id,
    district_id: record.district_id,
    address: record.address,
    environment_id: record.environment?.id,
    requirement_id: record.requirement?.id,
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
      user_id: formData.user_id,
      brand_id: formData.brand_id,
      variety_id: formData.variety_id,
      specification_id: formData.specification_id,
      gender: formData.gender,
      need_ear_tag: formData.need_ear_tag,
      supervisor_name: formData.supervisor_name,
      orderer_name: formData.orderer_name,
      contact_phone: formData.contact_phone,
      delivery_date: formData.delivery_date,
      address: formData.address,
      environment_id: formData.environment_id,
      requirement_id: formData.requirement_id,
      remark: formData.remark
    }

    // 省市区ID（可选，但必须同时提供或不提供）
    if (formData.province_id && formData.city_id && formData.district_id) {
      data.province_id = formData.province_id
      data.city_id = formData.city_id
      data.district_id = formData.district_id
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
 * 收货地址变化
 */
const handleRegionChange = () => {
  // 手动触发表单验证
  formRef.value?.validateFields(['region']).catch(() => {})
}

/**
 * 表单中品牌变化
 */
const handleFormBrandChange = () => {
  formData.variety_id = undefined
  if (formData.brand_id) {
    loadVarietyOptions(formData.brand_id)
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
    const res = await getUserList({ keyword: value, pageSize: 20 })
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
    await auditAnimalOrder(currentRecord.value.id, {
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
    await auditAnimalOrder(currentRecord.value.id, {
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
const loadVarietyOptions = async (brand_id) => {
  if (!brand_id) {
    varietyOptions.value = []
    return
  }
  try {
    const res = await getAnimalVarietyOptions({ brand_id })
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
  // 检查路由参数，如果有 status 参数则自动筛选
  if (route.query.status !== undefined) {
    searchForm.status = Number(route.query.status)
  }
  
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
