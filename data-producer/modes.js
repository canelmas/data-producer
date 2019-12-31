import _ from 'lodash'

export const GENERATE_AND_SEND_EVENTS_AND_USERS = "default"
export const GENERATE_AND_WRITE_USERS_TO_REDIS = "create-users"
export const GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS = "use-redis"
export const SEND_USERS_ON_REDIS = "send-users"
export const GENERATE_AND_SEND_USERS = "generate-and-send-users"

export const modes = [
  GENERATE_AND_SEND_EVENTS_AND_USERS,
  GENERATE_AND_WRITE_USERS_TO_REDIS,
  GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS,
  SEND_USERS_ON_REDIS,
  GENERATE_AND_SEND_USERS
]

export let setMode = (selection) => {
  return _.includes(modes, selection) ? selection : undefined
}

export let isRedisRequired = (mode) => {
  return [
    SEND_USERS_ON_REDIS,
    GENERATE_AND_WRITE_USERS_TO_REDIS,
    GENERATE_AND_SEND_EVENTS_WITH_USERS_READ_FROM_REDIS
  ].includes(mode)
}