<template>
  <div class="time-slot-container">
    <div class="action-bar">
      <a-button
        v-if="userStore.hasPermission('equipment_time_slot:create')"
        type="primary"
        @click="handleAdd"
      >
        <PlusOutlined />
        新增时间段
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'display_time'">
          {{ record.display_time || `${record.start_time}-${record.end_time}` }}
        </template>
        <template v-else-if="column.key === 'status'">
          <a-badge
            :status="record.status === 1 ? 'success' : 'default'"
            :text="record.status === 1 ? '启用' : '禁用'"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="userStore.hasPermission('equipment_time_slot:update')"
              type="link"
              size="small"
              @click="handleEdit(record)"
            >
              编辑
            </a-button>
            <a-popconfirm
              v-if="userStore.hasPermission('equipment_time_slot:delete')"
              title="确定删除该时间段吗？"
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
        <a-form-item label="开始时间" name="start_time">
          <a-time-picker
            v-model:value="formData.start_time"
            format="HH:mm"
            :value-format="'HH:mm:ss'"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="结束时间" name="end_time">
          <a-time-picker
            v-model:value="formData.end_time"
            format="HH:mm"
            :value-format="'HH:mm:ss'"
            placeholder="请选择结束时间"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            :rows="3"
            placeholder="请输入描述信息（可选）"
          />
        </a-form-item>
        <a-form-item label="排序" name="sort_order">
          <a-input-number
            v-model:value="formData.sort_order"
            :min="0"
            :max="1000"
            placeholder="排序值越小越靠前"
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
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getTimeSlotList,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} from '@/api/equipment'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const loading = ref(false)
const tableData = ref([])

/**
 * 表格列配置
 */
const columns = [
  { title: '时间段', key: 'display_time', width: 150 },
  { title: '开始时间', dataIndex: 'start_time', width: 120 },
  { title: '结束时间', dataIndex: 'end_time', width: 120 },
  { title: '描述', dataIndex: 'description', ellipsis: true },
  { title: '排序', dataIndex: 'sort_order', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
]

/**
 * 获取时间段列表
 */
const fetchTableData = async () => {
  try {
    loading.value = true
    const res = await getTimeSlotList()
    tableData.value = res.data
  } catch (error) {
    console.error('获取时间段列表失败：', error)
    message.error('获取时间段列表失败')
  } finally {
    loading.value = false
  }
}

// ========== 新增/编辑 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增时间段')
const formRef = ref()
const formData = reactive({
  id: null,
  start_time: null,
  end_time: null,
  description: '',
  sort_order: 0,
  status: 1
})

const formRules = {
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

/**
 * 新增
 */
const handleAdd = () => {
  modalTitle.value = '新增时间段'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    start_time: null,
    end_time: null,
    description: '',
    sort_order: 0,
    status: 1
  })
}

/**
 * 编辑
 */
const handleEdit = (record) => {
  modalTitle.value = '编辑时间段'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    start_time: record.start_time,
    end_time: record.end_time,
    description: record.description || '',
    sort_order: record.sort_order || 0,
    status: record.status
  })
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 验证结束时间必须大于开始时间
    if (formData.start_time && formData.end_time) {
      const start = formData.start_time
      const end = formData.end_time
      if (start >= end) {
        message.error('结束时间必须大于开始时间')
        return
      }
    }
    
    const data = {
      start_time: formData.start_time,
      end_time: formData.end_time,
      description: formData.description,
      sort_order: formData.sort_order,
      status: formData.status
    }
    
    if (formData.id) {
      await updateTimeSlot(formData.id, data)
      message.success('更新成功')
    } else {
      await createTimeSlot(data)
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
    await deleteTimeSlot(record.id)
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
.time-slot-container {
  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
