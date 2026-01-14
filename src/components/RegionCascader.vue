<template>
  <div class="region-cascader">
    <a-space :size="8">
      <a-select
        v-model:value="selectedProvince"
        placeholder="请选择省份"
        :style="{ width: selectWidth }"
        :loading="provinceLoading"
        :options="provinceOptions"
        :field-names="{ label: 'name', value: 'id' }"
        allow-clear
        @change="handleProvinceChange"
      />
      <a-form-item-rest>
        <a-select
          v-model:value="selectedCity"
          placeholder="请选择城市"
          :style="{ width: selectWidth }"
          :loading="cityLoading"
          :options="cityOptions"
          :field-names="{ label: 'name', value: 'id' }"
          :disabled="!selectedProvince"
          allow-clear
          @change="handleCityChange"
        />
      </a-form-item-rest>
      <a-form-item-rest>
        <a-select
          v-model:value="selectedDistrict"
          placeholder="请选择区县"
          :style="{ width: selectWidth }"
          :loading="districtLoading"
          :options="districtOptions"
          :field-names="{ label: 'name', value: 'id' }"
          :disabled="!selectedCity"
          allow-clear
          @change="handleDistrictChange"
        />
      </a-form-item-rest>
    </a-space>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getRegionList } from '@/api/region'

/**
 * 组件属性
 */
const props = defineProps({
  // 省份ID（国标区划代码）
  provinceId: {
    type: Number,
    default: undefined
  },
  // 城市ID（国标区划代码）
  cityId: {
    type: Number,
    default: undefined
  },
  // 区县ID（国标区划代码）
  districtId: {
    type: Number,
    default: undefined
  },
  // 省份名称（用于编辑时根据名称回填）
  provinceName: {
    type: String,
    default: ''
  },
  // 城市名称（用于编辑时根据名称回填）
  cityName: {
    type: String,
    default: ''
  },
  // 区县名称（用于编辑时根据名称回填）
  districtName: {
    type: String,
    default: ''
  },
  // 下拉框宽度
  selectWidth: {
    type: String,
    default: '150px'
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['update:provinceId', 'update:cityId', 'update:districtId', 'change'])

// ========== 省份选择 ==========

const provinceLoading = ref(false)
const provinceOptions = ref([])
const selectedProvince = ref(undefined)

/**
 * 加载省份列表
 */
const loadProvinces = async () => {
  try {
    provinceLoading.value = true
    const res = await getRegionList({ level: 1 })
    provinceOptions.value = res.data || []
    
    // 如果有省份名称，根据名称找到对应的ID并设置
    if (props.provinceName && !selectedProvince.value) {
      const province = provinceOptions.value.find(item => item.name === props.provinceName)
      if (province) {
        selectedProvince.value = province.id
        emit('update:provinceId', province.id)
        // 加载城市列表
        await loadCitiesWithName(province.id)
      }
    }
  } catch (error) {
    console.error('加载省份列表失败：', error)
    provinceOptions.value = []
  } finally {
    provinceLoading.value = false
  }
}

/**
 * 省份改变事件
 */
const handleProvinceChange = (value) => {
  // 清空市、区选择
  selectedCity.value = undefined
  selectedDistrict.value = undefined
  cityOptions.value = []
  districtOptions.value = []
  
  // 触发更新事件
  emit('update:provinceId', value)
  emit('update:cityId', undefined)
  emit('update:districtId', undefined)
  
  // 加载城市列表
  if (value) {
    loadCities(value)
  }
  
  // 触发change事件
  emitChange()
}

// ========== 城市选择 ==========

const cityLoading = ref(false)
const cityOptions = ref([])
const selectedCity = ref(undefined)

/**
 * 加载城市列表
 * @param {number} provinceId - 省份ID
 */
const loadCities = async (provinceId) => {
  if (!provinceId) return
  
  try {
    cityLoading.value = true
    const res = await getRegionList({ parent_id: provinceId, level: 2 })
    cityOptions.value = res.data || []
  } catch (error) {
    console.error('加载城市列表失败：', error)
    cityOptions.value = []
  } finally {
    cityLoading.value = false
  }
}

/**
 * 加载城市列表（用于根据名称初始化）
 * @param {number} provinceId - 省份ID
 */
const loadCitiesWithName = async (provinceId) => {
  if (!provinceId) return
  
  try {
    cityLoading.value = true
    const res = await getRegionList({ parent_id: provinceId, level: 2 })
    cityOptions.value = res.data || []
    
    // 如果有城市名称，根据名称找到对应的ID并设置
    if (props.cityName && !selectedCity.value) {
      const city = cityOptions.value.find(item => item.name === props.cityName)
      if (city) {
        selectedCity.value = city.id
        emit('update:cityId', city.id)
        // 加载区县列表
        await loadDistrictsWithName(city.id)
      }
    }
  } catch (error) {
    console.error('加载城市列表失败：', error)
    cityOptions.value = []
  } finally {
    cityLoading.value = false
  }
}

/**
 * 城市改变事件
 */
const handleCityChange = (value) => {
  // 清空区选择
  selectedDistrict.value = undefined
  districtOptions.value = []
  
  // 触发更新事件
  emit('update:cityId', value)
  emit('update:districtId', undefined)
  
  // 加载区县列表
  if (value) {
    loadDistricts(value)
  }
  
  // 触发change事件
  emitChange()
}

// ========== 区县选择 ==========

const districtLoading = ref(false)
const districtOptions = ref([])
const selectedDistrict = ref(undefined)

/**
 * 加载区县列表
 * @param {number} cityId - 城市ID
 */
const loadDistricts = async (cityId) => {
  if (!cityId) return
  
  try {
    districtLoading.value = true
    const res = await getRegionList({ parent_id: cityId, level: 3 })
    districtOptions.value = res.data || []
  } catch (error) {
    console.error('加载区县列表失败：', error)
    districtOptions.value = []
  } finally {
    districtLoading.value = false
  }
}

/**
 * 加载区县列表（用于根据名称初始化）
 * @param {number} cityId - 城市ID
 */
const loadDistrictsWithName = async (cityId) => {
  if (!cityId) return
  
  try {
    districtLoading.value = true
    const res = await getRegionList({ parent_id: cityId, level: 3 })
    districtOptions.value = res.data || []
    
    // 如果有区县名称，根据名称找到对应的ID并设置
    if (props.districtName && !selectedDistrict.value) {
      const district = districtOptions.value.find(item => item.name === props.districtName)
      if (district) {
        selectedDistrict.value = district.id
        emit('update:districtId', district.id)
        // 触发change事件
        emitChange()
      }
    }
  } catch (error) {
    console.error('加载区县列表失败：', error)
    districtOptions.value = []
  } finally {
    districtLoading.value = false
  }
}

/**
 * 区县改变事件
 */
const handleDistrictChange = (value) => {
  // 触发更新事件
  emit('update:districtId', value)
  
  // 触发change事件
  emitChange()
}

// ========== 统一change事件 ==========

/**
 * 触发change事件，返回完整的选择数据
 */
const emitChange = () => {
  const provinceData = provinceOptions.value.find(item => item.id === selectedProvince.value)
  const cityData = cityOptions.value.find(item => item.id === selectedCity.value)
  const districtData = districtOptions.value.find(item => item.id === selectedDistrict.value)
  
  emit('change', {
    provinceId: selectedProvince.value,
    provinceName: provinceData?.name,
    cityId: selectedCity.value,
    cityName: cityData?.name,
    districtId: selectedDistrict.value,
    districtName: districtData?.name
  })
}

// ========== 监听props变化 ==========

/**
 * 监听provinceId变化，初始化省份选择
 */
watch(() => props.provinceId, (newVal) => {
  if (newVal !== selectedProvince.value) {
    selectedProvince.value = newVal
    if (newVal) {
      loadCities(newVal)
    }
  }
}, { immediate: true })

/**
 * 监听cityId变化，初始化城市选择
 */
watch(() => props.cityId, (newVal) => {
  if (newVal !== selectedCity.value) {
    selectedCity.value = newVal
    if (newVal) {
      loadDistricts(newVal)
    }
  }
}, { immediate: true })

/**
 * 监听districtId变化，初始化区县选择
 */
watch(() => props.districtId, (newVal) => {
  if (newVal !== selectedDistrict.value) {
    selectedDistrict.value = newVal
  }
}, { immediate: true })

// ========== 组件初始化 ==========

onMounted(() => {
  loadProvinces()
})
</script>

<style lang="less" scoped>
.region-cascader {
  display: inline-block;
}
</style>
