import axios from 'axios'
import { showFailToast } from 'vant'
import router from '../router'
import { getApiOrigin } from './url'

axios.defaults.baseURL = getApiOrigin()
axios.defaults.withCredentials = false
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.post['Content-Type'] = 'application/json'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(res => {
  if (typeof res.data !== 'object') {
    showFailToast('服务端异常！')
    return Promise.reject(res)
  }

  if (res.data.code != 200) {
    if (res.data.message) showFailToast(res.data.message)

    if (res.data.code == 401) {
      localStorage.removeItem('token')
      router.push({ path: '/login' })
    }

    return Promise.reject(res.data)
  }

  return res.data
})

export default axios
