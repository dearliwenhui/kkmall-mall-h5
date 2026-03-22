import axios from '../utils/axios'

export function addSearchHistory(keyword) {
  return axios.post('/api/mall/search-history', null, {
    params: { keyword }
  })
}

export function getSearchHistory(limit = 10) {
  return axios.get('/api/mall/search-history', {
    params: { limit }
  })
}

export function clearSearchHistory() {
  return axios.delete('/api/mall/search-history')
}

export function deleteSearchHistory(keyword) {
  return axios.delete(`/api/mall/search-history/${encodeURIComponent(keyword)}`)
}
