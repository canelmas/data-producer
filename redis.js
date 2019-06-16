import redis from 'redis'
import _ from 'lodash'

let init = (onReady, onError) => {
    redisClient = redis.createClient(configRedis)

    redisClient.on('ready', async () => {
        await onReady(redisClient)
    })

    redisClient.on('error', async (err) => {
        await onError(err)
    })
}

let scan = (client, cursor, callback, finalize) => {

    client.scan(cursor, "MATCH", "*", "COUNT", 200, (err, reply) => {

        if (err) {
            throw err
        }

        cursor = reply[0]

        let keys = reply[1]

        if (cursor == 0 && keys.length == 0) {
            return finalize()
        } else {

            _.forEach(keys, (key) => {
                callback(key)
            })

            if (cursor == 0) {
                return finalize()
            } else return scanRedis(cursor, callback, finalize)

        }

    })

}

export default {
    init: init,
    scan : scan
}