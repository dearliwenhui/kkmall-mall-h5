<template>
  <div class="favorite-page">
    <s-header :name="texts.title" />
    <div class="content">
      <van-pull-refresh v-model="state.refreshing" @refresh="onRefresh">
        <van-list v-model:loading="state.loading" :finished="state.finished" :finished-text="texts.finished" @load="onLoad">
          <div v-if="state.list.length">
            <div v-for="item in state.list" :key="item.favoriteId" class="favorite-item">
              <van-card :title="item.goodsName" :price="item.sellingPrice" :thumb="$filters.prefix(item.goodsCoverImg)" @click="goDetail(item.goodsId)" />
              <div class="favorite-actions">
                <van-button size="small" plain color="#1baeae" @click="goDetail(item.goodsId)">{{ texts.view }}</van-button>
                <van-button size="small" plain color="#ee0a24" @click="remove(item.goodsId)">{{ texts.remove }}</van-button>
              </div>
            </div>
          </div>
          <div v-else-if="!state.loading" class="empty">{{ texts.empty }}</div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import sHeader from '@/components/SimpleHeader.vue'
import { getFavoriteList, removeFavorite } from '@/service/favorite'

const router = useRouter()
const texts = {
  title: '\u6211\u7684\u6536\u85CF',
  finished: '\u6CA1\u6709\u66F4\u591A\u4E86',
  view: '\u67E5\u770B',
  remove: '\u53D6\u6D88\u6536\u85CF',
  empty: '\u6682\u65E0\u6536\u85CF\u5546\u54C1',
  removed: '\u5DF2\u53D6\u6D88\u6536\u85CF'
}

const state = reactive({
  loading: false,
  finished: false,
  refreshing: false,
  page: 1,
  totalPage: 0,
  list: []
})

const loadData = async () => {
  const { data } = await getFavoriteList({ pageNumber: state.page })
  state.list = state.list.concat(data.list || [])
  state.totalPage = data.totalPage || 0
  state.loading = false
  if (state.page >= state.totalPage || state.totalPage === 0) state.finished = true
}

const onLoad = () => {
  if (!state.refreshing && state.page < state.totalPage) state.page += 1
  if (state.refreshing) {
    state.list = []
    state.refreshing = false
  }
  loadData()
}

const onRefresh = () => {
  state.finished = false
  state.loading = true
  state.refreshing = true
  state.page = 1
  onLoad()
}

const goDetail = (id) => {
  router.push({ path: `/product/${id}` })
}

const remove = async (goodsId) => {
  await removeFavorite(goodsId)
  showSuccessToast(texts.removed)
  onRefresh()
}

onRefresh()
</script>

<style lang="less" scoped>
.favorite-page {
  .content {
    min-height: calc(100vh - 44px);
    background: #f7f7f7;
  }
  .favorite-item {
    margin: 10px;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
  }
  .favorite-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 16px 16px;
  }
  .empty {
    padding: 60px 0;
    text-align: center;
    color: #999;
  }
}
</style>
