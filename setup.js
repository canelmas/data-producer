import _ from 'lodash'
import {
    modes,
    modeFromString,
} from "./modes"

import configKafka from './config/kafka';
import {
    info
} from './logger'

let getRandomAppId = () => {
    return _.sample(config.apps)
}

let isVerbose = () => {
    return config.verbose == "true"
}

let isProd = () => {
    return config.env == "production"
}

let print = () => {
    info(`env=${config.env}`)
    info(`mode=${config.mode}`)
    info(`verbose=${config.verbose}`)
    info(`scenario=${config.scenario}`)
    info(`period=${config.period}`)
    info(`numOfUsers=${config.numOfUsers}`)
    info(`sessionPerUser=${config.sessionPerUser}`)
    info(`eventPerSession=${config.eventsPerSession}`)
    info(`dateFormat=${config.dateFormat}`)
    info(`topicsToCreate=${config.topicsToCreate}`)
    info(`format=${config.format}`)
    info(`brokers=${configKafka.brokerOptions.brokers}`)
    info(`schemaRegistry=${config.schemaRegistry}\n`)
}

const config = {
    env: process.env.ENV || "development",
    verbose: process.env.VERBOSE || "true",
    period: process.env.PERIOD_IN_MS || 5 * 1000,
    numOfUsers: process.env.NUM_OF_USERS || 1,
    sessionPerUser: process.env.SESSION_PER_USER || 1,
    eventsPerSession: process.env.EVENTS_PER_SESSION || 5,
    mode: modeFromString(process.env.MODE) || modes.GENERATE_AND_SEND_EVENTS_AND_USERS,
    apps: (process.env.APP_IDS || "DemoApp").replace(" ", "").split(","),
    topicsToCreate: process.env.CREATE_TOPICS || undefined,
    scenario: process.env.EVENT_SCENARIO || "apm",
    format: process.env.FORMAT || 'json',
    dateFormat: process.env.DATE_FORMAT || "YYYY-MM-DDTHH:mm:ssZ",
    schemaRegistry: process.env.SCHEMA_REGISTRY || undefined
}

export default {
    config,
    print,
    isProd,
    isVerbose,
    getRandomAppId
}