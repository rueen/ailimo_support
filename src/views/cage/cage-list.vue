<template>
  <div>
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="动物类型">
          <a-select
            v-model:value="searchForm.animalTypeId"
            placeholder="请选择"
            allow-clear
            style="width: 150px"
            :options="animalTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="环境类型">
          <a-select
            v-model:value="searchForm.environmentId"
            placeholder="请选择"
            allow-clear
            style="width: 150px"
            :options="environmentTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
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
        v-if="userStore.hasPermission('cage:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增笼位
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
        <template v-if="column.key === 'status'">
          <a-switch
            v-if="userStore.hasPermission('cage:update')"
            :checked="record.status === 1"
            @change="(checked) => handleStatusChange(record, checked)"
          />
          <span v-else>{{ record.status === 1 ? '启用' : '禁用' }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('cage:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('cage:delete')"
              title="确定删除该笼位吗？"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑笼位对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="600"
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
        <a-form-item label="动物类型" name="animalTypeId">
          <a-select
            v-model:value="formData.animalTypeId"
            placeholder="请选择动物类型"
            :options="animalTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="环境类型" name="environmentId">
          <a-select
            v-model:value="formData.environmentId"
            placeholder="请选择环境类型"
            :options="environmentTypeOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="笼位数量" name="quantity">
          <a-input-number
            v-model:value="formData.quantity"
            :min="1"
            :max="10000"
            placeholder="请输入笼位数量"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
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
  getCageList,
  createCage,
  updateCage,
  deleteCage
} from '@/api/cage'
import { getAnimalTypeOptions, getEnvironmentTypeOptions } from '@/api/config'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  animalTypeId: undefined,
  environmentId: undefined,
  status: undefined
})

const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    animalTypeId: undefined,
    environmentId: undefined,
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

const columns = [
  { title: '动物类型', dataIndex: ['animalType', 'name'], width: 150 },
  { title: '环境类型', dataIndex: ['environment', 'name'], width: 150 },
  { title: '笼位数量', dataIndex: 'quantity', width: 150 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'created_at', width: 180 },
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
    const res = await getCageList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取笼位列表失败：', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchTableData()
}

const handleStatusChange = async (record, checked) => {
  try {
    await updateCage(record.id, { status: checked ? 1 : 0 })
    message.success('状态更新成功')
    fetchTableData()
  } catch (error) {
    console.error('状态更新失败：', error)
  }
}

// ========== 新增/编辑笼位 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增笼位')
const formRef = ref()
const formData = reactive({
  id: null,
  animalTypeId: undefined,
  environmentId: undefined,
  quantity: 100,
  status: 1
})

const formRules = {
  animalTypeId: [{ required: true, message: '请选择动物类型', trigger: 'change' }],
  environmentId: [{ required: true, message: '请选择环境类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入笼位数量', trigger: 'blur' }]
}

const animalTypeOptions = ref([])
const environmentTypeOptions = ref([])

const handleAdd = () => {
  modalTitle.value = '新增笼位'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    animalTypeId: undefined,
    environmentId: undefined,
    quantity: 100,
    status: 1
  })
}

const handleEdit = (record) => {
  modalTitle.value = '编辑笼位'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    animalTypeId: record.animalType?.id,
    environmentId: record.environment?.id,
    quantity: record.quantity,
    status: record.status
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      animalTypeId: formData.animalTypeId,
      environmentId: formData.environmentId,
      quantity: formData.quantity,
      status: formData.status
    }
    
    if (formData.id) {
      await updateCage(formData.id, data)
      message.success('更新成功')
    } else {
      await createCage(data)
      message.success('创建成功')
    }
    
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('提交失败：', error)
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
}

const handleDelete = async (record) => {
  try {
    await deleteCage(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

// ========== 加载选项数据 ==========

const loadOptions = async () => {
  try {
    const [animalTypes, environmentTypes] = await Promise.all([
      getAnimalTypeOptions(),
      getEnvironmentTypeOptions()
    ])
    
    animalTypeOptions.value = animalTypes.data
    environmentTypeOptions.value = environmentTypes.data
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
