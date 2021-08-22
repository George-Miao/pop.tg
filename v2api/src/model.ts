import { AnySchema, Asserts } from 'yup'
import { Handler } from './helper'

export interface SuccessResponse<T> {
  ok: true
  result: T
}

export interface ErrorResponse {
  ok: false
  error_code: ErrorsCode
  error_text: keyof typeof ErrorsCode
  reason: string[]
}

export type ResponseObject<T> = SuccessResponse<T> | ErrorResponse

export enum ErrorsCode {
  BadRequest = 101,
  KeyDuplicated = 102,
  NotAuthorized = 103,
  RecordNotFound = 104
}

export interface URLRecord {
  key: string
  value: string
  expire?: number
}

interface Token {
  token: string
}

export interface URLRecordInKv extends URLRecord, Token {}

/* -------------------------------------------------------------------------- */
/*                               Response Models                              */
/* -------------------------------------------------------------------------- */

export interface GetResponse extends URLRecord {}

export interface VerifyResponse {
  matched: string[]
  unmatched: string[]
  missing: string[]
}

export interface PostResponse extends Token, URLRecord {}

export interface PutResponse extends Token, URLRecord {}

export interface DelResponse extends URLRecord {}

export interface ListResponse {
  keys: string[]
  list_complete: boolean
  cursor: string
}
