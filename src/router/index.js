import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '@/services/api'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/landing',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { layout: 'none' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'none' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/patients',
      name: 'patients',
      component: () => import('@/views/PatientsView.vue'),
    },
    {
      path: '/patients/add',
      name: 'patients-add',
      component: () => import('@/views/AddPatientView.vue'),
    },
    {
      path: '/patients/:id',
      name: 'patient-record',
      component: () => import('@/views/PatientRecordView.vue'),
    },
    {
      path: '/patients/:id/edit',
      name: 'patient-edit',
      component: () => import('@/views/EditPatientView.vue'),
    },
    {
      path: '/transmissions',
      name: 'transmissions',
      component: () => import('@/views/TransmissionsView.vue'),
    },
    {
      path: '/diagnostics',
      name: 'diagnostics',
      component: () => import('@/views/DiagnosticsView.vue'),
    },
    {
      path: '/feedbacks',
      name: 'feedbacks-admin',
      component: () => import('@/views/FeedbacksAdminView.vue'),
    },
    {
      path: '/audit-log',
      name: 'audit-log',
      component: () => import('@/views/AuditLogView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const publicRoutes = ['home', 'login']
  if (!publicRoutes.includes(to.name) && !getAccessToken()) return { name: 'login' }
  if (to.name === 'login' && getAccessToken()) return { name: 'dashboard' }
  return true
})

export default router
