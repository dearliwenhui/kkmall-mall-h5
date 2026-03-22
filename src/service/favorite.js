import axios from '../utils/axios'

function adaptFavoriteItem(item) {
  if (!item) return null
  return {
    favoriteId: item.favoriteId,
    goodsId: item.productId,
    goodsName: item.productName,
    goodsCoverImg: item.image,
    sellingPrice: item.price,
    createTime: item.createTime
  }
}

export function addFavorite(productId) {
  return axios.post(`/api/mall/favorites/${productId}`)
}

export function removeFavorite(productId) {
  return axios.delete(`/api/mall/favorites/${productId}`)
}

export function checkFavorite(productId) {
  return axios.get(`/api/mall/favorites/check/${productId}`)
}

export function getFavoriteList(params = {}) {
  return axios.get('/api/mall/favorites', {
    params: {
      pageNum: params.pageNumber || 1,
      pageSize: params.pageSize || 10
    }
  }).then(res => {
    if (res.data) {
      const list = Array.isArray(res.data.list)
        ? res.data.list.map(adaptFavoriteItem).filter(Boolean)
        : []
      res.data = {
        list,
        totalCount: res.data.total || 0,
        currPage: res.data.pageNum || 1,
        pageSize: res.data.pageSize || 10,
        totalPage: res.data.pages || 0
      }
    }
    return res
  })
}
