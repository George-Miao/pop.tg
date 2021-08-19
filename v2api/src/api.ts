import { genToken, expire } from './utils'
import {
  BulkQueryResponse,
  DelResponse,
  GetResponse,
  PostResponse,
  PutResponse,
  URLRecordInKv
} from 'src/model'
import { ApiError, Methods } from './helper'
import * as yup from 'yup'

const prefix = 'url-'

// Unique identifier for record
const key = yup
  .string()
  .matches(/^[a-zA-Z0-9_-]{3,12}$/)
  .required()
// URL object
const url = yup.string().url().required()
// Token generated to claim the ownership
const token = yup.string().required()
// Time to live, in minutes. Minimum 1 hour
const ttl = yup.number().min(60)

export default new Methods('api/v2')
  .method(
    'get_record',
    yup.object({
      key
    }),
    async body => {
      const value = await KV.get<URLRecordInKv>(prefix + body.key, 'json')
      if (!value) {
        throw new ApiError('RecordNotFound', [])
      } else {
        return {
          key: value.key,
          value: value.value,
          expire: value.expire
        } as GetResponse
      }
    }
  )
  .method(
    'new_record',
    yup.object({
      key,
      value: url,
      ttl: ttl.optional()
    }),
    async body => {
      if (await KV.get(prefix + body.key)) {
        throw new ApiError('KeyDuplicated', [`${body.key} already existed`])
      }
      const value: URLRecordInKv = {
        key: body.key,
        token: genToken(),
        value: body.value
      }
      if (body.ttl) {
        value.expire = expire(body.ttl)
      }
      await KV.put(prefix + body.key, JSON.stringify(value), {
        expirationTtl: body.ttl
      })
      return value as PostResponse
    }
  )
  .method(
    'update_record',
    yup.object({
      key,
      ttl,
      token,
      value: url
    }),
    async body => {
      const stored = await KV.get<URLRecordInKv>(prefix + body.key, 'json')
      if (!stored)
        throw new ApiError('RecordNotFound', `Record ${key} not found`)

      if (stored.token !== body.token && body.token !== AUTH)
        throw new ApiError(
          'NotAuthorized',
          `Authorized failed, your token is invalid`
        )

      const newToken = genToken()

      const newRecord: URLRecordInKv = {
        key: body.key,
        value: body.value,
        token: newToken
      }

      if (body.ttl) {
        newRecord.expire = expire(body.ttl)
      }

      await KV.put(prefix + body.key, JSON.stringify(newRecord), {
        expirationTtl: body.ttl
      })

      return newRecord as PutResponse
    }
  )
  .method(
    'delete_record',
    yup.object({
      key,
      token
    }),
    async body => {
      const keyInKv = prefix + body.key
      const stored = await KV.get<URLRecordInKv>(keyInKv, 'json')
      if (!stored)
        throw new ApiError('RecordNotFound', `Record ${body.key} not found`)
      await KV.delete(keyInKv)
      const ret: DelResponse = {
        key: body.key,
        value: stored.value
      }
      return ret
    }
  )
  .method(
    'list_record',
    yup.object({
      cursor: yup.string()
    }),
    async body => {
      const value = await KV.list({
        prefix,
        cursor: body.cursor,
        limit: 20
      })
      return {
        keys: value.keys.map(e => (e.name = e.name.replace(prefix, ''))),
        list_complete: value.list_complete,
        cursor: value.cursor
      }
    }
  )
  .method(
    'verify_record',
    yup.object({
      values: yup
        .array()
        .of(
          yup.object({
            key,
            value: url,
            token
          })
        )
        .required()
    }),
    async body => {
      const ret: BulkQueryResponse = {
        matched: [],
        unmatched: [],
        missing: []
      }
      await Promise.all(
        body.values.map(async item => {
          const stored = await KV.get<URLRecordInKv>(prefix + item.key, 'json')
          if (!stored) ret.missing.push(item.key)
          // Check if these two have the same token and value (target url)
          else if (stored.token !== item.token || stored.value !== item.value) {
            ret.unmatched.push(item.key)
          } else {
            ret.matched.push(item.key)
          }
        })
      )
      return ret
    }
  ).middleware
