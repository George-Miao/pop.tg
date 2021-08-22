import { ErrorResponse, ErrorsCode, ResponseObject } from './model'
import { Context, Router } from '@cfworker/web'
import { AnySchema, Asserts } from 'yup'

const redirectText = `<!DOCTYPE html PUBLIC "-//IETF//DTD HTML 2.0//EN"><html><head><title>Redirecting...</title></head><body><h1>Redirecting</h1><p>This is a redirect page to<code> {{ url }} </code></p><p>The process should be done automatically by your browser</p><br /><span><label>If not, click: </label><a href="{{ url }}">here</a></span></body></html>`
export class ApiError<S extends keyof typeof ErrorsCode> extends Error {
  private _status: keyof typeof ErrorsCode
  private _reason: string[]
  constructor(status: S, reason: string[] | string = []) {
    super(`Api Error <${status}>: ${reason}`)
    Object.setPrototypeOf(this, ApiError.prototype)
    this._status = status
    if (!Array.isArray(reason)) reason = [reason]
    this._reason = reason
  }

  get status() {
    return this._status
  }

  get reason() {
    return this._reason
  }

  get response(): ErrorResponse {
    return {
      error_code: ErrorsCode[this._status],
      error_text: this._status,
      ok: false,
      reason: this._reason
    }
  }
}

ApiError.prototype.toString = () => {
  return 'Api Error'
}

export class Methods {
  router: Router
  base: string

  constructor(name: string = 'api') {
    this.router = new Router()
    this.base = name
  }

  method<R, S extends AnySchema, B extends Asserts<S>>(
    name: string,
    schema: S,
    handler: Handler<B, R>
  ) {
    const url = `/${this.base}/${name}`
    this.router.post(url, async ctx => {
      const body = ((await ctx.req.body.json()) ?? {}) as B
      console.log(`Method <${name}> called`)
      if (await schema.isValid(body).then(e => !e)) {
        respond(
          ctx,
          new ApiError('BadRequest', ['Invalid request body']).response
        )
      } else {
        try {
          console.log('Body: ', JSON.stringify(body))
          console.log(`Invoking handler`)
          const ret = await handler(body, ctx)
          console.log('Ret: ', JSON.stringify(ret))
          respond(ctx, {
            ok: true,
            result: ret
          })
        } catch (e) {
          if (e instanceof ApiError) {
            respond(ctx, e.response)
          } else {
            console.log(`Unexpected error: ${(e as Error).message}`)
            ctx.respondWith(
              new Response('Internal Error', {
                status: 500
              })
            )
          }
        }
      }
    })
    return this
  }

  get middleware() {
    return this.router.middleware
  }
}

export const respond = <T>(ctx: Context, obj: ResponseObject<T>) =>
  respondRaw(ctx, JSON.stringify(obj), {
    status: obj.ok ? 200 : 400
  })

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

export const exist = async (key: string) => KV.get(key).then(e => !!e)

export const redirectTemp = (ctx: Context) => async (url: string) => {
  ctx.respondWith(
    new Response(redirectText.replaceAll('{{ url }}', url), {
      status: 302,
      headers: {
        'Location': url,
        'Content-Type': 'text/html; charset=UTF-8'
      }
    })
  )
}

export const redirectPerm = (ctx: Context) => async (url: string) => {
  ctx.respondWith(
    new Response(redirectText.replaceAll('{{ url }}', url), {
      status: 308,
      headers: {
        'Location': url,
        'Content-Type': 'text/html; charset=UTF-8'
      }
    })
  )
}

export type Handler<B, R> = (body: B, ctx: Context) => Promise<R> | R
