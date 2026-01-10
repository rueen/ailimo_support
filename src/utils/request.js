/**
 * Axios 请求封装
 */
import axios from 'axios'
import { message } from 'ant-design-vue'
import { getToken, clearAuth } from './storage'
import router from '@/router'

/**
 * 创建 axios 实例
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    // 添加 Token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果返回的状态码为 200，说明接口请求成功
    if (res.code === 200) {
      return res
    }

    // 处理业务错误
    message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    console.error('响应错误：', error)

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未登录或 Token 失效
          message.error('登录已过期，请重新登录')
          clearAuth()
          router.push('/login')
          break
        case 403:
          // 无权限
          message.error(data.message || '无权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误，请稍后重试')
          break
        default:
          message.error(data.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络错误，请检查网络连接')
    } else {
      // 请求配置出错
      message.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request
