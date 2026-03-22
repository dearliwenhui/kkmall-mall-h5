const DEFAULT_API_BASE = 'http://localhost:38081'

export function getApiOrigin(rawBaseApi = import.meta.env.VITE_APP_BASE_API || DEFAULT_API_BASE) {
  return rawBaseApi.replace(/\/+$/, '').replace(/\/api$/, '')
}

export function prefixAssetUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const baseUrl = getApiOrigin()
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`
}
