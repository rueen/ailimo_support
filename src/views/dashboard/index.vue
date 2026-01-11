<template>
  <div class="dashboard-container">
    <!-- 统计数据 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="新用户"
            :value="statistics.pendingUsers"
            :value-style="{ color: '#cf1322' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="仪器预约"
            :value="statistics.pendingEquipmentReservations"
            :value-style="{ color: '#faad14' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="笼位预约"
            :value="statistics.pendingCageReservations"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="实验代操作"
            :value="statistics.pendingExperimentOperations"
            :value-style="{ color: '#722ed1' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading">
          <a-statistic
            title="动物订单"
            :value="statistics.pendingAnimalOrders"
            :value-style="{ color: '#13c2c2' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="8" :xl="4">
        <a-card hoverable :loading="loading">
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
import { getStatisticsOverview } from '@/api/content'

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
    statistics.pendingEquipmentReservations = data.equipmentReservations?.pending || 0
    statistics.pendingCageReservations = data.cageReservations?.pending || 0
    statistics.pendingExperimentOperations = data.experimentOperations?.pending || 0
    statistics.pendingAnimalOrders = data.animalOrders?.pending || 0
    statistics.pendingReagentOrders = data.reagentOrders?.pending || 0
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
