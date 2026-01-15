<template>
  <div class="variety-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="所属品牌">
          <a-select
            v-model:value="searchForm.brand_id"
            placeholder="选择所属品牌"
            allow-clear
            style="width: 200px"
            :options="brandOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="品系名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="输入品系名称"
            allow-clear
            style="width: 150px"
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
        v-if="userStore.hasPermission('animal_variety:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增品系
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
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('animal_variety:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('animal_variety:delete')"
              title="确定删除该品系吗？"
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

    <!-- 新增/编辑对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="500"
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
        <a-form-item label="品牌" name="brand_id">
          <a-select
            v-model:value="formData.brand_id"
            placeholder="请选择品牌"
            :options="brandOptions"
            :field-names="{ label: 'name', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="品系名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入品系名称"
          />
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
  getAnimalVarietyList,
  createAnimalVariety,
  updateAnimalVariety,
  deleteAnimalVariety,
  getAnimalBrandOptions
} from '@/api/animal'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  name: '',
  brand_id: undefined
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
    name: '',
    brand_id: undefined
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
  { title: '品系名称', dataIndex: 'name', width: 150 },
  {
    title: '所属品牌',
    dataIndex: ['brand', 'name'],
    width: 200,
    customRender: ({ record }) => record.brand?.name || '-'
  },
  { title: '创建时间', dataIndex: 'created_at', width: 180 },
  { title: '操作', key: 'action', fixed: 'right', width: 150 }
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
    const res = await getAnimalVarietyList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取品系列表失败：', error)
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

// ========== 新增/编辑 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增品系')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  brand_id: undefined
})

const formRules = {
  name: [{ required: true, message: '请输入品系名称', trigger: 'blur' }],
  brand_id: [{ required: true, message: '请选择品牌', trigger: 'change' }]
}

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增品系'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    brand_id: undefined
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑品系'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    brand_id: record.brand?.id
  })
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      name: formData.name,
      brand_id: formData.brand_id
    }
    
    if (formData.id) {
      await updateAnimalVariety(formData.id, data)
      message.success('更新成功')
    } else {
      await createAnimalVariety(data)
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
const handleCancel = () => {
  formRef.value?.resetFields()
}

/**
 * 删除
 */
const handleDelete = async (record) => {
  try {
    await deleteAnimalVariety(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
    message.error(error.message || '删除失败')
  }
}

// ========== 选项数据 ==========

const brandOptions = ref([])

/**
 * 加载品牌选项
 */
const loadBrandOptions = async () => {
  try {
    const res = await getAnimalBrandOptions()
    brandOptions.value = res.data
  } catch (error) {
    console.error('获取品牌选项失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadBrandOptions()
})
</script>

<style lang="less" scoped>
.variety-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
