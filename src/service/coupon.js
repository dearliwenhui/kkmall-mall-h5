import axios from '../utils/axios'

function adaptCoupon(coupon) {
  if (!coupon) return null
  return {
    couponId: coupon.id || coupon.couponId,
    couponName: coupon.name || coupon.couponName,
    type: coupon.type,
    typeName: coupon.typeName,
    discountAmount: coupon.discountAmount,
    discountRate: coupon.discountRate,
    minAmount: coupon.minAmount,
    status: coupon.status,
    statusName: coupon.statusName,
    expireTime: coupon.expireTime,
    startTime: coupon.startTime,
    endTime: coupon.endTime
  }
}

function adaptCouponPage(data) {
  return {
    list: Array.isArray(data.list) ? data.list.map(adaptCoupon).filter(Boolean) : [],
    totalCount: data.total || 0,
    currPage: data.pageNum || 1,
    pageSize: data.pageSize || 10,
    totalPage: data.pages || 0
  }
}

export function getAvailableCoupons(params = {}) {
  return axios.get('/api/mall/coupons/available', {
    params: {
      pageNum: params.pageNumber || 1,
      pageSize: params.pageSize || 10
    }
  }).then(res => {
    if (res.data) res.data = adaptCouponPage(res.data)
    return res
  })
}

export function receiveCoupon(couponId) {
  return axios.post(`/api/mall/coupons/${couponId}/receive`)
}

export function getMyCoupons(params = {}) {
  return axios.get('/api/mall/coupons/my', {
    params: {
      status: params.status,
      pageNum: params.pageNumber || 1,
      pageSize: params.pageSize || 10
    }
  }).then(res => {
    if (res.data) res.data = adaptCouponPage(res.data)
    return res
  })
}
