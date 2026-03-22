<template>
  <div class="create-order-page">
    <s-header :name="texts.title" @callback="deleteLocal"></s-header>
    <div class="address-wrap">
      <div class="name" @click="goToAddress">
        <span>{{ state.address.userName }}</span>
        <span>{{ state.address.userPhone }}</span>
      </div>
      <div class="address">
        {{ state.address.provinceName }} {{ state.address.cityName }} {{ state.address.regionName }} {{ state.address.detailAddress }}
      </div>
      <van-icon class="arrow" name="arrow" />
    </div>

    <div class="good-list">
      <div class="good-item" v-for="item in state.cartList" :key="item.cartItemId">
        <div class="good-img"><img :src="$filters.prefix(item.goodsCoverImg)" alt="" /></div>
        <div class="good-desc">
          <div class="good-title">
            <span>{{ item.goodsName }}</span>
            <span>x{{ item.goodsCount }}</span>
          </div>
          <div class="good-btn">
            <div class="price">{{ currency(item.sellingPrice) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="benefit-card">
      <div class="section-title">{{ texts.couponTitle }}</div>
      <div class="coupon-list">
        <div
          class="coupon-item"
          :class="{ active: state.selectedCouponId === null }"
          @click="state.selectedCouponId = null; state.selectedCoupon = null"
        >
          {{ texts.noCoupon }}
        </div>
        <div
          v-for="coupon in state.coupons"
          :key="coupon.couponId"
          class="coupon-item"
          :class="{ active: state.selectedCouponId === coupon.couponId }"
          @click="selectCoupon(coupon)"
        >
          <div>{{ coupon.couponName }}</div>
          <div class="coupon-desc">{{ coupon.typeName }}</div>
        </div>
      </div>

      <div class="section-title">{{ texts.pointsTitle }}</div>
      <van-cell center :title="texts.usePoints">
        <template #label>
          {{ texts.availablePoints }}{{ state.points }}
        </template>
        <template #right-icon>
          <van-switch v-model="state.usePoints" size="24" />
        </template>
      </van-cell>
      <div v-if="state.usePoints" class="points-tip">
        {{ texts.pointsDiscount }}{{ currency(pointsDiscount) }}
      </div>
    </div>

    <div class="pay-wrap">
      <div class="price-row"><span>{{ texts.subtotal }}</span><span>{{ currency(subtotal) }}</span></div>
      <div class="price-row"><span>{{ texts.couponDiscount }}</span><span>-{{ currency(couponDiscount) }}</span></div>
      <div class="price-row"><span>{{ texts.pointsDiscountTitle }}</span><span>-{{ currency(pointsDiscount) }}</span></div>
      <div class="price-row total"><span>{{ texts.total }}</span><span>{{ currency(payableTotal) }}</span></div>
      <van-button @click="handleCreateOrder" class="pay-btn" color="#1baeae" type="primary" block>
        {{ texts.createOrder }}
      </van-button>
    </div>

    <van-popup
      closeable
      :close-on-click-overlay="false"
      v-model:show="state.showPay"
      position="bottom"
      :style="{ height: '30%' }"
      @close="close"
    >
      <div class="pay-popup">
        <van-button color="#1989fa" block style="margin-bottom: 10px" @click="handlePayOrder(1)">
          {{ texts.alipay }}
        </van-button>
        <van-button color="#4fc08d" block @click="handlePayOrder(2)">
          {{ texts.wechat }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import sHeader from '@/components/SimpleHeader.vue'
import { getByCartItemIds } from '@/service/cart'
import { getDefaultAddress, getAddressDetail } from '@/service/address'
import { createOrder, payOrder } from '@/service/order'
import { getMyCoupons } from '@/service/coupon'
import { getUserPoints } from '@/service/points'
import { setLocal, getLocal } from '@/common/js/utils'
import { showLoadingToast, closeToast, showSuccessToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const POINTS_PER_CURRENCY = 100
const texts = {
  title: '\u751F\u6210\u8BA2\u5355',
  couponTitle: '\u4F18\u60E0\u5238',
  noCoupon: '\u4E0D\u4F7F\u7528\u4F18\u60E0\u5238',
  pointsTitle: '\u79EF\u5206\u62B5\u6263',
  usePoints: '\u4F7F\u7528\u79EF\u5206',
  availablePoints: '\u53EF\u7528\u79EF\u5206\uFF1A',
  pointsDiscount: '\u79EF\u5206\u53EF\u62B5\u6263\uFF1A',
  subtotal: '\u5546\u54C1\u91D1\u989D',
  couponDiscount: '\u4F18\u60E0\u5238\u51CF\u514D',
  pointsDiscountTitle: '\u79EF\u5206\u62B5\u6263',
  total: '\u5E94\u4ED8\u91D1\u989D',
  createOrder: '\u751F\u6210\u8BA2\u5355',
  alipay: '\u652F\u4ED8\u5B9D\u652F\u4ED8',
  wechat: '\u5FAE\u4FE1\u652F\u4ED8',
  loading: '\u52A0\u8F7D\u4E2D...',
  createSuccess: '\u8BA2\u5355\u521B\u5EFA\u6210\u529F',
  paySuccess: '\u652F\u4ED8\u6210\u529F'
}

const state = reactive({
  cartList: [],
  address: {},
  coupons: [],
  points: 0,
  usePoints: false,
  selectedCouponId: null,
  selectedCoupon: null,
  showPay: false,
  orderId: null
})

const currency = (value) => `\uFFE5${Number(value || 0).toFixed(2)}`

onMounted(() => {
  init()
})

const init = async () => {
  showLoadingToast({ message: texts.loading, forbidClick: true })
  const { addressId, cartItemIds } = route.query
  const selectedCartIds = cartItemIds
    ? JSON.parse(cartItemIds)
    : JSON.parse(getLocal('cartItemIds'))

  setLocal('cartItemIds', JSON.stringify(selectedCartIds))

  const [{ data: list }, { data: points }, { data: couponData }] = await Promise.all([
    getByCartItemIds({ cartItemIds: selectedCartIds.join(',') }),
    getUserPoints(),
    getMyCoupons({ status: 0 })
  ])

  const { data: address } = addressId
    ? await getAddressDetail(addressId)
    : await getDefaultAddress()

  if (!address) {
    router.push({ path: '/address' })
    return
  }

  state.cartList = list
  state.address = address
  state.points = points || 0
  state.coupons = (couponData.list || []).filter(item => Number(item.minAmount || 0) <= subtotal.value)
  closeToast()
}

const goToAddress = () => {
  router.push({
    path: '/address',
    query: { cartItemIds: JSON.stringify(state.cartList.map(item => item.cartItemId)), from: 'create-order' }
  })
}

const deleteLocal = () => {
  setLocal('cartItemIds', '')
}

const selectCoupon = (coupon) => {
  state.selectedCouponId = coupon.couponId
  state.selectedCoupon = coupon
}

const subtotal = computed(() => {
  return state.cartList.reduce((sum, item) => {
    return sum + item.goodsCount * item.sellingPrice
  }, 0)
})

const couponDiscount = computed(() => {
  if (!state.selectedCoupon) return 0
  if (state.selectedCoupon.discountAmount) {
    return Number(state.selectedCoupon.discountAmount)
  }
  if (state.selectedCoupon.discountRate) {
    const subtotalValue = Number(subtotal.value)
    const discount = subtotalValue - subtotalValue * (Number(state.selectedCoupon.discountRate) / 10)
    return Math.max(discount, 0)
  }
  return 0
})

const maxPointsCanUse = computed(() => {
  const payableBeforePoints = Math.max(Number(subtotal.value) - Number(couponDiscount.value), 0)
  return Math.min(state.points, Math.floor(payableBeforePoints * POINTS_PER_CURRENCY))
})

const pointsDiscount = computed(() => {
  if (!state.usePoints) return 0
  return maxPointsCanUse.value / POINTS_PER_CURRENCY
})

const payableTotal = computed(() => {
  const total = Number(subtotal.value) - Number(couponDiscount.value) - Number(pointsDiscount.value)
  return Math.max(total, 0)
})

const handleCreateOrder = async () => {
  const params = {
    addressId: state.address.addressId,
    cartItemIds: state.cartList.map(item => item.cartItemId),
    userCouponId: state.selectedCouponId,
    usePoints: state.usePoints,
    pointsToUse: state.usePoints ? maxPointsCanUse.value : 0
  }

  const { data } = await createOrder(params)
  setLocal('cartItemIds', '')
  state.orderId = data.id

  if (Number(data.totalAmount || 0) === 0) {
    showSuccessToast(texts.createSuccess)
    setTimeout(() => {
      router.push({ path: '/order' })
    }, 1200)
    return
  }

  state.showPay = true
}

const close = () => {
  router.push({ path: '/order' })
}

const handlePayOrder = async (type) => {
  await payOrder({ orderId: state.orderId, payType: type })
  showSuccessToast(texts.paySuccess)
  setTimeout(() => {
    router.push({ path: '/order' })
  }, 1200)
}
</script>

<style lang="less" scoped>
@import '../common/style/mixin';
.create-order-page {
  background: #f9f9f9;
  .address-wrap {
    margin-bottom: 20px;
    background: #fff;
    position: relative;
    font-size: 14px;
    padding: 15px;
    color: #222333;
    .name,
    .address {
      margin: 10px 0;
    }
    .arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
    }
  }
  .good-list {
    margin-bottom: 14px;
  }
  .good-item {
    padding: 10px;
    background: #fff;
    display: flex;
    .good-img img {
      .wh(100px, 100px);
    }
    .good-desc {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      padding: 20px;
      .good-title {
        display: flex;
        justify-content: space-between;
      }
      .price {
        font-size: 16px;
        color: red;
      }
    }
  }
  .benefit-card {
    margin-bottom: 130px;
    padding: 14px;
    background: #fff;
    .section-title {
      margin-bottom: 10px;
      font-weight: 600;
    }
    .coupon-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 14px;
    }
    .coupon-item {
      min-width: 100px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      &.active {
        border-color: #1baeae;
        color: #1baeae;
      }
    }
    .coupon-desc,
    .points-tip {
      margin-top: 4px;
      font-size: 12px;
      color: #999;
    }
  }
  .pay-wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    padding: 10px 0 50px;
    border-top: 1px solid #e9e9e9;
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 0 5%;
      margin: 8px 0;
      font-size: 14px;
      span:last-child {
        color: red;
      }
      &.total {
        font-weight: 700;
        span:last-child {
          font-size: 18px;
        }
      }
    }
    .pay-btn {
      position: fixed;
      bottom: 7px;
      right: 0;
      left: 0;
      width: 90%;
      margin: 0 auto;
    }
  }
  .pay-popup {
    width: 90%;
    margin: 0 auto;
    padding: 20px 0;
  }
}
</style>
