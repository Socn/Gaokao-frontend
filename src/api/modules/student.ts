import api from '../index'
import type { StudentC } from '@/interfaces/student'

export default {
  getGrade: {
    byNameId: (
      name: string,
      id: string,
    ) => api.get(`student?name=${name}&id=${id}`, {
      baseURL: '/mock/',
    }),
    byCondition: (
      condition: string,
    ) => api.get(`student/condition?condition=${condition}`, {
      baseURL: '/mock/',
    }),
    all: () => api.get('student/condition?condition=', {
      baseURL: '/mock/',
    }),
  },
  editGrade: (stu: StudentC) => api.post('student/edit', stu.toAPIResponse(), {
    baseURL: '/mock/',
  }),
  addGrade: (stu: StudentC) => api.post('student/add', stu.toAPIResponse(), {
    baseURL: '/mock/',
  }),
}
