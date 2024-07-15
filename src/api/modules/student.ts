import api from '../index'
import useUserStore from '@/store/modules/user'
import type { StudentC } from '@/interfaces/student'

const userStore = useUserStore()

export default {
  getGrade: {
    byNameId: (
      name: string,
      id: string,
    ) => api.get(`student?name=${name}&id=${id}`, {
      headers: {
        Authorization: userStore.token,
      },
    }),
    byCondition: (
      condition: string,
    ) => api.get(`student/condition?condition=${condition}`, {
      headers: {
        Authorization: userStore.token,
      },
    }),
    all: () => api.get('student/condition?condition=', {
      headers: {
        Authorization: userStore.token,
      },
    }),
  },
  editGrade: (stu: StudentC) => api.post('student/edit', stu.toAPIResponse(), {
    headers: {
      Authorization: userStore.token,
    },
  }),
  addGrade: (stu: StudentC) => api.post('student/add', stu.toAPIResponse(10), {
    headers: {
      Authorization: userStore.token,
    },
  }),
  deleteGrade: (stu: StudentC) => api.post('student/delete', { name: stu.name, id: stu.id }, {
    headers: {
      Authorization: userStore.token,
    },
  }),
}
