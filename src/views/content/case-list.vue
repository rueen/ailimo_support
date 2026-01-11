<template>
  <div class="case-list-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="项目名称">
          <a-input
            v-model:value="searchForm.projectName"
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
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增案例
      </a-button>
    </div>

    <!-- 数据表格 -->
    <a-card>
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
    </a-card>

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
        <a-form-item label="项目名称" name="projectName">
          <a-input v-model:value="formData.projectName" placeholder="请输入项目名称" />
        </a-form-item>
        <a-form-item label="项目概述" name="projectSummary">
          <a-textarea
            v-model:value="formData.projectSummary"
            :rows="4"
            placeholder="请输入项目概述"
          />
        </a-form-item>
        <a-form-item label="项目成果" name="projectResult">
          <a-textarea
            v-model:value="formData.projectResult"
            :rows="4"
            placeholder="请输入项目成果"
          />
        </a-form-item>
        <a-form-item label="案例图片" name="images">
          <div class="image-list">
            <div v-for="(img, index) in formData.images" :key="index" class="image-item">
              <img :src="img" alt="案例图片" />
              <a-button
                type="link"
                danger
                size="small"
                @click="removeImage(index)"
              >
                删除
              </a-button>
            </div>
            <div class="upload-btn">
              <a-button @click="handleUpload">
                <PlusOutlined />
                上传图片
              </a-button>
              <div class="tip">支持 jpg、png、gif 格式，大小不超过 5MB</div>
            </div>
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
  getCaseList,
  createCase,
  updateCase,
  deleteCase
} from '@/api/content'

// ========== 搜索表单 ==========

const searchForm = reactive({
  projectName: '',
  status: undefined
})

const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    projectName: '',
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
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '项目名称', dataIndex: 'projectName', width: 200 },
  {
    title: '项目概述',
    dataIndex: 'projectSummary',
    ellipsis: true,
    customRender: ({ text }) => text || '-'
  },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
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
  projectName: '',
  projectSummary: '',
  projectResult: '',
  images: [],
  status: 1
})

const formRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectSummary: [{ required: true, message: '请输入项目概述', trigger: 'blur' }],
  projectResult: [{ required: true, message: '请输入项目成果', trigger: 'blur' }]
}

const handleAdd = () => {
  modalTitle.value = '新增案例'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    projectName: '',
    projectSummary: '',
    projectResult: '',
    images: [],
    status: 1
  })
}

const handleEdit = (record) => {
  modalTitle.value = '编辑案例'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    projectName: record.projectName,
    projectSummary: record.projectSummary,
    projectResult: record.projectResult,
    images: record.images || [],
    status: record.status
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      projectName: formData.projectName,
      projectSummary: formData.projectSummary,
      projectResult: formData.projectResult,
      images: formData.images,
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

// ========== 图片管理 ==========

const handleUpload = () => {
  message.info('图片上传功能需要配置 OSS，当前为演示模式')
  // TODO: 实现实际的图片上传功能
}

const removeImage = (index) => {
  formData.images.splice(index, 1)
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

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .image-item {
      position: relative;
      width: 120px;
      height: 120px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }

      .ant-btn {
        position: absolute;
        top: 4px;
        right: 4px;
      }
    }

    .upload-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        border-color: #1890ff;
      }

      .tip {
        margin-top: 8px;
        font-size: 12px;
        color: #999;
        text-align: center;
      }
    }
  }
}
</style>
