<template>
  <SimpleConfigManager
    title="笼位用途管理"
    :api="{
      list: getCagePurposeList,
      create: createCagePurpose,
      update: updateCagePurpose,
      delete: deleteCagePurpose
    }"
    :columns="[
      { title: 'ID', dataIndex: 'id', width: 80 },
      { title: '用途名称', dataIndex: 'name', width: 200 },
      { title: '创建时间', dataIndex: 'created_at', width: 180 },
      { title: '操作', key: 'action', fixed: 'right', width: 200 }
    ]"
    :form-fields="[
      { name: 'name', label: '用途名称', type: 'input', placeholder: '请输入用途名称', required: true }
    ]"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getCagePurposeList,
  createCagePurpose,
  updateCagePurpose,
  deleteCagePurpose
} from '@/api/cage'
</script>
