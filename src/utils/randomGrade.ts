import { generateNormalDistribution } from '@/utils/normalDistribution'

export default function randomGrade(minGrade: number, maxGrade: number, mean?: number, stdDev?: number) {
  let randomNum: number
  const minRan: number = minGrade * 2
  const maxRan: number = maxGrade * 2
  if (mean === undefined || stdDev === undefined) {
    randomNum = Math.random() * (maxRan - minRan) + minRan
  }
  else {
    do {
      randomNum = generateNormalDistribution(mean * 2, stdDev)
    } while (randomNum < minRan || randomNum > maxRan)
  }
  return Math.floor(randomNum) / 2
}
