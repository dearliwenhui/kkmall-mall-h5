<template>
  <div class="review-page">
    <s-header :name="texts.title" />
    <div class="content">
      <div v-for="item in state.list" :key="item.reviewId" class="review-item">
        <div class="review-top">
          <span>{{ item.username || texts.anonymous }}</span>
          <span>{{ texts.rating }}{{ item.rating }}</span>
        </div>
        <div class="review-content">{{ item.content || '-' }}</div>
        <div class="review-time">{{ item.createTime }}</div>
        <div v-if="item.reply" class="review-reply">{{ texts.reply }}{{ item.reply }}</div>
      </div>
      <div v-if="!state.list.length" class="empty">{{ texts.empty }}</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import sHeader from '@/components/SimpleHeader.vue'
import { getMyReviews } from '@/service/review'

const texts = {
  title: '\u6211\u7684\u8BC4\u4EF7',
  anonymous: '\u533F\u540D\u7528\u6237',
  rating: '\u8BC4\u5206\uFF1A',
  reply: '\u5546\u5BB6\u56DE\u590D\uFF1A',
  empty: '\u6682\u65E0\u8BC4\u4EF7\u8BB0\u5F55'
}

const state = reactive({
  list: []
})

onMounted(async () => {
  const { data } = await getMyReviews()
  state.list = data.list || []
})
</script>

<style lang="less" scoped>
.review-page {
  .content {
    padding: 12px;
  }
  .review-item {
    margin-bottom: 12px;
    padding: 14px;
    border-radius: 8px;
    background: #fff;
  }
  .review-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .review-content {
    margin-bottom: 8px;
    color: #333;
  }
  .review-time,
  .review-reply {
    font-size: 12px;
    color: #999;
  }
  .review-reply {
    margin-top: 8px;
  }
  .empty {
    padding: 60px 0;
    text-align: center;
    color: #999;
  }
}
</style>
