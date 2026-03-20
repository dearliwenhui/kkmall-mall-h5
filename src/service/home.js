/**
 * KKMall 商城 - 首页 API 服务
 * 适配 KKMall 后端 API
 */

import axios from '../utils/axios'
import { adaptProductList } from '../utils/dataAdapter'

/**
 * 获取首页数据
 * 包含轮播图、热门商品、新品推荐等
 */
export function getHome() {
  // KKMall 需要组合多个接口来构建首页数据
  return Promise.all([
    getHotGoods(),
    getNewGoods(),
    getRecommendGoods()
  ]).then(([hotGoods, newGoods, recommendGoods]) => {
    return {
      code: 200,
      message: '成功',
      data: {
        // 轮播图（暂时使用占位数据，后续可以从后端获取）
        carousels: [],
        // 热销商品
        hotGoodses: hotGoods.data || [],
        // 新品推荐
        newGoodses: newGoods.data || [],
        // 推荐商品
        recommendGoodses: recommendGoods.data || []
      }
    }
  })
}

/**
 * 获取热门商品
 */
function getHotGoods() {
  return axios.get('/api/mall/products/hot', {
    params: { pageNum: 1, pageSize: 10 }
  }).then(res => {
    if (res.data && res.data.list) {
      res.data = adaptProductList(res.data.list)
    }
    return res
  })
}

/**
 * 获取新品推荐
 */
function getNewGoods() {
  return axios.get('/api/mall/products', {
    params: { pageNum: 1, pageSize: 10, sortBy: 'createTime', sortOrder: 'desc' }
  }).then(res => {
    if (res.data && res.data.list) {
      res.data = adaptProductList(res.data.list)
    }
    return res
  })
}

/**
 * 获取推荐商品
 */
function getRecommendGoods() {
  return axios.get('/api/mall/products', {
    params: { pageNum: 1, pageSize: 10 }
  }).then(res => {
    if (res.data && res.data.list) {
      res.data = adaptProductList(res.data.list)
    }
    return res
  })
}
