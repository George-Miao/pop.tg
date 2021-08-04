import { Router } from '@cfworker/web'

import {
  DelResponse,
  GetResponse,
  PostRequest,
  PostResponse,
  PutRequest,
  PutResponse,
  URLRecordInKv
} from './model'

import {
  defineMiddleware,
  err,
  ok,
  redirectTemp,
  unzip,
  validator
} from './helper'
import { expire, genToken } from './utils'
import postSchema from './schema/post.schema'
import putSchema from './schema/put.schema'
import { own_url } from '.'

const keyPattern = '^[a-zA-Z0-9_-]{2,12}$'
const prefix = 'url'

const validateEndpoint = (endpoint: string) => {
  return defineMiddleware(async (ctx, next) => {
    let key = endpoint.split(':')[1]
    if (!new RegExp(keyPattern).test(ctx.req.params[key]))
      err(ctx)('BadRequest', ['Bad token format', `Pattern: ${keyPattern}`])
    else await next()
  })
}

const list = defineMiddleware(async ctx => {
  const cursor = ctx.req.url.searchParams.get('cursor') || undefined
  const value = await KV.list({
    prefix,
    cursor,
    limit: 20
  })
  value.keys.map(e => (e.name = e.name.replace(`${prefix}-`, '')))
  ok(ctx)('RecordListed', value)
})

const get = defineMiddleware(async ctx => {
  const key = ctx.req.params.key
  const value = await KV.get<URLRecordInKv>(`${prefix}-${key}`, 'json')

  if (!value) {
    err(ctx)('RecordNotFound', `Record ${key} not found`)
  } else {
    const ret: GetResponse = {
      key: value.key,
      value: value.value,
      expire: value.expire
    }
    ok(ctx)('RecordFound', ret)
  }
})

const post = defineMiddleware(async ctx => {
  const { key } = unzip(ctx)

  const body = await validator<PostRequest>(ctx, postSchema)

  if (await KV.get(`${prefix}-${key}`)) {
    err(ctx)('RecordDuplicated', `${key} is duplicated`)
  }

  const value: URLRecordInKv = {
    key,
    token: genToken(),
    value: body.value
  }
  if (body.ttl) {
    value.expire = expire(body.ttl)
  }

  await KV.put(`${prefix}-${key}`, JSON.stringify(value), {
    expiration: value.expire
  })

  const ret: PostResponse = value
  ok(ctx)('RecordCreated', ret)
})

const put = defineMiddleware(async ctx => {
  const { key, token } = unzip(ctx)

  if (!token) {
    err(ctx)('AuthorizeFailed', [
      'No token provided',
      'It should be provided in url search paramter',
      'e.g. ?token=aOisj28VBdaDpz'
    ])
  }

  const body = await validator<PutRequest>(ctx, putSchema)

  const stored = await KV.get<URLRecordInKv>(`${prefix}-${key}`, 'json')

  if (!stored) {
    err(ctx)('RecordNotFound', `Record ${key} not found`)
    return
  }

  if (stored.token !== token && token !== AUTH) {
    err(ctx)('AuthorizeFailed', `Authorized failed, your token is invalid`)
    return
  }

  const newToken = genToken()

  const newRecord: URLRecordInKv = {
    key,
    value: body.value,
    token: newToken
  }

  if (body.ttl) {
    newRecord.expire = expire(body.ttl)
  }

  await KV.put(`${prefix}-${key}`, JSON.stringify(newRecord), {
    expirationTtl: body.ttl
  })

  const ret: PutResponse = newRecord // For matter of typing
  ok(ctx)('RecordUpdated', ret)
})

const del = defineMiddleware(async ctx => {
  const { key, token } = unzip(ctx)

  if (!token) {
    err(ctx)('AuthorizeFailed', [
      'No token provided',
      'It should be provided in url search paramter',
      'e.g. ?token=aOisj28VBdaDpz'
    ])
  }

  const stored = await KV.get<URLRecordInKv>(`${prefix}-${key}`, 'json')

  if (!stored) {
    err(ctx)('RecordNotFound', `Record ${key} not found`)
    return
  }

  if (stored.token !== token && AUTH !== token) {
    err(ctx)('AuthorizeFailed', `Authorized failed, your token is invalid`)
    return
  }

  await KV.delete(`${prefix}-${key}`)

  const ret: DelResponse = {
    key,
    value: stored.value,
    expire: stored.expire
  }

  ok(ctx)('RecordDeleted', ret)
})

const redirect = defineMiddleware(async ctx => {
  const key = ctx.req.params.key
  const value = await KV.get<URLRecordInKv>(`${prefix}-${key}`, 'json')

  if (!value) await redirectTemp(ctx)(own_url)
  else await redirectTemp(ctx)(value.value)
})

export default new Router()
  .get('/', ctx => ctx.respondWith(new Response('Index'))) // todo: Index page, fetch frontend to respond
  .get('/:key', redirect)
  .get('/api/records', list)
  .get('/api/records/:key', validateEndpoint('/api/records/:key'), get)
  .post('/api/records/:key', validateEndpoint('/api/records/:key'), post)
  .put('/api/records/:key', validateEndpoint('/api/records/:key'), put)
  .delete('/api/records/:key', validateEndpoint('/api/records/:key'), del)
