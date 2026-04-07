/**
 * KKMall data adapters.
 */

export function adaptProduct(kkmallProduct) {
  if (!kkmallProduct) return null

  let goodsCarouselList = []
  if (kkmallProduct.images && Array.isArray(kkmallProduct.images)) {
    goodsCarouselList = kkmallProduct.images
  } else if (kkmallProduct.mainImage) {
    goodsCarouselList = [kkmallProduct.mainImage]
  }

  return {
    goodsId: kkmallProduct.id,
    goodsName: kkmallProduct.productName || kkmallProduct.name,
    goodsCoverImg: kkmallProduct.mainImage,
    sellingPrice: kkmallProduct.price,
    goodsIntro: kkmallProduct.description || kkmallProduct.subTitle || '',
    tag: kkmallProduct.tag || '',
    originalPrice: kkmallProduct.originalPrice,
    stockNum: kkmallProduct.stock,
    goodsCarouselList,
    goodsDetailContent: kkmallProduct.detail || kkmallProduct.detailHtml || kkmallProduct.description || ''
  }
}

export function adaptProductList(kkmallProducts) {
  if (!Array.isArray(kkmallProducts)) return []
  return kkmallProducts.map(adaptProduct).filter(Boolean)
}

export function adaptOrder(kkmallOrder) {
  if (!kkmallOrder) return null

  // 将后端订单结构适配为 H5 现有页面所需字段。
  const items = kkmallOrder.items ? adaptOrderItems(kkmallOrder.items) : []
  const originalTotal = items.reduce((sum, item) => {
    return sum + Number(item.sellingPrice || 0) * Number(item.goodsCount || 0)
  }, 0)
  const couponAmount = Number(kkmallOrder.couponAmount || 0)
  const totalDiscount = Math.max(originalTotal - Number(kkmallOrder.totalAmount || 0), 0)

  return {
    orderId: kkmallOrder.id,
    orderNo: kkmallOrder.orderNo,
    orderStatus: kkmallOrder.status,
    orderStatusString: getOrderStatusText(kkmallOrder.status),
    totalPrice: kkmallOrder.totalAmount,
    originalTotalPrice: originalTotal,
    couponAmount: couponAmount,
    totalDiscountAmount: totalDiscount,
    createTime: kkmallOrder.createTime,
    // expireTime / remainingSeconds 用于待付款倒计时显示。
    expireTime: kkmallOrder.expireTime,
    remainingSeconds: Number(kkmallOrder.remainingSeconds || 0),
    payTime: kkmallOrder.payTime,
    payType: kkmallOrder.payType,
    newBeeMallOrderItemVOS: items
  }
}

export function adaptOrderList(kkmallOrders) {
  if (!Array.isArray(kkmallOrders)) return []
  return kkmallOrders.map(adaptOrder).filter(Boolean)
}

export function adaptOrderItems(kkmallOrderItems) {
  if (!Array.isArray(kkmallOrderItems)) return []

  return kkmallOrderItems.map(item => ({
    orderItemId: item.id,
    goodsId: item.productId,
    goodsName: item.productName,
    goodsCoverImg: item.productImage,
    sellingPrice: item.price,
    goodsCount: item.quantity
  }))
}

export function getOrderStatusText(status) {
  const statusMap = {
    0: 'Pending payment',
    1: 'Pending shipment',
    2: 'Pending receipt',
    3: 'Completed',
    4: 'Cancelled',
    5: 'Closed'
  }
  return statusMap[status] || 'Unknown'
}

export function adaptCartItem(kkmallCartItem) {
  if (!kkmallCartItem) return null

  return {
    cartItemId: kkmallCartItem.id,
    goodsId: kkmallCartItem.productId,
    goodsName: kkmallCartItem.productName,
    goodsCoverImg: kkmallCartItem.productImage,
    sellingPrice: kkmallCartItem.price,
    goodsCount: kkmallCartItem.quantity,
    checked: kkmallCartItem.selected || false
  }
}

export function adaptCartList(kkmallCartItems) {
  if (!Array.isArray(kkmallCartItems)) return []
  return kkmallCartItems.map(adaptCartItem).filter(Boolean)
}

export function adaptAddress(kkmallAddress) {
  if (!kkmallAddress) return null

  return {
    addressId: kkmallAddress.id,
    userName: kkmallAddress.receiverName,
    userPhone: kkmallAddress.receiverPhone,
    provinceName: kkmallAddress.province,
    cityName: kkmallAddress.city,
    regionName: kkmallAddress.district,
    detailAddress: kkmallAddress.detail || kkmallAddress.detailAddress,
    isDefault: kkmallAddress.isDefault || 0
  }
}

export function adaptAddressList(kkmallAddresses) {
  if (!Array.isArray(kkmallAddresses)) return []
  return kkmallAddresses.map(adaptAddress).filter(Boolean)
}

export function adaptAddressToKKMall(newbeeAddress) {
  if (!newbeeAddress) return null

  return {
    id: newbeeAddress.addressId,
    receiverName: newbeeAddress.userName,
    receiverPhone: newbeeAddress.userPhone,
    province: newbeeAddress.provinceName,
    city: newbeeAddress.cityName,
    district: newbeeAddress.regionName,
    detail: newbeeAddress.detailAddress,
    isDefault: newbeeAddress.isDefault || 0
  }
}

export function adaptCategory(kkmallCategory) {
  if (!kkmallCategory) return null

  return {
    categoryId: kkmallCategory.id,
    categoryName: kkmallCategory.name,
    categoryLevel: kkmallCategory.level,
    parentId: kkmallCategory.parentId,
    categoryRank: kkmallCategory.sort
  }
}

export function adaptCategoryList(kkmallCategories) {
  if (!Array.isArray(kkmallCategories)) return []
  return kkmallCategories.map(adaptCategory).filter(Boolean)
}

export function adaptUser(kkmallUser) {
  if (!kkmallUser) return null

  return {
    nickName: kkmallUser.nickname || kkmallUser.username,
    loginName: kkmallUser.username,
    introduceSign: kkmallUser.avatar || '',
    phone: kkmallUser.phone || '',
    email: kkmallUser.email || ''
  }
}

export function adaptPageData(kkmallPageData, itemAdapter) {
  if (!kkmallPageData) {
    return { list: [], totalCount: 0, currPage: 1, pageSize: 10, totalPage: 0 }
  }

  const list = kkmallPageData.list || kkmallPageData.records || []
  return {
    list: itemAdapter ? itemAdapter(list) : list,
    totalCount: kkmallPageData.total || 0,
    currPage: kkmallPageData.pageNum || kkmallPageData.current || 1,
    pageSize: kkmallPageData.pageSize || kkmallPageData.size || 10,
    totalPage: kkmallPageData.pages || Math.ceil((kkmallPageData.total || 0) / (kkmallPageData.pageSize || 10))
  }
}
