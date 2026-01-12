<!--
 * @Author: diaochan
 * @Date: 2026-01-09 16:37:27
 * @LastEditors: diaochan
 * @LastEditTime: 2026-01-11 20:28:03
 * @Description: 
-->
<template>
  <SimpleConfigManager
    title="操作内容管理"
    :api="{
      list: getOperationContentList,
      create: createOperationContent,
      update: updateOperationContent,
      delete: deleteOperationContent
    }"
    :columns="[
      { title: '操作内容', dataIndex: 'name', width: 200 },
      { title: '创建时间', dataIndex: 'created_at', width: 180 },
      { title: '操作', key: 'action', fixed: 'right', width: 200 }
    ]"
    :form-fields="[
      { name: 'name', label: '操作内容', type: 'input', placeholder: '请输入操作内容名称（如：灌胃、腹腔注射等）', required: true }
    ]"
    :permissions="{
      create: 'operation_content:create',
      update: 'operation_content:update',
      delete: 'operation_content:delete'
    }"
  />
</template>

<script setup>
import SimpleConfigManager from '@/components/SimpleConfigManager.vue'
import {
  getOperationContentList,
  createOperationContent,
  updateOperationContent,
  deleteOperationContent
} from '@/api/experiment'
</script>
