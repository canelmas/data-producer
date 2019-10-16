import _ from 'lodash'
import uuid from 'uuid/v4';
import CommerceEvents from "./commerce_events"
import CustomEvents from "./custom_events"
import ViewEvents from "./screen_events"
import APMEvents from './apm_events'
import {
  nextEventTime
} from "../util.js"

// Event Categories
const EVENT_CATEGORY_VIEWS = "view"
const EVENT_CATEGORY_COMMERCE = "commerce"
const EVENT_CATEGORY_CUSTOM = "custom"
const EVENT_CATEGORY_APM = "apm"

const eventCategories = [
  EVENT_CATEGORY_VIEWS,
  EVENT_CATEGORY_COMMERCE,
  EVENT_CATEGORY_CUSTOM,
  EVENT_CATEGORY_APM
]

// Event Scenarios
const SCENARIO_RANDOM = "random"
const SCENARIO_VIEW = "view"
const SCENARIO_COMMERCE = "commerce"
const SCENARIO_CUSTOM = "custom"
const SCENARIO_APM = "apm"

const scenarios = [
  SCENARIO_RANDOM,
  SCENARIO_VIEW,
  SCENARIO_COMMERCE,
  SCENARIO_CUSTOM,
  SCENARIO_APM
]

export let generate = (eventName,
  eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  return {
    eventId: uuid(),
    deviceId: deviceInfo["deviceId"],
    appconnectId: appconnectId,
    customerId: customerId,
    eventName: eventName,
    appId: appId,
    clientCreationDate: eventCreationTime,
    deviceProperty: deviceInfo,
    clientSession: clientSession,
    attributes: null
  }

}

export let generateSessionEvents = (scenario,
  numOfEvents,
  sessionStartTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  let eventCreationTime = sessionStartTime

  return _.times(numOfEvents, () => {
    eventCreationTime = nextEventTime(eventCreationTime)
    return generateSessionEvent(scenario,
      eventCreationTime,
      deviceInfo,
      clientSession,
      appconnectId,
      customerId,
      appId)
  })

}

export let generateSessionEvent = (scenario,
  eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {
  switch (scenario) {
    case SCENARIO_COMMERCE:
      return generateCommerceEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case SCENARIO_CUSTOM:
      return generateCustomEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case SCENARIO_VIEW:
      return generateViewEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case SCENARIO_APM:
      return generateAPMEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case SCENARIO_RANDOM:
    default:
      return generateRandomEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
  }

}

let generateAPMEvent = (eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  let event = APMEvents.takeOne()

  return generateEvent(event["name"],
    event["attrs"],
    eventCreationTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId)
}

let generateCommerceEvent = (eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  let event = CommerceEvents.takeOne()
  return generateEvent(event["name"],
    event["attrs"],
    eventCreationTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId)
}

let generateCustomEvent = (eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  let event = CustomEvents.takeOne()
  return generateEvent(event["name"],
    event["attrs"],
    eventCreationTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId)

}

let generateViewEvent = (eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  let event = ViewEvents.takeOne()
  return generateEvent(event["name"],
    event["attrs"],
    eventCreationTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId)

}

let generatePushTokenEvent = (eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {
  return generateEvent('device.update.pushToken', {
      pushToken: uuid()
    },
    eventCreationTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId
  )
}

let generateUpdateUserEvent = (userInfo,
  eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {
  return generateEvent('user.update',
    {
      phone: userInfo.phone,
      fn : userInfo.fn,
      ln : userInfo.ln,
      gender : userInfo.gender,
      maritalStatus : userInfo.maritalStatus,
      dob : userInfo.dob
    },
    eventCreationTime,
    deviceInfo,
    clientSession,
    appconnectId,
    customerId,
    appId
  )
}

let generateRandomEvent = (eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  let category = _.sample(eventCategories)

  switch (category) {

    case EVENT_CATEGORY_COMMERCE:
      return generateCommerceEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case EVENT_CATEGORY_VIEWS:
      return generateViewEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case EVENT_CATEGORY_VIEWS:
      return generateViewEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case EVENT_CATEGORY_APM:
      return generateAPMEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)
    case EVENT_CATEGORY_CUSTOM:
    default:
      return generateCustomEvent(eventCreationTime,
        deviceInfo,
        clientSession,
        appconnectId,
        customerId,
        appId)

  }

}

let generateEvent = (eventName,
  attributes,
  eventCreationTime,
  deviceInfo,
  clientSession,
  appconnectId,
  customerId,
  appId) => {

  return {
    eventId: uuid(),
    deviceId: deviceInfo["deviceId"],
    appconnectId: appconnectId,
    customerId: customerId,
    eventName: eventName,
    appId: appId,
    clientCreationDate: eventCreationTime,
    deviceProperty: deviceInfo,
    clientSession: clientSession,
    attributes: attributes
  }

}

export default {
  generate,
  generateSessionEvent,
  generateSessionEvents,
  scenarios,
  generateEvent,
  generatePushTokenEvent,
  generateUpdateUserEvent
}