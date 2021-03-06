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
    GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS,
    GENERATE_AND_WRITE_USERS_TO_REDIS,
    GENERATE_AND_SEND_USERS,
    SEND_USERS_ON_REDIS
} from './modes'
import WebHook from "./webhook";
import outputs from './outputs';
import Funnel from "./funnel";
import explode from './transformations/explode'

let sendUsersOnRedis = () => {

    let cursor = 0

    Redis.scan(cursor, (key) => {

        Redis.get(key, (err, result) => {
            if (err) {
                error(err)
            } else {
                sendUser(JSON.parse(result))                
            }            
        })

    }, () => {
        info("Users read from Redis sent.")
    })

}

let generateAndPersistUsersOntoRedis = () => {    

    for (var k = 0; k < setup.config.numOfUsers; k++) {
    
        // new user
        let userInfo = UserGenerator.generate(setup.getRandomAppId())

        // new device based on user's last device id
        let deviceInfo = DeviceGenerator.generate(userInfo["ldid"])     

        userInfo = _.assignIn(userInfo, {deviceProperty : deviceInfo})        

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
                let deviceInfo = jsonUser.deviceProperty                
                
                // create user sessions
                for (var i = 0; i < setup.config.sessionsPerUser; i++) {

                    // create session events
                    createAndSendSessionEvents(jsonUser.appId, jsonUser, deviceInfo)
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
            sendUser(_.assignIn(userInfo, {"deviceProperty" : deviceInfo}))

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

    } else if (setup.config.mode == GENERATE_AND_SEND_USERS) {

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
    let sessionStoptime = getSessionStopTime(setup.config.mode == GENERATE_AND_SEND_USERS ? 2 : setup.config.eventsPerSession, sessionStartTime)    

    let sessionInfoWithDuration = _.extend({
        stopDateTime: sessionStoptime,
        duration: getSessionDuration(sessionStartTime, sessionStoptime)
    }, sessionInfo["clientSession"])       

    if (!setup.config.excludeSessionEvents) {
        sendEvent(
            EventGenerator.generate(
                'clientSessionStop',
                sessionStoptime,
                deviceInfo,
                sessionInfoWithDuration,                
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
    
    let explodedEvents = undefined
    
    if (setup.shouldExplode()) {
        explodedEvents = explode(event)        
    }

    if (setup.hasOutput(outputs.KAFKA)) {
        Kafka.sendEvent(explodedEvents ? explodedEvents : event)        
    }

    if (setup.hasOutput(outputs.WEBHOOK)) {        
        WebHook.post(setup.config.webhookUrl, event)
    }

    if (setup.hasOutput(outputs.CONSOLE)) {        
        prettyPrint(explodedEvents ? explodedEvents : event)
    }

}

export default () => {

    switch (setup.config.mode) {
        case SEND_USERS_ON_REDIS:
            sendUsersOnRedis()
            break;
        case GENERATE_AND_WRITE_USERS_TO_REDIS:
            generateAndPersistUsersOntoRedis()
            break;
        case GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS:            
            readUsersFromRedisAndSendEvents()
            break;
        case GENERATE_AND_SEND_USERS:
            generateAndSendUsers()
            break;
        default:    // GENERATE_AND_SEND_EVENTS_AND_USERS
            generateAndSendEventsAndUsers()

    }
}