import moment from 'moment';
import _ from 'lodash';
import faker from 'faker';
import setup from './setup'

const secondsBetweenEvents = _.sample(_.range(2, 30))

let newEventTime = () => {
  return moment(faker.date.between(moment().subtract(1, "months"), moment())).format(setup.config.dateFormat)
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