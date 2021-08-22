import { HistoryStored, isValidHistories } from './model'

const urlReg =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
const tokenReg = /[a-zA-Z0-9]{3,12}/

export const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return urlReg.test(url)
  } catch (e) {
    return false
  }
}

export const isValidToken = (token: string) => {
  return tokenReg.test(token)
}

export const sleep = async (ms: number) =>
  new Promise(res => setTimeout(() => res(ms), ms))

export const timeout = <T>(task: Promise<T>, ms: number): Promise<T> =>
  new Promise((res, rej) => {
    task.then(e => res(e))
    setTimeout(() => rej('Timeout'), ms)
  })

export const copy = async (text: string): Promise<true> => {
  await navigator.clipboard.writeText(text)
  return true
}

export const loadHistories = () => {
  const data = localStorage.getItem('histories')
  if (!data) return []
  else return JSON.parse(data) as HistoryStored[]
}

export const saveHistories = (obj: HistoryStored[]) =>
  localStorage.setItem('histories', JSON.stringify(obj))

export const loadJson = async () => {
  var input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  return new Promise<Event>(res => {
    input.onchange = res
    input.click()
  })
    .then(e => {
      let file = (e.target as HTMLInputElement)?.files?.[0]
      if (!file) {
        throw new Error('No file selected')
      } else return file
    })
    .then(readFile)
    .then(async e => {
      const result = e.target?.result
      if (!result || result instanceof ArrayBuffer)
        throw new Error('Invalid content')
      const data = JSON.parse(result) as HistoryStored[]
      if (await isValidHistories(data).then(e => !e))
        throw new Error('Invalid data format')
      return data
    })
}

export const readFile = (dir: Blob) =>
  new Promise<ProgressEvent<FileReader>>(res => {
    var reader = new FileReader()
    reader.readAsText(dir)
    reader.onload = res
  })
