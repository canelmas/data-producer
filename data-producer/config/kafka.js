import _ from 'lodash'
import setup from '../setup'

const {
  logLevel,
  CompressionTypes
} = require('kafkajs')

export default {
  topicOptions: {
    users: setup.config.topicUsers,
    events: setup.config.topicEvents
  },
  brokerOptions: {
    clientId: 'data-producer',
    brokers: setup.config.brokers,
    connectionTimeout: 10000,
    requestTimeout: 30000,
    logLevel: logLevel.ERROR,
    retry: {
      retries: 10
    },
    avro: {
      url: setup.config.schemaRegistry
    }
  },
  producerOptions: {
    allowAutoTopicCreation: false
  },
  producerProperties: {
    acks: 1,
    timeout: 30000,
    compression: CompressionTypes.None
  }
}