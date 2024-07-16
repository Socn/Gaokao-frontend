import api from '../index'
import useUserStore from '@/store/modules/user'

export default {
  // 登录
  login: (data: {
    name: string
    password: string
  }) => api.post('user/login', data),

  // 获取权限
  permission: () => {
    const role = localStorage.getItem('role')
    let permissions: string[] = []
    if (role === '1') {
      permissions = [
        'grade.edit',
        'grade.add',
        'user.add',
        'user.edit',
      ]
    }
    return {
      message: '',
      success: true,
      data: {
        permissions,
      },
    }
  },

  getUsers: () => {
    const userStore = useUserStore()
    return api.get('/user', {
      headers: {
        Authorization: userStore.token,
      },
    })
  },

  deleteUser: (name: string) => {
    const userStore = useUserStore()
    return api.post('/user/delete', { name }, {
      headers: {
        Authorization: userStore.token,
      },
    })
  },
  editUser: (name: string, role: number) => {
    const userStore = useUserStore()
    return api.post('/user/edit', { name, role }, {
      headers: {
        Authorization: userStore.token,
      },
    })
  },
  addUser: (data: { name: string, password: string, role: boolean }) => {
    const userStore = useUserStore()
    return api.post('/user/register', { ...data, role: Boolean(data.role) }, {
      headers: {
        Authorization: userStore.token,
      },
    })
  },
}
