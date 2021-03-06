import redis from 'redis'
import _ from 'lodash'
import configRedis from './config/redis'
import { error  } from "./logger";

let client = null

let onError = async (err) => {
    error(err)
}

let init = async (onRedisReady) => {
    client = redis.createClient(configRedis)

    client.on('ready', async () => {
        await onRedisReady()
    })

    client.on('error', async (err) => {
        await onError(err)
    })
}

let get = (key, cb) => {
    
    if (client == null){
        throw new Error("Redis not initialized!")        
    }

    client.get(key, (err, result) => {        
        if (result) {
            cb(null, result)            
        } else {
            cb(err)            
        }
    })
}

let set = (key, val, onSuccess) => {

    if (client == null){
        throw new Error("Redis not initialized!")        
    }

    client.set(key, val, onSuccess)
}

let print = () => {
    client.print
}

let getRandomValue = (onSuccess, onError) => {    

    client.send_command("RANDOMKEY", (err, key) => {        
        if (key) {                            
            get(key, (err, result) => {
                if (result) {                    
                    onSuccess(result)
                } else {                                        
                    onError(`Getting random redis value with key [${key}] failed!`)
                }
            })
        } else {                 
            onError(`Getting random redis value failed!`)
        }
    })

}

let scan = (cursor, callback, finalize) => {

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
            } else return scan(cursor, callback, finalize)

        }

    })

}

export default {
    init,
    scan,
    get,
    set,
    getRandomValue,
    print
}