import axios from '../utils/axios'

function adaptReview(review) {
  if (!review) return null
  return {
    reviewId: review.id,
    orderId: review.orderId,
    orderItemId: review.orderItemId,
    productId: review.productId,
    username: review.username,
    userAvatar: review.userAvatar,
    rating: review.rating,
    content: review.content,
    images: review.images ? review.images.split(',').filter(Boolean) : [],
    reply: review.reply,
    replyTime: review.replyTime,
    createTime: review.createTime
  }
}

function adaptReviewPage(data) {
  return {
    list: Array.isArray(data.list) ? data.list.map(adaptReview).filter(Boolean) : [],
    totalCount: data.total || 0,
    currPage: data.pageNum || 1,
    pageSize: data.pageSize || 10,
    totalPage: data.pages || 0
  }
}

export function createReview(params) {
  return axios.post('/api/mall/reviews', {
    orderId: params.orderId,
    orderItemId: params.orderItemId,
    productId: params.productId,
    rating: params.rating,
    content: params.content,
    images: Array.isArray(params.images) ? params.images.join(',') : params.images
  })
}

export function getMyReviews(params = {}) {
  return axios.get('/api/mall/reviews/my', {
    params: {
      pageNum: params.pageNumber || 1,
      pageSize: params.pageSize || 10
    }
  }).then(res => {
    if (res.data) res.data = adaptReviewPage(res.data)
    return res
  })
}

export function getProductReviews(productId, params = {}) {
  return axios.get(`/api/mall/reviews/product/${productId}`, {
    params: {
      pageNum: params.pageNumber || 1,
      pageSize: params.pageSize || 10
    }
  }).then(res => {
    if (res.data) res.data = adaptReviewPage(res.data)
    return res
  })
}
