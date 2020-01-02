import _ from 'lodash';
import uuid from 'uuid/v4';
import { newEventTime } from "../util";

let generate = () => {
  return {
    clientSession: {
      sessionId: uuid(),
      startDateTime: newEventTime(),
      stopDateTime : null,
      duration : null
    }
  } 
}

export default { generate }