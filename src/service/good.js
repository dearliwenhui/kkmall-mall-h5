/**
 * KKMall 商城 - 商品 API 服务
 * 适配 KKMall 后端 API
 */

import axios from '../utils/axios'
import { adaptProduct, adaptProductList, adaptCategoryList, adaptPageData } from '../utils/dataAdapter'

/**
 * 获取商品详情
 * @param {Number} id - 商品 ID
 */
export function getDetail(id) {
  return axios.get(`/api/mall/products/${id}`).then(res => {
    if (res.data) {
      res.data = adaptProduct(res.data)
    }
    return res
  })
}

/**
 * 获取分类列表
 */
export function getCategory() {
  return axios.get('/api/mall/categories/tree').then(res => {
    if (res.data) {
      // 将树形结构扁平化为列表（如果需要）
      res.data = flattenCategories(res.data)
    }
    return res
  })
}

/**
 * 搜索商品
 * @param {Object} params - 搜索参数
 * @param {String} params.keyword - 搜索关键词
 * @param {Number} params.goodsCategoryId - 分类 ID
 * @param {Number} params.orderBy - 排序方式
 * @param {Number} params.pageNumber - 页码
 */
export function search(params) {
  // 转换参数格式
  const kkmallParams = {
    keyword: params.keyword,
    categoryId: params.goodsCategoryId,
    pageNum: params.pageNumber || 1,
    pageSize: params.pageSize || 10
  }

  return axios.get('/api/mall/products', { params: kkmallParams }).then(res => {
    if (res.data) {
      // 适配分页数据
      res.data = adaptPageData(res.data, adaptProductList)
    }
    return res
  })
}

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 */
export function getGoodsList(params) {
  const kkmallParams = {
    categoryId: params.categoryId,
    pageNum: params.pageNumber || 1,
    pageSize: params.pageSize || 10,
    keyword: params.keyword
  }

  return axios.get('/api/mall/products', { params: kkmallParams }).then(res => {
    if (res.data) {
      res.data = adaptPageData(res.data, adaptProductList)
    }
    return res
  })
}

/**
 * 将树形分类结构扁平化
 * @param {Array} tree - 树形分类数据
 * @returns {Array} 扁平化的分类列表
 */
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
