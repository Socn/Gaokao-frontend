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
      cache: ['detail', 'detailPage', 'overall', 'overallPage'],
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
          cache: ['detail', 'detailPage', 'overall', 'overallPage'],
        },
      },
    ],
  },
  {
    path: '/students/detail/:id',
    component: Layout,
    redirect: '/students/detail',
    name: 'detail',
    meta: {
      title: '学生详细',
      icon: 'i-material-symbols:person',
      menu: false,
    },
    children: [
      {
        path: '',
        name: 'detailPage',
        component: () => import('@/views/student_menu/detail.vue'),
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
