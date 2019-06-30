import _ from 'lodash'

import {
    Kafka,
    KafkaAvro
} from "kafkajs-avro"

import config from './config/kafka'
import setup from './setup'

import {
    info,
    prettyPrint,
    error
} from './logger'

const ENTITY_EVENT = 'event'
const ENTITY_USER = 'user'

let producers = {}
let multiTopicMapping = []

let checkSchemaRegistry = () => {
    if (!setup.config.schemaRegistry) {
        throw new Error("Schema Registry is missing!")
    }
}

let isAvroRequired = () => {
    return true
}

let initProducer = async (onReady, onError) => {

    let kafka = null

    if (setup.config.multiTopics) {

        multiTopicMapping = createMultiTopicMapping()

        if (_.isEmpty(multiTopicMapping)) {
            throw new Error('Someting\'s wrong with muliTopic config!')
        }

        kafka = new Kafka(config.brokerOptions)
        let jsonProducer = kafka.producer(config.producerOptions)

        jsonProducer.on(jsonProducer.events.CONNECT, async () => {

            if (setup.config.topicsToCreate) {
                await createTopics(kafka)
            }

            if (isAvroRequired()) {

                kafka = new KafkaAvro(config.brokerOptions)
                let avroProducer = kafka.avro.producer(config.producerOptions)

                avroProducer.on(avroProducer.events.CONNECT, async () => {
                    await onReady()
                })

                avroProducer.on(avroProducer.events.DISCONNECT, async (err) => {
                    await onError(err)
                })

                producers.avro = avroProducer

                await avroProducer.connect()

            } else {
                await onReady()
            }

        })

        jsonProducer.on(jsonProducer.events.DISCONNECT, async () => {
            await onError(err)
        })

        producers.json = jsonProducer

        await jsonProducer.connect()

    } else {

        let producer = null

        if (setup.config.format == 'avro') {

            checkSchemaRegistry()

            kafka = new KafkaAvro(config.brokerOptions)
            producer = producers.avro = kafka.avro.producer(config.producerOptions)            

        } else {
            kafka = new Kafka(config.brokerOptions)
            producer = producers.json = kafka.producer(config.producerOptions)            
        }        

        producer.on(producer.events.CONNECT, async () => {
            if (setup.config.topicsToCreate) {
                await createTopics(kafka)
            }
            await onReady()
        })

        producer.on(producer.events.DISCONNECT, async (err) => {
            await onError(err)
        })

        await producer.connect()
    }

}

let createTopics = async (kafka) => {

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

let createMultiTopicMapping = () => {
    
    try {

        let multiTopicMapping = []

        if (setup.config.multiTopics) {

            _.forEach(_.split(setup.config.multiTopics.replace(/\s/g, ""), ","), entry => {

                let topicParams = _.split(entry, ":")

                multiTopicMapping.push({
                    entity: topicParams[0],
                    topic: topicParams[1],
                    format: topicParams[2],
                    subject: topicParams[3]
                })

            })

        }

        return multiTopicMapping

    } catch (err) {
        throw new Error(`Parsing multi topics failed!\n${err.message}`)
    }
}

let send = async (topic, message, entity) => {

    if (setup.isProd()) {

        if (setup.config.multiTopics) {            
            sendToMultipleTopics(message, entity)
        } else {            
            sendToSingleTopic(topic, message)
        }

    } else {
        prettyPrint(message)
    }

}

let sendToMultipleTopics = async (message, entity) => {

    _.forEach(multiTopicMapping, async (v) => {
        if (entity == v.entity) {            
            if (v.format == 'avro') {
                sendToSingleTopicAsAvro(v.topic, message, v.subject)
            } else {
                sendToSingleTopicAsJson(v.topic, message)
            }
        }
    })

}

let sendToSingleTopic = async (topic, message) => {
    setup.config.format == 'avro' ? sendToSingleTopicAsAvro(topic, message) : sendToSingleTopicAsJson(topic, message)
}

let sendToSingleTopicAsAvro = async (topic, message, subject) => {
    await producers.avro.send({
            topic: topic,
            messages: [{
                subject: subject || `${topic}-value`,
                version: "latest",
                value: message
            }]
        })
        .then(res => {
            if (setup.isVerbose()) {
                info(res)
            }
        })
        .catch(error)
}

let sendToSingleTopicAsJson = async (topic, message) => {
    await producers.json.send({
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

let sendEvent = (event) => {
    send(config.topicOptions.events, event, ENTITY_EVENT)
}

let sendUser = (user) => {
    send(config.topicOptions.users, user, ENTITY_USER)
}

export default {
    initProducer,
    send,
    sendEvent,    
    sendUser
}