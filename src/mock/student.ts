import { defineFakeRoute } from 'vite-plugin-fake-server/client'
import { shuffle } from 'lodash-es'
import Mock from 'mockjs'
import type { Student } from '@/interfaces/student'
import randomGrade from '@/utils/randomGrade'

const studentNum = 500
const studentList: Array<Student> = []

function initStudentList() {
  for (let i = 1; i <= studentNum; i++) {
    const chose2 = Math.floor(Math.random() * 2)
    const chose4 = shuffle([randomGrade(60, 100), randomGrade(60, 100), -1, -1])
    const stu: Student = {
      name: Mock.mock('@cname'),
      id: (i + 302111000).toString(),
      chinese: randomGrade(50, 150),
      math: randomGrade(50, 150),
      english: randomGrade(50, 150),
      physics: chose2 === 0 ? randomGrade(60, 100) : -1,
      history: chose2 === 1 ? randomGrade(40, 100) : -1,
      chemistry: chose4[0],
      biology: chose4[1],
      geography: chose4[2],
      politics: chose4[3],
    }
    studentList.push(stu)
  }
}

export default defineFakeRoute([
  {
    url: '/mock/student',
    method: 'get',
    response: (request) => {
      if (studentList.length === 0) {
        initStudentList()
      }
      const retList = studentList.filter((stu) => {
        if (request.query.name === '' && request.query.id === '') return true
        if (request.query.name === '') return stu.id === request.query.id
        if (request.query.id === '') return stu.name === request.query.name
        return (stu.id === request.query.id && stu.name === request.query.name)
      })
      return {
        success: true,
        students: retList,
      }
    },
  },
  {
    url: '/mock/student/condition',
    method: 'get',
    response: () => {
      if (studentList.length === 0) {
        initStudentList()
      }
      return {
        success: true,
        students: studentList,
      }
    },
  },
])
