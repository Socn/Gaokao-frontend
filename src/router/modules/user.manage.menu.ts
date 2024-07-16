import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/users',
    component: Layout,
    redirect: '/users/index',
    name: 'users',
    meta: {
      title: '用户管理',
      cache: ['search', 'searchPage', 'overall', 'overallPage'],
      menu: false,
      auth: 'user.edit',
    },
    children: [
      {
        path: 'index',
        name: 'usersPage',
        component: () => import('@/views/user_manage/users.vue'),
        meta: {
          title: '用户管理',
          menu: false,
          cache: ['search', 'searchPage', 'overall', 'overallPage'],
          breadcrumb: false,
          auth: 'user.edit',
        },
      },
    ],
  },
]

export default routes
