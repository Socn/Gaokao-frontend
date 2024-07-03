import type { Subject } from '@/interfaces/subject'

export interface StudentFilter {
  type: 'single' | 'sum'
  subjects: Array<Subject>
  constrains: [number, number]
  and?: StudentFilter
}

export function getWhereClause(filter: StudentFilter) {
  let ret = ''
  let sum = ''
  filter.subjects.forEach((subject, index) => {
    if (index !== 0)sum += '+'
    sum += subject.prop
  })
  ret = ` (${sum} BETWEEN ${filter.constrains[0] * 10} and ${filter.constrains[1] * 10}) `
  if (filter.and !== undefined)ret += `AND ${getWhereClause(filter.and)}`
  return ret
}
