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

let exit = () => {
  process.exit()
}

let init = () => {  
  
  setup.print()

  if (isRedisRequired(setup.config.mode)) {    
    Redis.init(onRedisReady, onRedisError)
  } else {    
    Kafka.initProducer(onKafkaProducerReady, onKafkaProducerError)
  }
  
}

let onRedisReady = async () => {
  info("Redis [OK]")
  Kafka.initProducer(onKafkaProducerReady, onKafkaProducerError)
}

let onRedisError = async (err) => {
  error(`Redis [NOK] ${err}`)
  exit()
}

let onKafkaProducerReady = async () => {
  info("Kafka [OK]")  
  startIngestion()
}

let onKafkaProducerError = async (err) => {
  error(`Kafka [NOK] ${err}`)
  exit()
}

init()