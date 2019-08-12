import _ from 'lodash';
import faker from "faker"
import util from "util"

const viewEvents = [
  "viewStart",
  "viewStop"
]

let randomAttributes = () => {

  let view = faker.lorem.word()

  let viewLabel = util.format("%sScreen", view.charAt(0).toUpperCase() + view.substr(1).toLowerCase())
  
  return {
    viewId : Buffer.from(viewLabel, "ascii").toString("base64"),
    viewLabel : viewLabel,
    viewClass : util.format("com.lovely.%s", viewLabel),
  }

}

let generateEvent = () => {
  return {
    "name": _.sample(viewEvents),
    "attrs": randomAttributes()
  }
}

export default {
  takeOne : generateEvent
}
