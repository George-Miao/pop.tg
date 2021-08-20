import { call, callSuccess, genKey } from './common'

const newKey = genKey()

it('should create a new proper object and delete it', async () => {
  await callSuccess('new_record', {
    key: newKey,
    value: 'https://example.com'
  })
    .expect('json', 'result.key', newKey)
    .then(async res => {
      const result = res.json.result
      // Delete the record
      await callSuccess('delete_record', {
        key: newKey,
        token: result.token
      })
        .expect('json', 'result.value', result.value)
        .promise()
    })
    .promise()
})

afterAll(async () => {
  // And it should not be available anymore
  await call('get_record', {
    key: newKey
  })
    .expect('status', 400)
    .expect('json', 'error_text', 'RecordNotFound')
    .promise()
})
