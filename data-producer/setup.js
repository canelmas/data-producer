import _ from 'lodash'
import {
    GENERATE_AND_SEND_EVENTS_AND_USERS,
    setMode,
} from "./modes"
import Funnel from "./funnel";

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

let parse = (data) => {

    if (!data) {
        return undefined
    }

    return _.split(data.replace(/\s/g, ""), ",") 
}

let hasOutput = (output) => {
    return config.output.includes(output)
}

let dateRangeVal = (paramVal) => {
    let val = parseInt(paramVal.substring(0, paramVal.length -1))
    return isNaN(val) ? 1 : val     
}

let dateRangeUnit = (paramVal)=> {    
    let unit = paramVal.slice(-1)
    switch (unit) {        
        case "Y":
            return "years"
        case "D":
            return "days"        
        case "M":
        default :
            return "months"
    }
}

const config = {
    env: process.env.ENV || "production",
    output: parse(process.env.OUTPUT) || ['console'],
    verbose: process.env.VERBOSE || "false",
    period: process.env.PERIOD_IN_MS || 5 * 1000,
    numOfUsers: process.env.NUM_OF_USERS || 1,
    sessionsPerUser: process.env.SESSIONS_PER_USER || 1,
    eventsPerSession: process.env.EVENTS_PER_SESSION || 5,
    excludeSessionEvents: process.env.EXCLUDE_SESSION_EVENTS ? process.env.EXCLUDE_SESSION_EVENTS == 'true' : false,
    mode: setMode(process.env.MODE) || GENERATE_AND_SEND_EVENTS_AND_USERS,    
    apps : parse(process.env.APP_IDS) || ['DemoApp'],
    deviceId : process.env.DEVICE_ID || undefined,
    topicsToCreate: process.env.CREATE_TOPICS || undefined,
    scenario: process.env.EVENT_SCENARIO || "random",
    format: process.env.FORMAT || 'json',
    dateFormat: process.env.DATE_FORMAT || "YYYY-MM-DDTHH:mm:ssZ",
    schemaRegistry: process.env.SCHEMA_REGISTRY || undefined,
    addUserDemographics: process.env.ADD_USER_DEMOGRAPHICS || "false",
    topicUsers: process.env.TOPIC_USERS || "users",
    topicEvents: process.env.TOPIC_EVENTS || "events",
    brokers: parse(process.env.BROKERS) || ["localhost:19092"],
    multiTopics : process.env.WRITE_TO_MULTI_TOPICS || undefined,
    redisHost : process.env.REDIS_HOST || undefined,
    redisPort : process.env.REDIS_PORT || undefined,
    webhookUrl : process.env.WEBHOOK_URL || undefined,
    webhookHeaders : process.env.WEBHOOK_HEADERS || undefined,
    sendUsers : process.env.SEND_USERS ? process.env.SEND_USERS === 'true' : true,
    funnel : process.env.FUNNEL_TEMPLATE ? Funnel.create(process.env.FUNNEL_TEMPLATE) : undefined,
    eventDate: process.env.EVENT_DATE || undefined,    
    dateRangeVal : process.env.EVENT_DATE_RANGE ? dateRangeVal(process.env.EVENT_DATE_RANGE) : 1,
    dateRangeUnit : process.env.EVENT_DATE_RANGE ? dateRangeUnit(process.env.EVENT_DATE_RANGE) : "months",
    messageKey : process.env.MESSAGE_KEY || null
}

let print = () => {
    info(`env=${config.env}`)
    info(`output=${config.output}`)
    info(`mode=${config.mode}`)
    info(`verbose=${config.verbose}`)
    info(`scenario=${config.scenario}`)
    info(`period=${config.period}`)
    info(`numOfUsers=${config.numOfUsers}`)
    info(`sessionsPerUser=${config.sessionsPerUser}`)
    info(`eventsPerSession=${config.eventsPerSession}`)
    info(`excludeSessionEvents=${config.excludeSessionEvents}`)   
    info(`eventDate=${config.eventDate}`)
    info(`dateRangeVal=${config.dateRangeVal}`)
    info(`dateRangeUnit=${config.dateRangeUnit}`)   
    info(`sendUsers=${config.sendUsers}`)    
    info(`addUserDemographics=${config.addUserDemographics}`)
    info(`dateFormat=${config.dateFormat}`)
    info(`appIds=${config.apps}`)    
    info(`deviceId=${config.deviceId}`)    
    info(`redisHost=${config.redisHost}`)
    info(`redisPort=${config.redisPort}`)
    info(`brokers=${config.brokers}`)
    info(`format=${config.format}`)
    info(`topicsToCreate=${config.topicsToCreate}`)
    info(`topicEvents=${config.topicEvents}`)
    info(`topicUsers=${config.topicUsers}`)
    info(`multiTopics=${config.multiTopics}`)
    info(`schemaRegistry=${config.schemaRegistry}`)
    info(`messageKey=${config.messageKey}`)
    info(`webhookUrl=${config.webhookUrl}`)
    info(`webhookHeaders=${config.webhookHeaders}`)
    info(`funnel=${JSON.stringify(config.funnel)}`)    
}

export default {
    config,
    print,
    isProd,
    isVerbose,
    getRandomAppId,
    hasOutput
}