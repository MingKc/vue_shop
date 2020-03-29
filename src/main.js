import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'

// 导入axios
import axios from 'axios'
// 在Vue原型挂载axios，并配置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$axios = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
