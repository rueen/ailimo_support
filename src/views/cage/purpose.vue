<!--
 * @Author: diaochan
 * @Date: 2026-01-09 16:28:50
 * @LastEditors: diaochan
 * @LastEditTime: 2026-01-11 20:25:40
 * @Description: 
-->
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
      { title: '用途名称', dataIndex: 'name', width: 200 },
      { title: '创建时间', dataIndex: 'created_at', width: 180 },
      { title: '操作', key: 'action', fixed: 'right', width: 200 }
    ]"
    :form-fields="[
      { name: 'name', label: '用途名称', type: 'input', placeholder: '请输入用途名称', required: true }
    ]"
    :permissions="{
      create: 'cage_purpose:create',
      update: 'cage_purpose:update',
      delete: 'cage_purpose:delete'
    }"
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
