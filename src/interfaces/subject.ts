export interface Subject {
  prop: 'chinese' | 'math' | 'english' | 'physics' | 'history' | 'chemistry' | 'biology' | 'politics' | 'geography'
}

export const subjectFullscore = new Map(Object.entries({
  chinese: 150,
  math: 150,
  english: 150,
  physics: 100,
  history: 100,
  chemistry: 100,
  biology: 100,
  politics: 100,
  geography: 100,
}))
