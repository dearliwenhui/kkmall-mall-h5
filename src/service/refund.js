import axios from '../utils/axios'

function adaptRefund(refund) {
  if (!refund) return null
  return {
    refundId: refund.id,
    refundNo: refund.refundNo,
    orderId: refund.orderId,
    orderNo: refund.orderNo,
    refundAmount: refund.refundAmount,
    refundType: refund.refundType,
    refundTypeName: refund.refundTypeName,
    reason: refund.reason,
    description: refund.description,
    images: refund.images ? refund.images.split(',').filter(Boolean) : [],
    status: refund.status,
    statusName: refund.statusName,
    rejectReason: refund.rejectReason,
    refundTime: refund.refundTime,
    createTime: refund.createTime
  }
}

export function createRefund(params) {
  return axios.post('/api/mall/refunds', {
    orderId: params.orderId,
    refundAmount: params.refundAmount,
    refundType: params.refundType,
    reason: params.reason,
    description: params.description,
    images: Array.isArray(params.images) ? params.images.join(',') : params.images
  })
}

export function getRefundList(params = {}) {
  return axios.get('/api/mall/refunds', {
    params: {
      pageNum: params.pageNumber || 1,
      pageSize: params.pageSize || 10
    }
  }).then(res => {
    if (res.data) {
      res.data = {
        list: Array.isArray(res.data.list) ? res.data.list.map(adaptRefund) : [],
        totalCount: res.data.total || 0,
        currPage: res.data.pageNum || 1,
        pageSize: res.data.pageSize || 10,
        totalPage: res.data.pages || 0
      }
    }
    return res
  })
}

export function getRefundDetail(id) {
  return axios.get(`/api/mall/refunds/${id}`).then(res => {
    if (res.data) {
      res.data = adaptRefund(res.data)
    }
    return res
  })
}
