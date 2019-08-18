import unescape from "unescape-js";
import {
    nextEventTime
} from "./util";
import EventGenerator from "./generators/event_generator";
import _ from 'lodash'
import faker from "faker";

const DEFAULT_PROBABILITY = 1
const DEFAULT_FAIL_WITH_OTHER_EVENTS = true

let funnel = {
    steps: undefined,
    failWithOtherEvents: DEFAULT_FAIL_WITH_OTHER_EVENTS,
    probability: DEFAULT_PROBABILITY
}

let create = (funnelData) => {
    let data = JSON.parse(unescape(funnelData))

    if (!data.hasOwnProperty('steps')) {
        throw new Error('Funnel steps are missing!')
    }

    funnel.steps = data['steps']

    if (data.hasOwnProperty('config')) {
        let config = data['config']

        funnel.failWithOtherEvents = config.hasOwnProperty('failWithOtherEvents') ? config['failWithOtherEvents'] : DEFAULT_FAIL_WITH_OTHER_EVENTS
        funnel.probability = config.hasOwnProperty('probability') ? config['probability'] : DEFAULT_PROBABILITY
    }

    return funnel
}

let randomWord = () => {
    return faker.random.word()
}

let randomNumber = () => {
    return faker.random.number()
}

let randomAmount = () => {
    return faker.finance.amount()
}

let randomUuid = () => {
    return faker.random.uuid()
}

let randomBoolean = () => {
    return faker.random.boolean()
}

let populateAttributes = (attributes) => {    
    let populatedAttributes = {}
    if (attributes) {
        Object.keys(attributes).forEach( key => {                        
            populatedAttributes[key] = populateAttribute(attributes[key])
        })
    }
    return populatedAttributes
}

let populateAttribute = (type) => {
    switch (type)  {        
        case 'number':
            return randomNumber()
        case 'amount':
            return randomAmount()
        case 'uuid':
            return randomUuid()     
        case 'boolean':
            return randomBoolean()
        case 'word':            
        default:
            return randomWord()       
    }
}

let newFunnelEvent = (
    step,
    eventCreationTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId) => {

    return EventGenerator.generateEvent(
        step.name,
        populateAttributes(step.attributes),
        eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId
    )

}

let generateEvents = (
    sessionStartTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId) => {

    let eventCreationTime = sessionStartTime
    let events = []

    _.forEach(funnel.steps, step => {

        eventCreationTime = nextEventTime(eventCreationTime)

        if (step.probability == 1) {
            events.push(
                newFunnelEvent(
                    step,
                    eventCreationTime,
                    deviceInfo,
                    clientSession,
                    appconnectId,
                    customerId,
                    appId))
        } else {

            let random = _.random(0, 1, true)

            if (step.probability >= random) {
                events.push(
                    newFunnelEvent(
                        step,
                        eventCreationTime,
                        deviceInfo,
                        clientSession,
                        appconnectId,
                        customerId,
                        appId))
            } else {
                events.push(
                    EventGenerator.generateSessionEvent(
                        'random',                        
                        eventCreationTime,
                        deviceInfo,
                        clientSession,
                        appconnectId,
                        customerId,
                        appId
                    ))
            }


        }

    })

    return events
}

export default {
    create,
    generateEvents
}