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
    getSessionDuration,
    nextEventTime
} from './util';
import {
    modes
} from './modes'
import WebHook from "./webhook";
import outputs from './outputs';
import Funnel from "./funnel";

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
                for (var i = 0; i < setup.config.sessionsPerUser; i++) {
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
            for (var i = 0; i < setup.config.sessionsPerUser; i++) {

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

    // fire funnel events if set
    if (setup.config.funnel) {

        let funnelEvents = Funnel.generateEvents(
            sessionStartTime,
            deviceInfo,
            sessionInfo['clientSession'],
            userInfo['aid'],
            userInfo['cid'],
            appId
        )

        _.forEach(funnelEvents, e => {
            sendEvent(e)
        })


    } else if (setup.config.mode == modes.GENERATE_AND_SEND_USERS) {

        let eventCreationTime = nextEventTime(sessionStartTime)

        // device.update.pushToken
        sendEvent(EventGenerator.generatePushTokenEvent(eventCreationTime, deviceInfo, sessionInfo['clientSession'], userInfo['aid'], userInfo['cid'], appId))

        // user.update
        sendEvent(EventGenerator.generateUpdateUserEvent(userInfo, nextEventTime(eventCreationTime), deviceInfo, sessionInfo['clientSession'], userInfo['aid'], userInfo['cid'], appId))

    } else {

        // fire session events => events between clientSessionStart and clientSessionStop
        let sessionEvents = EventGenerator.generateSessionEvents(
            setup.config.scenario,
            setup.config.eventsPerSession,
            sessionStartTime,
            deviceInfo,
            sessionInfo["clientSession"],
            userInfo["aid"],
            userInfo["cid"],
            appId)

        _.forEach(sessionEvents, e => {
            sendEvent(e)
        })

    }

    // fire clientSessionStop  
    let sessionStoptime = getSessionStopTime(setup.config.mode == modes.GENERATE_AND_SEND_USERS ? 2 : setup.eventsPerSession, sessionStartTime)

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

let generateAndSendUsers = () => {

    setInterval(() => {

        for (var k = 0; k < setup.config.numOfUsers; k++) {

            let appId = setup.getRandomAppId()

            // new user
            let userInfo = UserGenerator.generate(appId)

            // new device based on user's last device id
            let deviceInfo = DeviceGenerator.generate(userInfo["ldid"])

            // sessions
            for (var i = 0; i < setup.config.sessionsPerUser; i++) {

                // session events
                createAndSendSessionEvents(appId, userInfo, deviceInfo)

            }

        }

    }, setup.config.period);

}

let sendUser = async (user) => {

    if (setup.config.sendUsers) {

        if (setup.hasOutput(outputs.KAFKA)) {
            Kafka.sendUser(user)
        }

        if (setup.hasOutput(outputs.WEBHOOK)) {
            WebHook.post(setup.config.webhookUrl, [user])
        }

        if (setup.hasOutput(outputs.CONSOLE)) {
            prettyPrint(user)
        }

    }

}

let sendEvent = async (event) => {

    if (setup.hasOutput(outputs.KAFKA)) {
        Kafka.sendEvent(event)
    }

    if (setup.hasOutput(outputs.WEBHOOK)) {
        WebHook.post(setup.config.webhookUrl, [event])
    }

    if (setup.hasOutput(outputs.CONSOLE)) {
        prettyPrint(event)
    }

}

export default () => {

    switch (setup.config.mode) {
        case modes.SEND_USERS_ON_REDIS:
            sendUsersOnRedis()
            break;
        case modes.GENERATE_AND_WRITE_USERS_TO_REDIS:
            generateAndPersistUsersOntoRedis()
            break;
        case modes.GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS:
            readUsersFromRedisAndSendEvents()
            break;
        case modes.GENERATE_AND_SEND_USERS:
            generateAndSendUsers()
            break;
        default:
            generateAndSendEventsAndUsers()

    }
}