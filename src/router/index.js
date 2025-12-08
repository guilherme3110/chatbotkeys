import { createRouter, createWebHistory } from 'vue-router'
import Feedback from '../pages/feedBack.vue'
import HomeView from '../pages/homeView.vue'
import DashboardFeedback from '../pages/dashboardFeedback.vue'
import LoginView from '@/pages/loginView.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: HomeView },
  { 
    path: '/feedback', 
    name: 'Feedback', 
    component: Feedback },
  {
    path: '/dashboard',
    name: 'DashboardFeedback',
    component: DashboardFeedback
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
