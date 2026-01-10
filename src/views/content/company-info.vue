<template>
  <div class="company-info-container">
    <a-card title="公司信息管理" :loading="loading">
      <a-form
        ref="formRef"
        :model="formData"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="公司名称" name="companyName">
          <a-input v-model:value="formData.companyName" placeholder="请输入公司名称" />
        </a-form-item>
        <a-form-item label="公司地址" name="companyAddress">
          <a-input v-model:value="formData.companyAddress" placeholder="请输入公司地址" />
        </a-form-item>
        <a-form-item label="联系电话" name="contactPhone">
          <a-input v-model:value="formData.contactPhone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="电子邮箱" name="email">
          <a-input v-model:value="formData.email" placeholder="请输入电子邮箱" />
        </a-form-item>
        <a-form-item label="工作时间" name="workTime">
          <a-input v-model:value="formData.workTime" placeholder="例如：周一至周五 9:00-18:00" />
        </a-form-item>
        <a-form-item label="公司简介" name="companyIntro">
          <a-textarea
            v-model:value="formData.companyIntro"
            :rows="6"
            placeholder="请输入公司简介"
          />
        </a-form-item>
        <a-form-item label="服务理念" name="serviceConcept">
          <a-textarea
            v-model:value="formData.serviceConcept"
            :rows="4"
            placeholder="请输入服务理念"
          />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 3 }">
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
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import {
  getCompanyInfo,
  updateCompanyInfo
} from '@/api/content'

const loading = ref(false)
const submitting = ref(false)
const formRef = ref()

/**
 * 表单数据
 */
const formData = reactive({
  companyName: '',
  companyAddress: '',
  contactPhone: '',
  email: '',
  workTime: '',
  companyIntro: '',
  serviceConcept: ''
})

/**
 * 原始数据备份（用于重置）
 */
let originalData = {}

/**
 * 加载公司信息
 */
const loadCompanyInfo = async () => {
  try {
    loading.value = true
    const res = await getCompanyInfo()
    Object.assign(formData, res.data)
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
    await updateCompanyInfo(formData)
    message.success('保存成功')
    // 更新原始数据
    originalData = { ...formData }
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
  message.info('已重置为上次保存的数据')
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
