<!--
 * @Author: diaochan
 * @Date: 2026-01-13
 * @Description: 系统配置管理
-->
<template>
  <div class="system-config-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="配置键">
          <a-input
            v-model:value="searchForm.config_key"
            placeholder="请输入配置键"
            allow-clear
            style="width: 200px"
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

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'config_value'">
          <a-typography-paragraph
            :ellipsis="{ rows: 2, expandable: true, symbol: '展开' }"
            :content="formatConfigValue(record.config_value)"
            style="max-width: 400px; margin: 0"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('system_config:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑对话框 -->
    <a-modal
      v-model:open="modalVisible"
      title="编辑系统配置"
      :width="800"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="配置键" name="config_key">
          <a-input
            v-model:value="formData.config_key"
            :disabled="!!formData.id"
            placeholder="请输入配置键"
          />
        </a-form-item>
        <a-form-item label="配置值" name="config_value">
          <a-textarea
            v-model:value="formData.config_value"
            placeholder="请输入配置值（JSON字符串）"
            :rows="8"
          />
          <div class="form-tip">
            <a-typography-text type="secondary">
              提示：配置值必须是有效的JSON字符串格式
            </a-typography-text>
          </div>
        </a-form-item>
        <a-form-item label="配置描述" name="description">
          <a-input
            v-model:value="formData.description"
            placeholder="请输入配置描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import {
  getSystemConfigList,
  getSystemConfig,
  updateSystemConfig
} from '@/api/content'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const loading = ref(false)
const tableData = ref([])

// ========== 搜索表单 ==========

const searchForm = reactive({
  config_key: ''
})

/**
 * 查询
 */
const handleSearch = () => {
  fetchTableData()
}

/**
 * 重置
 */
const handleReset = () => {
  searchForm.config_key = ''
  handleSearch()
}

/**
 * 格式化配置值显示
 * @param {string} value - 配置值
 * @returns {string} 格式化后的值
 */
const formatConfigValue = (value) => {
  if (!value) return ''
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return value
  }
}

/**
 * 表格列配置
 */
const columns = [
  { title: '配置键', dataIndex: 'config_key' },
  { title: '配置值', key: 'config_value', ellipsis: true },
  { title: '描述', dataIndex: 'description' },
  { title: '更新时间', dataIndex: 'updated_at' },
  { title: '操作', key: 'action', fixed: 'right' }
]

/**
 * 获取表格数据
 */
const fetchTableData = async () => {
  try {
    loading.value = true
    const res = await getSystemConfigList()
    let list = res.data || []
    
    // 如果有搜索条件，进行过滤
    if (searchForm.config_key) {
      list = list.filter(item =>
        item.config_key?.toLowerCase().includes(searchForm.config_key.toLowerCase())
      )
    }
    
    tableData.value = list
  } catch (error) {
    console.error('获取系统配置列表失败：', error)
    message.error('获取系统配置列表失败')
  } finally {
    loading.value = false
  }
}

// ========== 编辑 ==========

const modalVisible = ref(false)
const formRef = ref()
const formData = reactive({
  id: null,
  config_key: '',
  config_value: '',
  description: ''
})

/**
 * 表单验证规则
 */
const formRules = {
  config_key: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  config_value: [
    { required: true, message: '请输入配置值', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (!value) {
          return Promise.resolve()
        }
        try {
          JSON.parse(value)
          return Promise.resolve()
        } catch (e) {
          return Promise.reject('配置值必须是有效的JSON字符串格式')
        }
      },
      trigger: 'blur'
    }
  ]
}

/**
 * 编辑
 */
const handleEdit = async (record) => {
  try {
    // 重新获取最新配置数据
    const res = await getSystemConfig(record.config_key)
    const config = res.data
    
    modalVisible.value = true
    Object.assign(formData, {
      id: config.id,
      config_key: config.config_key,
      config_value: formatConfigValue(config.config_value),
      description: config.description || ''
    })
  } catch (error) {
    console.error('获取配置详情失败：', error)
    message.error('获取配置详情失败')
  }
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const data = {
      config_value: formData.config_value.trim(),
      description: formData.description || ''
    }
    
    await updateSystemConfig(formData.config_key, data)
    message.success('更新成功')
    
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    if (error.errorFields) {
      return
    }
    console.error('更新失败：', error)
    message.error(error.message || '更新失败')
  }
}

/**
 * 取消
 */
const handleCancel = () => {
  formRef.value?.resetFields()
}

// ========== 初始化 ==========

onMounted(() => {
  fetchTableData()
})
</script>

<style lang="less" scoped>
.system-config-container {
  .search-form {
    margin-bottom: 16px;
  }

  .form-tip {
    margin-top: 4px;
  }
}
</style>
