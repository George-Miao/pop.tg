import { callSuccess, genKey } from './common'
import frisby from 'frisby'

const root = 'http://127.0.0.1:8787/'
const home = 'https://www.pop.tg/'

frisby.globalSetup({
  request: {
    redirect: 'manual'
  }
})

it('should create a new record and redirect', async () => {
  const newKey = genKey()
  const dest = 'https://example.com/'
  await callSuccess('new_record', {
    key: newKey,
    value: dest
  })
    .expect('json', 'result.key', newKey)
    .expect('json', 'result.value', dest)
    .promise()

  await frisby
    .get(`${root}/${newKey}`)
    .expect('status', 302)
    .expect('header', 'location', dest)
    .promise()
})

it('should redirect to homepage', async () => {
  const randKey = genKey()
  await frisby
    .get(`${root}/${randKey}`)
    .expect('status', 302)
    .expect('header', 'location', home)
    .promise()

  await frisby
    .get(root)
    .expect('status', 308)
    .expect('header', 'location', home)
    .promise()
})
