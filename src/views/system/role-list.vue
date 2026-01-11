<template>
  <div class="role-list-container">
    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增角色
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
            <a-button type="link" size="small" @click="handlePermission(record)">
              权限配置
            </a-button>
            <a-popconfirm
              v-if="record.id !== 1"
              title="确定删除该角色吗？"
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

    <!-- 新增/编辑角色对话框 -->
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
        <a-form-item label="角色名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入角色名称"
            :disabled="formData.id === 1"
          />
        </a-form-item>
        <a-form-item label="角色描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限配置对话框 -->
    <a-modal
      v-model:open="permissionModalVisible"
      title="权限配置"
      :width="600"
      @ok="handlePermissionSubmit"
    >
      <a-tree
        v-model:checkedKeys="checkedPermissions"
        checkable
        :tree-data="permissionTree"
        :field-names="{ title: 'name', key: 'id', children: 'children' }"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getPermissionTree
} from '@/api/administrator'

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
  { title: '角色名称', dataIndex: 'name', width: 150 },
  { title: '角色描述', dataIndex: 'description' },
  { title: '创建时间', dataIndex: 'created_at', width: 180 },
  { title: '操作', key: 'action', fixed: 'right', width: 250 }
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
    const res = await getRoleList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取角色列表失败：', error)
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

// ========== 新增/编辑角色 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增角色')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增角色'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    description: ''
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑角色'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    description: record.description
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
      description: formData.description,
      permissionIds: [] // 创建时暂时为空，后续通过权限配置设置
    }
    
    if (formData.id) {
      await updateRole(formData.id, data)
      message.success('更新成功')
    } else {
      await createRole(data)
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
    await deleteRole(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

// ========== 权限配置 ==========

const permissionModalVisible = ref(false)
const permissionTree = ref([])
const checkedPermissions = ref([])
const currentRole = ref(null)

/**
 * 打开权限配置
 */
const handlePermission = async (record) => {
  currentRole.value = record
  permissionModalVisible.value = true
  
  // 加载权限树
  try {
    const res = await getPermissionTree()
    permissionTree.value = res.data
    
    // 设置已选中的权限
    if (record.permissions) {
      checkedPermissions.value = record.permissions.map((p) => p.id)
    } else {
      checkedPermissions.value = []
    }
  } catch (error) {
    console.error('加载权限树失败：', error)
  }
}

/**
 * 提交权限配置
 */
const handlePermissionSubmit = async () => {
  try {
    await updateRole(currentRole.value.id, {
      permissionIds: checkedPermissions.value
    })
    message.success('权限配置成功')
    permissionModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('权限配置失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
})
</script>

<style lang="less" scoped>
.role-list-container {
  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
