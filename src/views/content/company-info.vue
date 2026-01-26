<template>
  <PageHeader title="公司信息管理" />
  <div class="company-info-container" v-if="!loading">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 3 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="公司名称" name="company_name">
        <a-input v-model:value="formData.company_name" placeholder="请输入公司名称" />
      </a-form-item>
      <a-form-item label="公司地址" name="company_address">
        <a-input v-model:value="formData.company_address" placeholder="请输入公司地址" />
      </a-form-item>
      <a-form-item label="联系电话" name="contact_phone">
        <a-input v-model:value="formData.contact_phone" placeholder="请输入联系电话" />
      </a-form-item>
      <a-form-item label="电子邮箱" name="email">
        <a-input v-model:value="formData.email" placeholder="请输入电子邮箱" />
      </a-form-item>
      <a-form-item label="工作时间" name="work_time">
        <a-input v-model:value="formData.work_time" placeholder="例如：周一至周五 9:00-18:00" />
      </a-form-item>
      <a-form-item label="公司简介" name="company_intro">
        <a-textarea
          v-model:value="formData.company_intro"
          :rows="6"
          placeholder="请输入公司简介"
        />
      </a-form-item>
      <a-form-item label="服务理念" name="service_concept">
        <a-textarea
          v-model:value="formData.service_concept"
          :rows="4"
          placeholder="请输入服务理念"
        />
      </a-form-item>
      <a-form-item label="Banner图片" name="banner_image">
        <a-upload
          v-model:file-list="fileList"
          list-type="picture-card"
          :custom-request="handleUpload"
          :before-upload="beforeUpload"
          @preview="handlePreview"
          accept="image/*"
          :multiple="false"
        >
          <div v-if="fileList.length + uploadingCount < 1">
            <LoadingOutlined v-if="uploadingCount > 0" />
            <PlusOutlined v-else />
            <div style="margin-top: 8px">
              {{ uploadingCount > 0 ? `上传中(${uploadingCount})` : '上传' }}
            </div>
          </div>
        </a-upload>
      </a-form-item>
      <a-form-item label="视频链接" name="video_url">
        <a-input
          v-model:value="formData.video_url"
          placeholder="请输入视频链接URL，例如：https://example.com/video.mp4"
        />
      </a-form-item>
      <a-form-item label="价格表" name="price_list">
        <a-upload
          v-model:file-list="documentList"
          :custom-request="handleDocumentUpload"
          :before-upload="beforeDocumentUpload"
          @remove="handleDocumentRemove"
          accept=".doc,.docx,.xls,.xlsx,.pdf,.txt,.ppt,.pptx"
          :max-count="1"
        >
          <a-button>
            <UploadOutlined />
            上传文档
          </a-button>
        </a-upload>
        <div style="color: #999; margin-top: 8px; font-size: 12px">
          支持格式：doc, docx, xls, xlsx, pdf, txt, ppt, pptx，最大 20MB
        </div>
        <div v-if="documentList.length > 0 && documentList[0].url" style="margin-top: 8px">
          <a-button
            type="link"
            size="small"
            @click="handleDownloadDocument(documentList[0])"
          >
            <FileTextOutlined />
            查看/下载文档
          </a-button>
        </div>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 3 }" v-if="userStore.hasPermission('company_info:update')">
        <a-space>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">
            <SaveOutlined />
            保存
          </a-button>
          <a-button @click="handleReset">
            <ReloadOutlined />
            重置
          </a-button>
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
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  LoadingOutlined,
  UploadOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getCompanyInfo,
  updateCompanyInfo
} from '@/api/content'
import { uploadImage, uploadDocument } from '@/api/upload'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)
const formRef = ref()

/**
 * 表单数据
 */
const formData = reactive({
  company_name: '',
  company_address: '',
  contact_phone: '',
  email: '',
  work_time: '',
  company_intro: '',
  service_concept: '',
  banner_image: [],
  video_url: '',
  price_list: ''
})

/**
 * 原始数据备份（用于重置）
 */
let originalData = {}

// ========== 图片上传 ==========

const fileList = ref([])
const uploadingCount = ref(0) // 记录正在上传的文件数量
const previewVisible = ref(false)
const previewImage = ref('')

// ========== 文档上传 ==========

const documentList = ref([])
const documentUploading = ref(false)

/**
 * 加载公司信息
 */
const loadCompanyInfo = async () => {
  try {
    loading.value = true
    const res = await getCompanyInfo()
    const data = res.data || {}
    
    Object.assign(formData, data)
    
    // 将 banner_image 转换为 fileList 格式
    fileList.value = (data.banner_image || []).map((url, index) => ({
      uid: `-${index}`,
      name: `banner-${index}.jpg`,
      status: 'done',
      url
    }))
    
    // 将 price_list 转换为 documentList 格式
    if (data.price_list) {
      documentList.value = [{
        uid: '-doc-0',
        name: data.price_list.split('/').pop() || '价格表',
        status: 'done',
        url: data.price_list,
        originalName: data.price_list.split('/').pop() || '价格表'
      }]
    } else {
      documentList.value = []
    }
    
    // 备份原始数据
    originalData = { ...res.data }
  } catch (error) {
    console.error('加载公司信息失败：', error)
  } finally {
    loading.value = false
  }
}

/**
 * 提交保存
 */
const handleSubmit = async () => {
  try {
    submitting.value = true
    
    // 从文件列表中提取图片URL
    const imageUrls = fileList.value.map((file) => file.url || file.response?.url).filter(Boolean)
    
    // 从文档列表中提取文档URL
    const priceListUrl = documentList.value.length > 0 
      ? (documentList.value[0].url || documentList.value[0].response?.url || '')
      : ''
    
    const data = {
      ...formData,
      banner_image: imageUrls,
      price_list: priceListUrl
    }
    
    await updateCompanyInfo(data)
    message.success('保存成功')
    
    // 更新 formData 和原始数据
    formData.banner_image = imageUrls
    formData.price_list = priceListUrl
    originalData = { ...data }
  } catch (error) {
    console.error('保存失败：', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 重置表单
 */
const handleReset = () => {
  Object.assign(formData, originalData)
  
  // 重置文件列表
  fileList.value = (originalData.banner_image || []).map((url, index) => ({
    uid: `-${index}`,
    name: `banner-${index}.jpg`,
    status: 'done',
    url
  }))
  
  // 重置文档列表
  if (originalData.price_list) {
    documentList.value = [{
      uid: '-doc-0',
      name: originalData.price_list.split('/').pop() || '价格表',
      status: 'done',
      url: originalData.price_list,
      originalName: originalData.price_list.split('/').pop() || '价格表'
    }]
  } else {
    documentList.value = []
  }
  
  message.info('已重置为上次保存的数据')
}

/**
 * 上传前校验
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
 * 自定义上传（用于Banner图片上传）
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
      directory: 'company',
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

/**
 * 文档上传前校验
 */
const beforeDocumentUpload = (file) => {
  // 检查数量限制
  if (documentList.value.length >= 1) {
    message.error('最多只能上传 1 个文档')
    return false
  }
  
  // 文件类型、格式、大小的校验在 uploadDocument 中统一处理
  return true
}

/**
 * 文档上传处理
 */
const handleDocumentUpload = async ({ file, onProgress, onSuccess, onError }) => {
  const uploadKey = `doc-upload-${Date.now()}-${Math.random()}`
  
  try {
    documentUploading.value = true
    
    message.loading({ content: '正在上传文档...', key: uploadKey, duration: 0 })
    
    const res = await uploadDocument(file, {
      directory: 'price-list',
      onProgress: (percent) => {
        message.loading({ 
          content: `文档上传中... ${percent}%`, 
          key: uploadKey,
          duration: 0
        })
        onProgress({ percent })
      },
      maxSize: 20
    })
    
    message.destroy(uploadKey)
    
    if (res.code === 200 && res.data?.url) {
      // 更新文件列表，添加原始文件名
      const fileItem = {
        ...file,
        url: res.data.url,
        originalName: res.data.originalName || file.name,
        response: res.data
      }
      onSuccess(fileItem)
      message.success('上传成功')
    } else {
      throw new Error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('文档上传失败：', error)
    message.destroy(uploadKey)
    message.error(error.message || '上传失败')
    onError(error)
  } finally {
    documentUploading.value = false
  }
}

/**
 * 删除文档
 */
const handleDocumentRemove = () => {
  formData.price_list = ''
  return true
}

/**
 * 下载文档
 */
const handleDownloadDocument = (file) => {
  if (file.url) {
    window.open(file.url, '_blank')
  }
}

// ========== 初始化 ==========

onMounted(() => {
  loadCompanyInfo()
})
</script>

<style lang="less" scoped>
.company-info-container {
  max-width: 1000px;
}
</style>
