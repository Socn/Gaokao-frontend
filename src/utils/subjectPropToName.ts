export const subjectPropToName: Map<string, string> = new Map(Object.entries({
  chinese: '语文',
  math: '数学',
  english: '英语',
  physics: '物理',
  history: '历史',
  chemistry: '化学',
  biology: '生物',
  geography: '地理',
  politics: '政治',
}))
export function subjectPropToNameFunc(prop: string) {
  if (!subjectPropToName.has(prop)) return ''
  return subjectPropToName.get(prop)
}
