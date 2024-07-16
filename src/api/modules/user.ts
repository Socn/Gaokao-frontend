import api from '../index'

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
}
