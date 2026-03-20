/**
 * KKMall 商城 - 购物车 API 服务
 * 适配 KKMall 后端 API
 */

import axios from '../utils/axios'
import { adaptCartList } from '../utils/dataAdapter'

/**
 * 添加商品到购物车
 * @param {Object} params - 购物车参数
 * @param {Number} params.goodsId - 商品 ID
 * @param {Number} params.goodsCount - 商品数量
 */
export function addCart(params) {
  const kkmallParams = {
    productId: params.goodsId,
    quantity: params.goodsCount || 1
  }
  return axios.post('/api/mall/cart', kkmallParams)
}

/**
 * 修改购物车商品数量
 * @param {Object} params - 修改参数
 * @param {Number} params.cartItemId - 购物车项 ID
 * @param {Number} params.goodsCount - 新数量
 */
export function modifyCart(params) {
  const kkmallParams = {
    quantity: params.goodsCount
  }
  return axios.put(`/api/mall/cart/${params.cartItemId}`, kkmallParams)
}

/**
 * 获取购物车列表
 * @param {Object} params - 查询参数
 */
export function getCart(params) {
  return axios.get('/api/mall/cart', { params }).then(res => {
    if (res.data) {
      res.data = adaptCartList(res.data)
    }
    return res
  })
}

/**
 * 删除购物车商品
 * @param {Number} id - 购物车项 ID
 */
export function deleteCartItem(id) {
  return axios.delete(`/api/mall/cart/${id}`)
}

/**
 * 获取结算商品列表
 * @param {Object} params - 参数
 * @param {String} params.cartItemIds - 购物车项 ID 列表（逗号分隔）
 */
export function getByCartItemIds(params) {
  // KKMall 通过购物车列表筛选选中的商品
  return axios.get('/api/mall/cart').then(res => {
    if (res.data) {
      const cartItems = adaptCartList(res.data)

      // 如果提供了 cartItemIds，则筛选指定的商品
      if (params && params.cartItemIds) {
        const ids = params.cartItemIds.split(',').map(id => parseInt(id))
        const filteredItems = cartItems.filter(item => ids.includes(item.cartItemId))
        res.data = filteredItems
      } else {
        // 否则返回所有选中的商品
        res.data = cartItems.filter(item => item.checked)
      }
    }
    return res
  })
}

/**
 * 批量选中/取消选中购物车商品
 * @param {Array} ids - 购物车项 ID 数组
 * @param {Boolean} selected - 是否选中
 */
export function batchSelectCart(ids, selected) {
  return axios.put('/api/mall/cart/select', {
    ids: ids,
    selected: selected
  })
}
