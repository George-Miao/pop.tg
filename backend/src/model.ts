export enum SuccessResponseCode {
  RecordFound = 100,
  RecordCreated = 101,
  RecordUpdated = 102,
  RecordDeleted = 103,
  RecordListed = 104,
  OtherSuccess = 199
}

export enum ErrorResponseCode {
  BadRequest = 200,
  RecordExpired = 201,
  RecordDuplicated = 203,
  RecordNotFound = 204,
  AuthorizeFailed = 205,
  OtherError = 299
}

export type Body = string | string[] | Object

export interface ResponseBase {
  time: number
}

export interface ErrorResponseObject<T = Body> extends ResponseBase {
  success: false
  status: ErrorResponseCode
  status_text: keyof typeof ErrorResponseCode
  content: {
    reason: string | string[]
    body?: T
  }
}

export interface SuccessResponseObject<T = Body> extends ResponseBase {
  success: true
  status: SuccessResponseCode
  status_text: keyof typeof SuccessResponseCode
  content: {
    body?: T
  }
}

export type ResponseObject<T = Body> =
  | ErrorResponseObject<T>
  | SuccessResponseObject<T>

export interface URLRecord {
  key: string
  value: string
  expire?: number
}

export interface URLRecordInKv extends URLRecord, Token {}

interface Token {
  token: string
}

/* -------------------------------------------------------------------------- */
/*                               Request Models                               */
/* -------------------------------------------------------------------------- */

export interface PostRequest {
  value: string
  ttl?: number
}

export interface PutRequest extends PostRequest {}

export interface ListRequest {
  cursor?: string
}

/* -------------------------------------------------------------------------- */
/*                               Response Models                              */
/* -------------------------------------------------------------------------- */

export interface GetResponse extends URLRecord {}

export interface PostResponse extends Token, URLRecord {}

export interface PutResponse extends Token, URLRecord {}

export interface DelResponse extends URLRecord {}

export interface ListResponse {
  length: number
  cursor: string
  records: URLRecord[]
}
