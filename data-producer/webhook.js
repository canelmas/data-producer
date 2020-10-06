import axios from "axios";
import setup from "./setup";
import {
    info,
    error
} from "./logger";
import _ from 'lodash'

let instance = undefined

let init = (onReady) => {

    if (!setup.config.webhookUrl) {
        throw new Error('Webhook url is missing!')
    }

    instance = axios.create({
        headers: parseHeaders(setup.config.webhookHeaders)
    })

    if (!setup.isProd()) {
        instance.interceptors.request.use((req) => {
            info(req)
            return req
        })

        instance.interceptors.response.use((resp) => {
            info(resp)
            return resp
        })
    }

    onReady()

}

let parseHeaders = (headersString) => {

    if (!headersString) {
        return null
    }

    let headersToAdd = {}
    let headers = _.split(headersString.replace(/\s/g, ""), ",")

    _.forEach(headers, header => {
        let kv = _.split(header, ':')
        headersToAdd = _.extend({
            [kv[0]]: kv[1]
        }, headersToAdd)
    })

    return headersToAdd

}

let postEvent = async (url, event) => {

    try {    

        if (!instance) {
            throw new Error("axios not initialized!")
        }

        instance.post(url, event).then(resp => {    
            if (!setup.isProd) {
                info(resp.status)
            }            
        }).catch(err => {
            error(`Sending event failed! ${err}`)            
        })                            

    } catch (err) {
        error(err)
    }

}

export default {
    init,
    post: postEvent
}