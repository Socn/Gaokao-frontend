export function getSubArray(array: Array<any>, start: number, end: number) {
  const ret: Array<any> = []
  for (let i = start; i < end; i++) {
    ret.push(array[i])
  }
  return ret
}
