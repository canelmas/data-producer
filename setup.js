import _ from 'lodash'
import {
    modes,
    setMode,
} from "./modes"

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

let parseBrokers = (brokerString) => {

    if (!brokerString) {
        return undefined
    }

    let brokers = []
    _.forEach(_.split(brokerString.replace(/\s/g, ""), ","), broker => {
        brokers.push(broker)
    })

    return brokers
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
    info(`excludeSessionEvents=${config.excludeSessionEvents}`)    
    info(`redisHost=${config.redisHost}`)
    info(`redisPort=${config.redisPort}`)
    info(`dateFormat=${config.dateFormat}`)
    info(`topicsToCreate=${config.topicsToCreate}`)
    info(`format=${config.format}`)
    info(`userDemographics=${config.userDemographics}`)
    info(`brokers=${config.brokers}`)
    info(`topicEvents=${config.topicEvents}`)
    info(`topicUsers=${config.topicUsers}`)
    info(`writeToMultiTopics=${config.multiTopics}`)
    info(`schemaRegistry=${config.schemaRegistry}`)
}

const config = {
    env: process.env.ENV || "development",
    verbose: process.env.VERBOSE || "false",
    period: process.env.PERIOD_IN_MS || 5 * 1000,
    numOfUsers: process.env.NUM_OF_USERS || 1,
    sessionPerUser: process.env.SESSION_PER_USER || 1,
    eventsPerSession: process.env.EVENTS_PER_SESSION || 5,
    excludeSessionEvents: process.env.EXCLUDE_SESSION_EVENTS ? process.env.EXCLUDE_SESSION_EVENTS == "true" : false,
    mode: setMode(process.env.MODE) || modes.GENERATE_AND_SEND_EVENTS_AND_USERS,
    apps: (process.env.APP_IDS || "DemoApp").replace(" ", "").split(","),
    topicsToCreate: process.env.CREATE_TOPICS || undefined,
    scenario: process.env.EVENT_SCENARIO || "apm",
    format: process.env.FORMAT || 'json',
    dateFormat: process.env.DATE_FORMAT || "YYYY-MM-DDTHH:mm:ssZ",
    schemaRegistry: process.env.SCHEMA_REGISTRY || undefined,
    userDemographics: process.env.USER_DEMOGRAPHICS || "false",
    topicUsers: process.env.TOPIC_USERS || "users",
    topicEvents: process.env.TOPIC_EVENTS || "events",
    brokers: parseBrokers(process.env.BROKERS) || ["localhost:19092"],
    multiTopics : process.env.WRITE_TO_MULTI_TOPICS || undefined,
    redisHost : process.env.REDIS_HOST || 'localhost',
    redisPort : process.env.REDIS_PORT || 6379    
}

export default {
    config,
    print,
    isProd,
    isVerbose,
    getRandomAppId
}