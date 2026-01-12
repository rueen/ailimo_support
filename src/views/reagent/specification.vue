<template>
  <SimpleConfigManager
    title="规格"
    :api="specificationApi"
    :show-search="true"
    :permissions="{
      create: 'reagent_specification:create',
      update: 'reagent_specification:update',
      delete: 'reagent_specification:delete'
    }"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getReagentSpecificationList,
  createReagentSpecification,
  updateReagentSpecification,
  deleteReagentSpecification
} from '@/api/reagent'

/**
 * 规格API封装
 */
const specificationApi = {
  list: getReagentSpecificationList,
  create: createReagentSpecification,
  update: updateReagentSpecification,
  delete: deleteReagentSpecification
}
</script>
