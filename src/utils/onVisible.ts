export default function onVisible(element: any, callback: any) {
  new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        callback(element)
        observer.disconnect()
      }
    })
  }).observe(element)
  if (!callback) {
    return new Promise(r => callback = r)
  }
}
