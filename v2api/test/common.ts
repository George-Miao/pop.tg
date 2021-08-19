import frisby from 'frisby'

const baseUrl = 'http://127.0.0.1:8787/api/v2/'

export const genKey = () => Math.random().toString(36).slice(2, 6)

export const callSuccess = (methodName: string, obj?: any) =>
  call(methodName, obj).expect('status', 200).expect('json', 'ok', true)

export const call = (methodName: string, obj?: any) =>
  frisby.post(baseUrl + methodName, obj)
