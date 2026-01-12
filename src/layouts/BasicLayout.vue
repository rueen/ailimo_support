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
 * 菜单配置
 */
const menuItems = computed(() => {
  const items = [
    {
      key: 'Dashboard',
      icon: () => h(HomeOutlined),
      label: '工作台',
      title: '工作台'
    },
    {
      key: 'UserManagement',
      icon: () => h(UserOutlined),
      label: '用户管理',
      title: '用户管理',
      children: [
        {
          key: 'UserList',
          label: '用户列表',
          title: '用户列表'
        },
        {
          key: 'OrganizationList',
          label: '组织机构',
          title: '组织机构'
        },
        {
          key: 'ResearchGroupList',
          label: '课题组',
          title: '课题组'
        }
      ]
    },
    {
      key: 'EquipmentManagement',
      icon: () => h(ExperimentOutlined),
      label: '设备租赁',
      title: '设备租赁',
      children: [
        {
          key: 'EquipmentReservationList',
          label: '租赁订单',
          title: '租赁订单'
        },
        {
          key: 'EquipmentList',
          label: '设备管理',
          title: '设备管理'
        },
        {
          key: 'EquipmentTimeSlotList',
          label: '时间段管理',
          title: '时间段管理'
        }
      ]
    },
    {
      key: 'CageManagement',
      icon: () => h(AppstoreOutlined),
      label: '笼位租赁',
      title: '笼位租赁',
      children: [
        {
          key: 'CageReservationList',
          label: '租赁订单',
          title: '租赁订单'
        },
        {
          key: 'CageList',
          label: '笼位管理',
          title: '笼位管理'
        },
        {
          key: 'CagePurposeList',
          label: '用途管理',
          title: '用途管理'
        },
        {
          key: 'CageTimeSlotList',
          label: '时间段管理',
          title: '时间段管理'
        }
      ]
    },
    {
      key: 'ExperimentManagement',
      icon: () => h(BulbOutlined),
      label: '实验代操作',
      title: '实验代操作',
      children: [
        {
          key: 'ExperimentOperationList',
          label: '代操作订单',
          title: '代操作订单'
        },
        {
          key: 'OperationContentList',
          label: '操作内容',
          title: '操作内容'
        },
        {
          key: 'ExperimentTimeSlotList',
          label: '时间段管理',
          title: '时间段管理'
        }
      ]
    },
    {
      key: 'AnimalOrderManagement',
      icon: () => h(ShoppingOutlined),
      label: '动物订购',
      title: '动物订购',
      children: [
        {
          key: 'AnimalOrderList',
          label: '订购订单',
          title: '订购订单'
        },
        {
          key: 'AnimalBrandList',
          label: '品牌管理',
          title: '品牌管理'
        },
        {
          key: 'AnimalVarietyList',
          label: '品系管理',
          title: '品系管理'
        },
        {
          key: 'AnimalSpecificationList',
          label: '规格管理',
          title: '规格管理'
        },
        {
          key: 'AnimalRequirementList',
          label: '要求管理',
          title: '要求管理'
        }
      ]
    },
    {
      key: 'ReagentOrderManagement',
      icon: () => h(MedicineBoxOutlined),
      label: '试剂耗材订购',
      title: '试剂耗材订购',
      children: [
        {
          key: 'ReagentOrderList',
          label: '订购订单',
          title: '订购订单'
        },
        {
          key: 'ReagentBrandList',
          label: '品牌管理',
          title: '品牌管理'
        },
        {
          key: 'ReagentSpecificationList',
          label: '规格管理',
          title: '规格管理'
        }
      ]
    },
    {
      key: 'ConfigManagement',
      icon: () => h(ToolOutlined),
      label: '配置管理',
      title: '配置管理',
      children: [
        {
          key: 'HandlerList',
          label: '负责人管理',
          title: '负责人管理'
        },
        {
          key: 'EnvironmentTypeList',
          label: '环境类型',
          title: '环境类型'
        },
        {
          key: 'AnimalTypeList',
          label: '动物类型',
          title: '动物类型'
        }
      ]
    },
    {
      key: 'ContentManagement',
      icon: () => h(FileTextOutlined),
      label: '内容管理',
      title: '内容管理',
      children: [
        {
          key: 'CaseList',
          label: '案例管理',
          title: '案例管理'
        },
        {
          key: 'CompanyInfo',
          label: '公司信息',
          title: '公司信息'
        }
      ]
    },
    {
      key: 'SystemManagement',
      icon: () => h(SettingOutlined),
      label: '系统管理',
      title: '系统管理',
      children: [
        {
          key: 'AdministratorList',
          label: '管理员管理',
          title: '管理员管理'
        },
        {
          key: 'RoleList',
          label: '角色管理',
          title: '角色管理'
        },
        {
          key: 'PermissionList',
          label: '权限管理',
          title: '权限管理'
        }
      ]
    }
  ]

  // TODO: 根据权限过滤菜单
  return items
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
