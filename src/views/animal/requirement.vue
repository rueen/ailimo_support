<template>
  <SimpleConfigManager
    title="要求"
    :api="requirementApi"
    :show-search="true"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getAnimalRequirementList,
  createAnimalRequirement,
  updateAnimalRequirement,
  deleteAnimalRequirement
} from '@/api/animal'

/**
 * 要求API封装
 */
const requirementApi = {
  list: getAnimalRequirementList,
  create: createAnimalRequirement,
  update: updateAnimalRequirement,
  delete: deleteAnimalRequirement
}
</script>
