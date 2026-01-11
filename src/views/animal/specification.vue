<template>
  <SimpleConfigManager
    title="规格"
    :api="specificationApi"
    :show-search="true"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getAnimalSpecificationList,
  createAnimalSpecification,
  updateAnimalSpecification,
  deleteAnimalSpecification
} from '@/api/animal'

/**
 * 规格API封装
 */
const specificationApi = {
  list: getAnimalSpecificationList,
  create: createAnimalSpecification,
  update: updateAnimalSpecification,
  delete: deleteAnimalSpecification
}
</script>
