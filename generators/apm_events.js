import _ from 'lodash';
import faker from "faker"
import util from "util"

const networkErrorTypes = [
    "OTHER",
    "NO_CONNECTION",
    "SSL",
    "TIMEOUT",
    "AUTH_FAILURE",
    "NETWORK",
    "PARSE",
    "SERVER",
    "CANCELLED",
    "INSECURE_CONNECTION",
]

const connectionTypes = [
    "NONE",
    "CELLULAR",
    "WIFI",
    "ETHERNET",
    "BLUETOOTH",
    "WIFI_AWARE",
    "LOWPAN",
    "VPN",
]

const httpMethods = [
    "POST",
    "HEAD",
    "CONNECT",
    "OPTIONS",
    "GET",
    "PATCH",
    "PUT",
    "DELETE",
    "TRACE"
]

const hosts = _.times(2, () => {
    return "api.".concat(faker.internet.domainName())
})

const exceptions = [
    "ProtocolException",
    "SecurityException",
    "SSLHandshakeException",
    "MalformedURLException",
    "UnkownHostException",
    "SocketException",
    "HttpRetryException",
    "InterruptedByTimeoutException",
    "InterruptedIOException"
]

const errorMessages = [
    "Please Try Again Later",
    "Something Went Terribly Wrong",
    "Wow, something's really wrong",
    "Oopsie!"
]

const apmEvents = [
    "httpCall",
    "networkError"
]

const statusCodes = [
    200,
    201,
    202,
    203,
    204,
    301,
    304,
    400,
    401,
    403,
    404,
    405,
    500,
    501,
    502,
    503
]

const headers = {
        "Content-Encoding": "gzip",
        "Content-Length": String(_.random(5, 5000)),
        "Accept": _.sample(["text/html", "multipart/form-data"]),
        "Content-Language" : _.sample(["de-DE", "en-US", "en-CA"]),
        "Server": "Apache",
        "Content-Type" : "application/x-www-form-urlencoded",
        "Accept-Charset" : _.sample(["utf-8", "iso-8859-15"])
}

let randomHeaders = () => {
    return headers
}

let randomStatusCode = () => {
    return _.sample(statusCodes)
}

let randomErrorCode = () => {
    return _.random(500, 600)
}

let randomErrorMessage = (errorCode) => {
    if (!errorCode) {
        errorCode = randomErrorCode()
    }
    return _.sample(errorMessages) + ` [NOK]-${errorCode}`
}

let randomHttpMethod = () => {
    return _.sample(httpMethods)
}

let randomConnectionType = () => {
    return _.sample(connectionTypes)
}

let randomNetworkErrorType = () => {
    return _.sample(networkErrorTypes)
}

let randomPort = () => {
    return _.sample([80, 443])
}

let randomSchema = () => {
    return faker.internet.protocol()
}

let randomHost = () => {
    return _.sample(hosts)
}

let randomException = () => {
    return _.sample(exceptions)
}

let randomContentSize = () => {
    return _.random(10, 1000)
}

let randomDuration = () => {
    return _.random(200, 10000)
}

let randomPath = () => {

    let path = ""

    let level = _.random(1, 2)

    _.times(level, () => {
        path += "/".concat(faker.lorem.word())
    })

    return path
}

let getRandomAttributes = (num) => {    
    return _.zipObject(_.times(num, () => faker.internet.domainWord()), _.times(num, () => faker.internet.domainWord()))    
  }

let newHttpCall = () => {

    let view = faker.lorem.word()

    let viewLabel = util.format("%sScreen", view.charAt(0).toUpperCase() + view.substr(1).toLowerCase())

    let isSuccess = _.sample([true, false])
    let errorCode = randomErrorCode()

    return {
        pt: randomPort(),
        ht: randomHost(),
        h: randomHeaders(),
        ct: randomConnectionType(),
        et: _.sample(["et1", "et2", "et3", "et4", "et5", "et6"]),
        ec: !isSuccess ? errorCode : null,
        em: !isSuccess ? randomErrorMessage(errorCode) : null,
        s: isSuccess,
        d: randomDuration(),
        sc: randomStatusCode(),        
        rqs: randomContentSize(),
        rps: randomContentSize(),
        m: randomHttpMethod(),
        sch: randomSchema(),
        ph: randomPath(),
        viewId: Buffer.from(viewLabel, "ascii").toString("base64"),
        viewLabel: viewLabel,
        extras : Boolean(_.sample([true, false])) ? getRandomAttributes(_.random(1,10)) : null        
    }

}

let newNetworkError = () => {

    let view = faker.lorem.word()

    let viewLabel = util.format("%sScreen", view.charAt(0).toUpperCase() + view.substr(1).toLowerCase())

    return {
        sch: randomSchema(),
        ht: randomHost(),
        pt: randomPort(),
        ph: randomPath(),
        m: randomHttpMethod(),
        h: randomHeaders(),
        d: randomDuration(),
        et: randomNetworkErrorType(),
        ex: randomException(),
        em: randomErrorMessage(),
        ct: randomConnectionType(),
        viewId: Buffer.from(viewLabel, "ascii").toString("base64"),
        viewLabel: viewLabel,
        extras : Boolean(_.sample([true, false])) ? getRandomAttributes(_.random(1,10)) : null                
    }

}

let generateEvent = () => {

    let event = _.sample(apmEvents)

    if (event == "httpCall") {
        return render(event, newHttpCall())
    } else {
        return render(event, newNetworkError())
    }

}

let render = (event, data) => {
    return {
        "name": event,
        "attrs": data
    }
}

export default {
    takeOne: generateEvent
}