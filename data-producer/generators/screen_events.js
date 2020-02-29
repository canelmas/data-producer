import _ from 'lodash';
import faker from "faker"
import util from "util"
import moment from 'moment';
import setup from "../setup";

const viewEvents = [
  "viewStart",
  "viewStop"
]

let randomAttributes = (eventType, eventCreationTime) => {

  let view = faker.lorem.word()

  let viewLabel = util.format("%sScreen", view.charAt(0).toUpperCase() + view.substr(1).toLowerCase())

  let data = {
    viewId : Buffer.from(viewLabel, "ascii").toString("base64"),
    viewLabel : viewLabel,
    viewClass : util.format("com.lovely.%s", viewLabel)    
  }
  
  let exitTime = moment(eventCreationTime, setup.config.dateFormat)
    
  return eventType == 'viewStop' ? 
    _.extend({
        exitTime : eventCreationTime, 
        enterTime: exitTime.subtract(2, "seconds").format(setup.config.dateFormat), 
        duration: 2000},
      data) :
    _.extend({enterTime : eventCreationTime}, data)

}

let generateEvent = (eventCreationTime) => {
  let eventType = _.sample(viewEvents)
  return {
    "name": eventType,
    "attrs": randomAttributes(eventType, eventCreationTime)
  }
}

export default {
  takeOne : generateEvent
}
