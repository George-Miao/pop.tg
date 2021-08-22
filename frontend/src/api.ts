import { clean } from '@back/utils'
import type {
  BulkQueryResponse,
  BulkQueryRequest,
  V2ListResponse
} from '@back/model'
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
    undefined,
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

export class V2API {
  readonly base = 'https://pop.tg/api/v2/'
  constructor() {}
  async fetch<Req, Res>(method: string, req: Req): Promise<Res> {
    const url = this.base + method
    return (await fetch(url, {
      body: JSON.stringify(clean(req)),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(e => e.json())) as Res
  }

  async getRecord(key: string): Promise<GetResponse> {
    return await this.fetch('get_record', { key })
  }

  async newRecord(
    key: string,
    value: string,
    ttl?: number
  ): Promise<PostResponse> {
    return await this.fetch('new_record', { key, value, ttl })
  }

  async updateRecord(
    key: string,
    value: string,
    token: string,
    ttl?: number
  ): Promise<PutResponse> {
    return await this.fetch('update_record', { key, value, token, ttl })
  }

  async deleteRecord(key: string, token: string): Promise<DelResponse> {
    return await this.fetch('delete_record', { key, token })
  }

  async listRecord(cursor?: string): Promise<V2ListResponse> {
    return await this.fetch('list_record', { cursor })
  }

  async verifyRecord(
    values: {
      key: string
      value: string
      token: string
    }[]
  ): Promise<BulkQueryResponse> {
    return await this.fetch('verify_record', { values })
  }
}
