<template>
  <div class="equipment-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="设备名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入设备名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
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
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增设备
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
            :checked="record.status === 1"
            @change="(checked) => handleStatusChange(record, checked)"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定删除该设备吗？"
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

    <!-- 新增/编辑设备对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
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
        <a-form-item label="设备名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入设备名称" />
        </a-form-item>
        <a-form-item label="基本信息" name="baseInfo">
          <a-textarea
            v-model:value="formData.details.base_info"
            :rows="3"
            placeholder="请输入设备基本信息"
          />
        </a-form-item>
        <a-form-item label="规格参数" name="specs">
          <a-textarea
            v-model:value="formData.details.specs"
            :rows="3"
            placeholder="请输入设备规格参数"
          />
        </a-form-item>
        <a-form-item label="设备图片" name="images">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @preview="handlePreview"
            @remove="handleRemove"
          >
            <div v-if="fileList.length < 5">
              <PlusOutlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :footer="null">
      <img :src="previewImage" style="width: 100%" />
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
  getEquipmentList,
  createEquipment,
  updateEquipment,
  deleteEquipment
} from '@/api/equipment'

// ========== 搜索表单 ==========

const searchForm = reactive({
  name: '',
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
    name: '',
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
  { title: '设备名称', dataIndex: 'name', width: 200 },
  {
    title: '基本信息',
    width: 300,
    customRender: ({ record }) => {
      return record.details?.base_info || '-'
    }
  },
  { title: '状态', key: 'status', width: 100 },
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
    const res = await getEquipmentList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取设备列表失败：', error)
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
 * 状态变化
 */
const handleStatusChange = async (record, checked) => {
  try {
    await updateEquipment(record.id, { status: checked ? 1 : 0 })
    message.success('状态更新成功')
    fetchTableData()
  } catch (error) {
    console.error('状态更新失败：', error)
  }
}

// ========== 新增/编辑设备 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增设备')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  details: {
    base_info: '',
    specs: '',
    image: []
  },
  status: 1
})

const formRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
}

const fileList = ref([])

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增设备'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    details: {
      base_info: '',
      specs: '',
      image: []
    },
    status: 1
  })
  fileList.value = []
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑设备'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    details: {
      base_info: record.details?.base_info || '',
      specs: record.details?.specs || '',
      image: record.details?.image || []
    },
    status: record.status
  })
  
  // 设置文件列表
  fileList.value = (record.details?.image || []).map((url, index) => ({
    uid: `-${index}`,
    name: `image-${index}.jpg`,
    status: 'done',
    url
  }))
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 从文件列表中提取图片URL
    const imageUrls = fileList.value.map((file) => file.url || file.response?.url).filter(Boolean)
    
    const data = {
      name: formData.name,
      details: {
        ...formData.details,
        image: imageUrls
      },
      status: formData.status
    }
    
    if (formData.id) {
      await updateEquipment(formData.id, data)
      message.success('更新成功')
    } else {
      await createEquipment(data)
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
const handleCancel = () => {
  formRef.value?.resetFields()
}

/**
 * 删除
 */
const handleDelete = async (record) => {
  try {
    await deleteEquipment(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

// ========== 图片上传 ==========

const previewVisible = ref(false)
const previewImage = ref('')

/**
 * 上传前处理
 */
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件！')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB！')
    return false
  }
  
  // TODO: 实现实际的图片上传逻辑
  message.warning('图片上传功能需要配置 OSS')
  return false
}

/**
 * 预览图片
 */
const handlePreview = (file) => {
  previewImage.value = file.url || file.thumbUrl
  previewVisible.value = true
}

/**
 * 移除图片
 */
const handleRemove = (file) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
})
</script>

<style lang="less" scoped>
.equipment-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
