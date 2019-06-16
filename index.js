import _ from 'lodash';

import {  
  isRedisRequired
} from './modes';
import setup from './setup'
import {
  info,
  error
} from './logger'
import startIngestion from './ingestion'
import Kafka from './kafka'
import Redis from './redis'

let kafka = null
let kafkaProducer = null
let redisClient = null

let exit = () => {
  process.exit()
}

let init = () => {

  kafka = Kafka.newInstance()

  if (isRedisRequired(setup.mode)) {
    Redis.init(onRedisReady, onRedisError)
  } else {
    Kafka.initProducer(onKafkaProducerReady, onKafkaProducerError)
  }

}

let onRedisReady = async (client) => {
  info("Redis [OK]")
  redisClient = client
  Kafka.initProducer(onKafkaProducerReady, onKafkaProducerError)
}

let onRedisError = async (err) => {
  error(`Redis [NOK] ${err}`)
  exit()
}

let onKafkaProducerReady = async (producer) => {
  info("Kafka [OK]")

  kafkaProducer = producer

  setup.print()

  await Kafka.createTopics(kafka)

  startIngestion(redisClient, kafkaProducer)
}

let onKafkaProducerError = async (err) => {
  error(`Kafka [NOK] ${err}`)
  exit()
}

init()