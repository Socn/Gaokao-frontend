import api from '../index'

export default {
  getGrade: {
    byNameId: (
      name: string,
      id: string,
    ) => api.get(`student?name=${name}&id=${id}`, {
      baseURL: '/mock/',
    }),
  },
}
