<template>
  <div class="product-list-wrap">
    <div class="product-list-content">
      <header class="category-header wrap">
        <i class="nbicon nbfanhui" @click="goBack"></i>
        <div class="header-search">
          <i class="nbicon nbSearch"></i>
          <input
            v-model="state.keyword"
            type="text"
            class="search-title"
            :placeholder="texts.searchPlaceholder"
          />
        </div>
        <span class="search-btn" @click="getSearch">{{ texts.search }}</span>
      </header>
      <div v-if="showHistory" class="history-panel">
        <div class="history-header">
          <span>{{ texts.history }}</span>
          <span class="clear-btn" @click="handleClearHistory">{{ texts.clear }}</span>
        </div>
        <div class="history-tags">
          <span
            v-for="item in state.history"
            :key="item"
            class="history-tag"
            @click="applyHistory(item)"
          >
            {{ item }}
          </span>
        </div>
      </div>
      <van-tabs type="card" color="#1baeae" @click-tab="changeTab">
        <van-tab :title="texts.recommend" name=""></van-tab>
        <van-tab :title="texts.newest" name="new"></van-tab>
        <van-tab :title="texts.price" name="price"></van-tab>
      </van-tabs>
    </div>
    <div class="content">
      <van-pull-refresh v-model="state.refreshing" @refresh="onRefresh" class="product-list-refresh">
        <van-list
          v-model:loading="state.loading"
          :finished="state.finished"
          :finished-text="state.productList.length ? texts.finished : texts.emptySearch"
          @load="onLoad"
          @offset="10"
        >
          <template v-if="state.productList.length">
            <div
              v-for="(item, index) in state.productList"
              :key="index"
              class="product-item"
              @click="productDetail(item)"
            >
              <img :src="$filters.prefix(item.goodsCoverImg)" />
              <div class="product-info">
                <p class="name">{{ item.goodsName }}</p>
                <p class="subtitle">{{ item.goodsIntro }}</p>
                <span class="price">{{ currency(item.sellingPrice) }}</span>
              </div>
            </div>
          </template>
          <img
            v-else
            class="empty"
            src="https://s.yezgea02.com/1604041313083/kesrtd.png"
            :alt="texts.search"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { search } from '@/service/good'
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory
} from '@/service/searchHistory'

const route = useRoute()
const router = useRouter()
const texts = {
  search: '\u641C\u7D22',
  searchPlaceholder: '\u8BF7\u8F93\u5165\u5173\u952E\u8BCD',
  history: '\u641C\u7D22\u5386\u53F2',
  clear: '\u6E05\u7A7A',
  recommend: '\u63A8\u8350',
  newest: '\u65B0\u54C1',
  price: '\u4EF7\u683C',
  finished: '\u6CA1\u6709\u66F4\u591A\u4E86',
  emptySearch: '\u672A\u627E\u5230\u76F8\u5173\u5546\u54C1'
}

const state = reactive({
  keyword: route.query.keyword || '',
  refreshing: false,
  loading: false,
  finished: false,
  productList: [],
  totalPage: 0,
  page: 1,
  orderBy: '',
  history: []
})

const showHistory = computed(() => {
  return !state.productList.length && !state.keyword && state.history.length > 0
})

const currency = (value) => `\uFFE5${Number(value || 0).toFixed(2)}`

const loadHistory = async () => {
  if (!localStorage.getItem('token')) {
    state.history = []
    return
  }
  try {
    const { data } = await getSearchHistory()
    state.history = Array.isArray(data) ? data : []
  } catch (_error) {
    state.history = []
  }
}

const init = async () => {
  const { categoryId } = route.query
  if (!categoryId && !state.keyword) {
    state.finished = true
    state.loading = false
    return
  }

  const { data } = await search({
    pageNumber: state.page,
    goodsCategoryId: categoryId,
    keyword: state.keyword,
    orderBy: state.orderBy
  })

  state.productList = state.productList.concat(data.list || [])
  state.totalPage = data.totalPage || 0
  state.loading = false
  if (state.page >= state.totalPage) state.finished = true
}

const goBack = () => {
  router.go(-1)
}

const productDetail = (item) => {
  router.push({ path: `/product/${item.goodsId}` })
}

const getSearch = async () => {
  if (!state.keyword) {
    showToast('\u8BF7\u8F93\u5165\u641C\u7D22\u5185\u5BB9')
    return
  }
  if (localStorage.getItem('token')) {
    try {
      await addSearchHistory(state.keyword)
      await loadHistory()
    } catch (_error) {
      // ignore history save failure
    }
  }
  onRefresh()
}

const applyHistory = async (keyword) => {
  state.keyword = keyword
  await getSearch()
}

const handleClearHistory = async () => {
  await clearSearchHistory()
  state.history = []
}

const onLoad = () => {
  if (!state.refreshing && state.page < state.totalPage) {
    state.page += 1
  }
  if (state.refreshing) {
    state.productList = []
    state.refreshing = false
  }
  init()
}

const onRefresh = () => {
  state.refreshing = true
  state.finished = false
  state.loading = true
  state.page = 1
  onLoad()
}

const changeTab = ({ name }) => {
  state.orderBy = name
  onRefresh()
}

onMounted(() => {
  loadHistory()
  if (state.keyword || route.query.categoryId) {
    onRefresh()
  }
})
</script>

<style lang="less" scoped>
@import '../common/style/mixin';
.product-list-content {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: #fff;
  .category-header {
    .fj();
    width: 100%;
    height: 50px;
    line-height: 50px;
    padding: 0 15px;
    .boxSizing();
    font-size: 15px;
    color: #656771;
    .header-search {
      display: flex;
      width: 76%;
      line-height: 20px;
      margin: 10px 0;
      padding: 5px 0;
      color: #232326;
      background: #F7F7F7;
      .borderRadius(20px);
      .nbSearch {
        padding: 0 5px 0 20px;
        font-size: 17px;
      }
      .search-title {
        font-size: 12px;
        color: #666;
        background: #F7F7F7;
      }
    }
    .search-btn {
      height: 28px;
      margin: 8px 0;
      line-height: 28px;
      padding: 0 5px;
      color: #fff;
      background: @primary;
      .borderRadius(5px);
      margin-top: 10px;
    }
  }
}
.history-panel {
  padding: 10px 15px;
  .history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #666;
    font-size: 13px;
  }
  .clear-btn {
    color: @primary;
  }
  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .history-tag {
    padding: 5px 10px;
    background: #f6f6f6;
    border-radius: 14px;
    font-size: 12px;
    color: #555;
  }
}
.content {
  height: calc(~"(100vh - 70px)");
  overflow: hidden;
  overflow-y: scroll;
  margin-top: 132px;
}
.product-list-refresh {
  .product-item {
    .fj();
    width: 100%;
    height: 120px;
    padding: 10px 0;
    border-bottom: 1px solid #dcdcdc;
    img {
      width: 140px;
      height: 120px;
      padding: 0 10px;
      .boxSizing();
    }
    .product-info {
      width: 56%;
      height: 120px;
      padding: 5px;
      text-align: left;
      .boxSizing();
      p {
        margin: 0;
      }
      .name {
        width: 100%;
        max-height: 40px;
        line-height: 20px;
        font-size: 15px;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .subtitle {
        width: 100%;
        max-height: 20px;
        padding: 10px 0;
        line-height: 25px;
        font-size: 13px;
        color: #999;
        overflow: hidden;
      }
      .price {
        color: @primary;
        font-size: 16px;
      }
    }
  }
  .empty {
    display: block;
    width: 150px;
    margin: 50px auto 20px;
  }
}
</style>
