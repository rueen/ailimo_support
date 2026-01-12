<template>
  <SimpleConfigManager
    title="品牌"
    :api="brandApi"
    :show-search="true"
    :permissions="{
      create: 'reagent_brand:create',
      update: 'reagent_brand:update',
      delete: 'reagent_brand:delete'
    }"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getReagentBrandList,
  createReagentBrand,
  updateReagentBrand,
  deleteReagentBrand
} from '@/api/reagent'

/**
 * 品牌API封装
 */
const brandApi = {
  list: getReagentBrandList,
  create: createReagentBrand,
  update: updateReagentBrand,
  delete: deleteReagentBrand
}
</script>
