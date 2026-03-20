import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCart } from '@/service/cart'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)

  async function updateCart() {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      count.value = 0
      return
    }

    try {
      const { data = [] } = await getCart()
      count.value = data.length
    } catch (error) {
      // 如果是 401/403 错误，说明未登录或 token 过期
      if (error.code === 401 || error.code === 403) {
        count.value = 0
        localStorage.removeItem('token')
      }
    }
  }

  return { count, updateCart }
})
