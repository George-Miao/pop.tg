export const isValidUrl = (url: string) => {
  try {
    new URL(url)
  } catch (e) {
    return false
  }
  return true
}

export const sleep = async (ms: number) =>
  new Promise(res => setTimeout(() => res(ms), ms))

export const timeout = <T>(task: Promise<T>, ms: number): Promise<T> =>
  new Promise((res, rej) => {
    task.then(e => res(e))
    setTimeout(() => rej('Timeout'), ms)
  })
