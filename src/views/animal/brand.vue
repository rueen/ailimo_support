<template>
  <SimpleConfigManager
    title="品牌"
    :api="brandApi"
    :show-search="true"
    :permissions="{
      create: 'animal_brand:create',
      update: 'animal_brand:update',
      delete: 'animal_brand:delete'
    }"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getAnimalBrandList,
  createAnimalBrand,
  updateAnimalBrand,
  deleteAnimalBrand
} from '@/api/animal'

/**
 * 品牌API封装
 */
const brandApi = {
  list: getAnimalBrandList,
  create: createAnimalBrand,
  update: updateAnimalBrand,
  delete: deleteAnimalBrand
}
</script>
