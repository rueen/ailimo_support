<template>
  <div class="organization-container">
    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增组织机构
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
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定删除该组织机构吗？"
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
        <a-form-item label="机构名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入机构名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getOrganizationList,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from '@/api/organization'

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
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '机构名称', dataIndex: 'name' },
  { title: '创建时间', dataIndex: 'created_at', width: 200 },
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
      pageSize: pagination.pageSize
    }
    const res = await getOrganizationList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取组织机构列表失败：', error)
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
const modalTitle = ref('新增组织机构')
const formRef = ref()
const formData = reactive({
  id: null,
  name: ''
})

const formRules = {
  name: [{ required: true, message: '请输入机构名称', trigger: 'blur' }]
}

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增组织机构'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: ''
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑组织机构'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name
  })
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = { name: formData.name }
    
    if (formData.id) {
      await updateOrganization(formData.id, data)
      message.success('更新成功')
    } else {
      await createOrganization(data)
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
    await deleteOrganization(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
})
</script>

<style lang="less" scoped>
.organization-container {
  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
