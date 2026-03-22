<template>
  <div class="order-detail-page">
    <s-header :name="texts.title" />
    <div class="order-status">
      <div class="status-item"><label>{{ texts.status }}</label><span>{{ state.detail.orderStatusString }}</span></div>
      <div class="status-item"><label>{{ texts.orderNo }}</label><span>{{ state.detail.orderNo }}</span></div>
      <div class="status-item"><label>{{ texts.createdAt }}</label><span>{{ state.detail.createTime }}</span></div>
      <div v-if="state.detail.payTime" class="status-item"><label>{{ texts.payTime }}</label><span>{{ state.detail.payTime }}</span></div>
      <div class="action-list">
        <van-button v-if="state.detail.orderStatus === 0" block color="#1baeae" @click="showPayPopup">{{ texts.payNow }}</van-button>
        <van-button v-if="state.detail.orderStatus === 2" block color="#1baeae" @click="handleConfirmOrder(state.detail.orderId)">{{ texts.confirm }}</van-button>
        <van-button v-if="state.detail.orderStatus >= 2 && state.detail.orderStatus <= 3" plain block color="#1baeae" @click="goToLogistics">{{ texts.logistics }}</van-button>
        <van-button v-if="state.detail.orderStatus >= 1 && state.detail.orderStatus <= 3" plain block color="#ff976a" @click="goToRefundCreate">{{ texts.refund }}</van-button>
        <van-button v-if="state.detail.orderStatus === 0" plain block color="#ee0a24" @click="handleCancelOrder(state.detail.orderId)">{{ texts.cancel }}</van-button>
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
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showLoadingToast, closeToast, showSuccessToast } from 'vant'
import sHeader from '@/components/SimpleHeader.vue'
import { getOrderDetail, cancelOrder, confirmOrder, payOrder } from '@/service/order'

const route = useRoute()
const router = useRouter()
const texts = {
  title: '\u8BA2\u5355\u8BE6\u60C5',
  status: '\u8BA2\u5355\u72B6\u6001\uFF1A',
  orderNo: '\u8BA2\u5355\u7F16\u53F7\uFF1A',
  createdAt: '\u4E0B\u5355\u65F6\u95F4\uFF1A',
  payTime: '\u652F\u4ED8\u65F6\u95F4\uFF1A',
  total: '\u5546\u54C1\u91D1\u989D\uFF1A',
  discount: '\u4F18\u60E0\u62B5\u6263\uFF1A',
  payNow: '\u53BB\u652F\u4ED8',
  confirm: '\u786E\u8BA4\u6536\u8D27',
  logistics: '\u67E5\u770B\u7269\u6D41',
  refund: '\u7533\u8BF7\u9000\u6B3E',
  cancel: '\u53D6\u6D88\u8BA2\u5355',
  review: '\u53BB\u8BC4\u4EF7',
  alipay: '\u652F\u4ED8\u5B9D\u652F\u4ED8',
  wechat: '\u5FAE\u4FE1\u652F\u4ED8',
  load: '\u52A0\u8F7D\u4E2D...',
  cancelConfirm: '\u786E\u8BA4\u53D6\u6D88\u8BA2\u5355\uFF1F',
  confirmConfirm: '\u662F\u5426\u786E\u8BA4\u6536\u8D27\uFF1F',
  cancelSuccess: '\u53D6\u6D88\u6210\u529F',
  confirmSuccess: '\u786E\u8BA4\u6210\u529F',
  paySuccess: '\u652F\u4ED8\u6210\u529F'
}

const state = reactive({
  detail: {},
  showPay: false
})

const currency = (value) => `\uFFE5${Number(value || 0).toFixed(2)}`

onMounted(() => {
  init()
})

const init = async () => {
  showLoadingToast({ message: texts.load, forbidClick: true })
  const { id } = route.query
  const { data } = await getOrderDetail(id)
  state.detail = data
  closeToast()
}

const handleCancelOrder = (id) => {
  showConfirmDialog({ title: texts.cancelConfirm }).then(async () => {
    const res = await cancelOrder(id)
    if (res.code === 200) {
      showSuccessToast(texts.cancelSuccess)
      init()
    }
  }).catch(() => undefined)
}

const handleConfirmOrder = (id) => {
  showConfirmDialog({ title: texts.confirmConfirm }).then(async () => {
    const res = await confirmOrder(id)
    if (res.code === 200) {
      showSuccessToast(texts.confirmSuccess)
      init()
    }
  }).catch(() => undefined)
}

const showPayPopup = () => {
  state.showPay = true
}

const handlePayOrder = async (type) => {
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
