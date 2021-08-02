import { Application } from '@cfworker/web'
import api from './api'
import { ok, respondRaw } from './helper'

export const own_url = 'https://pop.tg'

new Application()
  .use(api.middleware)
  .use(async (ctx, next) => {
    if (ctx.req.method === 'HEAD') {
      ok(ctx)('OtherSuccess')
    } else if (ctx.req.method === 'OPTIONS') {
      respondRaw(ctx, 'Allow: GET, HEAD, PUT, POST, DELETE')
    } else await next()
  })
  .use(ctx =>
    ctx.respondWith(
      new Response("Seems it's a 404", {
        //todo Customize 404 page
        status: 404
      })
    )
  )
  .listen()
