import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/Report/Report.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  // 重定向Welcome页面
  { path: '/home', component: Home, redirect: '/Welcome', children: [{ path: '/welcome', component: Welcome }, { path: '/users', component: Users }, { path: '/rights', component: Rights }, { path: '/roles', component: Roles }, { path: '/categories', component: Cate }, { path: '/params', component: Params }, { path: '/goods', component: GoodsList }, { path: '/goods/add', component: Add }, { path: '/orders', component: Order }, { path: '/reports', component: Report }] }
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
