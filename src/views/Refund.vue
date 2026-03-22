<template>
  <div class="refund-page">
    <s-header :name="texts.title" />
    <div class="content">
      <van-pull-refresh v-model="state.refreshing" @refresh="onRefresh">
        <van-list v-model:loading="state.loading" :finished="state.finished" :finished-text="texts.finished" @load="onLoad">
          <div v-if="state.list.length">
            <div v-for="item in state.list" :key="item.refundId" class="refund-item" @click="goDetail(item.refundId)">
              <div class="refund-header">
                <span>{{ item.refundNo }}</span>
                <span>{{ item.statusName }}</span>
              </div>
              <div class="refund-line">{{ texts.orderNo }}{{ item.orderNo }}</div>
              <div class="refund-line">{{ texts.amount }}{{ currency(item.refundAmount) }}</div>
              <div class="refund-line">{{ texts.reason }}{{ item.reason }}</div>
              <div class="refund-time">{{ item.createTime }}</div>
            </div>
          </div>
          <div v-else-if="!state.loading" class="empty">{{ texts.empty }}</div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import sHeader from '@/components/SimpleHeader.vue'
import { getRefundList } from '@/service/refund'

const router = useRouter()
const texts = {
  title: '\u9000\u6B3E\u552E\u540E',
  finished: '\u6CA1\u6709\u66F4\u591A\u4E86',
  empty: '\u6682\u65E0\u9000\u6B3E\u8BB0\u5F55',
  orderNo: '\u8BA2\u5355\u53F7\uFF1A',
  amount: '\u9000\u6B3E\u91D1\u989D\uFF1A',
  reason: '\u9000\u6B3E\u539F\u56E0\uFF1A'
}

const state = reactive({
  loading: false,
  finished: false,
  refreshing: false,
  page: 1,
  totalPage: 0,
  list: []
})

const currency = (value) => `\uFFE5${Number(value || 0).toFixed(2)}`

const loadData = async () => {
  const { data } = await getRefundList({ pageNumber: state.page })
  state.list = state.list.concat(data.list || [])
  state.totalPage = data.totalPage || 0
  state.loading = false
  if (state.page >= state.totalPage || state.totalPage === 0) state.finished = true
}

const onLoad = () => {
  if (!state.refreshing && state.page < state.totalPage) state.page += 1
  if (state.refreshing) {
    state.list = []
    state.refreshing = false
  }
  loadData()
}

const onRefresh = () => {
  state.finished = false
  state.loading = true
  state.refreshing = true
  state.page = 1
  onLoad()
}

const goDetail = (id) => {
  router.push({ path: '/refund-detail', query: { id } })
}

onRefresh()
</script>

<style lang="less" scoped>
.refund-page {
  .content {
    min-height: calc(100vh - 44px);
    background: #f7f7f7;
  }
  .refund-item {
    margin: 10px;
    padding: 14px;
    border-radius: 8px;
    background: #fff;
  }
  .refund-header {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .refund-line {
    margin-bottom: 6px;
    color: #444;
    font-size: 13px;
  }
  .refund-time {
    color: #999;
    font-size: 12px;
  }
  .empty {
    padding: 60px 0;
    text-align: center;
    color: #999;
  }
}
</style>
