import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/students/overall',
    component: Layout,
    redirect: '/students/overall',
    name: 'overall',
    meta: {
      title: '总览',
      icon: 'i-material-symbols:supervisor-account',
    },
    children: [
      {
        path: '',
        name: 'overallPage',
        component: () => import('@/views/student_menu/overall.vue'),
        meta: {
          title: '总览',
          menu: false,
          breadcrumb: false,
        },
      },
    ],
  },
  {
    path: '/students/search',
    component: Layout,
    redirect: '/students/search',
    name: 'search',
    meta: {
      title: '搜索',
      icon: 'i-material-symbols:search',
    },
    children: [
      {
        path: '',
        name: 'searchPage',
        component: () => import('@/views/student_menu/search.vue'),
        meta: {
          title: '搜索',
          menu: false,
          breadcrumb: false,
        },
      },
    ],
  },
  {
    path: '/students/info',
    component: Layout,
    redirect: '/students/info',
    name: 'info',
    meta: {
      title: '学生详细',
      icon: 'i-material-symbols:person',
    },
    children: [
      {
        path: '',
        name: 'infoPage',
        component: () => import('@/views/student_menu/info.vue'),
        meta: {
          title: '学生详细',
          menu: false,
          breadcrumb: false,
        },
      },
    ],
  },
]

export default routes
