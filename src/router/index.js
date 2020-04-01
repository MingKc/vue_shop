import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach(function (to, from, next) {
  // to: 访问路径   from: 从哪里跳转来
  // next()是一个函数 next(): 放行   next('/login'): 强制跳转
  if (to.path === '/login') {
    next()
  }
  const token = window.sessionStorage.getItem('token')
  if (!token) {
    next('/login')
  } else {
    next()
  }
})

export default router
