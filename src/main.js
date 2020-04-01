import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'

// 导入axios
import axios from 'axios'
// 配置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// axios请求拦截器
axios.interceptors.request.use(function (config) {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// axios响应拦截器
axios.interceptors.response.use(function (result) {
  return result.data
})

// 在Vue原型挂载axios，
Vue.prototype.axios = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
