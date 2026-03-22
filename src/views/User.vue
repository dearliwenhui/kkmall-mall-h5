<template>
  <div class="user-page">
    <s-header :name="texts.title"></s-header>
    <van-skeleton title :avatar="true" :row="3" :loading="state.loading">
      <div class="user-info">
        <div class="info">
          <img src="https://s.yezgea02.com/1604040746310/aaaddd.png" />
          <div class="user-desc">
            <span>{{ texts.nickname }}：{{ state.user.nickName }}</span>
            <span>{{ texts.username }}：{{ state.user.loginName }}</span>
            <span>{{ texts.signature }}：{{ state.user.introduceSign }}</span>
          </div>
        </div>
      </div>
    </van-skeleton>
    <ul class="user-list">
      <li class="van-hairline--bottom" @click="goTo('/order')"><span>{{ texts.orders }}</span><van-icon name="arrow" /></li>
      <li class="van-hairline--bottom" @click="goTo('/favorite')"><span>{{ texts.favorite }}</span><van-icon name="arrow" /></li>
      <li class="van-hairline--bottom" @click="goTo('/refund')"><span>{{ texts.refund }}</span><van-icon name="arrow" /></li>
      <li class="van-hairline--bottom" @click="goTo('/coupon')"><span>{{ texts.coupon }}</span><van-icon name="arrow" /></li>
      <li class="van-hairline--bottom" @click="goTo('/points')"><span>{{ texts.points }}</span><van-icon name="arrow" /></li>
      <li class="van-hairline--bottom" @click="goTo('/review')"><span>{{ texts.review }}</span><van-icon name="arrow" /></li>
      <li class="van-hairline--bottom" @click="goTo('/setting')"><span>{{ texts.account }}</span><van-icon name="arrow" /></li>
      <li class="van-hairline--bottom" @click="goTo('/address', { from: 'mine' })"><span>{{ texts.address }}</span><van-icon name="arrow" /></li>
      <li @click="goTo('/about')"><span>{{ texts.about }}</span><van-icon name="arrow" /></li>
    </ul>
    <nav-bar></nav-bar>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import navBar from '@/components/NavBar.vue'
import sHeader from '@/components/SimpleHeader.vue'
import { getUserInfo } from '@/service/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const texts = {
  title: '\u6211\u7684',
  nickname: '\u6635\u79F0',
  username: '\u767B\u5F55\u540D',
  signature: '\u4E2A\u6027\u7B7E\u540D',
  orders: '\u6211\u7684\u8BA2\u5355',
  favorite: '\u6211\u7684\u6536\u85CF',
  refund: '\u9000\u6B3E\u552E\u540E',
  coupon: '\u4F18\u60E0\u5238',
  points: '\u79EF\u5206\u4E2D\u5FC3',
  review: '\u6211\u7684\u8BC4\u4EF7',
  account: '\u8D26\u53F7\u7BA1\u7406',
  address: '\u5730\u5740\u7BA1\u7406',
  about: '\u5173\u4E8E\u6211\u4EEC'
}

const state = reactive({
  user: {},
  loading: true
})

onMounted(async () => {
  const { data } = await getUserInfo()
  state.user = data
  state.loading = false
})

const goTo = (path, query) => {
  router.push({ path, query: query || {} })
}
</script>

<style lang="less" scoped>
@import '../common/style/mixin';
.user-page {
  .user-info {
    width: 94%;
    margin: 10px;
    height: 115px;
    background: linear-gradient(90deg, @primary, #51c7c7);
    box-shadow: 0 2px 5px #269090;
    border-radius: 6px;
    .info {
      display: flex;
      width: 100%;
      height: 100%;
      padding: 25px 20px;
      .boxSizing();
      img {
        .wh(60px, 60px);
        border-radius: 50%;
        margin-top: 4px;
      }
      .user-desc {
        display: flex;
        flex-direction: column;
        margin-left: 10px;
        line-height: 20px;
        span {
          color: #fff;
          font-size: 14px;
          padding: 2px 0;
        }
      }
    }
  }
  .user-list {
    padding: 0 20px;
    margin-top: 20px;
    li {
      height: 40px;
      line-height: 40px;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      .van-icon-arrow {
        margin-top: 13px;
      }
    }
  }
}
</style>
