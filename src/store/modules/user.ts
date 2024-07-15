import useSettingsStore from './settings'
import useRouteStore from './route'
import useMenuStore from './menu'
import router from '@/router'
import apiUser from '@/api/modules/user'

const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {
    const settingsStore = useSettingsStore()
    const routeStore = useRouteStore()
    const menuStore = useMenuStore()

    const name = ref(localStorage.name ?? '')
    const token = ref(localStorage.token ?? '')
    const role = ref(localStorage.role ?? '')
    const permissions = ref<string[]>([])
    const isLogin = computed(() => {
      if (token.value) {
        return true
      }
      return false
    })

    // 登录
    async function login(data: {
      name: string
      password: string
    }) {
      const res: any = await apiUser.login(data)
      localStorage.setItem('name', res.data.user.name)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.user.role)
      name.value = res.data.user.name
      token.value = res.data.token
      role.value = res.data.user.role
    }
    // 登出
    async function logout(redirect = router.currentRoute.value.fullPath) {
      localStorage.removeItem('name')
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      name.value = ''
      token.value = ''
      role.value = ''
      permissions.value = []
      routeStore.removeRoutes()
      menuStore.setActived(0)
      router.push({
        name: 'login',
        query: {
          ...(router.currentRoute.value.path !== settingsStore.settings.home.fullPath && router.currentRoute.value.name !== 'login' && { redirect }),
        },
      })
    }
    // 获取权限
    async function getPermissions() {
      const res = await apiUser.permission()
      permissions.value = res.data.permissions
    }

    return {
      name,
      token,
      role,
      permissions,
      isLogin,
      login,
      logout,
      getPermissions,
    }
  },
)

export default useUserStore
