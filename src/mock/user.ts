import { defineFakeRoute } from 'vite-plugin-fake-server/client'
import Mock from 'mockjs'

export default defineFakeRoute([
  {
    url: '/mock/user/login',
    method: 'post',
    response: ({ body }) => {
      return {
        message: '',
        success: true,
        data: Mock.mock({
          token: `${body.name}_@string`,
          user: {
            name: body.name,
            role: 1,
          },
        }),
      }
    },
  },
  {
    url: '/mock/user/permission',
    method: 'get',
    response: ({ headers }) => {
      let permissions: string[] = []
      if (headers.token?.indexOf('admin') === 0) {
        permissions = [
          'permission.browse',
          'permission.create',
          'permission.edit',
          'permission.remove',
          'grade.edit',
          'grade.add',
        ]
      }
      else if (headers.token?.indexOf('test') === 0) {
        permissions = [
          'permission.browse',
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
  },
  {
    url: '/mock/user/password/edit',
    method: 'post',
    response: () => {
      return {
        message: '',
        success: true,
        data: {
          isSuccess: true,
        },
      }
    },
  },
])
