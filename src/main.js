import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入进度条Nprogress对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入axios
import axios from 'axios'
// 配置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// axios请求拦截器   显示进度条NProgress.start()
axios.interceptors.request.use(function (config) {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// axios响应拦截器   隐藏进度条NProgress.done()
axios.interceptors.response.use(function (result) {
  NProgress.done()
  return result.data
})

// 在Vue原型挂载axios
Vue.prototype.axios = axios

Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册成全局可用组件
Vue.use(VueQuillEditor)

// 格式化时间
Vue.filter('dateFormat', function (time) {
    const date = new Date(time)
    const yyyy = date.getFullYear()
    // getMonth()为0-11 ，padStart(2, '0')字符串总长2位，不足用'0'补齐
    const m = (date.getMonth() + 1 + '').padStart(2, '0')
    const dd = (date.getDate() + '').padStart(2, '0')
    const hh = (date.getHours() + '').padStart(2, '0')
    const mm = (date.getMinutes() + '').padStart(2, '0')
    const ss = (date.getSeconds() + '').padStart(2, '0')
    return `${yyyy}-${m}-${dd} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
