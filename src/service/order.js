/**
 * Mall order APIs.
 */

import axios from '../utils/axios'
import { adaptOrder, adaptOrderList, adaptPageData } from '../utils/dataAdapter'

export function createOrder(params) {
  const kkmallParams = {
    addressId: params.addressId,
    cartIds: params.cartItemIds,
    userCouponId: params.userCouponId,
    usePoints: params.usePoints,
    pointsToUse: params.pointsToUse
  }
  return axios.post('/api/mall/orders', kkmallParams)
}

export function getOrderList(params) {
  const kkmallParams = {
    pageNum: params.pageNumber || 1,
    pageSize: params.pageSize || 10,
    status: params.status
  }

  return axios.get('/api/mall/orders', { params: kkmallParams }).then(res => {
    if (res.data) {
      if (res.data.list || res.data.records) {
        res.data = adaptPageData(res.data, adaptOrderList)
      } else if (Array.isArray(res.data)) {
        res.data = adaptOrderList(res.data)
      }
    }
    return res
  })
}

export function getOrderDetail(id) {
  return axios.get(`/api/mall/orders/${id}`).then(res => {
    if (res.data) {
      res.data = adaptOrder(res.data)
    }
    return res
  })
}

export function cancelOrder(id) {
  return axios.put(`/api/mall/orders/${id}/cancel`)
}

export function confirmOrder(id) {
  return axios.put(`/api/mall/orders/${id}/confirm`)
}

export function payOrder(params) {
  return axios.post('/api/mall/payments', {
    orderId: params.orderId,
    paymentType: params.payType
  }).then(res => {
    const paymentNo = res.data.paymentNo
    return axios.post(`/api/mall/payments/${paymentNo}/process`)
  })
}

export function deleteOrder(id) {
  return axios.delete(`/api/mall/orders/${id}`)
}
