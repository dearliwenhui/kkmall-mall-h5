<template>
  <div class="review-create-page">
    <s-header :name="texts.title" />
    <div class="content">
      <div class="summary">
        <div>{{ texts.product }}{{ state.goodsName }}</div>
      </div>
      <div class="form-box">
        <van-field v-model="state.rating" type="digit" :label="texts.ratingLabel" :placeholder="texts.ratingPlaceholder" />
        <van-field
          v-model="state.content"
          rows="4"
          autosize
          type="textarea"
          :label="texts.contentLabel"
          :placeholder="texts.contentPlaceholder"
        />
      </div>
      <van-button round class="submit-btn" color="#1baeae" block @click="submit">
        {{ texts.submit }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import sHeader from '@/components/SimpleHeader.vue'
import { createReview } from '@/service/review'

const route = useRoute()
const router = useRouter()
const texts = {
  title: '\u53D1\u8868\u8BC4\u4EF7',
  product: '\u5546\u54C1\uFF1A',
  ratingLabel: '\u8BC4\u5206',
  contentLabel: '\u8BC4\u4EF7\u5185\u5BB9',
  ratingPlaceholder: '\u8BF7\u8F93\u51651\u52305\u5206',
  contentPlaceholder: '\u8BF7\u8F93\u5165\u8BC4\u4EF7\u5185\u5BB9',
  submit: '\u63D0\u4EA4\u8BC4\u4EF7',
  invalid: '\u8BC4\u4EF7\u53C2\u6570\u5F02\u5E38',
  invalidRating: '\u8BC4\u5206\u9700\u57281\u52305\u4E4B\u95F4',
  success: '\u8BC4\u4EF7\u6210\u529F'
}

const routeGoodsName = route.query.goodsName || ''
const state = reactive({
  orderId: Number(route.query.orderId || 0),
  orderItemId: Number(route.query.orderItemId || 0),
  productId: Number(route.query.productId || 0),
  goodsName: routeGoodsName,
  rating: '5',
  content: ''
})

const submit = async () => {
  const rating = Number(state.rating)
  if (!state.orderId || !state.orderItemId || !state.productId) {
    showToast(texts.invalid)
    return
  }
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    showToast(texts.invalidRating)
    return
  }

  await createReview({
    orderId: state.orderId,
    orderItemId: state.orderItemId,
    productId: state.productId,
    rating,
    content: state.content
  })
  showSuccessToast(texts.success)
  router.replace({ path: '/review' })
}
</script>

<style lang="less" scoped>
.review-create-page {
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
  }
  .submit-btn {
    margin-top: 16px;
  }
}
</style>
