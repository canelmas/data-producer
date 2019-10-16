import _ from 'lodash'

const GENERATE_AND_SEND_EVENTS_AND_USERS = "default"
const GENERATE_AND_WRITE_USERS_TO_REDIS = "create-users"
const GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS = "use-redis"
const SEND_USERS_ON_REDIS = "send-users"
const GENERATE_AND_SEND_USERS = "generate-and-send-users"

export const modes = {
  GENERATE_AND_SEND_EVENTS_AND_USERS,
  GENERATE_AND_WRITE_USERS_TO_REDIS,
  GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS,
  SEND_USERS_ON_REDIS,
  GENERATE_AND_SEND_USERS
}

export let setMode = (selection) => {
  return _.includes(modes, selection) ? selection : undefined
}

export let isRedisRequired = (mode) => {
  return [
    modes.SEND_USERS_ON_REDIS,
    modes.GENERATE_AND_WRITE_USERS_TO_REDIS,
    modes.GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS
  ].includes(mode)
}