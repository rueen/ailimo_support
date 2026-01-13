<template>
  <div class="permission-list-container">
    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button
        v-if="userStore.hasPermission('permission:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增权限
      </a-button>
    </div>

    <!-- 权限树形表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      row-key="id"
      :default-expand-all-rows="true"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'code'">
          <a-tag>{{ record.code }}</a-tag>
        </template>
        <template v-else-if="column.key === 'method'">
          <a-tag v-if="record.method" :color="getMethodColor(record.method)">
            {{ record.method }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('permission:create')"
              type="link"
              size="small"
              @click="handleAddChild(record)"
            >
              添加子权限
            </a-button>
            <a-button
              v-if="userStore.hasPermission('permission:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('permission:delete')"
              title="确定删除该权限吗？删除后无法恢复"
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

    <!-- 新增/编辑权限对话框 -->
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
        <a-form-item label="权限名称" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入权限名称"
          />
        </a-form-item>
        <a-form-item label="权限代码" name="code">
          <a-input
            v-model:value="formData.code"
            placeholder="请输入权限代码（唯一，如：equipment:list）"
          />
        </a-form-item>
        <a-form-item label="资源路径" name="resource">
          <a-input
            v-model:value="formData.resource"
            placeholder="请输入资源路径（如：/api/support/equipment）"
          />
        </a-form-item>
        <a-form-item label="请求方法" name="method">
          <a-select
            v-model:value="formData.method"
            placeholder="请选择请求方法"
            allow-clear
          >
            <a-select-option value="GET">GET</a-select-option>
            <a-select-option value="POST">POST</a-select-option>
            <a-select-option value="PUT">PUT</a-select-option>
            <a-select-option value="DELETE">DELETE</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="父级权限" name="parent_id">
          <a-tree-select
            v-model:value="formData.parent_id"
            :tree-data="permissionTreeOptions"
            placeholder="请选择父级权限（不选则为顶级权限）"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        <a-form-item label="排序" name="sort_order">
          <a-input-number
            v-model:value="formData.sort_order"
            :min="0"
            placeholder="请输入排序值"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getPermissionTree,
  createPermission,
  updatePermission,
  deletePermission
} from '@/api/administrator'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const loading = ref(false)
const tableData = ref([])
const permissionTree = ref([])

/**
 * 表格列配置
 */
const columns = [
  { title: '权限名称', dataIndex: 'name', width: 200 },
  { title: '权限代码', key: 'code', width: 200 },
  { title: '资源路径', dataIndex: 'resource', width: 250 },
  { title: '请求方法', key: 'method', width: 100 },
  { title: '排序', dataIndex: 'sort_order', width: 80 },
  { title: '操作', key: 'action', fixed: 'right', width: 280 }
]

/**
 * 获取请求方法的颜色
 */
const getMethodColor = (method) => {
  const colorMap = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red'
  }
  return colorMap[method] || 'default'
}

/**
 * 获取表格数据
 */
const fetchTableData = async () => {
  try {
    loading.value = true
    const res = await getPermissionTree()
    permissionTree.value = res.data
    // 直接使用树形数据，Table组件会自动处理树形展示
    tableData.value = res.data
  } catch (error) {
    console.error('获取权限列表失败：', error)
    message.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 权限树选项（用于父级权限选择）
 */
const permissionTreeOptions = computed(() => {
  const buildOptions = (tree) => {
    return tree.map((node) => ({
      id: node.id,
      name: node.name,
      children: node.children && node.children.length > 0 ? buildOptions(node.children) : []
    }))
  }
  return buildOptions(permissionTree.value)
})

// ========== 新增/编辑 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增权限')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  code: '',
  resource: '',
  method: '',
  parent_id: null,
  sort_order: 0
})

const formRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限代码', trigger: 'blur' }],
  // resource: [{ required: true, message: '请输入资源路径', trigger: 'blur' }],
  // method: [{ required: true, message: '请选择请求方法', trigger: 'change' }]
}

/**
 * 新增权限
 */
const handleAdd = () => {
  modalTitle.value = '新增权限'
  resetForm()
  modalVisible.value = true
}

/**
 * 添加子权限
 */
const handleAddChild = (record) => {
  modalTitle.value = '新增子权限'
  resetForm()
  formData.parent_id = record.id
  modalVisible.value = true
}

/**
 * 编辑权限
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑权限'
  Object.assign(formData, {
    id: record.id,
    name: record.name,
    code: record.code,
    resource: record.resource,
    method: record.method,
    parent_id: record.parent_id || null,
    sort_order: record.sort_order || 0
  })
  modalVisible.value = true
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      name: formData.name,
      code: formData.code,
      resource: formData.resource,
      method: formData.method,
      parent_id: formData.parent_id || 0,
      sort_order: formData.sort_order || 0
    }
    if (formData.id) {
      await updatePermission(formData.id, data)
      message.success('更新成功')
    } else {
      await createPermission(data)
      message.success('创建成功')
    }
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    if (error.errorFields) {
      return
    }
    console.error('操作失败：', error)
    message.error(error.message || '操作失败')
  }
}

/**
 * 取消
 */
const handleCancel = () => {
  resetForm()
}

/**
 * 重置表单
 */
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    code: '',
    resource: '',
    method: '',
    parent_id: null,
    sort_order: 0
  })
  formRef.value?.resetFields()
}

// ========== 删除 ==========

/**
 * 删除权限
 */
const handleDelete = async (record) => {
  try {
    await deletePermission(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
    message.error(error.message || '删除失败')
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
})
</script>

<style lang="less" scoped>
.permission-list-container {
  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
