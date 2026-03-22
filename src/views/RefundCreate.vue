<template>
  <div class="refund-create-page">
    <s-header :name="texts.title" />
    <div class="content">
      <div class="summary">
        <div>{{ texts.orderNo }}{{ state.orderNo }}</div>
        <div>{{ texts.amount }}{{ currency(state.refundAmount) }}</div>
      </div>
      <div class="section-title">{{ texts.refundType }}</div>
      <div class="type-actions">
        <van-button :plain="state.refundType !== 1" color="#1baeae" size="small" @click="state.refundType = 1">{{ texts.refundOnly }}</van-button>
        <van-button :plain="state.refundType !== 2" color="#1baeae" size="small" @click="state.refundType = 2">{{ texts.returnRefund }}</van-button>
      </div>
      <div class="form-box">
        <van-field v-model="state.reason" :label="texts.reasonLabel" :placeholder="texts.reasonPlaceholder" />
        <van-field v-model="state.description" rows="3" autosize type="textarea" :label="texts.descriptionLabel" :placeholder="texts.descriptionPlaceholder" />
      </div>
      <van-button round class="submit-btn" color="#1baeae" block @click="submit">{{ texts.submit }}</van-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import sHeader from '@/components/SimpleHeader.vue'
import { createRefund } from '@/service/refund'

const route = useRoute()
const router = useRouter()
const texts = {
  title: '\u7533\u8BF7\u9000\u6B3E',
  orderNo: '\u8BA2\u5355\u53F7\uFF1A',
  amount: '\u9000\u6B3E\u91D1\u989D\uFF1A',
  refundType: '\u9000\u6B3E\u7C7B\u578B',
  refundOnly: '\u4EC5\u9000\u6B3E',
  returnRefund: '\u9000\u8D27\u9000\u6B3E',
  reasonLabel: '\u9000\u6B3E\u539F\u56E0',
  descriptionLabel: '\u8865\u5145\u8BF4\u660E',
  reasonPlaceholder: '\u8BF7\u8F93\u5165\u9000\u6B3E\u539F\u56E0',
  descriptionPlaceholder: '\u8BF7\u8F93\u5165\u8865\u5145\u8BF4\u660E',
  submit: '\u63D0\u4EA4\u7533\u8BF7',
  orderMissing: '\u8BA2\u5355\u4FE1\u606F\u7F3A\u5931',
  reasonRequired: '\u8BF7\u8F93\u5165\u9000\u6B3E\u539F\u56E0',
  success: '\u9000\u6B3E\u7533\u8BF7\u5DF2\u63D0\u4EA4'
}

const routeAmount = route.query.amount || 0
const state = reactive({
  orderId: Number(route.query.orderId || 0),
  orderNo: route.query.orderNo || '',
  refundAmount: Number(routeAmount),
  refundType: 1,
  reason: '',
  description: ''
})

const currency = (value) => `\uFFE5${Number(value || 0).toFixed(2)}`

const submit = async () => {
  if (!state.orderId) {
    showToast(texts.orderMissing)
    return
  }
  if (!state.reason) {
    showToast(texts.reasonRequired)
    return
  }

  await createRefund({
    orderId: state.orderId,
    refundAmount: state.refundAmount,
    refundType: state.refundType,
    reason: state.reason,
    description: state.description
  })
  showSuccessToast(texts.success)
  router.replace({ path: '/refund' })
}
</script>

<style lang="less" scoped>
.refund-create-page {
  .content {
    padding: 12px;
  }
  .summary,
  .form-box {
    margin-bottom: 12px;
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
  }
  .summary {
    padding: 14px;
    line-height: 24px;
  }
  .section-title {
    margin-bottom: 10px;
    color: #666;
    font-size: 13px;
  }
  .type-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }
  .submit-btn {
    margin-top: 16px;
  }
}
</style>
