export default function randomGrade(minGrade: number, maxGrade: number) {
  const minRan: number = minGrade * 2
  const maxRan: number = maxGrade * 2
  const ran: number = Math.random() * (maxRan - minRan) + minRan
  return Math.floor(ran) / 2
}
