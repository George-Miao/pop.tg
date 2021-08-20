import { Application, Router } from '@cfworker/web'
import api from './api'
import { redirectPerm, redirectTemp } from './helper'
import { URLRecordInKv } from './model'

const own_url = 'https://www.pop.tg'
export const prefix = 'url-'

const redirect = new Router()
  .get('/', async ctx => {
    await redirectPerm(ctx)(own_url)
  })
  .get('/:key', async ctx => {
    const key = ctx.req.params.key
    const value = await KV.get<URLRecordInKv>(prefix + key, 'json')

    if (!value) await redirectTemp(ctx)(own_url)
    else await redirectTemp(ctx)(value.value)
  }).middleware

new Application().use(redirect).use(api).listen()
