export default {
  brokerHost: process.env.BROKER || 'localhost:19092',
  timeout: 20000,
  producerOptions: {
    requireAcks: 1,
    ackTimeoutMs: 1000,
    partitionerType: 0
  },
  topics: {
    users: process.env.TOPICS_USERS || 'users',
    events: process.env.TOPICS_EVENTS || 'events'
  },
  compressionType: 1 // 1: gzip 0: no compression
}