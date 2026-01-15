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
        <quill-editor 
          v-model:content="formData.details.base_info"
          theme="snow"
          contentType="html"
          :toolbar="toolbarOptions"
          style="height: 250px;"
          placeholder="请输入设备基本信息"
          @ready="onQuillReady"
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
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getEquipmentDetail,
  createEquipment,
  updateEquipment
} from '@/api/equipment'
import { uploadImage } from '@/api/upload'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

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
const uploadingCount = ref(0) // 记录正在上传的文件数量

// 自定义工具栏配置，确保包含图片按钮
const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image'], // 确保包含图片按钮
  ['clean']
]
/**
 * 图片上传函数（用于Quill编辑器）
 * @param {File} file - 图片文件
 * @returns {Promise<string>} 图片URL
 */
const uploadImageToServer = async (file) => {
  try {
    // 显示压缩提示
    message.loading({ content: '正在压缩图片...', key: 'quill-upload', duration: 0 })
    
    // 上传图片（内部会自动压缩并校验压缩后的大小）
    const res = await uploadImage(file, {
      directory: 'equipment',
      compress: true, // 启用压缩
      maxOriginalSize: 10, // 原始文件最大 10MB
      maxCompressedSize: 5, // 压缩后最大 5MB
      onCompress: () => {
        // 压缩完成，切换到上传提示
        message.loading({ 
          content: '正在上传图片...', 
          key: 'quill-upload',
          duration: 0
        })
      },
      onProgress: (percent) => {
        // 更新上传进度（使用同一个 key 替换）
        message.loading({ 
          content: `图片上传中... ${percent}%`, 
          key: 'quill-upload',
          duration: 0
        })
      }
    })
    
    if (res.code === 200 && res.data?.url) {
      return res.data.url
    } else {
      throw new Error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('图片上传失败：', error)
    throw error
  }
}
// Quill编辑器准备完成后的处理
const onQuillReady = (quill) => {
  // 获取工具栏的图片按钮
  const toolbar = quill.getModule('toolbar')
  if (toolbar) {
    // 重写图片按钮的点击事件
    toolbar.addHandler('image', () => {
      // 创建文件选择器
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.click()
      
      input.onchange = async () => {
        const file = input.files[0]
        if (!file) return
        
        try {
          // 上传图片（内部会显示压缩和上传进度）
          const imageUrl = await uploadImageToServer(file)
          
          // 销毁所有上传相关的提示
          message.destroy('quill-upload')
          
          // 获取当前光标位置
          const range = quill.getSelection(true)
          
          // 插入图片
          quill.insertEmbed(range.index, 'image', imageUrl)
          
          // 移动光标到图片后面
          quill.setSelection(range.index + 1)
          
          message.success('图片上传成功！')
        } catch (error) {
          console.error('图片上传失败:', error)
          message.destroy('quill-upload')
          message.error(error.message || '图片上传失败，请重试')
        }
      }
    })
  }
}

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
 * 自定义上传（用于设备图片上传）
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
      directory: 'equipment',
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
  if (isEdit.value) {
    loadEquipmentDetail()
  }
})
</script>

<style lang="less" scoped>

</style>
