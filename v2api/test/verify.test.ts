import { genKey, callSuccess } from './common'

const keys = Array(10)
  .fill('')
  .map(() => genKey())

const dataToInsert = keys.map(key => {
  return {
    key,
    value: `https://example.com/${key}`
  }
})

let updated = 0
const dataToVerify = keys.map(key => {
  return {
    key,
    value:
      // Update half (which will be the first 5) of them
      updated++ >= 5
        ? `https://example.com/${key}`
        : `https://example.org/${key}`
  }
})

// And add 5 more DNE records
dataToVerify.push(
  ...Array(5)
    .fill('')
    .map(() => {
      const key = genKey()
      return {
        key: key,
        value: `https://example.com/${key}`
      }
    })
)

it('should verify', async () => {
  const results: Record<string, string> = {}
  await Promise.all(
    dataToInsert.map(v => {
      callSuccess('new_record', v).then(res => {
        const result = res.json.result
        results[result.key as string] = result.token
      })
    })
  )
  await new Promise(res => {
    setTimeout(() => {
      callSuccess('verify_record', {
        values: dataToVerify.map(e => {
          return {
            token: results[e.key] ?? 'aiousdhuioawhd',
            ...e
          }
        })
      })
        .then(res => {
          const result = res.json.result
          expect(result.matched.length).toBe(5)
          expect(result.unmatched.length).toBe(5)
          expect(result.missing.length).toBe(5)
        })
        .promise()
        .then(() => res(1))
    }, 2000)
  })
})
