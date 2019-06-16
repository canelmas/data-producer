import _ from 'lodash'

import Redis from './redis'
import setup from './setup'
import Kafka from './kafka'

import UserGenerator from './generators/user_generator';
import DeviceGenerator from './generators/device_generator';
import SessionGenerator from './generators/session_generator';
import EventGenerator from './generators/event_generator';
import {
    info,
    error,
    prettyPrint
} from './logger'
import {
    getSessionStopTime,
    getSessionDuration
} from './util';
import { modes } from './modes'

let sendUsersOnRedis = (redisClient, kafkaProducer) => {

    let cursor = 0

    Redis.scan(redisClient, cursor, (key) => {

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

let generateAndPersistUsersOntoRedis = (redisClient) => {

    for (var k = 0; k < setup.config.numOfUsers; k++) {
        let userInfo = UserGenerator.generate()

        if (setup.isProd()) {
            redisClient.set(userInfo["aid"], JSON.stringify(userInfo), redisClient.print)
        } else {
            prettyPrint(userInfo)
        }
    }

    info(`${setup.config.numOfUsers} users written onto Redis.`)

}

let readUsersFromRedisAndSendEvents = (redisClient, kafkaProducer) => {

    setInterval(() => {

        for (var k = 0; k < setup.config.numOfUsers; k++) {

            redisClient.send_command("RANDOMKEY", (err, aid) => {

                if (aid) {

                    redisClient.get(aid, (err, userInfo) => {

                        if (userInfo) {

                            let jsonUser = JSON.parse(userInfo)

                            // create new device based on user's last device id
                            let deviceInfo = DeviceGenerator.generate(jsonUser["ldid"])

                            // create user sessions
                            for (var i = 0; i < setup.config.sessionPerUser; i++) {

                                // create session events
                                createAndSendSessionEvents(jsonUser, deviceInfo, kafkaProducer)

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

    }, setup.config.period)
}

let generateAndSendEventsAndUsers = (kafkaProducer) => {

    setInterval(() => {

        for (var k = 0; k < setup.config.numOfUsers; k++) {

            let appId = setup.getRandomAppId()

            // new user
            let userInfo = UserGenerator.generate(appId)

            // new device based on user's last device id
            let deviceInfo = DeviceGenerator.generate(userInfo["ldid"])

            // sessions
            for (var i = 0; i < setup.config.sessionPerUser; i++) {

                // session events
                createAndSendSessionEvents(appId, userInfo, deviceInfo, kafkaProducer)

            }

            // send user
            sendUser(userInfo, kafkaProducer)

        }

    }, setup.config.period);

}

let createAndSendSessionEvents = (appId, userInfo, deviceInfo, kafkaProducer) => {

    let sessionInfo = SessionGenerator.generate()

    let sessionStartTime = sessionInfo["clientSession"]["startDateTime"]

    // fire clientSessionStart
    // sendEvent(
    //     EventGenerator.generate(
    //         'clientSessionStart',
    //         sessionStartTime,
    //         deviceInfo,
    //         sessionInfo["clientSession"],
    //         userInfo["aid"],
    //         userInfo["cid"],
    //         appId),
    //     kafkaProducer)

    // fire session events
    let sessionEvents = EventGenerator.generateSessionEvents(
        setup.config.scenario,
        setup.config.eventsPerSession,
        sessionStartTime,
        deviceInfo,
        sessionInfo["clientSession"],
        userInfo["aid"],
        userInfo["cid"],
        appId)

    _.forEach(sessionEvents, (e) => {
        sendEvent(e, kafkaProducer)
    })

    // fire clientSessionStop  
    let sessionStoptime = getSessionStopTime(setup.eventsPerSession, sessionStartTime)

    _.assignIn(sessionInfo["clientSession"], {
        stopDateTime: sessionStoptime,
        duration: getSessionDuration(sessionStartTime, sessionStoptime)
    })

    // sendEvent(
    //     EventGenerator.generate(
    //         'clientSessionStop',
    //         sessionStoptime,
    //         deviceInfo,
    //         sessionInfo["clientSession"],
    //         userInfo["aid"],
    //         userInfo["cid"],
    //         appId),
    //     kafkaProducer)

}

let sendUser = async (user, kafkaProducer) => {
    Kafka.sendUser(kafkaProducer, user)
}

let sendEvent = async (event, kafkaProducer) => {
    Kafka.sendEvent(kafkaProducer, event)
}

export default (redisClient, kafkaProducer) => {
    if (setup.config.mode == modes.SEND_USERS_ON_REDIS) {
        sendUsersOnRedis(redisClient)
    } else if (setup.config.mode == modes.GENERATE_AND_WRITE_USERS_TO_REDIS) {
        generateAndPersistUsersOntoRedis(redisClient)
    } else if (setup.config.mode == modes.GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS) {
        readUsersFromRedisAndSendEvents(redisClient, kafkaProducer)
    } else {
        generateAndSendEventsAndUsers(kafkaProducer)
    }
}