const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const hash = async (value: string) =>
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)).then(e =>
    Array.from(new Uint8Array(e))
      .map(x => x.toString(16).padStart(2, '0'))
      .join()
  )

export const randInt = (max: number) => {
  if (max <= 0) return 0
  return Math.floor((crypto.getRandomValues(new Uint8Array(1))[0] / 255) * max)
}

export const genToken = (len: number = 32) =>
  Array(len)
    .fill(0)
    .map(() => char[randInt(char.length)])
    .join('')

export const expire = (ttl: number) => Math.floor(Date.now() / 1000) + ttl

export const clean = (obj: any): any =>
  Array.isArray(obj)
    ? obj
    : Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v != null)
          .map(([k, v]) => [k, v === Object(v) ? clean(v) : v])
      )
