import axios from '../utils/axios'

export function getLogistics(orderId) {
  return axios.get(`/api/mall/logistics/order/${orderId}`)
}
