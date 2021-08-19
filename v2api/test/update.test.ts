import { genKey, callSuccess } from './common'

const oldUrl = 'https://example.com'
const newUrl = 'https://example.org'

const key = genKey()

it('should create a new record and update it', async () => {
  await callSuccess('new_record', {
    key,
    value: oldUrl
  })
    .then(async res => {
      const newResult = res.json.result
      await callSuccess('update_record', {
        key,
        value: newUrl,
        token: newResult.token
      })
        .then(async () => {
          await callSuccess('get_record', {
            key
          })
            .expect('json', 'result.value', newUrl)
            .promise()
        })
        .promise()
    })
    .promise()
})
