import _ from 'lodash'

const {
  logLevel,
  CompressionTypes
} = require('kafkajs')

let parseBrokers = (brokerConfig) => {
  
  if (!brokerConfig) {
    return null
  }

  let brokers = []
  _.forEach(_.split(brokerConfig.replace(/\s/g, ""), ","), broker => {
    brokers.push(broker)
  })
  
  return brokers
}

export default {
  topicOptions: {
    users: process.env.TOPIC_USERS || 'users',
    events: process.env.TOPIC_EVENTS || 'events'
  },
  brokerOptions: {
    clientId: 'data-producer',
    brokers: parseBrokers(process.env.BROKERS) || ["localhost:19092"],
    connectionTimeout: 10000,
    requestTimeout: 30000,
    logLevel: logLevel.ERROR,
    retry: {
      retries: 10
    }
  },
  producerOptions : {
    allowAutoTopicCreation: false
  },
  producerProperties : {
    acks: 1,
    timeout: 30000,
    compression: CompressionTypes.None    
  }
}