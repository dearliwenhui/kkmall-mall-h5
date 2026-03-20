/**
 * KKMall 商城 - 订单 API 服务
 * 适配 KKMall 后端 API
 */

import axios from '../utils/axios'
import { adaptOrder, adaptOrderList, adaptPageData } from '../utils/dataAdapter'

/**
 * 创建订单
 * @param {Object} params - 订单参数
 * @param {Number} params.addressId - 地址 ID
 * @param {Array} params.cartItemIds - 购物车项 ID 数组
 */
export function createOrder(params) {
  const kkmallParams = {
    addressId: params.addressId,
    cartIds: params.cartItemIds
  }
  return axios.post('/api/mall/orders', kkmallParams).then(res => {
    // 后端返回 OrderVO 对象，包含 id 和 orderNo
    // 前端需要保存完整的订单信息，而不仅仅是订单号
    return res
  })
}

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNumber - 页码
 * @param {Number} params.status - 订单状态
 */
export function getOrderList(params) {
  const kkmallParams = {
    pageNum: params.pageNumber || 1,
    pageSize: params.pageSize || 10,
    status: params.status
  }

  return axios.get('/api/mall/orders', { params: kkmallParams }).then(res => {
    if (res.data) {
      // 如果是分页数据
      if (res.data.list || res.data.records) {
        res.data = adaptPageData(res.data, adaptOrderList)
      } else if (Array.isArray(res.data)) {
        // 如果直接返回数组
        res.data = adaptOrderList(res.data)
      }
    }
    return res
  })
}

/**
 * 获取订单详情
 * @param {Number} id - 订单 ID
 */
export function getOrderDetail(id) {
  return axios.get(`/api/mall/orders/${id}`).then(res => {
    if (res.data) {
      res.data = adaptOrder(res.data)
    }
    return res
  })
}

/**
 * 取消订单
 * @param {Number} id - 订单 ID
 */
export function cancelOrder(id) {
  return axios.put(`/api/mall/orders/${id}/cancel`)
}

/**
 * 确认收货
 * @param {Number} id - 订单 ID
 */
export function confirmOrder(id) {
  return axios.put(`/api/mall/orders/${id}/confirm`)
}

/**
 * 支付订单
 * @param {Object} params - 支付参数
 * @param {Number} params.orderId - 订单 ID
 * @param {Number} params.payType - 支付方式（1-支付宝，2-微信）
 */
export function payOrder(params) {
  // 1. 创建支付记录
  return axios.post('/api/mall/payments', {
    orderId: params.orderId,
    paymentType: params.payType
  }).then(res => {
    // 2. 处理支付（模拟支付成功）
    const paymentNo = res.data.paymentNo
    return axios.post(`/api/mall/payments/${paymentNo}/process`)
  })
}

/**
 * 删除订单
 * @param {Number} id - 订单 ID
 */
export function deleteOrder(id) {
  return axios.delete(`/api/mall/orders/${id}`)
}
