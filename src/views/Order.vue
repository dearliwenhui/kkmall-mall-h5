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
              <span>{{ item.orderStatusString }}</span>
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
import { reactive } from 'vue'
import sHeader from '@/components/SimpleHeader.vue'
import { getOrderList } from '@/service/order'
import { useRouter } from 'vue-router'

const router = useRouter()
const texts = {
  title: '\u6211\u7684\u8BA2\u5355',
  all: '\u5168\u90E8',
  pendingPay: '\u5F85\u4ED8\u6B3E',
  pendingShip: '\u5F85\u53D1\u8D27',
  pendingReceive: '\u5F85\u6536\u8D27',
  completed: '\u5DF2\u5B8C\u6210',
  cancelled: '\u5DF2\u53D6\u6D88',
  finished: '\u6CA1\u6709\u66F4\u591A\u4E86',
  empty: '\u6682\u65E0\u8BA2\u5355'
}

const state = reactive({
  status: '',
  loading: false,
  finished: false,
  refreshing: false,
  list: [],
  page: 1,
  totalPage: 0
})

const loadData = async () => {
  const { data } = await getOrderList({
    pageNumber: state.page,
    status: state.status
  })
  state.list = state.list.concat(data.list || [])
  state.totalPage = data.totalPage || 0
  state.loading = false
  if (state.page >= state.totalPage || state.totalPage === 0) {
    state.finished = true
  }
}

const onChangeTab = ({ name }) => {
  state.status = name
  onRefresh()
}

const goTo = (id) => {
  router.push({ path: '/order-detail', query: { id } })
}

const onLoad = () => {
  if (!state.refreshing && state.page < state.totalPage) {
    state.page += 1
  }
  if (state.refreshing) {
    state.list = []
    state.refreshing = false
  }
  loadData()
}

const onRefresh = () => {
  state.refreshing = true
  state.finished = false
  state.loading = true
  state.page = 1
  onLoad()
}

onRefresh()
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
