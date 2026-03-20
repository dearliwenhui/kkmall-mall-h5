/**
 * KKMall 商城 - 地址 API 服务
 * 适配 KKMall 后端 API
 */

import axios from '../utils/axios'
import { adaptAddress, adaptAddressList, adaptAddressToKKMall } from '../utils/dataAdapter'

/**
 * 添加地址
 * @param {Object} params - 地址参数
 */
export function addAddress(params) {
  const kkmallParams = adaptAddressToKKMall(params)
  return axios.post('/api/mall/addresses', kkmallParams)
}

/**
 * 编辑地址
 * @param {Object} params - 地址参数
 */
export function EditAddress(params) {
  const kkmallParams = adaptAddressToKKMall(params)
  const addressId = kkmallParams.id
  delete kkmallParams.id // 删除 id，因为它在 URL 中
  return axios.put(`/api/mall/addresses/${addressId}`, kkmallParams)
}

/**
 * 删除地址
 * @param {Number} id - 地址 ID
 */
export function DeleteAddress(id) {
  return axios.delete(`/api/mall/addresses/${id}`)
}

/**
 * 获取默认地址
 */
export function getDefaultAddress() {
  return axios.get('/api/mall/addresses', {
    params: { isDefault: 1 }
  }).then(res => {
    if (res.data) {
      // 如果返回数组，取第一个
      if (Array.isArray(res.data)) {
        res.data = res.data.length > 0 ? adaptAddress(res.data[0]) : null
      } else {
        res.data = adaptAddress(res.data)
      }
    }
    return res
  })
}

/**
 * 获取地址列表
 */
export function getAddressList() {
  return axios.get('/api/mall/addresses').then(res => {
    if (res.data) {
      res.data = adaptAddressList(res.data)
    }
    return res
  })
}

/**
 * 获取地址详情
 * @param {Number} id - 地址 ID
 */
export function getAddressDetail(id) {
  return axios.get(`/api/mall/addresses/${id}`).then(res => {
    if (res.data) {
      res.data = adaptAddress(res.data)
    }
    return res
  })
}

/**
 * 设置默认地址
 * @param {Number} id - 地址 ID
 */
export function setDefaultAddress(id) {
  return axios.put(`/api/mall/addresses/${id}/default`)
}
