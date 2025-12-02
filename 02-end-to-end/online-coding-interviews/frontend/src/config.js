// API configuration that works in both development and production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export const API_URL = isDevelopment
  ? 'http://localhost:8000'
  : window.location.origin

export const WS_URL = isDevelopment
  ? 'ws://localhost:8000'
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
