import { call, callSuccess, genKey } from './common'

const newKey = genKey()

console.log(newKey)

it('should create a new proper object', async () => {
  await callSuccess('new_record', {
    key: newKey,
    value: 'https://example.com'
  })
    .inspectJSON()
    .expect('json', 'result.key', newKey)
    .then(async res => {
      const result = res.json.result
      await callSuccess('get_record', {
        key: newKey
      })
        .expect('status', 200)
        .expect('json', 'result.value', result.value)
        .promise()
    })
    .promise()
})

it("should warn it's duplicated", async () => {
  await call('new_record', {
    key: newKey,
    value: 'https://oasjdhoad.com'
  })
    .expect('status', 400)
    .expect('json', 'error_text', 'KeyDuplicated')
    .promise()
})
