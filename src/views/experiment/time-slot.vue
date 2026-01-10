<template>
  <div class="experiment-time-slot-container">
    <a-card>
      <div class="action-bar">
        <a-button type="primary" @click="handleAdd">
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
          <template v-if="column.key === 'displayTime'">
            {{ record.displayTime || `${record.startTime}-${record.endTime}` }}
          </template>
          <template v-else-if="column.key === 'status'">
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
    </a-card>

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
        <a-form-item label="开始时间" name="startTime">
          <a-time-picker
            v-model:value="formData.startTime"
            format="HH:mm"
            :value-format="'HH:mm:ss'"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="结束时间" name="endTime">
          <a-time-picker
            v-model:value="formData.endTime"
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
            placeholder="请输入描述信息（如：上午时段、下午时段等）"
          />
        </a-form-item>
        <a-form-item label="排序" name="sortOrder">
          <a-input-number
            v-model:value="formData.sortOrder"
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
  getExperimentTimeSlotList,
  createExperimentTimeSlot,
  updateExperimentTimeSlot,
  deleteExperimentTimeSlot
} from '@/api/experiment'

const loading = ref(false)
const tableData = ref([])

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '时间段', key: 'displayTime', width: 150 },
  { title: '开始时间', dataIndex: 'startTime', width: 120 },
  { title: '结束时间', dataIndex: 'endTime', width: 120 },
  { title: '描述', dataIndex: 'description', ellipsis: true },
  { title: '排序', dataIndex: 'sortOrder', width: 100 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', fixed: 'right', width: 200 }
]

const fetchTableData = async () => {
  try {
    loading.value = true
    const res = await getExperimentTimeSlotList()
    tableData.value = res.data
  } catch (error) {
    console.error('获取时间段列表失败：', error)
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (record, checked) => {
  try {
    await updateExperimentTimeSlot(record.id, { status: checked ? 1 : 0 })
    message.success('状态更新成功')
    fetchTableData()
  } catch (error) {
    console.error('状态更新失败：', error)
  }
}

// ========== 新增/编辑 ==========

const modalVisible = ref(false)
const modalTitle = ref('新增时间段')
const formRef = ref()
const formData = reactive({
  id: null,
  startTime: null,
  endTime: null,
  description: '',
  sortOrder: 0,
  status: 1
})

const formRules = {
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const handleAdd = () => {
  modalTitle.value = '新增时间段'
  modalVisible.value = true
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    startTime: null,
    endTime: null,
    description: '',
    sortOrder: 0,
    status: 1
  })
}

const handleEdit = (record) => {
  modalTitle.value = '编辑时间段'
  modalVisible.value = true
  Object.assign(formData, {
    id: record.id,
    startTime: record.startTime,
    endTime: record.endTime,
    description: record.description,
    sortOrder: record.sortOrder,
    status: record.status
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    const data = {
      startTime: formData.startTime,
      endTime: formData.endTime,
      description: formData.description,
      sortOrder: formData.sortOrder,
      status: formData.status
    }
    
    if (formData.id) {
      await updateExperimentTimeSlot(formData.id, data)
      message.success('更新成功')
    } else {
      await createExperimentTimeSlot(data)
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
    await deleteExperimentTimeSlot(record.id)
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
.experiment-time-slot-container {
  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
