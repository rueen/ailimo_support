<template>
  <SimpleConfigManager
    title="负责人"
    :api="handlerApi"
    :permissions="{
      create: 'handler:create',
      update: 'handler:update',
      delete: 'handler:delete'
    }"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getHandlerList,
  createHandler,
  updateHandler,
  deleteHandler
} from '@/api/config'

/**
 * 负责人API封装
 */
const handlerApi = {
  list: getHandlerList,
  create: createHandler,
  update: updateHandler,
  delete: deleteHandler
}
</script>
