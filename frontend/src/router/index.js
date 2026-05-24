import { createRouter, createWebHistory } from 'vue-router'

// Page components
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import FarmHouseList from '../pages/FarmHouseList.vue'
import FarmHouseDetail from '../pages/FarmHouseDetail.vue'
import BookingPage from '../pages/BookingPage.vue'
import UserBookings from '../pages/UserBookings.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import OwnerDashboard from '../pages/OwnerDashboard.vue'
import NotFound from '../pages/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/farmhouses',
    name: 'FarmHouseList',
    component: FarmHouseList
  },
  {
    path: '/farmhouses/:id',
    name: 'FarmHouseDetail',
    component: FarmHouseDetail
  },
  {
    path: '/booking/:id',
    name: 'BookingPage',
    component: BookingPage
  },
  {
    path: '/my-bookings',
    name: 'UserBookings',
    component: UserBookings
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard
  },
  {
    path: '/owner',
    name: 'OwnerDashboard',
    component: OwnerDashboard
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
