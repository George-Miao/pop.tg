import { defineSchema } from '../helper'

export default defineSchema({
  type: 'array',
  items: {
    type: 'object',
    required: ['key', 'value', 'token'],
    properties: {
      key: {
        type: 'string'
      },
      value: {
        type: 'string'
      },
      token: {
        type: 'string'
      }
    }
  }
})
