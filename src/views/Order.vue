<template>
  <div class="order-page">
    <s-header :name="texts.title" :back="'/user'" />
    <van-tabs
      v-model="state.status"
      class="order-tab"
      :color="'#1baeae'"
      :title-active-color="'#1baeae'"
      @click-tab="onChangeTab"
    >
      <van-tab :title="texts.all" name=""></van-tab>
      <van-tab :title="texts.pendingPay" name="0"></van-tab>
      <van-tab :title="texts.pendingShip" name="1"></van-tab>
      <van-tab :title="texts.pendingReceive" name="2"></van-tab>
      <van-tab :title="texts.completed" name="3"></van-tab>
      <van-tab :title="texts.cancelled" name="4"></van-tab>
    </van-tabs>
    <div class="content">
      <van-pull-refresh v-model="state.refreshing" @refresh="onRefresh" class="order-list-refresh">
        <van-list
          v-model:loading="state.loading"
          :finished="state.finished"
          :finished-text="texts.finished"
          @load="onLoad"
          @offset="10"
        >
          <div
            v-for="item in state.list"
            :key="item.orderId"
            class="order-item-box"
            @click="goTo(item.orderId)"
          >
            <div class="order-item-header">
              <span>{{ item.createTime }}</span>
              <span>{{ displayStatus(item) }}</span>
            </div>
            <div v-if="item.orderStatus === 0" class="order-item-expire">
              <span v-if="resolveRemainingSeconds(item) > 0">
                {{ texts.autoCloseIn }}{{ formatCountdown(resolveRemainingSeconds(item)) }}
              </span>
              <span v-else>{{ texts.timeoutClosing }}</span>
            </div>
            <van-card
              v-for="one in item.newBeeMallOrderItemVOS"
              :key="`${item.orderId}-${one.goodsId}`"
              :num="one.goodsCount"
              :price="one.sellingPrice"
              :title="one.goodsName"
              :thumb="$filters.prefix(one.goodsCoverImg)"
            />
          </div>
          <div v-if="!state.list.length && !state.loading" class="empty">
            {{ texts.empty }}
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import sHeader from '@/components/SimpleHeader.vue'
import { getOrderList } from '@/service/order'
import { useRouter } from 'vue-router'

const router = useRouter()
const texts = {
  title: '我的订单',
  all: '全部',
  pendingPay: '待付款',
  pendingShip: '待发货',
  pendingReceive: '待收货',
  completed: '已完成',
  cancelled: '已取消',
  finished: '没有更多了',
  empty: '暂无订单',
  autoCloseIn: '剩余支付时间：',
  timeoutClosing: '订单超时关闭中'
}

const state = reactive({
  status: '',
  loading: true,
  finished: false,
  refreshing: false,
  list: [],
  page: 1,
  totalPage: 0,
  now: Date.now(),
  lastTimeoutRefreshAt: 0
})

let countdownTimer = null

// 优先使用后端下发的 expireTime 计算倒计时，remainingSeconds 作为兜底。
const resolveRemainingSeconds = (item) => {
  if (!item || item.orderStatus !== 0) {
    return 0
  }
  if (item.expireTime) {
    const expireAt = new Date(item.expireTime).getTime()
    if (!Number.isNaN(expireAt)) {
      return Math.max(Math.floor((expireAt - state.now) / 1000), 0)
    }
  }
  return Math.max(Number(item.remainingSeconds || 0), 0)
}

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

const displayStatus = (item) => {
  if (item.orderStatus === 0 && resolveRemainingSeconds(item) <= 0) {
    return texts.timeoutClosing
  }
  return item.orderStatusString
}

const syncCountdownTimer = () => {
  clearInterval(countdownTimer)
  if (!state.list.some(item => item.orderStatus === 0)) {
    countdownTimer = null
    return
  }
  countdownTimer = setInterval(() => {
    // 每秒刷新当前时间，让页面内的待付款订单自动倒计时。
    state.now = Date.now()
    const hasExpiredPendingOrder = state.list.some(item => item.orderStatus === 0 && resolveRemainingSeconds(item) <= 0)
    if (hasExpiredPendingOrder && Date.now() - state.lastTimeoutRefreshAt > 15000) {
      // 到点后自动刷新列表，把“待付款”切成后端实际状态。
      state.lastTimeoutRefreshAt = Date.now()
      refreshList(false)
    }
  }, 1000)
}

const fetchOrders = async (reset = false) => {
  state.loading = true
  const { data } = await getOrderList({
    pageNumber: state.page,
    status: state.status
  })
  const records = data.list || []
  state.list = reset ? records : state.list.concat(records)
  state.totalPage = data.totalPage || 0
  state.finished = state.page >= state.totalPage || state.totalPage === 0
  state.loading = false
  state.refreshing = false
  state.now = Date.now()
  syncCountdownTimer()
}

const refreshList = async (showPullState = true) => {
  // 切换 tab 或超时自动刷新时统一走这里，避免状态分散。
  state.page = 1
  state.finished = false
  state.list = []
  state.refreshing = showPullState
  await fetchOrders(true)
}

const onChangeTab = async ({ name }) => {
  state.status = name
  await refreshList()
}

const goTo = (id) => {
  router.push({ path: '/order-detail', query: { id } })
}

const onLoad = async () => {
  if (state.loading || state.finished) {
    return
  }
  if (state.list.length > 0) {
    state.page += 1
  }
  await fetchOrders(state.page === 1)
}

const onRefresh = async () => {
  await refreshList()
}

onMounted(() => {
  refreshList(false)
})

onBeforeUnmount(() => {
  clearInterval(countdownTimer)
})
</script>

<style lang="less" scoped>
.order-page {
  .order-tab {
    position: fixed;
    left: 0;
    z-index: 1000;
    width: 100%;
    border-bottom: 1px solid #e9e9e9;
  }
  .content {
    height: calc(~"(100vh - 70px)");
    overflow: hidden;
    overflow-y: scroll;
    margin-top: 34px;
  }
  .order-list-refresh {
    .van-card__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .van-pull-refresh__head {
      background: #f9f9f9;
    }
    .order-item-box {
      margin: 20px 10px;
      background-color: #fff;
      .order-item-header {
        padding: 10px 20px 0;
        display: flex;
        justify-content: space-between;
      }
      .order-item-expire {
        padding: 6px 20px 0;
        color: #ee0a24;
        font-size: 12px;
      }
      .van-card {
        background-color: #fff;
        margin-top: 0;
      }
    }
    .empty {
      padding: 60px 0;
      text-align: center;
      color: #999;
    }
  }
}
</style>
