import axios from "axios";
import setup from "./setup";
import { info } from "./logger";
import _ from 'lodash'

let instance = undefined

let init = (onSuccess) => {    
    
    instance = axios.create({
        headers : parseHeaders(setup.config.webhookHeaders)        
    })
    
    if (!setup.isProd) {
        instance.interceptors.request.use((req) => {
            info(req)
            return req
        })

        instance.interceptors.response.use((resp) => {
            info(resp)
            return resp
        })
    }    

    onSuccess(instance)
}

let parseHeaders = (headersString) => {

    if (!headersString) {
        return null
    }

    let headersToAdd = {}
    let headers = _.split(headersString.replace(/\s/g, ""), ",")    

    _.forEach(headers, header => {
        let kv = _.split(header, ':')        
        headersToAdd = _.extend({ [kv[0]] : kv[1] }, headersToAdd)
    })

    return headersToAdd

}

let postEvent = async (url, event) => {
    
    try {
        
        if (!instance) {
            throw new Error("axios not initialized!")
        }

        await instance.post(url, event)

    } catch (err) {
        console.log(`Posting event to webhook failed! ${err}`)
    }   

}

export default {
    init,
    post : postEvent
}