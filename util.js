import moment from 'moment';
import _ from 'lodash';
import faker from 'faker';

const DATE_FORMAT = process.env.DATE_FORMAT || "x"

const secondsBetweenEvents = _.sample(_.range(2,30))

let newEventTime = () => {
  return moment(faker.date.between(moment().subtract(1, "months"), moment())).format(DATE_FORMAT)
}

let nextEventTime = (lastEventTime) => {
  return moment(lastEventTime, DATE_FORMAT).add(secondsBetweenEvents, "seconds").format(DATE_FORMAT)
}

let getSessionStopTime = (eventsPerSession, sessionStartTime) => {
  return moment(sessionStartTime, DATE_FORMAT).add(secondsBetweenEvents * (eventsPerSession+1), "seconds").format(DATE_FORMAT)
}

let getSessionDuration = (sessionStartTime, sessionStopTime) => {
  return moment(sessionStopTime, DATE_FORMAT).valueOf() - moment(sessionStartTime, DATE_FORMAT).valueOf()
}

export {
  newEventTime,
  nextEventTime,
  getSessionStopTime,
  getSessionDuration,
  DATE_FORMAT
}