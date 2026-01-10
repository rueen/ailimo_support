<template>
  <div class="administrator-list-container">
    <!-- 搜索表单 -->
    <a-card class="search-form" :bodyStyle="{ paddingBottom: 0 }">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="用户名">
          <a-input
            v-model:value="searchForm.username"
            placeholder="请输入用户名"
            allow-clear
            style="width: 180px"
          />
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-model:value="searchForm.roleId"
            placeholder="请选择角色"
            allow-clear
            style="width: 150px"
            :options="roleOptions"
            :field-names="{ label: 'name', value: 'id' }"
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
    </a-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        新增管理员
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
              :disabled="record.username === 'admin'"
              @change="(checked) => handleStatusChange(record, checked)"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                v-if="record.username !== 'admin'"
                title="确定删除该管理员吗？"
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

    <!-- 新增/编辑管理员对话框 -->
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
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            :disabled="!!formData.id"
          />
        </a-form-item>
        <a-form-item v-if="!formData.id" label="密码" name="password">
          <a-input-password v-model:value="formData.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item v-if="formData.id" label="新密码" name="password">
          <a-input-password
            v-model:value="formData.password"
            placeholder="不修改请留空"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-input v-model:value="formData.remark" placeholder="请输入备注" />
        </a-form-item>
        <a-form-item label="角色" name="roleId">
          <a-select
            v-model:value="formData.roleId"
            placeholder="请选择角色"
            :options="roleOptions"
            :field-names="{ label: 'name', value: 'id' }"
            :disabled="formData.username === 'admin'"
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
  getAdministratorList,
  createAdministrator,
  updateAdministrator,
  deleteAdministrator
} from '@/api/administrator'
import { getRoleList } from '@/api/administrator'

// ========== 搜索表单 ==========

const searchForm = reactive({
  username: '',
  roleId: undefined,
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
    username: '',
    roleId: undefined,
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
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 150 },
  { title: '备注', dataIndex: 'remark', width: 200 },
  {
    title: '角色',
    dataIndex: ['role', 'name'],
    width: 150,
    customRender: ({ record }) => record.role?.name || '-'
  },
  { title: '状态', key: 'status', width: 100 },
  { title: '最后登录', dataIndex: 'lastLoginTime', width: 180 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
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
    const res = await getAdministratorList(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取管理员列表失败：', error)
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
    await updateAdministrator(record.id, { status: checked ? 1 : 0 })
    message.success('状态更新成功')
    fetchTableData()
  } catch (error) {
    console.error('状态更新失败：', error)
  }
}

// ========== 新增/编辑管理员 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增管理员')
const formRef = ref()
const formData = reactive({
  id: null,
  username: '',
  password: '',
  remark: '',
  roleId: undefined,
  status: 1
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const roleOptions = ref([])

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增管理员'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    username: '',
    password: '',
    remark: '',
    roleId: undefined,
    status: 1
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑管理员'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    username: record.username,
    password: '',
    remark: record.remark,
    roleId: record.role?.id,
    status: record.status
  })
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = { ...formData }
    delete data.id
    
    // 如果是编辑且密码为空，删除密码字段
    if (formData.id && !data.password) {
      delete data.password
    }
    
    if (formData.id) {
      await updateAdministrator(formData.id, data)
      message.success('更新成功')
    } else {
      await createAdministrator(data)
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
    await deleteAdministrator(record.id)
    message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败：', error)
  }
}

/**
 * 加载角色选项
 */
const loadRoleOptions = async () => {
  try {
    const res = await getRoleList({ page: 1, pageSize: 100 })
    roleOptions.value = res.data.list
  } catch (error) {
    console.error('获取角色列表失败：', error)
  }
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
  loadRoleOptions()
})
</script>

<style lang="less" scoped>
.administrator-list-container {
  .search-form {
    margin-bottom: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
