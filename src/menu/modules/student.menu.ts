import type { Menu } from '#/global'

const menus: Menu.recordRaw = {
  meta: {
    title: '学生成绩',
    icon: 'i-material-symbols:account-circle',
  },
  children: [
    {
      path: '/students/overall',
      meta: {
        title: '总览',
        icon: 'i-material-symbols:supervisor-account',
      },
      children: [
        {
          path: '',
          meta: {
            title: '总览',
            menu: false,
          },
        },
      ],
    },
    {
      path: '/students/search',
      meta: {
        title: '搜索',
        icon: 'i-material-symbols:search',
      },
      children: [
        {
          path: '',
          meta: {
            title: '搜索',
            menu: false,
          },
        },
      ],
    },
    {
      path: '/students/detail/:id',
      meta: {
        title: '学生详细',
        icon: 'i-material-symbols:person',
        menu: false,
      },
      children: [
        {
          path: '',
          meta: {
            title: '学生详细',
            menu: false,
          },
        },
      ],
    },
  ],
}

export default menus
