/**
 * 应用全局状态管理
 */
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 侧边栏是否折叠
    collapsed: false,
    // 当前选中的菜单
    selectedKeys: [],
    // 当前展开的菜单
    openKeys: []
  }),

  actions: {
    /**
     * 切换侧边栏折叠状态
     */
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },

    /**
     * 设置侧边栏折叠状态
     * @param {boolean} collapsed - 是否折叠
     */
    setCollapsed(collapsed) {
      this.collapsed = collapsed
    },

    /**
     * 设置选中的菜单
     * @param {Array<string>} keys - 菜单 key 数组
     */
    setSelectedKeys(keys) {
      this.selectedKeys = keys
    },

    /**
     * 设置展开的菜单
     * @param {Array<string>} keys - 菜单 key 数组
     */
    setOpenKeys(keys) {
      this.openKeys = keys
    }
  }
})
