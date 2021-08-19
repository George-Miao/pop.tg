import { call, callSuccess } from './common'

it('should return RecordNotFound', async () =>
  await call('get_record', {
    key: 'akjsdnak'
  })
    .expect('status', 400)
    .expect('json', 'error_code', 104)
    .promise())

it('should give my record', async () =>
  await callSuccess('get_record', {
    key: 'abc'
  })
    .expect('json', 'result.value', 'https://baidu.com')
    .promise())
