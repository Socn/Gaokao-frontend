import { getSubArray } from '@/utils/subArray'

export interface StudentAPIResponse {
  [key: string]: string | number
  name: string
  id: string
  chinese: number
  math: number
  english: number
  physics: number
  history: number
  chemistry: number
  biology: number
  politics: number
  geography: number
}
export interface Student {
  name: string
  id: string
  gradeSum: number
  groups: {
    [key: string]: {
      limit: number
      selectedCount: number
      grade: { [key: string]: number, chinese: number, math: number, english: number } | { [key: string]: number, physics: number, history: number } | { [key: string]: number, chemistry: number, biology: number, politics: number, geography: number }
    }
    main: {
      limit: number
      selectedCount: number
      grade: {
        [key: string]: number
        chinese: number
        math: number
        english: number
      }
    }
    second: {
      limit: number
      selectedCount: number
      grade: {
        [key: string]: number
        physics: number
        history: number
      }
    }
    third: {
      limit: number
      selectedCount: number
      grade: {
        [key: string]: number
        chemistry: number
        biology: number
        politics: number
        geography: number
      }
    }
  }
}

export const emptyStudentInfo: Student = {
  name: '',
  id: '',
  gradeSum: 0,
  groups: {
    main: {
      limit: 3,
      selectedCount: 0,
      grade: {
        chinese: -1,
        math: -1,
        english: -1,
      },
    },
    second: {
      limit: 1,
      selectedCount: 0,
      grade: {
        physics: -1,
        history: -1,
      },
    },
    third: {
      limit: 2,
      selectedCount: 0,
      grade: {
        chemistry: -1,
        biology: -1,
        politics: -1,
        geography: -1,
      },
    },
  },
}

const indexToGroup = ['main', 'second', 'third']
const indexToEntry = [['chinese', 'math', 'english'], ['physics', 'history'], ['chemistry', 'biology', 'politics', 'geography']]
export class StudentC implements Student {
  name: string
  id: string
  gradeSum: number
  groups: {
    [key: string]: {
      limit: number
      selectedCount: number
      grade: { [key: string]: number, chinese: number, math: number, english: number } | { [key: string]: number, physics: number, history: number } | { [key: string]: number, chemistry: number, biology: number, politics: number, geography: number }
    }
    main: {
      limit: number
      selectedCount: number
      grade: {
        [key: string]: number
        chinese: number
        math: number
        english: number
      }
    }
    second: {
      limit: number
      selectedCount: number
      grade: {
        [key: string]: number
        physics: number
        history: number
      }
    }
    third: {
      limit: number
      selectedCount: number
      grade: {
        [key: string]: number
        chemistry: number
        biology: number
        politics: number
        geography: number
      }
    }
  }

  public getGradeSum(): number {
    let sum = 0
    indexToEntry.forEach((group, index) => {
      group.forEach((subject) => {
        const grade = this.groups[indexToGroup[index]].grade[subject]
        if (grade !== -1) sum += grade
      })
    })
    return sum
  }

  public constructor(object?: StudentAPIResponse) {
    if (object === undefined) {
      this.name = emptyStudentInfo.name
      this.id = emptyStudentInfo.id
      this.gradeSum = emptyStudentInfo.gradeSum
      this.groups = emptyStudentInfo.groups
      return
    }
    this.name = object.name ?? ''
    this.id = object.id ?? ''
    this.groups = {
      main: {
        limit: 3,
        selectedCount: Number(object.chinese !== -1) + Number(object.math !== -1) + Number(object.english !== -1),
        grade: {
          chinese: object.chinese,
          math: object.math,
          english: object.english,
        },
      },
      second: {
        limit: 1,
        selectedCount: Number(object.physics !== -1) + Number(object.history !== -1),
        grade: {
          physics: object.physics,
          history: object.history,
        },
      },
      third: {
        limit: 2,
        selectedCount: Number(object.chemistry !== -1) + Number(object.biology !== -1) + Number(object.politics !== -1) + Number(object.geography !== -1),
        grade: {
          chemistry: object.chemistry,
          biology: object.biology,
          politics: object.politics,
          geography: object.geography,
        },
      },
    }
    this.gradeSum = this.getGradeSum()
  }

  public fromStudent(stu: Student) {
    this.name = stu.name
    this.id = stu.id
    this.groups = stu.groups
    return this
  }

  public toAPIResponse(): StudentAPIResponse {
    return {
      name: String(this.name),
      id: String(this.id),
      chinese: Number(this.groups.main.grade.chinese),
      math: Number(this.groups.main.grade.math),
      english: Number(this.groups.main.grade.english),
      physics: Number(this.groups.second.grade.physics),
      history: Number(this.groups.second.grade.history),
      chemistry: Number(this.groups.third.grade.chemistry),
      biology: Number(this.groups.third.grade.biology),
      politics: Number(this.groups.third.grade.politics),
      geography: Number(this.groups.third.grade.geography),
    }
  }

  public toSimpleObj() {
    return {
      name: String(this.name),
      id: String(this.id),
      chinese: Number(this.groups.main.grade.chinese),
      math: Number(this.groups.main.grade.math),
      english: Number(this.groups.main.grade.english),
      physics: Number(this.groups.second.grade.physics),
      history: Number(this.groups.second.grade.history),
      chemistry: Number(this.groups.third.grade.chemistry),
      biology: Number(this.groups.third.grade.biology),
      politics: Number(this.groups.third.grade.politics),
      geography: Number(this.groups.third.grade.geography),
      sum: Number(this.getGradeSum()),
    }
  }
}
