import type {
  DelResponse,
  ListRequest,
  ListResponse,
  PostRequest,
  PostResponse,
  PutRequest,
  PutResponse,
  ResponseObject
} from '@back/model'

export enum Method {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE'
}

const test = true

export const requestApi = async <T = undefined, R = unknown>(
  endpoint: string,
  method: Method = Method.Get,
  param?: URLSearchParams,
  prop?: T
) => {
  const url = new URL(
    endpoint,
    test ? 'http://localhost:8787/api/' : 'https://pop.tg/api/'
  )
  param?.forEach((k, v) => url.searchParams.set(k, v))
  return (await fetch(url.toString(), {
    method: method,
    body: JSON.stringify(prop),
    headers: {
      'Content-Type': 'Application/json'
    }
  }).then(e => e.json())) as Promise<ResponseObject<R>>
}

export const newRecord = async (request: { key: string } & PostRequest) => {
  const { key, ...body } = request
  return await requestApi<PostRequest, PostResponse>(
    `records/${key}`,
    Method.Post,
    undefined,
    body
  )
}

export const listRecords = async (request: ListRequest) => {
  const param = new URLSearchParams(request as Record<string, string>)
  return await requestApi<ListRequest, ListResponse>(
    'records',
    Method.Get,
    param
  )
}

export const updateRecord = async (request: { key: string } & PutRequest) => {
  const { key, ...body } = request
  return await requestApi<PutRequest, PutResponse>(
    `records/${key}`,
    Method.Put,
    undefined,
    body
  )
}

export const deleteRecord = async (request: { key: string }) => {
  return await requestApi<undefined, DelResponse>(
    `records/${request.key}`,
    Method.Delete
  )
}
