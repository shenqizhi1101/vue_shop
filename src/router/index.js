import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

// <!--挂载路由导航守卫,控制登录页面获取token值跳转页面-->

router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // feom 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 表示放行   next('/login') 表示强制跳转登录页面

  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login')
  next();
})

export default router
