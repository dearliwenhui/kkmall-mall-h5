/**
 * KKMall mall - home APIs.
 */

import axios from '../utils/axios'
import { adaptProductList } from '../utils/dataAdapter'

export function getHome() {
  return Promise.all([
    getHotGoods(),
    getNewGoods(),
    getRecommendGoods()
  ]).then(([hotGoods, newGoods, recommendGoods]) => {
    const hotList = hotGoods.data || []
    const newList = newGoods.data || []
    return {
      code: 200,
      message: 'success',
      data: {
        carousels: buildCarousels(hotList, newList),
        hotGoodses: hotList,
        newGoodses: newList,
        recommendGoodses: recommendGoods.data || []
      }
    }
  })
}

function buildCarousels(hotGoods = [], newGoods = []) {
  const list = [...hotGoods, ...newGoods]
    .filter(item => item && item.goodsCoverImg)
    .slice(0, 4)

  return list.map(item => ({
    carouselUrl: item.goodsCoverImg,
    redirectUrl: `/#/product/${item.goodsId}`
  }))
}

function getHotGoods() {
  return axios.get('/api/mall/products/hot', {
    params: { limit: 10 }
  }).then(res => {
    if (Array.isArray(res.data)) {
      res.data = adaptProductList(res.data)
    } else if (res.data && (res.data.list || res.data.records)) {
      res.data = adaptProductList(res.data.list || res.data.records)
    }
    return res
  })
}

function getNewGoods() {
  return axios.get('/api/mall/products', {
    params: { pageNum: 1, pageSize: 10, sortBy: 'new' }
  }).then(res => {
    if (res.data && (res.data.list || res.data.records)) {
      res.data = adaptProductList(res.data.list || res.data.records)
    }
    return res
  })
}

function getRecommendGoods() {
  return axios.get('/api/mall/products', {
    params: { pageNum: 1, pageSize: 10 }
  }).then(res => {
    if (res.data && (res.data.list || res.data.records)) {
      res.data = adaptProductList(res.data.list || res.data.records)
    }
    return res
  })
}
