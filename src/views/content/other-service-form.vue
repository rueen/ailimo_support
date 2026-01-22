<template>
  <div class="other-service-form-container">
    <PageHeader :title="modalTitle" back-path="/content/other-service/list" />

    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="标题" name="title">
        <a-input 
          v-model:value="formData.title" 
          placeholder="请输入标题" 
          style="width: 400px" 
        />
      </a-form-item>
      
      <a-form-item label="内容" name="content">
        <quill-editor 
          v-model:content="formData.content"
          theme="snow"
          contentType="html"
          :toolbar="toolbarOptions"
          style="height: 400px;"
          placeholder="请输入服务内容"
          @ready="onQuillReady"
        />
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import {
  getOtherServiceDetail,
  createOtherService,
  updateOtherService
} from '@/api/other-service'
import { uploadImage } from '@/api/upload'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()

// 判断是新增还是编辑
const isEdit = computed(() => !!route.params.id)
const modalTitle = computed(() => isEdit.value ? '编辑其他服务' : '新增其他服务')

const formRef = ref()
const submitting = ref(false)
const formData = reactive({
  id: null,
  title: '',
  content: '',
  status: 1
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入服务内容', trigger: 'blur' }]
}

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
      directory: 'other-service',
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

/**
 * Quill编辑器准备完成后的处理
 * @param {Object} quill - Quill实例
 */
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
 * 加载其他服务详情（编辑时）
 */
const loadOtherServiceDetail = async () => {
  if (!isEdit.value) return
  
  try {
    const res = await getOtherServiceDetail(route.params.id)
    const record = res.data
    
    Object.assign(formData, {
      id: record.id,
      title: record.title,
      content: record.content,
      status: record.status
    })
  } catch (error) {
    console.error('获取其他服务详情失败：', error)
    message.error('获取其他服务详情失败')
    handleBack()
  }
}

/**
 * 返回列表页
 */
const handleBack = () => {
  router.push('/content/other-service/list')
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const data = {
      title: formData.title,
      content: formData.content,
      status: formData.status
    }
    
    if (isEdit.value) {
      await updateOtherService(formData.id, data)
      message.success('更新成功')
    } else {
      await createOtherService(data)
      message.success('创建成功')
    }
    
    // 返回列表页
    router.push('/content/other-service/list')
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

// ========== 初始化 ==========

onMounted(() => {
  if (isEdit.value) {
    loadOtherServiceDetail()
  }
})
</script>

<style lang="less" scoped>
.other-service-form-container {
  // 添加额外的空间以适应富文本编辑器
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }
  
  // 富文本编辑器样式调整
  :deep(.ql-container) {
    min-height: 400px;
  }
}
</style>
