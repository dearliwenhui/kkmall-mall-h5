/**
 * KKMall 商城 - HTTP 请求配置
 * 适配 KKMall 后端 API
 */
import axios from 'axios'
import { showToast, showFailToast } from 'vant'
import router from '../router'

console.log('import.meta.env', import.meta.env)

// 配置 baseURL - 从环境变量读取
axios.defaults.baseURL = import.meta.env.VITE_APP_BASE_API || 'http://localhost:38081'
axios.defaults.withCredentials = false
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.post['Content-Type'] = 'application/json'

// 请求拦截器 - 添加 Authorization Bearer token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器 - 适配 KKMall API 格式
axios.interceptors.response.use(res => {
  if (typeof res.data !== 'object') {
    showFailToast('服务端异常！')
    return Promise.reject(res)
  }

  // KKMall API 使用 code 字段（不是 resultCode）
  if (res.data.code != 200) {
    if (res.data.message) showFailToast(res.data.message)

    // 401 未授权 - 跳转登录
    if (res.data.code == 401) {
      localStorage.removeItem('token')
      router.push({ path: '/login' })
    }

    return Promise.reject(res.data)
  }

  return res.data
})

export default axios
