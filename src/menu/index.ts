import StudentMenu from './modules/student.menu'

import type { Menu } from '#/global'

const menu: Menu.recordMainRaw[] = [
  {
    meta: {
      title: '高考成绩管理系统',
      icon: 'uim:box',
    },
    children: [
      StudentMenu,
    ],
  },
]

export default menu
