import api from '../index'

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
    all: () => api.get('student/condition?condition=""', {
      baseURL: '/mock/',
    }),
  },
}
