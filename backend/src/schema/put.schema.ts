import { defineSchema } from '../helper'

export default defineSchema({
  type: 'object',
  title: 'new record api',
  description: 'api schema for post /:key',
  examples: [
    {
      value: 'https://live.bilibili.com/2305276',
      ttl: 86400
    }
  ],
  required: ['value'],
  properties: {
    value: {
      type: 'string',
      title: 'The to schema',
      format: 'uri',
      description: 'The URL redirect to',
      examples: ['https://live.bilibili.com/2305276']
    },
    ttl: {
      type: 'integer',
      minimum: 60,
      title: 'The TTL schema',
      description:
        'Number of seconds the record is valid, default to unlimited which means it will not expire',
      examples: [86400]
    }
  }
})
