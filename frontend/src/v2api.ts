import { clean } from '@back/utils'
import type {
  VerifyResponse,
  DelResponse,
  GetResponse,
  ListResponse,
  PostResponse,
  PutResponse,
  ResponseObject
} from '@v2/model'

const test = true
export default {
  base: test ? 'http://127.0.0.1:8787/api/v2/' : 'https://pop.tg/api/v2/',
  async fetch<Req, Res>(method: string, req: Req) {
    const url = this.base + method
    return (await fetch(url, {
      body: JSON.stringify(clean(req)),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(e => e.json())) as ResponseObject<Res>
  },

  async getRecord(key: string): Promise<ResponseObject<GetResponse>> {
    return await this.fetch('get_record', { key })
  },

  async newRecord(
    key: string,
    value: string,
    ttl?: number
  ): Promise<ResponseObject<PostResponse>> {
    return await this.fetch('new_record', { key, value, ttl })
  },

  async updateRecord(
    key: string,
    value: string,
    token: string,
    ttl?: number
  ): Promise<ResponseObject<PutResponse>> {
    return await this.fetch('update_record', { key, value, token, ttl })
  },

  async deleteRecord(
    key: string,
    token: string
  ): Promise<ResponseObject<DelResponse>> {
    return await this.fetch('delete_record', { key, token })
  },

  async listRecord(cursor?: string): Promise<ResponseObject<ListResponse>> {
    return await this.fetch('list_record', { cursor })
  },

  async verifyRecord(
    values: {
      key: string
      value: string
      token: string
    }[]
  ): Promise<ResponseObject<VerifyResponse>> {
    return await this.fetch('verify_record', { values })
  }
}
