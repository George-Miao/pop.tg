import { clean, expire } from './utils'
import { Context, Middleware } from '@cfworker/web'
import { Schema, validate } from '@cfworker/json-schema'
import {
  Body,
  ErrorResponseCode,
  ResponseBase,
  ResponseObject,
  SuccessResponseCode
} from './model'

export const define = <T>(value: T) => value
export const defineSchema = (schema: Schema) => schema
export const defineMiddleware = (middeware: Middleware) => middeware

const redirectText = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>Redirecting...</title>
</head><body>
<h1>302 Found</h1>
<p>This is a redirect page to <a href="{{ url }}">here</a>.</p>
<p>The process should happen automatically by your browser</p>
</body></html>`

export const baseResp = (): ResponseBase => {
  return {
    time: expire(0)
  }
}

export const unzip = ({ req }: Context) => {
  const key = req.params.key
  const token = req.url.searchParams.get('token')
  return {
    key,
    token
  }
}

export const ok =
  (ctx: Context) =>
  (status_text: keyof typeof SuccessResponseCode, body?: Body) =>
    respond(ctx, {
      ...baseResp(),
      success: true,
      status_text,
      status: SuccessResponseCode[status_text],
      content: {
        body
      }
    })

export const err =
  (ctx: Context) =>
  (
    status_text: keyof typeof ErrorResponseCode,
    reason: string | string[],
    body?: Body
  ) =>
    respond(ctx, {
      ...baseResp(),
      success: false,
      status_text,
      status: ErrorResponseCode[status_text],
      content: {
        reason,
        body
      }
    })

export const validator = async <T = unknown>(ctx: Context, schema: Schema) => {
  const data = (await ctx.req.body.json()) as T
  if (!data) {
    err(ctx)('BadRequest', 'Missing body')
  }
  const result = validate(data, schema)
  if (!result.valid) {
    err(ctx)(
      'BadRequest',
      result.errors.map(e => e.error)
    )
  }
  return data
}

export const redirectTemp = (ctx: Context) => async (url: string) => {
  ctx.respondWith(
    new Response(redirectText.replace('{{ url }}', url), {
      status: 302,
      headers: {
        'Location': url,
        'Content-Type': 'text/html; charset=UTF-8'
      }
    })
  )
}

export const respond = (
  ctx: Context,
  json: ResponseObject,
  init?: ResponseInit
) => {
  respondRaw(ctx, JSON.stringify(clean(json)), {
    status: json.success ? 200 : 400,
    ...init
  })
}

export const respondRaw = (
  ctx: Context,
  raw?: string | null,
  init?: ResponseInit
) => {
  ctx.respondWith(
    new Response(raw, {
      headers: {
        'Content-Type': 'Application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,POST,DELETE',
        'Access-Control-Max-Age': '86400'
      },
      ...init
    })
  )
}
