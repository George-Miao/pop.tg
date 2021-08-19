import { callSuccess, genKey } from './common'

const newKey = genKey()

it('should create a new proper object and delete it', async () => {
  await callSuccess('new_record', {
    key: newKey,
    value: 'https://example.com'
  })
    .expect('json', 'result.key', newKey)
    .then(async res => {
      const result = res.json.result
      await callSuccess('delete_record', {
        key: newKey,
        token: result.token
      })
        .expect('json', 'result.value', result.value)
        .promise()
    })
    .promise()
})
