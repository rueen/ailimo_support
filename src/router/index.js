/**
 * Vue Router 配置
 */
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/storage'
import { message } from 'ant-design-vue'

/**
 * 路由配置
 */
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'HomeOutlined', permission: 'dashboard' }
      },
      // 用户管理
      {
        path: 'users',
        name: 'UserManagement',
        meta: { title: '用户管理', icon: 'UserOutlined' },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/user/list.vue'),
            meta: { title: '用户列表', permission: 'user:list' }
          },
          {
            path: 'organizations',
            name: 'OrganizationList',
            component: () => import('@/views/user/organization.vue'),
            meta: { title: '组织机构', permission: 'organization:list' }
          },
          {
            path: 'research-groups',
            name: 'ResearchGroupList',
            component: () => import('@/views/user/research-group.vue'),
            meta: { title: '课题组', permission: 'research_group:list' }
          }
        ]
      },
      // 设备预约管理
      {
        path: 'equipment',
        name: 'EquipmentManagement',
        meta: { title: '设备预约', icon: 'ExperimentOutlined' },
        children: [
          {
            path: 'reservations',
            name: 'EquipmentReservationList',
            component: () => import('@/views/equipment/reservation-list.vue'),
            meta: { title: '预约订单', permission: 'equipment_reservation:list' }
          },
          {
            path: 'list',
            name: 'EquipmentList',
            component: () => import('@/views/equipment/equipment-list.vue'),
            meta: { title: '设备管理', permission: 'equipment:list' }
          },
          {
            path: 'form',
            name: 'EquipmentForm',
            component: () => import('@/views/equipment/equipment-form.vue'),
            meta: { title: '新增设备', permission: 'equipment:create', hideInMenu: true }
          },
          {
            path: 'form/:id',
            name: 'EquipmentEdit',
            component: () => import('@/views/equipment/equipment-form.vue'),
            meta: { title: '编辑设备', permission: 'equipment:update', hideInMenu: true }
          },
          {
            path: 'time-slots',
            name: 'EquipmentTimeSlotList',
            component: () => import('@/views/equipment/time-slot.vue'),
            meta: { title: '时间段管理', permission: 'equipment_time_slot:list' }
          }
        ]
      },
      // 笼位预约管理
      {
        path: 'cage',
        name: 'CageManagement',
        meta: { title: '笼位预约', icon: 'HomeOutlined' },
        children: [
          {
            path: 'reservations',
            name: 'CageReservationList',
            component: () => import('@/views/cage/reservation-list.vue'),
            meta: { title: '预约订单', permission: 'cage_reservation:list' }
          },
          {
            path: 'cages',
            name: 'CageList',
            component: () => import('@/views/cage/cage-list.vue'),
            meta: { title: '笼位管理', permission: 'cage:list' }
          },
          {
            path: 'purposes',
            name: 'CagePurposeList',
            component: () => import('@/views/cage/purpose.vue'),
            meta: { title: '用途管理', permission: 'cage_purpose:list' }
          },
          {
            path: 'time-slots',
            name: 'CageTimeSlotList',
            component: () => import('@/views/cage/time-slot.vue'),
            meta: { title: '时间段管理', permission: 'cage_time_slot:list' }
          }
        ]
      },
      // 实验代操作管理
      {
        path: 'experiment',
        name: 'ExperimentManagement',
        meta: { title: '实验代操作', icon: 'ExperimentOutlined' },
        children: [
          {
            path: 'operations',
            name: 'ExperimentOperationList',
            component: () => import('@/views/experiment/operation-list.vue'),
            meta: { title: '代操作订单', permission: 'experiment_operation:list' }
          },
          {
            path: 'operation-contents',
            name: 'OperationContentList',
            component: () => import('@/views/experiment/operation-content.vue'),
            meta: { title: '操作内容管理', permission: 'operation_content:list' }
          },
          {
            path: 'time-slots',
            name: 'ExperimentTimeSlotList',
            component: () => import('@/views/experiment/time-slot.vue'),
            meta: { title: '时间段管理', permission: 'experiment_time_slot:list' }
          }
        ]
      },
      // 动物订购管理
      {
        path: 'animal',
        name: 'AnimalOrderManagement',
        meta: { title: '动物订购', icon: 'ShoppingOutlined' },
        children: [
          {
            path: 'orders',
            name: 'AnimalOrderList',
            component: () => import('@/views/animal/order-list.vue'),
            meta: { title: '订购订单', permission: 'animal_order:list' }
          },
          {
            path: 'brands',
            name: 'AnimalBrandList',
            component: () => import('@/views/animal/brand.vue'),
            meta: { title: '品牌管理', permission: 'animal_brand:list' }
          },
          {
            path: 'varieties',
            name: 'AnimalVarietyList',
            component: () => import('@/views/animal/variety.vue'),
            meta: { title: '品系管理', permission: 'animal_variety:list' }
          },
          {
            path: 'specifications',
            name: 'AnimalSpecificationList',
            component: () => import('@/views/animal/specification.vue'),
            meta: { title: '规格管理', permission: 'animal_specification:list' }
          },
          {
            path: 'requirements',
            name: 'AnimalRequirementList',
            component: () => import('@/views/animal/requirement.vue'),
            meta: { title: '要求管理', permission: 'animal_requirement:list' }
          }
        ]
      },
      // 试剂耗材订购管理
      {
        path: 'reagent',
        name: 'ReagentOrderManagement',
        meta: { title: '试剂耗材订购', icon: 'MedicineBoxOutlined' },
        children: [
          {
            path: 'orders',
            name: 'ReagentOrderList',
            component: () => import('@/views/reagent/order-list.vue'),
            meta: { title: '订购订单', permission: 'reagent_order:list' }
          },
          {
            path: 'brands',
            name: 'ReagentBrandList',
            component: () => import('@/views/reagent/brand.vue'),
            meta: { title: '品牌管理', permission: 'reagent_brand:list' }
          },
          {
            path: 'specifications',
            name: 'ReagentSpecificationList',
            component: () => import('@/views/reagent/specification.vue'),
            meta: { title: '规格管理', permission: 'reagent_specification:list' }
          }
        ]
      },
      // 内容管理
      {
        path: 'content',
        name: 'ContentManagement',
        meta: { title: '内容管理', icon: 'FileTextOutlined' },
        children: [
          {
            path: 'cases',
            name: 'CaseList',
            component: () => import('@/views/content/case-list.vue'),
            meta: { title: '案例管理', permission: 'case:list' }
          },
          {
            path: 'company-info',
            name: 'CompanyInfo',
            component: () => import('@/views/content/company-info.vue'),
            meta: { title: '公司信息', permission: 'company_info:view' }
          }
        ]
      },
      // 通用配置管理
      {
        path: 'config',
        name: 'ConfigManagement',
        meta: { title: '通用配置管理', icon: 'ToolOutlined' },
        children: [
          {
            path: 'handlers',
            name: 'HandlerList',
            component: () => import('@/views/config/handler.vue'),
            meta: { title: '负责人管理', permission: 'handler:list' }
          },
          {
            path: 'handler-statistics',
            name: 'HandlerStatistics',
            component: () => import('@/views/config/handler-statistics.vue'),
            meta: { title: '负责人统计', permission: 'statistics:handler_completion', hideInMenu: true }
          },
          {
            path: 'environment-types',
            name: 'EnvironmentTypeList',
            component: () => import('@/views/config/environment-type.vue'),
            meta: { title: '环境类型', permission: 'environment_type:list' }
          },
          {
            path: 'animal-types',
            name: 'AnimalTypeList',
            component: () => import('@/views/config/animal-type.vue'),
            meta: { title: '动物类型', permission: 'animal_type:list' }
          }
        ]
      },
      // 系统管理
      {
        path: 'system',
        name: 'SystemManagement',
        meta: { title: '系统管理', icon: 'SettingOutlined' },
        children: [
          {
            path: 'administrators',
            name: 'AdministratorList',
            component: () => import('@/views/system/administrator-list.vue'),
            meta: { title: '管理员管理', permission: 'administrator:list' }
          },
          {
            path: 'roles',
            name: 'RoleList',
            component: () => import('@/views/system/role-list.vue'),
            meta: { title: '角色管理', permission: 'role:list' }
          },
          {
            path: 'system-configs',
            name: 'SystemConfigList',
            component: () => import('@/views/system/system-config.vue'),
            meta: { title: '系统配置', permission: 'system_config' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { title: '404' }
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 路由守卫
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 艾力默管理端` : '艾力默管理端'

  // 检查是否需要登录
  if (to.meta.requiresAuth !== false) {
    const token = getToken()
    if (!token) {
      message.warning('请先登录')
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 如果已登录访问登录页，跳转到首页
  if (to.path === '/login' && getToken()) {
    next({ path: '/' })
    return
  }

  // 权限检查
  if (to.meta.requiresAuth !== false && to.meta.permission !== null && to.meta.permission !== undefined) {
    // 动态导入 store（避免循环依赖）
    import('@/store').then(({ useUserStore }) => {
      const userStore = useUserStore()
      if (!userStore.hasPermission(to.meta.permission)) {
        message.error('无权限访问该页面')
        // 查找用户有权限的第一个路由
        const firstAccessibleRoute = findFirstAccessibleRoute(router.options.routes, userStore)
        if (firstAccessibleRoute) {
          // 构建完整路径
          const fullPath = firstAccessibleRoute.path.startsWith('/') 
            ? firstAccessibleRoute.path 
            : `/${firstAccessibleRoute.path}`
          next({ path: fullPath })
        } else {
          // 如果没有找到有权限的路由，跳转到登录页
          message.error('您没有任何页面访问权限')
          next({ path: '/login' })
        }
        return
      }
      next()
    }).catch(() => {
      next()
    })
  } else {
    next()
  }
})

/**
 * 查找用户有权限的第一个路由
 * @param {Array} routes - 路由配置数组
 * @param {Object} userStore - 用户 store 实例
 * @returns {Object|null} 第一个有权限的路由对象
 */
/**
 * 查找用户有权限的第一个路由
 * @param {Array} routes - 路由配置数组
 * @param {Object} userStore - 用户 store 实例
 * @returns {Object|null} 第一个有权限的路由对象，包含完整路径
 */
function findFirstAccessibleRoute(routes, userStore) {
  // 递归查找路由
  function findRoute(routeList, parentPath = '') {
    for (const route of routeList) {
      // 跳过登录页和404页
      if (route.path === '/login' || route.name === 'NotFound') {
        continue
      }
      
      // 构建当前路由的完整路径
      let currentPath = route.path
      if (parentPath) {
        if (route.path.startsWith('/')) {
          currentPath = route.path
        } else {
          // 子路由路径拼接
          currentPath = parentPath.endsWith('/') 
            ? `${parentPath}${route.path}` 
            : `${parentPath}/${route.path}`
        }
      } else if (!route.path.startsWith('/')) {
        // 根路径下的子路由
        currentPath = `/${route.path}`
      }
      
      // 检查是否有子路由
      if (route.children && route.children.length > 0) {
        const childRoute = findRoute(route.children, currentPath)
        if (childRoute) {
          return childRoute
        }
      }
      
      // 检查当前路由是否有权限要求且有组件
      if (route.meta?.permission && route.component) {
        // 如果有权限要求，检查用户是否有权限
        if (userStore.hasPermission(route.meta.permission)) {
          return {
            ...route,
            path: currentPath
          }
        }
      }
    }
    return null
  }
  
  return findRoute(routes)
}

export default router
