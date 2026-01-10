<template>
  <div class="dashboard-container">
    <!-- 欢迎信息 -->
    <a-card class="welcome-card">
      <h2>欢迎使用艾力墨管理系统</h2>
      <p>您好，{{ userStore.userInfo?.username }}！今天是 {{ currentDate }}</p>
      <p>角色：{{ userStore.userInfo?.role?.name || '管理员' }}</p>
      <p>最后登录时间：{{ userStore.userInfo?.lastLoginTime || '-' }}</p>
    </a-card>

    <!-- 统计数据 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="用户总数"
            :value="statistics.totalUsers"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="待审核用户"
            :value="statistics.pendingUsers"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="设备总数"
            :value="statistics.totalEquipment"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <ExperimentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="待处理预约"
            :value="statistics.pendingReservations"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <CalendarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :xs="24" :lg="12">
        <a-card title="快捷入口">
          <a-row :gutter="[16, 16]">
            <a-col :xs="12" :sm="8" v-for="link in quickLinks" :key="link.key">
              <div class="quick-link-item" @click="goToPage(link.key)">
                <component :is="link.icon" class="quick-link-icon" />
                <div class="quick-link-title">{{ link.title }}</div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="系统信息">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="系统版本">v1.0.0</a-descriptions-item>
            <a-descriptions-item label="构建时间">2026-01-09</a-descriptions-item>
            <a-descriptions-item label="技术栈">Vue 3 + Ant Design Vue</a-descriptions-item>
            <a-descriptions-item label="开发模式">前后端分离</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  ToolOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/store'
import { getStatisticsOverview } from '@/api/content'

const router = useRouter()
const userStore = useUserStore()

/**
 * 当前日期
 */
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 星期${weekDay}`
})

/**
 * 统计数据
 */
const loading = ref(false)
const statistics = reactive({
  totalUsers: 0,
  pendingUsers: 0,
  totalEquipment: 0,
  pendingReservations: 0
})

/**
 * 快捷入口
 */
const quickLinks = [
  { key: 'UserList', title: '用户管理', icon: UserOutlined },
  { key: 'OrganizationList', title: '机构管理', icon: TeamOutlined },
  { key: 'EquipmentList', title: '设备管理', icon: ExperimentOutlined },
  { key: 'EquipmentReservationList', title: '预约管理', icon: CalendarOutlined },
  { key: 'HandlerList', title: '负责人', icon: ToolOutlined },
  { key: 'CaseList', title: '案例管理', icon: FileTextOutlined }
]

/**
 * 跳转到指定页面
 */
const goToPage = (name) => {
  router.push({ name })
}

/**
 * 获取统计数据
 */
const fetchStatistics = async () => {
  try {
    loading.value = true
    const res = await getStatisticsOverview()
    Object.assign(statistics, res.data)
  } catch (error) {
    console.error('获取统计数据失败：', error)
    // 使用模拟数据
    Object.assign(statistics, {
      totalUsers: 128,
      pendingUsers: 5,
      totalEquipment: 32,
      pendingReservations: 12
    })
  } finally {
    loading.value = false
  }
}

/**
 * 初始化
 */
onMounted(() => {
  fetchStatistics()
})
</script>

<style lang="less" scoped>
.dashboard-container {
  .welcome-card {
    margin-bottom: 16px;

    h2 {
      margin-bottom: 8px;
      color: #1890ff;
    }

    p {
      color: #666;
      margin: 4px 0;
    }
  }

  .stats-row {
    margin-bottom: 16px;

    .ant-col {
      margin-bottom: 16px;
    }
  }

  .quick-link-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 8px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #1890ff;
      background: #f0f7ff;

      .quick-link-icon {
        color: #1890ff;
      }
    }

    .quick-link-icon {
      font-size: 28px;
      color: #666;
      margin-bottom: 8px;
      transition: color 0.3s;
    }

    .quick-link-title {
      font-size: 13px;
      color: #333;
      text-align: center;
    }
  }

  :deep(.ant-statistic-title) {
    margin-bottom: 8px;
    font-size: 14px;
  }

  :deep(.ant-statistic-content) {
    font-size: 24px;
  }
}
</style>
