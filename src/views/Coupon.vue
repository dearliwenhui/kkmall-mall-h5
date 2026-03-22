<template>
  <div class="coupon-page">
    <s-header :name="texts.title" />
    <van-tabs v-model:active="state.activeTab" @change="onTabChange" color="#1baeae">
      <van-tab :title="texts.available">
        <div class="list-wrap">
          <div v-for="item in state.availableList" :key="`a-${item.couponId}`" class="coupon-card">
            <div class="coupon-main">
              <div class="coupon-amount">{{ couponAmount(item) }}</div>
              <div class="coupon-info">
                <div>{{ item.couponName }}</div>
                <div class="coupon-desc">{{ item.typeName }}</div>
                <div class="coupon-desc">{{ texts.minAmount }}{{ item.minAmount }}</div>
              </div>
            </div>
            <van-button size="small" color="#1baeae" @click="receive(item.couponId)">
              {{ texts.receive }}
            </van-button>
          </div>
          <div v-if="!state.availableList.length" class="empty">{{ texts.emptyAvailable }}</div>
        </div>
      </van-tab>
      <van-tab :title="texts.mine">
        <div class="list-wrap">
          <div v-for="item in state.myList" :key="`m-${item.couponId}-${item.expireTime}`" class="coupon-card">
            <div class="coupon-main">
              <div class="coupon-amount">{{ couponAmount(item) }}</div>
              <div class="coupon-info">
                <div>{{ item.couponName }}</div>
                <div class="coupon-desc">{{ item.statusName }}</div>
                <div class="coupon-desc">{{ texts.expire }}{{ item.expireTime || '-' }}</div>
              </div>
            </div>
          </div>
          <div v-if="!state.myList.length" class="empty">{{ texts.emptyMine }}</div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import sHeader from '@/components/SimpleHeader.vue'
import { getAvailableCoupons, getMyCoupons, receiveCoupon } from '@/service/coupon'

const texts = {
  title: '\u4F18\u60E0\u5238',
  available: '\u53EF\u9886\u53D6',
  mine: '\u6211\u7684\u4F18\u60E0\u5238',
  minAmount: '\u6EE1',
  expire: '\u5230\u671F\uFF1A',
  receive: '\u9886\u53D6',
  emptyAvailable: '\u6682\u65E0\u53EF\u9886\u53D6\u4F18\u60E0\u5238',
  emptyMine: '\u6682\u65E0\u4F18\u60E0\u5238',
  receiveSuccess: '\u9886\u53D6\u6210\u529F'
}

const state = reactive({
  activeTab: 0,
  availableList: [],
  myList: []
})

const couponAmount = (item) => {
  if (item.discountAmount) return `\uFFE5${Number(item.discountAmount).toFixed(2)}`
  if (item.discountRate) return `${item.discountRate}\u6298`
  return '-'
}

const loadAvailable = async () => {
  const { data } = await getAvailableCoupons()
  state.availableList = data.list || []
}

const loadMine = async () => {
  const { data } = await getMyCoupons()
  state.myList = data.list || []
}

const onTabChange = (index) => {
  if (index === 0) loadAvailable()
  else loadMine()
}

const receive = async (couponId) => {
  await receiveCoupon(couponId)
  showSuccessToast(texts.receiveSuccess)
  loadAvailable()
  loadMine()
}

onMounted(() => {
  loadAvailable()
  loadMine()
})
</script>

<style lang="less" scoped>
.coupon-page {
  .list-wrap {
    padding: 12px;
  }
  .coupon-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 14px;
    border-radius: 8px;
    background: #fff;
  }
  .coupon-main {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .coupon-amount {
    min-width: 72px;
    font-size: 20px;
    color: #ee0a24;
    font-weight: 700;
  }
  .coupon-desc {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }
  .empty {
    padding: 60px 0;
    text-align: center;
    color: #999;
  }
}
</style>
