import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入副文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import axios from 'axios'
// import { Table } from 'element-ui'
// 树形表格
import TreeTable from 'vue-table-with-tree-grid'

// 导入nprogress包
import NProgress from 'nprogress'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 授权API接口,请求使用Authorization字段提供token令牌
// 在request拦截器中，展示进度条NProgress.start();
axios.interceptors.request.use(config => {
  // 展示进度条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})
// 在response拦截器中，隐藏进度条NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done();
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 注册副文本编辑器的组件
Vue.use(VueQuillEditor)

// 定义一个时间的过滤器
Vue.filter('dateFormat', function(origunVal) {
  const dt = new Date(origunVal)
  // padStart用于给两位数。不足两位用0填充
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
