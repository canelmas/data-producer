import _ from 'lodash'

const GENERATE_AND_SEND_EVENTS_AND_USERS = 0
const GENERATE_AND_WRITE_USERS_TO_REDIS = 1
const GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS = 2
const SEND_USERS_ON_REDIS = 3

export const modes = {
  GENERATE_AND_SEND_EVENTS_AND_USERS: "default",
  GENERATE_AND_WRITE_USERS_TO_REDIS: "create-users",
  GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS: "use-redis",
  SEND_USERS_ON_REDIS: "send-users"
}

export let modeFromString = (selection) => {
  let mode = _.invert(modes)[String(selection)]
  if (!mode) {
    mode = GENERATE_AND_SEND_EVENTS_AND_USERS
  }
  return mode
}

export let isRedisRequired = (mode) => {
  return [modes.SEND_USERS_ON_REDIS, modes.GENERATE_AND_WRITE_USERS_TO_REDIS, modes.GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS].includes(mode)
}