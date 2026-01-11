<template>
  <SimpleConfigManager
    title="品牌"
    :api="brandApi"
    :show-search="true"
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
