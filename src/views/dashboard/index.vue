<template>
  <div class="dashboard-container">
    <!-- 统计数据 -->
    <a-row :gutter="16" class="stats-row" v-if="userStore.hasPermission('statistics:overview')">
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading" @click="handleNavigate('/users/list', 'audit_status')">
          <a-statistic
            title="新用户"
            :value="statistics.pendingUsers"
            :value-style="{ color: '#cf1322' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading" @click="handleNavigate('/equipment/reservations', 'status')">
          <a-statistic
            title="设备预约"
            :value="statistics.pendingEquipmentReservations"
            :value-style="{ color: '#faad14' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading" @click="handleNavigate('/cage/reservations', 'status')">
          <a-statistic
            title="笼位预约"
            :value="statistics.pendingCageReservations"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading" @click="handleNavigate('/experiment/operations', 'status')">
          <a-statistic
            title="实验代操作"
            :value="statistics.pendingExperimentOperations"
            :value-style="{ color: '#722ed1' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading" @click="handleNavigate('/animal/orders', 'status')">
          <a-statistic
            title="动物订单"
            :value="statistics.pendingAnimalOrders"
            :value-style="{ color: '#13c2c2' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading" @click="handleNavigate('/reagent/orders', 'status')">
          <a-statistic
            title="试剂耗材订单"
            :value="statistics.pendingReagentOrders"
            :value-style="{ color: '#eb2f96' }"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStatisticsOverview } from '@/api/content'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const router = useRouter()
/**
 * 统计数据
 */
const loading = ref(false)
const statistics = reactive({
  pendingUsers: 0,
  pendingEquipmentReservations: 0,
  pendingCageReservations: 0,
  pendingExperimentOperations: 0,
  pendingAnimalOrders: 0,
  pendingReagentOrders: 0
})

/**
 * 获取统计数据
 */
const fetchStatistics = async () => {
  try {
    loading.value = true
    const res = await getStatisticsOverview()
    const data = res.data
    // 从返回的数据结构中提取待审核数量
    statistics.pendingUsers = data.users?.pending || 0
    statistics.pendingEquipmentReservations = data.equipment_reservations?.pending || 0
    statistics.pendingCageReservations = data.cage_reservations?.pending || 0
    statistics.pendingExperimentOperations = data.experiment_operations?.pending || 0
    statistics.pendingAnimalOrders = data.animal_orders?.pending || 0
    statistics.pendingReagentOrders = data.reagent_orders?.pending || 0
  } catch (error) {
    console.error('获取统计数据失败：', error)
    // 使用模拟数据
    Object.assign(statistics, {
      pendingUsers: 0,
      pendingEquipmentReservations: 0,
      pendingCageReservations: 0,
      pendingExperimentOperations: 0,
      pendingAnimalOrders: 0,
      pendingReagentOrders: 0
    })
  } finally {
    loading.value = false
  }
}

/**
 * 跳转到列表页并筛选待审核状态
 */
const handleNavigate = (path, statusKey) => {
  router.push({
    path,
    query: {
      [statusKey]: 0 // 待审核状态
    }
  })
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
  .stats-row {
    .ant-col {
      margin-bottom: 16px;
    }

    .ant-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
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
