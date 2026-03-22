<template>
  <div class="logistics-page">
    <s-header :name="texts.title" />
    <div class="content" v-if="state.data.traces">
      <div class="summary">
        <div>{{ texts.company }}{{ state.data.logisticsCompany }}</div>
        <div>{{ texts.trackingNo }}{{ state.data.trackingNumber }}</div>
        <div>{{ texts.status }}{{ state.data.status }}</div>
      </div>
      <div class="trace-list">
        <div v-for="(item, index) in state.data.traces" :key="index" class="trace-item">
          <div class="trace-time">{{ item.time }}</div>
          <div class="trace-main">
            <div class="trace-status">{{ item.status }}</div>
            <div class="trace-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import sHeader from '@/components/SimpleHeader.vue'
import { getLogistics } from '@/service/logistics'

const route = useRoute()
const texts = {
  title: '\u7269\u6D41\u8BE6\u60C5',
  company: '\u7269\u6D41\u516C\u53F8\uFF1A',
  trackingNo: '\u7269\u6D41\u5355\u53F7\uFF1A',
  status: '\u7269\u6D41\u72B6\u6001\uFF1A'
}

const state = reactive({
  data: {}
})

onMounted(async () => {
  const { orderId } = route.query
  const { data } = await getLogistics(orderId)
  state.data = data
})
</script>

<style lang="less" scoped>
.logistics-page {
  .content {
    padding: 12px;
  }
  .summary,
  .trace-list {
    margin-bottom: 12px;
    border-radius: 8px;
    background: #fff;
  }
  .summary {
    padding: 14px;
    line-height: 24px;
  }
  .trace-item {
    display: flex;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  }
  .trace-time {
    width: 110px;
    color: #999;
    font-size: 12px;
    flex-shrink: 0;
  }
  .trace-status {
    font-weight: 600;
    margin-bottom: 6px;
  }
  .trace-desc {
    color: #666;
    font-size: 13px;
  }
}
</style>
