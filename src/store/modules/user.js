/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { login as loginApi, getProfile } from '@/api/auth'
import { setToken, setUserInfo, clearAuth, getToken, getUserInfo } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: getUserInfo(),
    permissions: []
  }),

  getters: {
    /**
     * 是否已登录
     */
    isLoggedIn: (state) => !!state.token,

    /**
     * 用户角色
     */
    userRole: (state) => state.userInfo?.role,

    /**
     * 权限代码列表
     */
    permissionCodes: (state) => {
      return state.userInfo?.permissions?.map((p) => p.code) || []
    }
  },

  actions: {
    /**
     * 登录
     * @param {Object} loginForm - 登录表单数据
     */
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm)
        const { token, admin } = res.data

        // 保存 token 和用户信息
        this.token = token
        this.userInfo = admin
        setToken(token)
        setUserInfo(admin)

        return res
      } catch (error) {
        throw error
      }
    },

    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
      try {
        const res = await getProfile()
        this.userInfo = res.data
        setUserInfo(res.data)
        return res
      } catch (error) {
        throw error
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.token = null
      this.userInfo = null
      this.permissions = []
      clearAuth()
    },

    /**
     * 检查是否有指定权限
     * @param {string} permissionCode - 权限代码
     */
    hasPermission(permissionCode) {
      // 超级管理员拥有所有权限
      if (this.userRole?.id === 1) {
        return true
      }
      return this.permissionCodes.includes(permissionCode)
    }
  }
})
