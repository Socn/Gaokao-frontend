import { defineFakeRoute } from 'vite-plugin-fake-server/client'
import type { Student } from '@/interfaces/student'
import randomGrade from '@/utils/randomGrade'

const StudentNum = 500

export default defineFakeRoute([
  {
    url: '/mock/student',
    method: 'get',
    response: () => {
      const retList: Array<Student> = []
      for (let i = 1; i <= StudentNum; i++) {
        const stu: Student = {
          name: i.toString(),
          id: i.toString(),
          chinese: randomGrade(50, 150),
          math: randomGrade(50, 150),
          english: randomGrade(50, 150),
          physics: randomGrade(60, 100),
          history: randomGrade(40, 100),
          chemistry: randomGrade(60, 100),
          biology: randomGrade(60, 100),
          geography: randomGrade(60, 100),
          politics: randomGrade(60, 100),
        }
        retList.push(stu)
      }
      return {
        success: true,
        students: retList,
      }
    },
  },
])
