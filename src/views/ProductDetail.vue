<template>
  <div class="product-detail-page">
    <s-header :name="texts.title"></s-header>
    <div class="detail-content">
      <div class="detail-swipe-wrap">
        <van-swipe class="my-swipe" indicator-color="#1baeae">
          <van-swipe-item v-for="(item, index) in state.detail.goodsCarouselList" :key="index">
            <img :src="item" alt="" />
          </van-swipe-item>
        </van-swipe>
      </div>
      <div class="product-info">
        <div class="product-title">{{ state.detail.goodsName || '' }}</div>
        <div class="product-desc">{{ texts.shipping }}</div>
        <div class="product-price">
          <span>{{ currency(state.detail.sellingPrice) }}</span>
        </div>
      </div>
      <div class="product-intro">
        <div class="product-content" v-html="state.detail.goodsDetailContent || ''"></div>
      </div>
      <div class="review-section">
        <div class="review-title">{{ texts.reviews }}</div>
        <div v-if="state.reviews.length">
          <div v-for="item in state.reviews" :key="item.reviewId" class="review-item">
            <div class="review-top">
              <span>{{ item.username || texts.anonymous }}</span>
              <span>{{ texts.rating }}{{ item.rating }}</span>
            </div>
            <div class="review-content">{{ item.content || '-' }}</div>
            <div class="review-time">{{ item.createTime }}</div>
          </div>
        </div>
        <div v-else class="review-empty">{{ texts.noReviews }}</div>
      </div>
    </div>
    <van-action-bar>
      <van-action-bar-icon icon="chat-o" :text="texts.support" />
      <van-action-bar-icon
        :icon="state.favorite ? 'star' : 'star-o'"
        :text="state.favorite ? texts.favorited : texts.favorite"
        @click="toggleFavorite"
      />
      <van-action-bar-icon icon="cart-o" :badge="!cart.count ? '' : cart.count" @click="goToCartList" :text="texts.cart" />
      <van-action-bar-button type="warning" @click="handleAddCart" :text="texts.addCart" />
      <van-action-bar-button type="danger" @click="buyNow" :text="texts.buyNow" />
    </van-action-bar>
  </div>
</template>

<script setup>
import { reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { getDetail } from '@/service/good'
import { addCart } from '@/service/cart'
import { addFavorite, checkFavorite, removeFavorite } from '@/service/favorite'
import { getProductReviews } from '@/service/review'
import sHeader from '@/components/SimpleHeader.vue'
import { showSuccessToast, showToast } from 'vant'
import { prefixAssetUrl } from '@/utils/url'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const texts = {
  title: '\u5546\u54C1\u8BE6\u60C5',
  shipping: '\u514D\u90AE\u8D39 \u00B7 \u987A\u4E30\u5FEB\u9012',
  reviews: '\u5546\u54C1\u8BC4\u4EF7',
  anonymous: '\u533F\u540D\u7528\u6237',
  rating: '\u8BC4\u5206\uFF1A',
  noReviews: '\u6682\u65E0\u8BC4\u4EF7',
  support: '\u5BA2\u670D',
  favorite: '\u6536\u85CF',
  favorited: '\u5DF2\u6536\u85CF',
  cart: '\u8D2D\u7269\u8F66',
  addCart: '\u52A0\u5165\u8D2D\u7269\u8F66',
  buyNow: '\u7ACB\u5373\u8D2D\u4E70',
  loginFirst: '\u8BF7\u5148\u767B\u5F55',
  addSuccess: '\u6DFB\u52A0\u6210\u529F',
  removeFavorite: '\u5DF2\u53D6\u6D88\u6536\u85CF',
  addFavorite: '\u6536\u85CF\u6210\u529F'
}

const state = reactive({
  detail: {
    goodsCarouselList: []
  },
  favorite: false,
  reviews: []
})

const currency = (value) => `\uFFE5${Number(value || 0).toFixed(2)}`

onMounted(async () => {
  const { id } = route.params
  const { data } = await getDetail(id)

  if (data.goodsCarouselList && data.goodsCarouselList.length > 0) {
    data.goodsCarouselList = data.goodsCarouselList.map(i => prefixAssetUrl(i))
  }

  state.detail = data

  try {
    const { data: reviewData } = await getProductReviews(id)
    state.reviews = reviewData.list || []
  } catch (_error) {
    state.reviews = []
  }

  if (localStorage.getItem('token')) {
    try {
      const { data: favorite } = await checkFavorite(id)
      state.favorite = !!favorite
    } catch (_error) {
      state.favorite = false
    }
    cart.updateCart()
  }
})

nextTick(() => {
  const content = document.querySelector('.detail-content')
  if (content) content.scrollTop = 0
})

const goToCartList = () => {
  router.push({ path: '/cart' })
}

const handleAddCart = async () => {
  const { code } = await addCart({ goodsCount: 1, goodsId: state.detail.goodsId })
  if (code === 200) showSuccessToast(texts.addSuccess)
  cart.updateCart()
}

const buyNow = async () => {
  await addCart({ goodsCount: 1, goodsId: state.detail.goodsId })
  cart.updateCart()
  router.push({ path: '/cart' })
}

const toggleFavorite = async () => {
  if (!localStorage.getItem('token')) {
    showToast(texts.loginFirst)
    router.push({ path: '/login' })
    return
  }

  if (state.favorite) {
    await removeFavorite(state.detail.goodsId)
    state.favorite = false
    showSuccessToast(texts.removeFavorite)
  } else {
    await addFavorite(state.detail.goodsId)
    state.favorite = true
    showSuccessToast(texts.addFavorite)
  }
}
</script>

<style lang="less" scoped>
@import '../common/style/mixin';
.product-detail-page {
  .detail-content {
    height: calc(100vh - 50px);
    overflow: hidden;
    overflow-y: auto;
    .detail-swipe-wrap {
      .my-swipe .van-swipe-item {
        img {
          width: 100%;
        }
      }
    }
    .product-info {
      padding: 0 10px;
      .product-title {
        font-size: 18px;
        text-align: left;
        color: #333;
      }
      .product-desc {
        font-size: 14px;
        text-align: left;
        color: #999;
        padding: 5px 0;
      }
      .product-price {
        .fj();
        span:nth-child(1) {
          color: #F63515;
          font-size: 22px;
        }
      }
    }
    .product-intro {
      width: 100%;
      padding: 10px 20px 20px;
      box-sizing: border-box;
      .product-content {
        img {
          width: 100%;
        }
      }
    }
  }
  .review-section {
    padding: 12px;
    background: #fff;
    .review-title {
      margin-bottom: 10px;
      font-weight: 600;
    }
    .review-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      &:last-child {
        border-bottom: none;
      }
    }
    .review-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    .review-content {
      margin-bottom: 6px;
      font-size: 13px;
      color: #333;
    }
    .review-time,
    .review-empty {
      font-size: 12px;
      color: #999;
    }
  }
  .van-action-bar-button--warning {
    background: linear-gradient(to right, #6bd8d8, @primary);
  }
  .van-action-bar-button--danger {
    background: linear-gradient(to right, #0dc3c3, #098888);
  }
}
</style>
