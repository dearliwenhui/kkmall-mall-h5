<template>
  <div class="refund-detail-page">
    <s-header :name="texts.title" />
    <div class="content" v-if="state.detail.refundNo">
      <div class="card">
        <div class="row"><span>{{ texts.refundNo }}</span><span>{{ state.detail.refundNo }}</span></div>
        <div class="row"><span>{{ texts.orderNo }}</span><span>{{ state.detail.orderNo }}</span></div>
        <div class="row"><span>{{ texts.status }}</span><span>{{ state.detail.statusName }}</span></div>
        <div class="row"><span>{{ texts.type }}</span><span>{{ state.detail.refundTypeName }}</span></div>
        <div class="row"><span>{{ texts.amount }}</span><span>{{ currency(state.detail.refundAmount) }}</span></div>
        <div class="row"><span>{{ texts.reason }}</span><span>{{ state.detail.reason || '-' }}</span></div>
        <div class="row"><span>{{ texts.description }}</span><span>{{ state.detail.description || '-' }}</span></div>
        <div class="row"><span>{{ texts.rejectReason }}</span><span>{{ state.detail.rejectReason || '-' }}</span></div>
        <div class="row"><span>{{ texts.createdAt }}</span><span>{{ state.detail.createTime || '-' }}</span></div>
        <div class="row"><span>{{ texts.refundAt }}</span><span>{{ state.detail.refundTime || '-' }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import sHeader from '@/components/SimpleHeader.vue'
import { getRefundDetail } from '@/service/refund'

const route = useRoute()
const texts = {
  title: '\u9000\u6B3E\u8BE6\u60C5',
  refundNo: '\u9000\u6B3E\u5355\u53F7',
  orderNo: '\u8BA2\u5355\u53F7',
  status: '\u9000\u6B3E\u72B6\u6001',
  type: '\u9000\u6B3E\u7C7B\u578B',
  amount: '\u9000\u6B3E\u91D1\u989D',
  reason: '\u9000\u6B3E\u539F\u56E0',
  description: '\u8865\u5145\u8BF4\u660E',
  rejectReason: '\u62D2\u7EDD\u539F\u56E0',
  createdAt: '\u7533\u8BF7\u65F6\u95F4',
  refundAt: '\u9000\u6B3E\u65F6\u95F4'
}

const state = reactive({
  detail: {}
})

const currency = (value) => `\uFFE5${Number(value || 0).toFixed(2)}`

onMounted(async () => {
  const { id } = route.query
  const { data } = await getRefundDetail(id)
  state.detail = data
})
</script>

<style lang="less" scoped>
.refund-detail-page {
  .content {
    padding: 12px;
  }
  .card {
    padding: 14px;
    border-radius: 8px;
    background: #fff;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
    &:last-child {
      border-bottom: none;
    }
    span:first-child {
      color: #999;
    }
    span:last-child {
      text-align: right;
      word-break: break-all;
    }
  }
}
</style>
