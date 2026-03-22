<template>
  <div class="points-page">
    <s-header :name="texts.title" />
    <div class="summary">
      <div class="points-value">{{ state.points }}</div>
      <div class="points-label">{{ texts.current }}</div>
      <van-button size="small" color="#1baeae" @click="signIn">{{ texts.signIn }}</van-button>
    </div>
    <div class="log-list">
      <div v-for="item in state.logs" :key="item.id" class="log-item">
        <div>
          <div>{{ item.typeName }}</div>
          <div class="log-desc">{{ item.description }}</div>
        </div>
        <div class="log-right">
          <div :class="['log-points', item.points > 0 ? 'plus' : 'minus']">
            {{ item.points > 0 ? '+' : '' }}{{ item.points }}
          </div>
          <div class="log-time">{{ item.createTime }}</div>
        </div>
      </div>
      <div v-if="!state.logs.length" class="empty">{{ texts.empty }}</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { showSuccessToast, showToast } from 'vant'
import sHeader from '@/components/SimpleHeader.vue'
import { getUserPoints, getPointsLog, signInPoints } from '@/service/points'

const texts = {
  title: '\u79EF\u5206\u4E2D\u5FC3',
  current: '\u5F53\u524D\u79EF\u5206',
  signIn: '\u6BCF\u65E5\u7B7E\u5230',
  empty: '\u6682\u65E0\u79EF\u5206\u8BB0\u5F55',
  success: '\u7B7E\u5230\u6210\u529F',
  failed: '\u7B7E\u5230\u5931\u8D25'
}

const state = reactive({
  points: 0,
  logs: []
})

const loadData = async () => {
  const [{ data: points }, { data: logData }] = await Promise.all([
    getUserPoints(),
    getPointsLog()
  ])
  state.points = points || 0
  state.logs = logData.list || []
}

const signIn = async () => {
  try {
    await signInPoints()
    showSuccessToast(texts.success)
    loadData()
  } catch (error) {
    showToast(error.message || texts.failed)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.points-page {
  .summary {
    padding: 20px;
    text-align: center;
    background: linear-gradient(135deg, #1baeae, #51c7c7);
    color: #fff;
  }
  .points-value {
    font-size: 32px;
    font-weight: 700;
  }
  .points-label {
    margin: 6px 0 12px;
  }
  .log-list {
    padding: 12px;
  }
  .log-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    padding: 14px;
    border-radius: 8px;
    background: #fff;
  }
  .log-desc,
  .log-time {
    font-size: 12px;
    color: #999;
  }
  .log-right {
    text-align: right;
  }
  .log-points.plus {
    color: #07c160;
  }
  .log-points.minus {
    color: #ee0a24;
  }
  .empty {
    padding: 60px 0;
    text-align: center;
    color: #999;
  }
}
</style>
