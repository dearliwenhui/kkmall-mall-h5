/**
 * KKMall 商城 - 用户 API 服务
 * 适配 KKMall 后端 API
 */

import axios from '../utils/axios'
import { adaptUser } from '../utils/dataAdapter'

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return axios.get('/api/mall/auth/info').then(res => {
    if (res.data) {
      res.data = adaptUser(res.data)
    }
    return res
  })
}

/**
 * 更新用户信息
 * @param {Object} params - 用户信息参数
 */
export function EditUserInfo(params) {
  // 转换参数格式
  const kkmallParams = {
    nickname: params.nickName,
    avatar: params.introduceSign,
    phone: params.phone,
    email: params.email
  }
  return axios.put('/api/mall/user/profile', kkmallParams)
}

/**
 * 用户登录
 * @param {Object} params - 登录参数 { loginName, passwordMd5 }
 */
export function login(params) {
  // KKMall 使用 username 和 password（前端已经 MD5 加密）
  const kkmallParams = {
    username: params.loginName,
    password: params.passwordMd5  // 前端传来的是原始密码
  }
  return axios.post('/api/mall/auth/login', kkmallParams).then(res => {
    // 保存 token（后端返回的是 accessToken）
    if (res.data && res.data.accessToken) {
      localStorage.setItem('token', res.data.accessToken)
    }
    return res
  })
}

/**
 * 用户登出
 */
export function logout() {
  return axios.post('/api/mall/auth/logout').then(res => {
    localStorage.removeItem('token')
    return res
  })
}

/**
 * 用户注册
 * @param {Object} params - 注册参数 { loginName, password }
 */
export function register(params) {
  // KKMall 使用 username 和 password
  const kkmallParams = {
    username: params.loginName,
    password: params.password
  }
  return axios.post('/api/mall/auth/register', kkmallParams)
}
