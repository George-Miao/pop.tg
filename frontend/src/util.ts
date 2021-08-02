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
