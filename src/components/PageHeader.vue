<template>
  <div class="page-header">
    <ArrowLeftOutlined class="page-header-back" @click="handleBack" />
    <h2 class="page-header-title">
      <slot>{{ title }}</slot>
    </h2>
  </div>
</template>

<script setup>
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

/**
 * 组件属性
 */
const props = defineProps({
  // 标题文本
  title: {
    type: String,
    default: ''
  },
  // 返回路径（字符串或函数）
  // 如果为字符串，则跳转到该路径
  // 如果为函数，则执行该函数
  // 如果不提供，则返回上一页
  backPath: {
    type: [String, Function],
    default: null
  },
  // 是否需要确认返回（用于未保存提示等）
  needConfirm: {
    type: Boolean,
    default: false
  },
  // 确认提示文本
  confirmText: {
    type: String,
    default: '确定要返回吗？未保存的更改将丢失。'
  }
})

const router = useRouter()

/**
 * 处理返回
 */
const handleBack = () => {
  if (props.needConfirm) {
    import('ant-design-vue').then(({ Modal }) => {
      Modal.confirm({
        title: '确认返回',
        content: props.confirmText,
        onOk: () => {
          executeBack()
        }
      })
    })
  } else {
    executeBack()
  }
}

/**
 * 执行返回操作
 */
const executeBack = () => {
  if (typeof props.backPath === 'function') {
    props.backPath()
  } else if (typeof props.backPath === 'string') {
    router.push(props.backPath)
  } else {
    router.back()
  }
}
</script>

<style lang="less" scoped>
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  .page-header-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: 12px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
    
    &:hover {
      color: #1890ff;
      background-color: #f0f0f0;
    }
    
    &:active {
      background-color: #e0e0e0;
    }
  }
  
  .page-header-title {
    font-size: 20px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin: 0;
  }
}
</style>
