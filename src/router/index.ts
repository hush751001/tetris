import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Tetris from '../views/Tetris.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Tetris',
    component: Tetris
  }
]

const router = new VueRouter({
  routes
})

export default router
