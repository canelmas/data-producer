import _ from 'lodash';

import {
  getSessionStopTime,
  getSessionDuration,
  DATE_FORMAT
} from "./util";

import configKafka from './config/kafka';
import redisClient from "./config/redis";
import {
  modes,
  modeFromString
} from "./modes";

import UserGenerator from "./generators/user_generator";
import DeviceGenerator from "./generators/device_generator";
import SessionGenerator from "./generators/session_generator";
import EventGenerator from "./generators/event_generator";

import {
  Kafka
} from 'kafkajs'

const NODE_ENV = process.env.NODE_ENV || "development"
const VERBOSE = process.env.VERBOSE || "true"

const PERIOD = process.env.PERIOD_IN_MS || 5 * 1000;
const NUM_OF_USERS = process.env.NUM_OF_USERS || 1
const SESSION_PER_USER = process.env.SESSION_PER_USER || 1
const EVENTS_PER_SESSION = process.env.EVENTS_PER_SESSION || 5
const RUN_MODE = modeFromString(process.env.RUN_MODE) || modes.GENERATE_AND_SEND_EVENTS_AND_USERS
const APPS = (process.env.APP_IDS || "DemoApp").replace(" ", "").split(",")
const TOPICS_TO_CREATE = process.env.CREATE_TOPICS || undefined

const kafka = new Kafka(configKafka.brokerOptions)
const kafkaProducer = kafka.producer()

let getRandomAppId = () => {
  return _.sample(APPS)
}

let isVerbose = () => {
  return VERBOSE == "true"
}

let isProd = () => {
  return NODE_ENV == "production"
}

let exit = () => {
  process.exit()
}

let error = (err) => {
  console.error(err)
}

let info = (msg) => {
  console.info(msg)
}

let prettyPrint = (json) => {
  info(JSON.stringify(json, null, 4))
}

let showConfig = () => {
  info(`mode=${NODE_ENV}`)
  info(`runMode=${RUN_MODE}`)
  info(`period=${PERIOD}`)
  info(`numOfUsers=${NUM_OF_USERS}`)
  info(`sessionPerUser=${SESSION_PER_USER}`)
  info(`eventPerSession=${EVENTS_PER_SESSION}`)
  info(`dateFormat=${DATE_FORMAT}\n`)
  info(`verbose=${VERBOSE}`)
  info(`topicsToCreate=${TOPICS_TO_CREATE}`)
  info(`brokers=${configKafka.brokerOptions.brokers}\n`)
}

redisClient.on('ready', async () => {
  info("Redis [OK]")
  await kafkaProducer.connect()
})

redisClient.on('error', (err) => {
  error(`Redis [NOK] ${err}`)
  exit()
})

kafkaProducer.on(kafkaProducer.events.CONNECT, async (e) => {
  info("Kafka [OK]")
  showConfig()

  await createTopics()

  if (RUN_MODE == modes.SEND_USERS_ON_REDIS) {
    sendUsersOnRedis()
  } else if (RUN_MODE == modes.GENERATE_AND_WRITE_USERS_TO_REDIS) {
    generateAndPersistUsersOntoRedis()
  } else if (RUN_MODE == modes.GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS) {
    readUsersFromRedisAndSendEvents()
  } else {
    generateAndSendEventsAndUsers()
  }

})

kafkaProducer.on(kafkaProducer.events.DISCONNECT, e => {
  error(`Kafka [NOK] ${err}`)
  exit()
})

let scanRedis = (cursor, callback, finalize) => {

  redisClient.scan(cursor, "MATCH", "*", "COUNT", 200, (err, reply) => {

    if (err) {
      throw err
    }

    cursor = reply[0]

    let keys = reply[1]

    if (cursor == 0 && keys.length == 0) {
      return finalize()
    } else {

      _.forEach(keys, (key) => {
        callback(key)
      })

      if (cursor == 0) {
        return finalize()
      } else return scanRedis(cursor, callback, finalize)

    }

  })

}

let sendUsersOnRedis = () => {

  let cursor = 0

  scanRedis(cursor, (key) => {

    redisClient.get(key, (err, user_info) => {

      if (user_info) {
        sendUser(JSON.parse(user_info), kafkaProducer)
      } else {
        error(err)
      }
    })

  }, () => {
    info("Users read from Redis sent.")
  })

}

let generateAndPersistUsersOntoRedis = () => {

  for (var k = 0; k < NUM_OF_USERS; k++) {
    let userInfo = UserGenerator.generate()

    if (isProd()) {
      redisClient.set(userInfo["aid"], JSON.stringify(userInfo), redisClient.print)
    } else {
      prettyPrint(userInfo)
    }
  }

  info(`${NUM_OF_USERS} users written onto Redis.`)

}

let readUsersFromRedisAndSendEvents = () => {

  setInterval(() => {

    for (var k = 0; k < NUM_OF_USERS; k++) {

      redisClient.send_command("RANDOMKEY", (err, aid) => {

        if (aid) {

          redisClient.get(aid, (err, userInfo) => {

            if (userInfo) {

              let jsonUser = JSON.parse(userInfo)

              // create new device based on user's last device id
              let deviceInfo = DeviceGenerator.generate(jsonUser["ldid"])

              // create user sessions
              for (var i = 0; i < SESSION_PER_USER; i++) {

                // create session events
                createAndSendSessionEvents(jsonUser, deviceInfo)

              }

            } else {
              error(err)
            }

          })

        } else {
          error(err)
        }

      })

    }

  }, PERIOD)
}

let generateAndSendEventsAndUsers = () => {

  setInterval(() => {

    for (var k = 0; k < NUM_OF_USERS; k++) {

      let appId = getRandomAppId()

      // new user
      let userInfo = UserGenerator.generate(appId)

      // new device based on user's last device id
      let deviceInfo = DeviceGenerator.generate(userInfo["ldid"])

      // sessions
      for (var i = 0; i < SESSION_PER_USER; i++) {

        // session events
        createAndSendSessionEvents(appId, userInfo, deviceInfo)

      }

      // send user
      sendUser(userInfo, kafkaProducer)

    }

  }, PERIOD);

}

let createAndSendSessionEvents = (appId, userInfo, deviceInfo) => {

  let sessionInfo = SessionGenerator.generate()

  let sessionStartTime = sessionInfo["clientSession"]["startDateTime"]

  // fire clientSessionStart
  sendEvent(
    EventGenerator.generate('clientSessionStart',
      sessionStartTime,
      deviceInfo,
      sessionInfo["clientSession"],
      userInfo["aid"],
      userInfo["cid"],
      appId))

  // fire session events
  let sessionEvents = EventGenerator.generateSessionEvents(EVENTS_PER_SESSION,
    sessionStartTime,
    deviceInfo,
    sessionInfo["clientSession"],
    userInfo["aid"],
    userInfo["cid"],
    appId)

  _.forEach(sessionEvents, sendEvent)

  // fire clientSessionStop  
  let sessionStoptime = getSessionStopTime(EVENTS_PER_SESSION, sessionStartTime)

  _.assignIn(sessionInfo["clientSession"], {
    stopDateTime: sessionStoptime,
    duration: getSessionDuration(sessionStartTime, sessionStoptime)
  })

  sendEvent(EventGenerator.generate('clientSessionStop',
    sessionStoptime,
    deviceInfo,
    sessionInfo["clientSession"],
    userInfo["aid"],
    userInfo["cid"],
    appId))

}

let createTopics = async () => {

  if (TOPICS_TO_CREATE) {

    let topics = []

    _.forEach(_.split(TOPICS_TO_CREATE.replace(/\s/g, ""), ","), topicEntry => {

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

let sendUser = async (userInfo) => {
  send(configKafka.topicOptions.users, userInfo)
}

let sendEvent = async (event) => {
  send(configKafka.topicOptions.events, event)
}

let send = async (topic, message) => {

  if (isProd()) {

    await kafkaProducer.send({
        topic: topic,
        messages: [{
          value: JSON.stringify(message)
        }],
        acks: configKafka.producerOptions.acks,
        timeout: configKafka.producerOptions.timeout,
        compression: configKafka.producerOptions.compression
      })
      .then(res => {
        if (isVerbose()) {
          info(res)
        }
      })
      .catch(error)

  } else {
    prettyPrint(message)
  }

}