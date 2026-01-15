<template>
  <a-layout class="basic-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      :style="{ overflow: 'auto' }"
      theme="dark"
    >
      <div class="logo">
        <span v-if="!collapsed">艾力默管理端</span>
        <span v-else>艾力默</span>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        :items="menuItems"
        @click="handleMenuClick"
      />
    </a-layout-sider>

    <!-- 右侧内容区 -->
    <a-layout>
      <!-- 顶部导航栏 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="toggleCollapsed"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="toggleCollapsed"
          />
        </div>

        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32" :style="{ backgroundColor: '#1890ff' }">
                {{ userStore.userInfo?.username?.charAt(0)?.toUpperCase() }}
              </a-avatar>
              <span class="username">{{ userStore.userInfo?.username }}</span>
              <DownOutlined />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleChangePassword">
                  <KeyOutlined />
                  修改密码
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>

    <!-- 修改密码对话框 -->
    <a-modal
      v-model:open="passwordModalVisible"
      title="修改密码"
      @ok="handlePasswordSubmit"
      @cancel="handlePasswordCancel"
    >
      <a-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        layout="vertical"
      >
        <a-form-item label="旧密码" name="oldPassword">
          <a-input-password v-model:value="passwordForm.oldPassword" />
        </a-form-item>
        <a-form-item label="新密码" name="newPassword">
          <a-input-password v-model:value="passwordForm.newPassword" />
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password v-model:value="passwordForm.confirmPassword" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, reactive, computed, h, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  LogoutOutlined,
  KeyOutlined,
  HomeOutlined,
  UserOutlined,
  ExperimentOutlined,
  SettingOutlined,
  ToolOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BulbOutlined,
  ShoppingOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons-vue'
import { useUserStore, useAppStore } from '@/store'
import { changePassword } from '@/api/auth'
import routerInstance from '@/router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const collapsed = computed({
  get: () => appStore.collapsed,
  set: (val) => appStore.setCollapsed(val)
})

const selectedKeys = ref([route.name])
const openKeys = ref([])

/**
 * 图标映射
 */
const iconMap = {
  HomeOutlined,
  UserOutlined,
  ExperimentOutlined,
  SettingOutlined,
  ToolOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BulbOutlined,
  ShoppingOutlined,
  MedicineBoxOutlined
}

/**
 * 获取图标组件
 */
const getIcon = (iconName) => {
  if (!iconName) return null
  const IconComponent = iconMap[iconName]
  return IconComponent ? () => h(IconComponent) : null
}

/**
 * 检查是否有权限
 */
const hasPermission = (permission) => {
  if (!permission) return true // 没有设置权限要求，默认允许访问
  return userStore.hasPermission(permission)
}

/**
 * 从路由生成菜单项
 */
const generateMenuItems = (routes) => {
  return routes
    .filter((route) => {
      // 过滤掉隐藏的菜单项
      if (route.meta?.hideInMenu) {
        return false
      }
      // 过滤掉没有权限的路由
      if (route.meta?.permission !== null && route.meta?.permission !== undefined) {
        return hasPermission(route.meta.permission)
      }
      // 如果没有设置权限，默认显示（如首页）
      return true
    })
    .map((route) => {
      const menuItem = {
        key: route.name,
        label: route.meta?.title || route.name,
        title: route.meta?.title || route.name
      }

      // 添加图标
      if (route.meta?.icon) {
        const icon = getIcon(route.meta.icon)
        if (icon) {
          menuItem.icon = icon
        }
      }

      // 处理子路由
      if (route.children && route.children.length > 0) {
        const children = generateMenuItems(route.children)
        // 只有当有子菜单且有权限的子菜单时，才显示父菜单
        if (children.length > 0) {
          menuItem.children = children
        } else {
          // 如果没有有权限的子菜单，不显示父菜单
          return null
        }
      }

      return menuItem
    })
    .filter((item) => item !== null) // 过滤掉 null 项
}

/**
 * 菜单配置（从路由动态生成）
 */
const menuItems = computed(() => {
  // 获取主布局下的子路由
  const mainRoute = routerInstance.options.routes.find((r) => r.path === '/')
  if (!mainRoute || !mainRoute.children) {
    return []
  }

  return generateMenuItems(mainRoute.children)
})

/**
 * 切换侧边栏折叠状态
 */
const toggleCollapsed = () => {
  appStore.toggleCollapsed()
}

/**
 * 菜单点击事件
 */
const handleMenuClick = ({ key }) => {
  router.push({ name: key })
}

/**
 * 监听路由变化，更新选中的菜单
 */
watch(
  () => route.name,
  (name) => {
    selectedKeys.value = [name]
  },
  { immediate: true }
)

/**
 * 退出登录
 */
const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    onOk: () => {
      userStore.logout()
      router.push('/login')
      message.success('已退出登录')
    }
  })
}

// ========== 修改密码 ==========

const passwordModalVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

/**
 * 打开修改密码对话框
 */
const handleChangePassword = () => {
  passwordModalVisible.value = true
}

/**
 * 提交修改密码
 */
const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value.validate()
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    message.success('密码修改成功，请重新登录')
    passwordModalVisible.value = false
    
    // 清空表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 退出登录
    setTimeout(() => {
      userStore.logout()
      router.push('/login')
    }, 1000)
  } catch (error) {
    console.error('修改密码失败：', error)
  }
}

/**
 * 取消修改密码
 */
const handlePasswordCancel = () => {
  passwordFormRef.value?.resetFields()
}
</script>

<style lang="less" scoped>
.basic-layout {
  width: 100%;
  height: 100vh;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    .trigger {
      font-size: 18px;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .username {
        margin-left: 4px;
      }
    }
  }
}

.layout-content {
  margin: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 4px;
  overflow-y: auto;
}

:deep(.ant-layout-sider) {
  .ant-menu-dark {
    background: transparent;
  }
}
</style>
