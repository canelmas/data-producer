import _ from 'lodash'
import {
    Kafka
} from 'kafkajs'

import KafkaAvro from "kafkajs-avro"

import config from './config/kafka'
import setup from './setup'

import {
    info,
    prettyPrint
} from './logger'

let newInstance = () => {
    return new Kafka(config.brokerOptions)
}

let initProducer = async (onReady, onError) => {

    let kafkaProducer = null

    if (setup.config.format == 'avro') {

        if (!setup.config.schemaRegistry) {
            throw new Error('No Schema Registry set!')
        }

        const kafka = new KafkaAvro({
            clientId: "data-producer",
            brokers: config.brokerOptions.brokers,
            avro: {
                url: setup.config.schemaRegistry
            }
        })

        kafkaProducer = kafka.avro.producer()

    } else {
        kafkaProducer = kafka.producer(config.producerOptions)
    }

    kafkaProducer.on(kafkaProducer.events.CONNECT, async () => {
        await onReady(kafkaProducer)
    })

    kafkaProducer.on(kafkaProducer.events.DISCONNECT, async (err) => {
        await onError()
    })

    await kafkaProducer.connect()

}

let createTopics = async (kafka) => {

    if (setup.config.topicsToCreate) {

        let topics = []

        _.forEach(_.split(setup.config.topicsToCreate.replace(/\s/g, ""), ","), topicEntry => {

            let topicParams = _.split(topicEntry, ":")

            topics.push({
                topic: topicParams[0],
                numPartitions: topicParams[1],
                replicationFactor: topicParams[2]
            })

        })

        const admin = kafka.admin()

        await admin.connect()

        await admin.createTopics({
            validateOnly: false,
            waitForLeaders: true,
            timeout: 20000,
            topics: topics
        }).then(success => {
            info("Topic Creation " + (success ? "[OK]" : "[NOK]\n"))
        })

        await admin.disconnect()

    }

}

let send = async (kafkaProducer, topic, message) => {

    if (setup.isProd()) {

        if (setup.format == 'avro') {

            info(message)

            await kafkaProducer.send({
                    topic: topic,
                    messages: [{
                        subject: "events-value",
                        version: "latest",
                        value: message
                        // value : JSON.stringify(message)
                    }]
                })
                .then(res => {
                    if (setup.isVerbose()) {
                        info(res)
                    }
                })
                .catch(error)

        } else {

            await kafkaProducer.send({
                    topic: topic,
                    messages: [{
                        value: JSON.stringify(message)
                    }],
                    acks: config.producerProperties.acks,
                    timeout: config.producerProperties.timeout,
                    compression: config.producerProperties.compression
                })
                .then(res => {
                    if (setup.isVerbose()) {
                        info(res)
                    }
                })
                .catch(error)

        }

    } else {
        prettyPrint(message)
    }

}

let sendEvent = (producer, event) => {
    send(producer, config.topicOptions.events, event)
}

let sendUser = (producer, user) => {
    send(producer, config.topicOptions.users, user)
}

export default {
    newInstance: newInstance,
    initProducer: initProducer,
    createTopics: createTopics,
    send: send,
    sendEvent : sendEvent,
    sendUser : sendUser
}