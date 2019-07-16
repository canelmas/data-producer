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
import {
    modes
} from './modes'
import WebHook from "./webhook";

let sendUsersOnRedis = () => {

    let cursor = 0

    Redis.scan(cursor, (key) => {

        Redis.get(key, (result) => {            
            sendUser(JSON.parse(result))
        }, (err) => {
            error(err)
        })

    }, () => {
        info("Users read from Redis sent.")
    })

}

let generateAndPersistUsersOntoRedis = () => {

    for (var k = 0; k < setup.config.numOfUsers; k++) {
        let userInfo = UserGenerator.generate()

        if (setup.isProd()) {
            Redis.set(userInfo["aid"], JSON.stringify(userInfo), Redis.print)
        } else {
            prettyPrint(userInfo)
        }
    }

    info(`${setup.config.numOfUsers} users written onto Redis.`)

}

let readUsersFromRedisAndSendEvents = () => {

    setInterval(() => {

        for (var k = 0; k < setup.config.numOfUsers; k++) {

            Redis.getRandomValue((userInfo) => {

                let jsonUser = JSON.parse(userInfo)

                // create new device based on user's last device id
                let deviceInfo = DeviceGenerator.generate(jsonUser["ldid"])

                // create user sessions
                for (var i = 0; i < setup.config.sessionPerUser; i++) {
                    // create session events
                    createAndSendSessionEvents(jsonUser, deviceInfo)
                }

            }, (err) => {
                error(err)
            })
        }

    }, setup.config.period)
}

let generateAndSendEventsAndUsers = () => {

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
                createAndSendSessionEvents(appId, userInfo, deviceInfo)

            }

            // send user
            sendUser(userInfo)

        }

    }, setup.config.period);

}

let createAndSendSessionEvents = (appId, userInfo, deviceInfo) => {

    let sessionInfo = SessionGenerator.generate()

    let sessionStartTime = sessionInfo["clientSession"]["startDateTime"]

    // fire clientSessionStart
    if (!setup.config.excludeSessionEvents) {
        sendEvent(
            EventGenerator.generate(
                'clientSessionStart',
                sessionStartTime,
                deviceInfo,
                sessionInfo["clientSession"],
                userInfo["aid"],
                userInfo["cid"],
                appId))
    }

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
        sendEvent(e)
    })

    // fire clientSessionStop  
    let sessionStoptime = getSessionStopTime(setup.eventsPerSession, sessionStartTime)

    _.assignIn(sessionInfo["clientSession"], {
        stopDateTime: sessionStoptime,
        duration: getSessionDuration(sessionStartTime, sessionStoptime)
    })

    if (!setup.config.excludeSessionEvents) {
        sendEvent(
            EventGenerator.generate(
                'clientSessionStop',
                sessionStoptime,
                deviceInfo,
                sessionInfo["clientSession"],
                userInfo["aid"],
                userInfo["cid"],
                appId))
    }

}

let sendUser = async (user) => {
    Kafka.sendUser(user)
}

let sendEvent = async (event) => {
    Kafka.sendEvent(event)

    if (setup.config.webhook) {
        WebHook.post(setup.config.webhook, [event])   
    }
}

export default () => {
    if (setup.config.mode == modes.SEND_USERS_ON_REDIS) {
        sendUsersOnRedis()
    } else if (setup.config.mode == modes.GENERATE_AND_WRITE_USERS_TO_REDIS) {
        generateAndPersistUsersOntoRedis()
    } else if (setup.config.mode == modes.GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS) {
        readUsersFromRedisAndSendEvents()
    } else {
        generateAndSendEventsAndUsers()
    }
}