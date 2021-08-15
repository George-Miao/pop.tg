import type { BulkQueryResponse, BulkQueryRequest } from '@back/model'
import { timeout } from './util'
import type {
  DelResponse,
  GetResponse,
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

const test = false

export const requestApi = async <T = undefined, R = unknown>(
  endpoint: string,
  method: Method = Method.Get,
  param?: URLSearchParams,
  prop?: T
) => {
  const url = new URL(
    endpoint,
    test ? 'http://localho.st:8787/api/' : 'https://pop.tg/api/'
  )
  param?.forEach((v, k) => url.searchParams.set(k, v))
  return fetch(url.toString(), {
    method: method,
    body: JSON.stringify(prop),
    mode: 'cors'
  }).then(e => e.json()) as Promise<ResponseObject<R>>
}

export const bulkQuery = async (request: BulkQueryRequest) =>
  requestApi<BulkQueryRequest, BulkQueryResponse>(
    '/api/records_bulk',
    Method.Post,
    new URLSearchParams({
      keys: request.join('+')
    }),
    request
  )

export const getRecord = async (request: { key: string }) =>
  requestApi<{ key: string }, GetResponse>(`records/${request.key}`)

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

export const updateRecord = async (
  request: { key: string; token: string } & PutRequest
) => {
  const { key, token, ...body } = request
  const param = new URLSearchParams()
  param.set('token', request.token)
  return await requestApi<PutRequest, PutResponse>(
    `records/${key}`,
    Method.Put,
    param,
    body
  )
}

export const deleteRecord = async (request: { key: string; token: string }) => {
  const param = new URLSearchParams()
  param.set('token', request.token)
  return await requestApi<undefined, DelResponse>(
    `records/${request.key}`,
    Method.Delete,
    param
  )
}
