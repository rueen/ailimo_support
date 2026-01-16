<template>
  <div class="case-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="项目名称">
          <a-input
            v-model:value="searchForm.project_name"
            placeholder="请输入项目名称"
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
      <a-button
        v-if="userStore.hasPermission('case:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增案例
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
          <a-badge
            :status="record.status === 1 ? 'success' : 'default'"
            :text="record.status === 1 ? '启用' : '禁用'"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('case:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('case:delete')"
              title="确定删除该案例吗？"
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

    <!-- 新增/编辑案例对话框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="800"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 19 }"
      >
        <a-form-item label="项目名称" name="project_name">
          <a-input v-model:value="formData.project_name" placeholder="请输入项目名称" />
        </a-form-item>
        <a-form-item label="项目概述" name="project_summary">
          <a-textarea
            v-model:value="formData.project_summary"
            :rows="4"
            placeholder="请输入项目概述"
          />
        </a-form-item>
        <a-form-item label="项目成果" name="project_result">
          <a-textarea
            v-model:value="formData.project_result"
            :rows="4"
            placeholder="请输入项目成果"
          />
        </a-form-item>
        <a-form-item label="案例图片" name="images">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :custom-request="handleUpload"
            :before-upload="beforeUpload"
            @preview="handlePreview"
            accept="image/*"
            :multiple="true"
          >
            <div v-if="fileList.length + uploadingCount < 10">
              <LoadingOutlined v-if="uploadingCount > 0" />
              <PlusOutlined v-else />
              <div style="margin-top: 8px">
                {{ uploadingCount > 0 ? `上传中(${uploadingCount})` : '上传' }}
              </div>
            </div>
          </a-upload>
          <div style="color: #999; margin-top: 8px">
            最多上传10张图片，支持 jpg、png、gif、webp 格式，单张图片不超过5MB，上传前会自动压缩
          </div>
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
  PlusOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import {
  getCaseList,
  getCaseDetail,
  createCase,
  updateCase,
  deleteCase
} from '@/api/content'
import { uploadImage } from '@/api/upload'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// ========== 搜索表单 ==========

const searchForm = reactive({
  project_name: '',
  status: undefined
})

const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    project_name: '',
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
  { title: '项目名称', dataIndex: 'project_name', width: 200 },
  { title: '项目概述', dataIndex: 'project_summary', ellipsis: true, width: 200 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'created_at', width: 180 },
  { title: '更新时间', dataIndex: 'updated_at', width: 180 },
  { title: '操作', key: 'action', fixed: 'right', width: 150 }
]

const fetchTableData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getCaseList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取案例列表失败：', error)
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
    await updateCase(record.id, { status: checked ? 1 : 0 })
    message.success('状态更新成功')
    fetchTableData()
  } catch (error) {
    console.error('状态更新失败：', error)
  }
}

// ========== 新增/编辑 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增案例')
const formRef = ref()
const formData = reactive({
  id: null,
  project_name: '',
  project_summary: '',
  project_result: '',
  images: [],
  status: 1
})

const formRules = {
  project_name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  project_summary: [{ required: true, message: '请输入项目概述', trigger: 'blur' }],
  project_result: [{ required: true, message: '请输入项目成果', trigger: 'blur' }]
}

const handleAdd = () => {
  modalTitle.value = '新增案例'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    project_name: '',
    project_summary: '',
    project_result: '',
    images: [],
    status: 1
  })
  // 重置文件列表
  fileList.value = []
  uploadingCount.value = 0
}

const handleEdit = async (record) => {
  modalTitle.value = '编辑案例'
  modalVisible.value = true
  
  try {
    // 获取详情以获取完整数据
    const res = await getCaseDetail(record.id)
    const detail = res.data
    
    Object.assign(formData, {
      id: detail.id,
      project_name: detail.project_name,
      project_summary: detail.project_summary,
      project_result: detail.project_result,
      images: detail.images || [],
      status: detail.status
    })
    
    // 设置文件列表
    fileList.value = (detail.images || []).map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}.jpg`,
      status: 'done',
      url
    }))
  } catch (error) {
    console.error('获取案例详情失败：', error)
    message.error('获取案例详情失败')
    // 如果获取详情失败，使用列表数据
    Object.assign(formData, {
      id: record.id,
      project_name: record.project_name,
      project_summary: record.project_summary,
      project_result: record.project_result,
      images: record.images || [],
      status: record.status
    })
    fileList.value = (record.images || []).map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}.jpg`,
      status: 'done',
      url
    }))
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 从文件列表中提取图片URL
    const imageUrls = fileList.value.map((file) => file.url || file.response?.url).filter(Boolean)
    
    const data = {
      project_name: formData.project_name,
      project_summary: formData.project_summary,
      project_result: formData.project_result,
      images: imageUrls,
      status: formData.status
    }
    
    if (formData.id) {
      await updateCase(formData.id, data)
      message.success('更新成功')
    } else {
      await createCase(data)
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
    await deleteCase(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

// ========== 图片上传 ==========

const fileList = ref([])
const uploadingCount = ref(0) // 记录正在上传的文件数量
const previewVisible = ref(false)
const previewImage = ref('')

/**
 * 上传前校验（仅校验业务相关逻辑）
 */
const beforeUpload = (file) => {
  // 检查数量限制（包括正在上传的文件）
  const totalCount = fileList.value.length + uploadingCount.value
  if (totalCount >= 10) {
    message.error('最多只能上传 10 张图片')
    return false
  }
  
  // 文件类型、格式、大小的校验在 uploadImage 中统一处理
  return true
}

/**
 * 自定义上传（用于案例图片上传）
 */
const handleUpload = async ({ file, onProgress, onSuccess, onError }) => {
  // 为每个上传任务生成唯一的 key
  const uploadKey = `upload-${Date.now()}-${Math.random()}`
  
  try {
    uploadingCount.value++
    
    // 显示压缩提示
    message.loading({ content: '正在压缩图片...', key: uploadKey, duration: 0 })
    
    // 上传图片（内部会自动压缩并校验）
    const res = await uploadImage(file, {
      directory: 'case',
      compress: true,
      maxOriginalSize: 10, // 原始文件最大 10MB
      maxCompressedSize: 5, // 压缩后最大 5MB
      onCompress: () => {
        // 压缩完成，切换到上传提示（使用同一个 key 替换）
        message.loading({ 
          content: '正在上传图片...', 
          key: uploadKey,
          duration: 0
        })
      },
      onProgress: (percent) => {
        // 更新上传进度（使用同一个 key 替换）
        message.loading({ 
          content: `图片上传中... ${percent}%`, 
          key: uploadKey,
          duration: 0
        })
        onProgress({ percent })
      }
    })
    
    // 销毁上传提示
    message.destroy(uploadKey)
    
    if (res.code === 200 && res.data?.url) {
      onSuccess(res.data)
      message.success('上传成功')
    } else {
      throw new Error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败：', error)
    message.destroy(uploadKey)
    message.error(error.message || '上传失败')
    onError(error)
  } finally {
    uploadingCount.value--
  }
}

/**
 * 预览图片
 */
const handlePreview = (file) => {
  previewImage.value = file.url || file.thumbUrl
  previewVisible.value = true
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
})
</script>

<style lang="less" scoped>
.case-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
