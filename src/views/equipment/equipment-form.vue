<template>
  <div class="equipment-form-container">
    <PageHeader :title="modalTitle" back-path="/equipment/list" :need-confirm="true" />

    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="设备名称" name="name">
        <a-input v-model:value="formData.name" placeholder="请输入设备名称" style="width: 400px" />
      </a-form-item>
      
      <a-form-item label="基本信息" name="baseInfo">
        <a-textarea
          v-model:value="formData.details.base_info"
          :rows="4"
          placeholder="请输入设备基本信息"
          style="width: 600px"
        />
      </a-form-item>
      
      <a-form-item label="规格参数" name="specs">
        <a-textarea
          v-model:value="formData.details.specs"
          :rows="4"
          placeholder="请输入设备规格参数"
          style="width: 600px"
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
        <div style="color: #999; margin-top: 8px">
          最多上传5张图片，单张图片不超过5MB
        </div>
      </a-form-item>
      
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      
      <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
        <a-space>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            保存
          </a-button>
          <a-button @click="handleBack">取消</a-button>
        </a-space>
      </a-form-item>
    </a-form>

    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :footer="null">
      <img :src="previewImage" style="width: 100%" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getEquipmentDetail,
  createEquipment,
  updateEquipment
} from '@/api/equipment'

const route = useRoute()
const router = useRouter()

// 判断是新增还是编辑
const isEdit = computed(() => !!route.params.id)
const modalTitle = computed(() => isEdit.value ? '编辑设备' : '新增设备')

const formRef = ref()
const submitting = ref(false)
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
 * 加载设备详情（编辑时）
 */
const loadEquipmentDetail = async () => {
  if (!isEdit.value) return
  
  try {
    const res = await getEquipmentDetail(route.params.id)
    const record = res.data
    
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
  } catch (error) {
    console.error('获取设备详情失败：', error)
    message.error('获取设备详情失败')
    handleBack()
  }
}

const handleBack = () => {
  router.back()
}

/**
 * 提交
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
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
    
    if (isEdit.value) {
      await updateEquipment(formData.id, data)
      message.success('更新成功')
    } else {
      await createEquipment(data)
      message.success('创建成功')
    }
    
    // 返回列表页
    router.push('/equipment/list')
  } catch (error) {
    if (error?.errorFields) {
      // 表单验证错误，不显示错误消息
      return
    }
    console.error('提交失败：', error)
    message.error('提交失败')
  } finally {
    submitting.value = false
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
  if (isEdit.value) {
    loadEquipmentDetail()
  }
})
</script>

<style lang="less" scoped>

</style>
