import moment from 'moment';
import _ from 'lodash';
import faker from 'faker';
import setup from './setup'

const secondsBetweenEvents = _.sample(_.range(2, 30))

let newEventTime = () => {
  return setup.config.eventDate ?
    moment(faker.date.between(moment(setup.config.eventDate), moment(setup.config.eventDate).add("24", "hours"))).format(setup.config.dateFormat) :
    moment(faker.date.between(moment().subtract(setup.config.dateRangeVal, setup.config.dateRangeUnit), moment())).format(setup.config.dateFormat)

}

let nextEventTime = (lastEventTime) => {
  return moment(lastEventTime, setup.config.dateFormat).add(secondsBetweenEvents, "seconds").format(setup.config.dateFormat)
}

let getSessionStopTime = (eventsPerSession, sessionStartTime) => {
  return moment(sessionStartTime, setup.config.dateFormat).add(secondsBetweenEvents * (eventsPerSession + 1), "seconds").format(setup.config.dateFormat)
}

let getSessionDuration = (sessionStartTime, sessionStopTime) => {
  return moment(sessionStopTime, setup.config.dateFormat).valueOf() - moment(sessionStartTime, setup.config.dateFormat).valueOf()
}

export {
  newEventTime,
  nextEventTime,
  getSessionStopTime,
  getSessionDuration
}