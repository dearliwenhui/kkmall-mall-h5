<template>
  <div class="order-detail-page">
    <s-header :name="texts.title" />
    <div class="order-status">
      <div class="status-item"><label>{{ texts.status }}</label><span>{{ detailStatusText }}</span></div>
      <div class="status-item"><label>{{ texts.orderNo }}</label><span>{{ state.detail.orderNo }}</span></div>
      <div class="status-item"><label>{{ texts.createdAt }}</label><span>{{ state.detail.createTime }}</span></div>
      <div v-if="state.detail.orderStatus === 0" class="status-item expire-tip">
        <label>{{ texts.autoCloseIn }}</label>
        <span>{{ remainingSeconds > 0 ? formatCountdown(remainingSeconds) : texts.timeoutClosing }}</span>
      </div>
      <div v-if="state.detail.payTime" class="status-item"><label>{{ texts.payTime }}</label><span>{{ state.detail.payTime }}</span></div>
      <div class="action-list">
        <van-button v-if="canPay" block color="#1baeae" @click="showPayPopup">{{ texts.payNow }}</van-button>
        <van-button v-if="state.detail.orderStatus === 2" block color="#1baeae" @click="handleConfirmOrder(state.detail.orderId)">{{ texts.confirm }}</van-button>
        <van-button v-if="state.detail.orderStatus >= 2 && state.detail.orderStatus <= 3" plain block color="#1baeae" @click="goToLogistics">{{ texts.logistics }}</van-button>
        <van-button v-if="state.detail.orderStatus >= 1 && state.detail.orderStatus <= 3" plain block color="#ff976a" @click="goToRefundCreate">{{ texts.refund }}</van-button>
        <van-button v-if="canPay" plain block color="#ee0a24" @click="handleCancelOrder(state.detail.orderId)">{{ texts.cancel }}</van-button>
      </div>
    </div>
    <div class="order-price">
      <div class="price-item"><label>{{ texts.total }}</label><span>{{ currency(state.detail.totalPrice) }}</span></div>
      <div v-if="Number(state.detail.totalDiscountAmount || 0) > 0" class="price-item">
        <label>{{ texts.discount }}</label>
        <span>-{{ currency(state.detail.totalDiscountAmount) }}</span>
      </div>
    </div>
    <van-card
      v-for="item in state.detail.newBeeMallOrderItemVOS || []"
      :key="item.goodsId"
      style="background: #fff"
      :num="item.goodsCount"
      :price="item.sellingPrice"
      :title="item.goodsName"
      :thumb="$filters.prefix(item.goodsCoverImg)"
    >
      <template #footer>
        <van-button v-if="state.detail.orderStatus === 3" size="mini" plain color="#1baeae" @click.stop="goToReviewCreate(item)">
          {{ texts.review }}
        </van-button>
      </template>
    </van-card>
    <van-popup v-model:show="state.showPay" position="bottom" :style="{ height: '24%' }">
      <div class="pay-popup">
        <van-button color="#1989fa" block style="margin-bottom: 10px" @click="handlePayOrder(1)">{{ texts.alipay }}</van-button>
        <van-button color="#4fc08d" block @click="handlePayOrder(2)">{{ texts.wechat }}</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showLoadingToast, closeToast, showSuccessToast } from 'vant'
import sHeader from '@/components/SimpleHeader.vue'
import { getOrderDetail, cancelOrder, confirmOrder, payOrder } from '@/service/order'

const route = useRoute()
const router = useRouter()
const texts = {
  title: '订单详情',
  status: '订单状态：',
  orderNo: '订单编号：',
  createdAt: '下单时间：',
  payTime: '支付时间：',
  total: '商品金额：',
  discount: '优惠抵扣：',
  autoCloseIn: '剩余支付时间：',
  payNow: '去支付',
  confirm: '确认收货',
  logistics: '查看物流',
  refund: '申请退款',
  cancel: '取消订单',
  review: '去评价',
  alipay: '支付宝支付',
  wechat: '微信支付',
  load: '加载中...',
  cancelConfirm: '确认取消订单？',
  confirmConfirm: '是否确认收货？',
  cancelSuccess: '取消成功',
  confirmSuccess: '确认成功',
  paySuccess: '支付成功',
  timeoutClosing: '订单超时关闭中'
}

const state = reactive({
  detail: {},
  showPay: false,
  now: Date.now(),
  lastTimeoutRefreshAt: 0
})

let countdownTimer = null

const currency = (value) => `￥${Number(value || 0).toFixed(2)}`

// 详情页和列表页共用同一套倒计时规则，避免显示不一致。
const remainingSeconds = computed(() => {
  if (state.detail.orderStatus !== 0) {
    return 0
  }
  if (state.detail.expireTime) {
    const expireAt = new Date(state.detail.expireTime).getTime()
    if (!Number.isNaN(expireAt)) {
      return Math.max(Math.floor((expireAt - state.now) / 1000), 0)
    }
  }
  return Math.max(Number(state.detail.remainingSeconds || 0), 0)
})

const canPay = computed(() => state.detail.orderStatus === 0 && remainingSeconds.value > 0)

const detailStatusText = computed(() => {
  if (state.detail.orderStatus === 0 && remainingSeconds.value <= 0) {
    return texts.timeoutClosing
  }
  return state.detail.orderStatusString || ''
})

const formatCountdown = (seconds) => {
  const total = Math.max(Number(seconds || 0), 0)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const syncCountdownTimer = () => {
  clearInterval(countdownTimer)
  if (state.detail.orderStatus !== 0) {
    countdownTimer = null
    state.showPay = false
    return
  }
  countdownTimer = setInterval(() => {
    // 待付款详情页每秒推进一次倒计时。
    state.now = Date.now()
    if (remainingSeconds.value <= 0) {
      state.showPay = false
      if (Date.now() - state.lastTimeoutRefreshAt > 15000) {
        // 超时后自动回源刷新，拿到后端真实状态。
        state.lastTimeoutRefreshAt = Date.now()
        init(false)
      }
    }
  }, 1000)
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  clearInterval(countdownTimer)
})

const init = async (showLoading = true) => {
  if (showLoading) {
    showLoadingToast({ message: texts.load, forbidClick: true })
  }
  const { id } = route.query
  const { data } = await getOrderDetail(id)
  state.detail = data
  state.now = Date.now()
  syncCountdownTimer()
  if (showLoading) {
    closeToast()
  }
}

const handleCancelOrder = (id) => {
  showConfirmDialog({ title: texts.cancelConfirm }).then(async () => {
    const res = await cancelOrder(id)
    if (res.code === 200) {
      showSuccessToast(texts.cancelSuccess)
      init(false)
    }
  }).catch(() => undefined)
}

const handleConfirmOrder = (id) => {
  showConfirmDialog({ title: texts.confirmConfirm }).then(async () => {
    const res = await confirmOrder(id)
    if (res.code === 200) {
      showSuccessToast(texts.confirmSuccess)
      init(false)
    }
  }).catch(() => undefined)
}

const showPayPopup = () => {
  if (!canPay.value) {
    // 已超时的订单不再打开支付弹窗。
    return
  }
  state.showPay = true
}

const handlePayOrder = async (type) => {
  if (!canPay.value) {
    state.showPay = false
    await init(false)
    return
  }
  await payOrder({ orderId: state.detail.orderId, payType: type })
  showSuccessToast(texts.paySuccess)
  state.showPay = false
  setTimeout(() => {
    router.push({ path: '/order' })
  }, 1200)
}

const goToLogistics = () => {
  router.push({ path: '/logistics', query: { orderId: state.detail.orderId } })
}

const goToRefundCreate = () => {
  router.push({
    path: '/refund-create',
    query: {
      orderId: state.detail.orderId,
      orderNo: state.detail.orderNo,
      amount: state.detail.totalPrice
    }
  })
}

const goToReviewCreate = (item) => {
  router.push({
    path: '/review-create',
    query: {
      orderId: state.detail.orderId,
      orderItemId: item.orderItemId,
      productId: item.goodsId,
      goodsName: item.goodsName
    }
  })
}
</script>

<style lang="less" scoped>
.order-detail-page {
  background: #f7f7f7;
  .order-status {
    background: #fff;
    padding: 20px;
    font-size: 15px;
    .status-item {
      margin-bottom: 10px;
      label {
        color: #999;
      }
    }
    .expire-tip {
      color: #ee0a24;
    }
    .action-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 14px;
    }
  }
  .order-price {
    background: #fff;
    margin: 20px 0;
    padding: 20px;
    font-size: 15px;
    .price-item {
      label {
        color: #999;
      }
    }
  }
  .van-card {
    margin-top: 0;
  }
  .van-card__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .pay-popup {
    width: 90%;
    margin: 0 auto;
    padding: 20px 0;
  }
}
</style>
