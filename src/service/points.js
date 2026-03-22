import axios from '../utils/axios'

export function getUserPoints() {
  return axios.get('/api/mall/points')
}

export function signInPoints() {
  return axios.post('/api/mall/points/sign-in')
}

export function getPointsLog(params = {}) {
  return axios.get('/api/mall/points/log', {
    params: {
      pageNum: params.pageNumber || 1,
      pageSize: params.pageSize || 10
    }
  }).then(res => {
    if (res.data) {
      res.data = {
        list: res.data.list || [],
        totalCount: res.data.total || 0,
        currPage: res.data.pageNum || 1,
        pageSize: res.data.pageSize || 10,
        totalPage: res.data.pages || 0
      }
    }
    return res
  })
}
