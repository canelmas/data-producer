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
import Webhook from './webhook'
import outputs from "./outputs"

let exit = (err) => {
  error(err)
  process.exit(1)
}

let onWebhookReady = () => {
  info('Webhook [OK]')
}

let onKafkaReady = () => {
  info('Kafka [OK]')
  startIngestion()
}

let onRedisReady = () => {
  info('Redis [OK]')

  if (setup.hasOutput(outputs.KAFKA)) {
    Kafka.initProducer(onKafkaReady)
  } else {
    startIngestion()
  }

}

let init = () => {

  try {

    setup.print()

    if (setup.hasOutput(outputs.WEBHOOK)) {
      Webhook.init(onWebhookReady)
    }

    if (isRedisRequired(setup.config.mode)) {
      Redis.init(onRedisReady)
    } else if (setup.hasOutput(outputs.KAFKA)) {
      Kafka.initProducer(onKafkaReady)
    } else {
      startIngestion()
    }

  } catch (err) {
    exit(err)
  }

}

init()