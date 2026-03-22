/**
 * KKMall mall - product APIs.
 */

import axios from '../utils/axios'
import {
  adaptProduct,
  adaptProductList,
  adaptPageData
} from '../utils/dataAdapter'

export function getDetail(id) {
  return axios.get(`/api/mall/products/${id}`).then(res => {
    if (res.data) {
      res.data = adaptProduct(res.data)
    }
    return res
  })
}

export function getCategory() {
  return axios.get('/api/mall/categories/tree').then(res => {
    if (res.data) {
      res.data = flattenCategories(res.data)
    }
    return res
  })
}

export function search(params) {
  const kkmallParams = {
    keyword: params.keyword,
    categoryId: params.goodsCategoryId,
    sortBy: params.orderBy,
    pageNum: params.pageNumber || 1,
    pageSize: params.pageSize || 10
  }

  return axios.get('/api/mall/products', { params: kkmallParams }).then(res => {
    if (res.data) {
      res.data = adaptPageData(res.data, adaptProductList)
    }
    return res
  })
}

export function getGoodsList(params) {
  const kkmallParams = {
    categoryId: params.categoryId,
    keyword: params.keyword,
    sortBy: params.orderBy,
    pageNum: params.pageNumber || 1,
    pageSize: params.pageSize || 10
  }

  return axios.get('/api/mall/products', { params: kkmallParams }).then(res => {
    if (res.data) {
      res.data = adaptPageData(res.data, adaptProductList)
    }
    return res
  })
}

function flattenCategories(tree) {
  if (!Array.isArray(tree)) return []

  const result = []

  function traverse(nodes, level = 1) {
    nodes.forEach(node => {
      result.push({
        categoryId: node.id,
        categoryName: node.name,
        categoryLevel: level,
        parentId: node.parentId || 0,
        categoryRank: node.sort || 0
      })

      if (node.children && node.children.length > 0) {
        traverse(node.children, level + 1)
      }
    })
  }

  traverse(tree)
  return result
}
