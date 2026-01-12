<template>
  <SimpleConfigManager
    title="环境类型"
    :api="environmentTypeApi"
    :permissions="{
      create: 'environment_type:create',
      update: 'environment_type:update',
      delete: 'environment_type:delete'
    }"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getEnvironmentTypeList,
  createEnvironmentType,
  updateEnvironmentType,
  deleteEnvironmentType
} from '@/api/config'

/**
 * 环境类型API封装
 */
const environmentTypeApi = {
  list: getEnvironmentTypeList,
  create: createEnvironmentType,
  update: updateEnvironmentType,
  delete: deleteEnvironmentType
}
</script>
