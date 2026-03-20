/**
 * KKMall 数据适配器
 * 将 KKMall API 数据格式转换为 newbee-mall 前端期望的格式
 */

/**
 * 商品数据转换 - KKMall -> newbee
 * @param {Object} kkmallProduct - KKMall 商品对象
 * @returns {Object} newbee 格式的商品对象
 */
export function adaptProduct(kkmallProduct) {
  if (!kkmallProduct) return null

  // 处理轮播图数组
  let goodsCarouselList = []
  if (kkmallProduct.images && Array.isArray(kkmallProduct.images)) {
    goodsCarouselList = kkmallProduct.images
  } else if (kkmallProduct.mainImage) {
    // 如果没有 images 数组，使用 mainImage
    goodsCarouselList = [kkmallProduct.mainImage]
  }

  return {
    goodsId: kkmallProduct.id,
    goodsName: kkmallProduct.name,
    goodsCoverImg: kkmallProduct.mainImage,
    sellingPrice: kkmallProduct.price,
    goodsIntro: kkmallProduct.description || kkmallProduct.subTitle || '',
    tag: kkmallProduct.tag || '',
    originalPrice: kkmallProduct.originalPrice,
    stockNum: kkmallProduct.stock,
    // 商品详情页需要的字段
    goodsCarouselList: goodsCarouselList,
    goodsDetailContent: kkmallProduct.detail || kkmallProduct.detailHtml || kkmallProduct.description || ''
  }
}

/**
 * 商品列表转换
 * @param {Array} kkmallProducts - KKMall 商品数组
 * @returns {Array} newbee 格式的商品数组
 */
export function adaptProductList(kkmallProducts) {
  if (!Array.isArray(kkmallProducts)) return []
  return kkmallProducts.map(adaptProduct)
}

/**
 * 订单数据转换 - KKMall -> newbee
 * @param {Object} kkmallOrder - KKMall 订单对象
 * @returns {Object} newbee 格式的订单对象
 */
export function adaptOrder(kkmallOrder) {
  if (!kkmallOrder) return null

  return {
    orderId: kkmallOrder.id,
    orderNo: kkmallOrder.orderNo,
    orderStatus: kkmallOrder.status,
    orderStatusString: getOrderStatusText(kkmallOrder.status),
    totalPrice: kkmallOrder.totalAmount,
    createTime: kkmallOrder.createTime,
    payTime: kkmallOrder.payTime,
    payType: kkmallOrder.payType,
    newBeeMallOrderItemVOS: kkmallOrder.items ? adaptOrderItems(kkmallOrder.items) : []
  }
}

/**
 * 订单列表转换
 * @param {Array} kkmallOrders - KKMall 订单数组
 * @returns {Array} newbee 格式的订单数组
 */
export function adaptOrderList(kkmallOrders) {
  if (!Array.isArray(kkmallOrders)) return []
  return kkmallOrders.map(adaptOrder)
}

/**
 * 订单商品项转换
 * @param {Array} kkmallOrderItems - KKMall 订单商品项数组
 * @returns {Array} newbee 格式的订单商品项数组
 */
export function adaptOrderItems(kkmallOrderItems) {
  if (!Array.isArray(kkmallOrderItems)) return []

  return kkmallOrderItems.map(item => ({
    goodsId: item.productId,
    goodsName: item.productName,
    goodsCoverImg: item.productImage,
    sellingPrice: item.price,
    goodsCount: item.quantity
  }))
}

/**
 * 订单状态映射
 * @param {Number} status - KKMall 订单状态码
 * @returns {String} 订单状态文本
 */
export function getOrderStatusText(status) {
  const statusMap = {
    0: '待支付',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消',
    5: '已关闭'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 购物车数据转换 - KKMall -> newbee
 * @param {Object} kkmallCartItem - KKMall 购物车项对象
 * @returns {Object} newbee 格式的购物车项对象
 */
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

/**
 * 购物车列表转换
 * @param {Array} kkmallCartItems - KKMall 购物车数组
 * @returns {Array} newbee 格式的购物车数组
 */
export function adaptCartList(kkmallCartItems) {
  if (!Array.isArray(kkmallCartItems)) return []
  return kkmallCartItems.map(adaptCartItem)
}

/**
 * 地址数据转换 - KKMall -> newbee
 * @param {Object} kkmallAddress - KKMall 地址对象
 * @returns {Object} newbee 格式的地址对象
 */
export function adaptAddress(kkmallAddress) {
  if (!kkmallAddress) return null

  return {
    addressId: kkmallAddress.id,
    userName: kkmallAddress.receiverName,
    userPhone: kkmallAddress.receiverPhone,
    provinceName: kkmallAddress.province,
    cityName: kkmallAddress.city,
    regionName: kkmallAddress.district,
    detailAddress: kkmallAddress.detailAddress,
    isDefault: kkmallAddress.isDefault || 0
  }
}

/**
 * 地址列表转换
 * @param {Array} kkmallAddresses - KKMall 地址数组
 * @returns {Array} newbee 格式的地址数组
 */
export function adaptAddressList(kkmallAddresses) {
  if (!Array.isArray(kkmallAddresses)) return []
  return kkmallAddresses.map(adaptAddress)
}

/**
 * 地址数据转换 - newbee -> KKMall (用于提交)
 * @param {Object} newbeeAddress - newbee 格式的地址对象
 * @returns {Object} KKMall 格式的地址对象
 */
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

/**
 * 分类数据转换 - KKMall -> newbee
 * @param {Object} kkmallCategory - KKMall 分类对象
 * @returns {Object} newbee 格式的分类对象
 */
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

/**
 * 分类列表转换
 * @param {Array} kkmallCategories - KKMall 分类数组
 * @returns {Array} newbee 格式的分类数组
 */
export function adaptCategoryList(kkmallCategories) {
  if (!Array.isArray(kkmallCategories)) return []
  return kkmallCategories.map(adaptCategory)
}

/**
 * 用户信息转换 - KKMall -> newbee
 * @param {Object} kkmallUser - KKMall 用户对象
 * @returns {Object} newbee 格式的用户对象
 */
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

/**
 * 分页数据转换 - KKMall -> newbee
 * @param {Object} kkmallPageData - KKMall 分页对象
 * @param {Function} itemAdapter - 单项数据转换函数
 * @returns {Object} newbee 格式的分页对象
 */
export function adaptPageData(kkmallPageData, itemAdapter) {
  if (!kkmallPageData) return { list: [], totalCount: 0, currPage: 1, pageSize: 10 }

  return {
    list: itemAdapter ? itemAdapter(kkmallPageData.list || kkmallPageData.records || []) : (kkmallPageData.list || kkmallPageData.records || []),
    totalCount: kkmallPageData.total || 0,
    currPage: kkmallPageData.pageNum || kkmallPageData.current || 1,
    pageSize: kkmallPageData.pageSize || kkmallPageData.size || 10,
    totalPage: kkmallPageData.pages || Math.ceil((kkmallPageData.total || 0) / (kkmallPageData.pageSize || 10))
  }
}
