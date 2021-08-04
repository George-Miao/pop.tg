import type { HistoryStored } from './model'

const windows = window as any

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
