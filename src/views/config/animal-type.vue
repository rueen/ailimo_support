<template>
  <SimpleConfigManager
    title="动物类型"
    :api="animalTypeApi"
    :permissions="{
      create: 'animal_type:create',
      update: 'animal_type:update',
      delete: 'animal_type:delete'
    }"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getAnimalTypeList,
  createAnimalType,
  updateAnimalType,
  deleteAnimalType
} from '@/api/config'

/**
 * 动物类型API封装
 */
const animalTypeApi = {
  list: getAnimalTypeList,
  create: createAnimalType,
  update: updateAnimalType,
  delete: deleteAnimalType
}
</script>
